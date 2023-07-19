import React from "react";
import { Webcam } from "../components/Webcam";

export const MainContainer = () => {
  return (
    <div className="flex flex-col">
      <h1 className="font-bold m-auto">Do You Lift?</h1>
      <div>
        {/* <select name="Choose workout" size="3" multiple>
              <option>Dumbbell curl (left)</option>
              <option>Dumbbell curl (right)</option>
              <option>Bench Press</option>
              <option>Squat</option>
              <option>Deadlift</option>
            </select> */}
      </div>
      <Webcam />
    </div>
  );
};
