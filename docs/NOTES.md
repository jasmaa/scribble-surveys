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

    POST /surveys
    {
      numQuestions: Integer
      classes: [...]
    }
    200 {
      surveyID: String
      secretToken: String
    }

    GET /surveys/{surveyID}
    200 {
      numQuestions: Integer
      classes: [String]
    }
    400 {
      error: String
    }

    POST /surveys/{surveyID}/submit
    {
      entries: [{
        class: String
        entry: String
      }]
    }
    200 {}
    404 {
      error: String
    }

    GET /surveys/{surveyID}/export?secretToken: String
    200 survey{surveyID}-{unix time}.zip
    404 {
      error: String
    }