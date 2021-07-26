package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/jasmaa/drawing-survey/internal/handlers"
)

func init() {
	// loads values from .env into the system
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
}

func main() {
	port := os.Getenv("PORT")
	if len(port) == 0 {
		port = "3000"
	}

	mongoURI := os.Getenv("MONGO_URI")

	// Connect to Mongo
	client, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
	if err != nil {
		panic(err)
	}
	ctx, _ := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		panic(err)
	}
	defer client.Disconnect(ctx)

	r := gin.Default()

	r.Use(cors.Default())

	r.POST("/api/v1/survey", handlers.HandleCreate(client))
	r.GET("/api/v1/survey/:surveyID", handlers.HandleInfo(client))
	r.POST("/api/v1/survey/:surveyID/submit", handlers.HandleSubmit(client))
	r.POST("/api/v1/survey/:surveyID/export", handlers.HandleExport())

	r.Run(fmt.Sprintf(":%s", port))
}
