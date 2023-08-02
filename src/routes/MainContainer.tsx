import React, { useState } from "react";

import Select from "react-select";
import { Settings } from "../components/settings/Settings";
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
      <div className="flex w-full m-auto">
        <Select
          defaultValue={"Select"}
          onChange={changeOption}
          value={selectedOption}
          options={options}
          className="w-1/2 m-auto"
        />
        <div className="m-auto">
          <Settings />
        </div>
      </div>
      <Webcam workoutOption={selectedOption} />
    </div>
  );
};
