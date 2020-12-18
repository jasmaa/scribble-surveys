package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

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

	r := gin.Default()

	r.POST("/create", handlers.HandleCreate())
	r.GET("/survey/:surveyID/info", handlers.HandleInfo())
	r.POST("/survey/:surveyID/submit", handlers.HandleSubmit())
	r.POST("/survey/:surveyID/export", handlers.HandleExport())

	r.Run(fmt.Sprintf(":%s", port))
}
