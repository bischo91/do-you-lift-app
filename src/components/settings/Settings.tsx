import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";

import Select from "react-select";
import { SettingsInput } from "./SettingsInput";
import { setSettings } from "../../redux/settings";
import store from "../../redux/store";
// import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import workout from "./workout.json";

export const Settings = () => {
  let [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: "armCurl", label: "Arm Curl" },
    { value: "squat", label: "Squat" },
    { value: "benchPress", label: "Bench Press" },
    // { value: 'deadlift', label: 'Deadlift' },
  ];
  const [selectedOption, setSelectedOption] = useState(null);
  const [angleUpInput, setAngleUpInput] = useState(null);
  const [angleDownInput, setAngleDownInput] = useState(null);
  const [thresholdTime, setThresholdTime] = useState(null);

  const changeOption = (selected) => {
    if (selected !== selectedOption) setSelectedOption(selected);
    const defaultSettings =
      store.getState().settings[selected.value].defaultSettings;
    const userDefinedSettings =
      store.getState().settings[selected.value].userDefinedSettings;
    setAngleUpInput(userDefinedSettings?.angleUp ?? defaultSettings.angleUp);
    setAngleDownInput(
      userDefinedSettings?.angleDown ?? defaultSettings.angleDown
    );
    setThresholdTime(
      userDefinedSettings?.thresholdTime ?? defaultSettings.thresholdTime
    );
    // setAngleUpInput(
    //   workout[selected?.value]?.userDefinedSettings?.angleUp ??
    //     workout[selected?.value]?.defaultSettings?.angleUp
    // );
    // setAngleDownInput(
    //   workout[selected?.value]?.userDefinedSettings?.angleDown ??
    //     workout[selected?.value]?.defaultSettings?.angleDown
    // );
    // setThresholdTime(
    //   workout[selected?.value]?.userDefinedSettings?.thresholdTime ??
    //     workout[selected?.value]?.defaultSettings?.thresholdTime
    // );
    setSelectedOption(selected);
    console.log(workout[selected?.value]);
    console.log(thresholdTime);
    console.log(store.getState());
  };

  const changeSetting = (e, settingKey) => {
    if (settingKey === "angleUp") setAngleUpInput(Number(e.target.value));
    else if (settingKey === "angleDown")
      setAngleDownInput(Number(e.target.value));
    else if (settingKey === "thresholdTime")
      setThresholdTime(Number(e.target.value));
  };

  const setToDefault = (settingKey) => {
    const selected = workout[selectedOption?.value];
    if (settingKey === "angleUp") {
      setAngleUpInput(selected.defaultSettings.angleUp);
      document.getElementById("angleUp").innerHTML =
        selected.defaultSettings.angleUp.toString();
    } else if (settingKey === "angleDown")
      setAngleDownInput(selected.defaultSettings.angleDown);
    else if (settingKey === "thresholdTime")
      setThresholdTime(selected.defaultSettings.thresholdTime);
    console.log(angleUpInput);
  };

  const getInput = (settingKey) => {
    if (settingKey === "angleUp") return angleUpInput;
    else if (settingKey === "angleDown") return angleDownInput;
    else if (settingKey === "thresholdTime") return thresholdTime;
  };

  const dispatch = useDispatch();
  const saveSettings = () => {
    dispatch(
      setSettings({
        [selectedOption.value]: {
          angleUp: angleUpInput,
          angleDown: angleDownInput,
          thresholdTime,
        },
      })
    );
  };
  const closeModal = () => {
    setIsOpen(false);
    console.log(store.getState());
    // console.log(test);
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
                    {["angleUp", "angleDown", "thresholdTime"].map(
                      (settingKey) => (
                        <SettingsInput
                          key={settingKey}
                          inputId={settingKey}
                          changeSetting={(e) => changeSetting(e, settingKey)}
                          setDefaultInput={() => setToDefault(settingKey)}
                          inputValue={getInput(settingKey)}
                        />
                      )
                    )}
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
