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
      <h1>Question {currQuestion + 1}: {questions[currQuestion]}</h1>

      <CanvasDraw
        ref={canvasRef}
        lazyRadius={0}
        immediateLoading={true}
      />
      <button onClick={() => {
        canvasRef.current.clear();
      }}>Reset</button>

      <button disabled={currQuestion === 0} onClick={() => {
        moveToQuestion(currQuestion - 1);
      }}>Prev</button>

      <button onClick={() => {
        moveToQuestion(currQuestion + 1);
      }}>Next</button>
    </>
  )
}