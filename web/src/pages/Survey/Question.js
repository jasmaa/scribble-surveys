import { useEffect, useState } from "react";
import CanvasDraw from "react-canvas-draw";

export default function Question({ canvasRef, currQuestion, questions, answers, surveyData, moveToQuestion, setIsReady }) {

  // Load canvas if possible
  useEffect(() => {
    setTimeout(() => {
      if (canvasRef.current) {
        if (answers[currQuestion]) {
          canvasRef.current.loadSaveData(answers[currQuestion]);
        } else {
          canvasRef.current.clear();
        }
      }
      setIsReady(true);
    }, 100);
  });

  return (
    <>
      <h1 className="text-center">{surveyData.title}</h1>
      
      <h2 className="mt-3">Question {currQuestion + 1}: <strong>Draw "{questions[currQuestion]}"</strong></h2>

      <div className="my-3">
        <button className="btn btn-danger" onClick={() => {
          canvasRef.current.clear();
        }}>Clear</button>
      </div>

      <CanvasDraw
        ref={canvasRef}
        lazyRadius={0}
        immediateLoading={true}
      />

      <div className="mt-3">
        <button className="btn btn-primary m-1" disabled={currQuestion === 0} onClick={() => {
          moveToQuestion(currQuestion - 1);
        }}>Prev</button>

        <button className="btn btn-primary m-1" onClick={() => {
          moveToQuestion(currQuestion + 1);
        }}>Next</button>
      </div>
    </>
  )
}