import { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";

export default function Finalize({ currQuestion, questions, answers, surveyData, moveToQuestion, submitSurvey, setIsReady }) {

  const previewCanvasRefs = useRef(new Array(surveyData.numQuestions).fill(null));

  useEffect(() => {
    setTimeout(() => {
      for (let i = 0; i < surveyData.numQuestions; i++) {
        previewCanvasRefs.current[i].loadSaveData(answers[i]);
      }
      setIsReady(true);
    }, 100);
  });

  return (
    <>
      <h1>Review</h1>
      {
        new Array(surveyData.numQuestions)
          .fill(null)
          .map((_, i) => (
            <>
              <h2>Question {i + 1}: {questions[i]}</h2>
              <button onClick={() => {
                moveToQuestion(i);
              }}>Edit</button>
              <CanvasDraw
                ref={el => previewCanvasRefs.current[i] = el}
                lazyRadius={0}
                disabled={true}
                immediateLoading={true}
              />
            </>
          ))
      }
      <button onClick={submitSurvey}>Submit</button>
    </>
  )
}