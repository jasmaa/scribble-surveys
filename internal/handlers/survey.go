package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HandleCreate handles survey creation
func HandleCreate() func(c *gin.Context) {
	return func(c *gin.Context) {
		c.String(http.StatusOK, "create")
	}
}

// HandleInfo handles survey creation
func HandleInfo() func(c *gin.Context) {
	return func(c *gin.Context) {
		c.String(http.StatusOK, "info")
	}
}

// HandleSubmit handles drawing submissions
func HandleSubmit() func(c *gin.Context) {
	return func(c *gin.Context) {
		surveyID := c.Param("surveyID")
		c.String(http.StatusOK, "Submit %s", surveyID)
	}
}

// HandleExport handles survey creation
func HandleExport() func(c *gin.Context) {
	return func(c *gin.Context) {
		c.String(http.StatusOK, "export")
	}
}
