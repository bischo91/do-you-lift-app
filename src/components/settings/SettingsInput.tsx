import React from "react";

export const SettingsInput = ({
  changeSetting,
  setDefaultInput,
  inputValue,
  inputId,
}) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        Angle for Up:
      </label>
      <div className="relative mb-4 text-gray-700">
        <input
          className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          type="number"
          onChange={changeSetting}
          defaultValue={inputValue}
          id={inputId}
          onFocus={(e) => (e.target.value = "")}
          onBlur={() => {
            (document.getElementById(inputId) as HTMLInputElement).value =
              inputValue;
          }}
        />
        <button
          className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-300"
          onClick={setDefaultInput}
        >
          Set Default
        </button>
      </div>
    </div>
  );
};
