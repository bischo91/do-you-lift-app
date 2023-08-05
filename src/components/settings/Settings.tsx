import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";

import Select from "react-select";
import { SettingsInput } from "./SettingsInput";
import workout from "./workout.json";

export const Settings = () => {
  let [isOpen, setIsOpen] = useState(false);
  console.log(workout);
  const options = [
    { value: "armCurl", label: "Arm Curl" },
    { value: "squat", label: "Squat" },
    { value: "benchPress", label: "Bench Press" },
    // { value: 'deadlift', label: 'Deadlift' },
  ];
  const [selectedOption, setSelectedOption] = useState(null);

  // set input states for angle up, down, time
  // on save settings define workout settings that can pass to parents or redux
  // on setDefault call workout's default
  const [angleUpInput, setAngleUpInput] = useState(null);
  const [angleDownInput, setAngleDownInput] = useState(null);
  const [timeThresholdInput, setTimeThresholdInput] = useState(null);

  const changeOption = (selected) => {
    if (selected !== selectedOption) setSelectedOption(selected);
    setAngleUpInput(workout[selected?.value]?.angle?.up);
    setAngleDownInput(workout[selected?.value]?.angle?.down);
    setTimeThresholdInput(workout[selected?.value]?.time);
    setSelectedOption(selected);
  };
  const changeAngleUp = (e) => {
    setAngleUpInput(Number(e.target.value));
  };
  const changeAngleDown = (e) => {
    setAngleDownInput(Number(e.target.value));
  };
  const changeThreholdTime = (e) => {
    setTimeThresholdInput(Number(e.target.value));
  };

  const setDefaultAngleUp = () => {
    console.log("set default");
    setAngleUpInput(workout[selectedOption?.value]?.angle?.up);
    (document.getElementById("angle_up_field") as HTMLInputElement).value =
      workout[selectedOption?.value]?.angle?.up;
  };
  const saveSettings = () => {
    console.log(angleUpInput);
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  const openModal = () => {
    setIsOpen(true);
  };
  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={openModal}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          Settings
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Workout Settings
                  </Dialog.Title>
                  <div className="mt-2">
                    <h3 className="text-md">
                      <Select
                        defaultValue={"Select"}
                        onChange={changeOption}
                        value={selectedOption}
                        options={options}
                        placeholder={"Select Workout"}
                        className="w-full m-auto my-4"
                      />
                    </h3>
                    <SettingsInput
                      changeInput={changeAngleUp}
                      setDefaultInput={setDefaultAngleUp}
                      inputValue={angleUpInput}
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Angle for Up:
                    </label>
                    <div className="relative mb-4 text-gray-700">
                      <input
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        type="number"
                        name="angleUp"
                        onChange={changeAngleUp}
                        defaultValue={angleUpInput}
                        id="angle_up_field"
                        onFocus={(e) => (e.target.value = "")}
                        onBlur={() => {
                          (
                            document.getElementById(
                              "angle_up_field"
                            ) as HTMLInputElement
                          ).value = angleUpInput;
                        }}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-300"
                        onClick={setDefaultAngleUp}
                      >
                        Set Default
                      </button>
                    </div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Angle for Down:
                    </label>
                    <div className="relative mb-4 text-gray-700">
                      <input
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        type="number"
                        name="angleUp"
                        onChange={changeAngleUp}
                        defaultValue={angleUpInput}
                        id="angle_up_field"
                        onFocus={(e) => (e.target.value = "")}
                      />
                      <button
                        className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-300"
                        onClick={setDefaultAngleUp}
                      >
                        Set Default
                      </button>
                    </div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Threshold Time:
                    </label>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={saveSettings}
                      disabled={!angleUpInput}
                    >
                      Save Settings
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
