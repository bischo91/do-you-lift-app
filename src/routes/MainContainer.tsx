import React, { useState } from "react";

import Select from "react-select";
import { Webcam } from "../components/Webcam";

export const MainContainer = () => {
  const options = [
    { value: "armCurl", label: "Arm Curl" },
    { value: "squat", label: "Squat" },
    { value: "benchPress", label: "Bench Press" },
    // { value: 'deadlift', label: 'Deadlift' },
    { value: "demo", label: "Demo" },
  ];
  const [selectedOption, setSelectedOption] = useState(null);

  const changeOption = (selected) => {
    if (!selected) setSelectedOption(options[3]); //demo for now
    else if (selected !== selectedOption) setSelectedOption(selected);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="m-auto font-bold">Do You Lift?</h1>
      <div>
        <Select
          defaultValue={"Select T"}
          onChange={changeOption}
          value={selectedOption}
          options={options}
        />
      </div>
      <Webcam workoutOption={selectedOption} />
    </div>
  );
};
