package handlers

import (
	"context"
	"encoding/json"
	"net/http"
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

		// Insert survey
		survey := Survey{
			Title:        title,
			Classes:      classes,
			NumQuestions: numQuestions,
			ExitMessage:  exitMessage,
			SecretToken:  uuid.New().String(),
		}

		res, err := collection.InsertOne(context.Background(), survey)
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
		cur, err := surveyCollection.Find(context.Background(), bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "database error",
			})
			return
		}
		for cur.Next(context.TODO()) {
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
		err = surveyCollection.
			FindOne(context.Background(), bson.M{"_id": objectID}).
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
		err = surveyCollection.
			FindOne(context.Background(), bson.M{"_id": objectID}).
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
		_, err = submissionCollection.InsertOne(context.Background(), submission)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return
		}
		c.JSON(http.StatusOK, gin.H{})
	}
}

// HandleExport handles survey creation
func HandleExport() func(c *gin.Context) {
	return func(c *gin.Context) {
		c.String(http.StatusOK, "export")
	}
}
