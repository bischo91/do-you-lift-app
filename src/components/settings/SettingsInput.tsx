import React from "react";

export const SettingsInput = ({
  disabled,
  changeSetting,
  setDefaultInput,
  inputValue,
  inputId,
  hasDefaultSetting,
}) => {
  const validateAngle = (angle) =>
    Number.isInteger(Number(angle)) && 0 <= angle && angle <= 180;
  const validateTime = (time) => Number.isFinite(Number(time)) && 0 <= time;
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        {inputId
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())}
        :
      </label>
      <div className="relative mb-4 text-gray-700">
        <input
          className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg disabled:bg-gray-200 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          type="number"
          onChange={changeSetting}
          value={inputValue ?? "-"}
          id={inputId}
          onFocus={(e) => (e.target.value = "")}
          onBlur={() => {
            (document.getElementById(inputId) as HTMLInputElement).value =
              inputValue;
          }}
          disabled={disabled}
        />
        {hasDefaultSetting && (
          <button
            className="absolute inset-y-0 right-0 flex items-center px-4 text-sm text-white bg-blue-500 rounded-r-lg hover:bg-blue-300"
            onClick={setDefaultInput}
          >
            Set To Default
          </button>
        )}
        {inputId.includes("angle") && !validateAngle(inputValue) && (
          <span className="text-sm text-red-600">
            Angle must be an integer between 0 and 180
          </span>
        )}
        {inputId.includes("thresholdTime") && !validateTime(inputValue) && (
          <span className="text-sm text-red-600">
            Threshold Time must be an integer greater than 0
          </span>
        )}
      </div>
    </div>
  );
};
