package handlers

import (
	"archive/zip"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Survey represents a survey
type Survey struct {
	ID           interface{} `bson:"_id,omitempty"`
	Title        string      `json:"title"`
	ExitMessage  string      `json:"exitMessage"`
	Classes      []string    `json:"classes"`
	NumQuestions int         `json:"numQuestions"`
	SecretToken  string      `json:"secretToken"`
}

// Submission represents a submission for a survey
type Submission struct {
	SurveyID  string    `json:"surveyID"`
	Entries   []Entry   `json:"entries"`
	Timestamp time.Time `json:"timestamp"`
}

// Entry represents drawing entry in a submission
type Entry struct {
	Class string `json:"class"`
	Entry string `json:"entry"`
}

const DURATION = 7 * time.Second

// HandleCreate handles survey creation
func HandleCreate(client *mongo.Client) func(c *gin.Context) {
	return func(c *gin.Context) {
		collection := client.Database("drawing_survey").Collection("surveys")

		// Get post form and validate data
		title := c.PostForm("title")
		if len(title) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "title is required",
			})
			return
		}
		classesData := c.PostForm("classes")
		if len(classesData) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "classes is required",
			})
			return
		}
		numQuestionsData := c.PostForm("numQuestions")
		if len(numQuestionsData) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "numQuestions is required",
			})
			return
		}
		exitMessage := c.PostForm("exitMessage")

		var classes []string
		err := json.Unmarshal([]byte(classesData), &classes)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "error parsing classes",
			})
			return
		}
		if len(classes) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "need at least one class",
			})
			return
		}
		numQuestions, err := strconv.Atoi(numQuestionsData)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "numQuestions was not a valid integer",
			})
			return
		}
		if numQuestions < 1 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "numQuestions must be positive",
			})
			return
		}

		// Insert survey
		survey := Survey{
			Title:        title,
			Classes:      classes,
			NumQuestions: numQuestions,
			ExitMessage:  exitMessage,
			SecretToken:  uuid.New().String(),
		}

		ctx, cancel := context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		res, err := collection.InsertOne(ctx, survey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}

		id := res.InsertedID
		c.JSON(http.StatusOK, gin.H{
			"secretToken": survey.SecretToken,
			"surveyID":    id.(primitive.ObjectID).Hex(),
		})
	}
}

// HandleList handles survey list retrieval
func HandleList(client *mongo.Client) func(c *gin.Context) {
	return func(c *gin.Context) {
		surveyCollection := client.Database("drawing_survey").Collection("surveys")

		surveys := make([]Survey, 0)

		// List all surveys
		ctx, cancel := context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		cur, err := surveyCollection.Find(ctx, bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}
		defer cur.Close(ctx)
		ctx, cancel = context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		for cur.Next(ctx) {
			var survey Survey
			err := cur.Decode(&survey)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "database error",
				})
				return
			}
			surveys = append(surveys, survey)
		}

		res := make([]gin.H, len(surveys))
		for i := 0; i < len(surveys); i++ {
			res[i] = gin.H{
				"surveyID": surveys[i].ID,
				"title":    surveys[i].Title,
			}
		}
		c.JSON(http.StatusOK, res)
	}
}

// HandleInfo handles single survey retrieval
func HandleInfo(client *mongo.Client) func(c *gin.Context) {
	return func(c *gin.Context) {
		surveyCollection := client.Database("drawing_survey").Collection("surveys")
		surveyID := c.Param("surveyID")

		var survey Survey

		// Find survey by id
		objectID, err := primitive.ObjectIDFromHex(surveyID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "invalid id",
			})
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		err = surveyCollection.
			FindOne(ctx, bson.M{"_id": objectID}).
			Decode(&survey)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "survey not found",
			})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"title":        survey.Title,
			"numQuestions": survey.NumQuestions,
			"classes":      survey.Classes,
			"exitMessage":  survey.ExitMessage,
		})
	}
}

// HandleSubmit handles drawing submissions
func HandleSubmit(client *mongo.Client) func(c *gin.Context) {
	return func(c *gin.Context) {
		surveyCollection := client.Database("drawing_survey").Collection("surveys")
		submissionCollection := client.Database("drawing_survey").Collection("submissions")
		surveyID := c.Param("surveyID")

		var survey Survey

		// Check if survey exists
		objectID, err := primitive.ObjectIDFromHex(surveyID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "invalid id",
			})
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		err = surveyCollection.
			FindOne(ctx, bson.M{"_id": objectID}).
			Decode(&survey)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "survey not found",
			})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}

		// Get post form
		entriesData := c.PostForm("entries")

		var entries []Entry
		err = json.Unmarshal([]byte(entriesData), &entries)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "error parsing entries",
			})
			return
		}
		// Validate entries
		// Check if submitted entry count matches question count
		if len(entries) != survey.NumQuestions {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "question number mismatch",
			})
			return
		}
		// Check if all submitted entry classes are valid
		classesMap := make(map[string]struct{})
		for _, class := range survey.Classes {
			var v struct{}
			classesMap[class] = v
		}
		for _, entry := range entries {
			if _, ok := classesMap[entry.Class]; !ok {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "invalid class",
				})
				return
			}
		}

		// Insert submission
		submission := Submission{
			SurveyID:  surveyID,
			Entries:   entries,
			Timestamp: time.Now(),
		}
		ctx, cancel = context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		_, err = submissionCollection.InsertOne(ctx, submission)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{})
	}
}

// HandleExport handles survey creation
func HandleExport(client *mongo.Client) func(c *gin.Context) {
	return func(c *gin.Context) {
		surveyCollection := client.Database("drawing_survey").Collection("surveys")
		submissionCollection := client.Database("drawing_survey").Collection("submissions")
		surveyID := c.Param("surveyID")

		var survey Survey

		// Check if survey exists
		objectID, err := primitive.ObjectIDFromHex(surveyID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "invalid id",
			})
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		err = surveyCollection.
			FindOne(ctx, bson.M{"_id": objectID}).
			Decode(&survey)
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "survey not found",
			})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}

		// Get and validate token
		secretToken := c.Query("secretToken")
		if len(secretToken) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "secretToken is required",
			})
			return
		}
		if secretToken != survey.SecretToken {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "secretToken was incorrect",
			})
			return
		}

		// Query submissions for survey
		ctx, cancel = context.WithTimeout(context.Background(), DURATION)
		defer cancel()
		cur, err := submissionCollection.Find(ctx, bson.D{{"surveyid", surveyID}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}
		defer cur.Close(ctx)

		// Create archive
		zipFile, err := createArchive(os.TempDir(), cur)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error creating archive",
			})
			return
		}

		// Send archive
		zipFile, err = os.Open(zipFile.Name())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error creating archive",
			})
			return
		}
		defer func() {
			zipFile.Close()
			os.Remove(zipFile.Name())
		}()

		zipInfo, err := zipFile.Stat()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "error creating archive",
			})
			return
		}

		fname := fmt.Sprintf("survey%s-%d.zip", surveyID, time.Now().Unix())
		extraHeaders := map[string]string{
			"Content-Disposition": fmt.Sprintf("attachment; filename=\"%s\"", fname),
		}
		c.DataFromReader(http.StatusOK, zipInfo.Size(), "application/octet-stream", zipFile, extraHeaders)
	}
}

func createArchive(zipDir string, cur *mongo.Cursor) (*os.File, error) {
	zipFile, err := ioutil.TempFile(zipDir, "submissions.zip")
	if err != nil {
		return nil, err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Retrieve and add submissions to archive
	ctx, cancel := context.WithTimeout(context.Background(), DURATION)
	defer cancel()
	for cur.Next(ctx) {
		var submission Submission
		err := cur.Decode(&submission)
		if err != nil {
			return nil, err
		}
		err = addSubmissionToArchive(zipDir, zipWriter, submission)
		if err != nil {
			return nil, err
		}
	}

	return zipFile, nil
}

func addSubmissionToArchive(zipDir string, zipWriter *zip.Writer, submission Submission) error {
	// Save blob to temp file
	b, _ := json.Marshal(submission)
	blobName := fmt.Sprintf("%d.json", submission.Timestamp.Unix())
	blobFile, err := ioutil.TempFile(zipDir, blobName)
	if err != nil {
		return err
	}
	defer func() {
		blobFile.Close()
		os.Remove(blobFile.Name())
	}()

	ioutil.WriteFile(blobFile.Name(), b, 0755)

	// Add blobs to archive
	blobInfo, err := blobFile.Stat()
	if err != nil {
		return err
	}

	header, err := zip.FileInfoHeader(blobInfo)
	if err != nil {
		return err
	}
	header.Name = blobName
	header.Method = zip.Deflate

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}

	_, err = io.Copy(writer, blobFile)
	return err
}
