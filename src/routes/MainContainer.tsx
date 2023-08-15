import React, { useState } from "react";

import Select from "react-select";
import { Settings } from "../components/settings/Settings";
import { Webcam } from "../components/Webcam";
import store from "../redux/store";

export const MainContainer = () => {
  const options = Object.keys(store.getState().settings).map((value) => ({
    value,
    label: store.getState().settings[value].label,
  }));
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="m-auto font-bold">Do You Lift?</h1>
      <div className="flex w-full m-auto">
        <Select
          defaultValue={"Select"}
          onChange={(selected) => {
            if (selected !== selectedOption) setSelectedOption(selected);
          }}
          onMenuOpen={() =>
            Object.keys(store.getState().settings).forEach((value) => {
              if (
                options.filter((option) => option.value === value).length === 0
              )
                options.push({
                  value,
                  label: store.getState().settings[value].label,
                });
            })
          }
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
