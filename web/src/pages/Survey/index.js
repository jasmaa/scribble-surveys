import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import Question from './Question';
import Finalize from './Finalize';
import Done from './Done';
import client from '../../client';

export default function Survey() {

  const { surveyID } = useParams();

  const [surveyData, setSurveyData] = useState(null);
  const [currQuestion, setCurrQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const getSurvey = async () => {
      const res = await client.get(`/survey/${surveyID}`);
      setSurveyData(res.data);
      setQuestions(
        new Array(res.data.numQuestions)
          .fill(null)
          .map(_ => res.data.classes[Math.floor(Math.random() * res.data.classes.length)])
      );
      setAnswers(new Array(res.data.numQuestions).fill(null));
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
      const res = await client.post(`/survey/${surveyID}/submit`, params);
      setIsDone(true);
    } catch (e) {
      console.log(e.response);
    }
  }

  // Survey data has not been loaded yet
  if (!surveyData || !canvasRef) {
    return <p>Loading...</p>
  }

  // Survey is done
  if (isDone) {
    return (
      <Done msg={surveyData.message ?? 'Thank you for taking this survey!'} />
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