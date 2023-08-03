import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";

import Select from "react-select";
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
  //   const [angleUp, setAngleUp] = useState(null);
  //   const [angleDown, setAngleDown] = useState(null);
  //   const [thresholdTime, setThresholdTime] = useState(null)
  const [workoutSetting, setWorkoutSetting] = useState(workout);
  const changeOption = (selected) => {
    if (selected !== selectedOption) setSelectedOption(selected);
  };

  const changeAngleUp = (e) => {
    console.log(e.target.value);
    console.log(workoutSetting);
    workout[selectedOption?.value].angle.up = Number(e.target.value);
    console.log(workout);
    setWorkoutSetting((prevState) => ({
      ...prevState,
      [selectedOption.value]: { angle: { up: Number(e.target.value) } },
    }));
    console.log(workoutSetting);
    // setWorkoutSetting()
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
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Angle for Up:
                    </label>
                    <div className="relative text-gray-700">
                      <input
                        className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        type="number"
                        name="angleUp"
                        value={workoutSetting[selectedOption?.value]?.angle.up}
                        onChange={changeAngleUp}
                      />
                      <button className="absolute inset-y-0 right-0 flex items-center px-4 font-bold text-white bg-blue-500 rounded-r-lg hover:bg-blue-300">
                        Set Default
                      </button>
                    </div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Angle for Down:
                    </label>
                    <input
                      className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      name="angleDown"
                      value={workout[selectedOption?.value]?.angle.down}
                    />
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Time:
                    </label>
                    <input
                      className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                      type="number"
                      name="time"
                      value={workout[selectedOption?.value]?.time}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
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
