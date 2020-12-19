# Notes

## Models

    Survey {
      id: String
      secretKey: String
      classes: [String]
      numQuestions: Integer
    }

    Submission {
      submitterID: String
      surveyID: String
      entries: [{
        class: String
        entry: String
      }]
      timestamp: DateTime
    }

## Routes

    POST /create
    {
      numQuestions: Integer
      classes: [...]
    }
    200 {
      surveyID: String
      secretToken: String
    }

    GET /survey/{surveyID}/info
    200 {
      numQuestions: Integer
      classes: [String]
    }
    400 {
      error: String
    }

    POST /survey/{surveyID}/submit
    {
      entries: [{
        class: String
        entry: String
      }]
    }
    200
    404 {
      error: String
    }

    POST /survey/{surveyID}/export
    {
      secretToken: String
    }
    200 export.zip
    404 {
      error: String
    }