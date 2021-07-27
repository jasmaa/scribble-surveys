import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import Question from './Question';
import Finalize from './Finalize';
import Done from './Done';
import Error from './Error';
import client from '../../client';

export default function Survey() {

  const { surveyID } = useParams();

  const [surveyData, setSurveyData] = useState(null);
  const [currQuestion, setCurrQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  const canvasRef = useRef(null);

  useEffect(() => {
    const getSurvey = async () => {
      try {
        const res = await client.get(`/surveys/${surveyID}`);
        setSurveyData(res.data);
        setQuestions(
          new Array(res.data.numQuestions)
            .fill(null)
            .map(_ => res.data.classes[Math.floor(Math.random() * res.data.classes.length)])
        );
        setAnswers(new Array(res.data.numQuestions).fill(null));
      } catch (err) {
        setErrorCode(err.response.status);
      }
    }
    getSurvey();
  }, []);


  const moveToQuestion = (v) => {
    if (isReady) {
      if (canvasRef.current) {
        // Save current canvas
        const currAnswer = JSON.parse(JSON.stringify(canvasRef.current.getSaveData()));
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currQuestion] = currAnswer;
          return newAnswers;
        });
      }
      setCurrQuestion(v);
      setIsReady(false);
    }
  }

  const submitSurvey = async () => {
    const entries = [];
    for (let i = 0; i < surveyData.numQuestions; i++) {
      entries.push({
        class: questions[i],
        entry: answers[i],
      });
    }

    const params = new URLSearchParams();
    params.append('entries', JSON.stringify(entries));

    try {
      const res = await client.post(`/surveys/${surveyID}/submit`, params);
      setIsDone(true);
    } catch (err) {
      setErrorCode(err.response.status);
    }
  }

  // Error occured
  if (errorCode) {
    return <Error errorCode={errorCode} />
  }

  // Survey data has not been loaded yet
  if (!surveyData || !canvasRef) {
    return <p>Loading...</p>
  }

  // Survey is done
  if (isDone) {
    return (
      <Done exitMessage={!!surveyData.exitMessage ? surveyData.exitMessage : 'Thank you for taking this survey!'} />
    );
  }

  // Survey is being taken
  return (
    <div>
      {
        currQuestion < surveyData.numQuestions
          ? (
            <Question
              canvasRef={canvasRef}
              currQuestion={currQuestion}
              questions={questions}
              answers={answers}
              surveyData={surveyData}
              moveToQuestion={moveToQuestion}
              setIsReady={setIsReady}
            />
          )
          : (
            <Finalize
              canvasRef={canvasRef}
              currQuestion={currQuestion}
              questions={questions}
              answers={answers}
              surveyData={surveyData}
              moveToQuestion={moveToQuestion}
              submitSurvey={submitSurvey}
              setIsReady={setIsReady}
            />
          )
      }
      <pre>{JSON.stringify(answers, null, 2)}</pre>
    </div>
  );
}