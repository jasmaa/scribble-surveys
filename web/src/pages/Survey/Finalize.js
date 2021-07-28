import { useEffect, useRef } from "react";
import CanvasDraw from "react-canvas-draw";

export default function Finalize({ questions, answers, surveyData, moveToQuestion, submitSurvey, setIsReady }) {

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
      <h1 className="text-center">{surveyData.title}: Review</h1>
      {
        new Array(surveyData.numQuestions)
          .fill(null)
          .map((_, i) => (
            <>
              <h2 className="mt-5">Question {i + 1}: <strong>Draw "{questions[i]}"</strong></h2>

              <div className="my-2">
                <button className="btn btn-warning" onClick={() => {
                  moveToQuestion(i);
                }}>Edit</button>
              </div>

              <CanvasDraw
                ref={el => previewCanvasRefs.current[i] = el}
                lazyRadius={0}
                disabled={true}
                immediateLoading={true}
              />
            </>
          ))
      }
      <button className="btn btn-primary mt-5" onClick={submitSurvey}>Submit</button>
    </>
  )
}