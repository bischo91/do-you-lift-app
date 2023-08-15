import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";

import Select from "react-select";
import { SettingsInput } from "./SettingsInput";
import { setSettings } from "../../redux/settings";
import store from "../../redux/store";
import { useDispatch } from "react-redux";
import workout from "./workout.json";

export const Settings = () => {
  let [isOpen, setIsOpen] = useState(false);

  const options = Object.keys(store.getState().settings)
    .map((value) => ({
      value,
      label: store.getState().settings[value].label,
    }))
    .filter(({ value }) => value !== "demo");

  const [selectedOption, setSelectedOption] = useState(null);
  const [angleUpInput, setAngleUpInput] = useState(null);
  const [angleDownInput, setAngleDownInput] = useState(null);
  const [thresholdTime, setThresholdTime] = useState(null);
  const [newWorkout, setNewWorkout] = useState("");
  const [isTwoSide, setIsTwoSide] = useState(false);
  const [bodyPoints, setBodyPoints] = useState(null);
  const changeOption = (selected) => {
    if (selected !== selectedOption) setSelectedOption(selected);
    if (selected.value !== "newWorkout") {
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
      setIsTwoSide(store.getState().settings[selected.value].isTwoSide);
      setBodyPoints({
        value: store.getState().settings[selected.value].bodyPoints,
        label: store
          .getState()
          .settings[selected.value].bodyPoints.replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
      });
    } else {
      setAngleUpInput(null);
      setAngleDownInput(null);
      setThresholdTime(null);
      setIsTwoSide(false);
      setBodyPoints(null);
      setNewWorkout("");
    }
    console.log(store.getState());
    // console.log(!hasDefaultSetting);
  };

  const changeSetting = (e, settingKey) => {
    if (settingKey === "angleUp")
      setAngleUpInput(e.target.value ? Number(e.target.value) : "");
    else if (settingKey === "angleDown")
      setAngleDownInput(e.target.value ? Number(e.target.value) : "");
    else if (settingKey === "thresholdTime")
      setThresholdTime(e.target.value ? Number(e.target.value) : "");
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
    const workoutValue =
      selectedOption.value === "newWorkout" ? newWorkout : selectedOption.value;

    dispatch(
      setSettings({
        [workoutValue]: {
          userDefinedSettings: {
            angleUp: angleUpInput,
            angleDown: angleDownInput,
            thresholdTime,
          },
          isTwoSide,
          bodyPoints,
        },
      })
    );
    setIsOpen(false);
    console.log(store.getState());
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
          className="inline-flex justify-center px-4 py-2 mr-4 font-bold text-white bg-blue-500 border border-transparent rounded-md rounded-r-lg py-2rounded-md text-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:bg-blue-300"
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
                        onChange={changeOption}
                        value={selectedOption}
                        options={[
                          ...options,
                          {
                            value: "newWorkout",
                            label: "(Create New Workout)",
                          },
                        ]}
                        // options={options}
                        onMenuOpen={() =>
                          Object.keys(store.getState().settings).forEach(
                            (value) => {
                              console.log(store.getState().settings);
                              console.log(options);
                              console.log(value);
                              if (
                                options.filter(
                                  (option) => option.value === value
                                ).length === 0 &&
                                value !== "demo"
                              )
                                options.push({
                                  value,
                                  label: store.getState().settings[value].label,
                                });
                            }
                          )
                        }
                        placeholder={"Select Workout"}
                        className="w-full m-auto my-4"
                      />
                    </h3>
                    {selectedOption?.value === "newWorkout" && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Workout Name:
                        </label>
                        <div className="relative mb-4 text-gray-700">
                          <input
                            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            type="text"
                            onChange={(e) => setNewWorkout(e.target.value)}
                            value={newWorkout}
                            id="newWorkout"
                            onFocus={(e) => (e.target.value = "")}
                            onBlur={() => {
                              (
                                document.getElementById(
                                  "newWorkout"
                                ) as HTMLInputElement
                              ).value = newWorkout;
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {["angleUp", "angleDown", "thresholdTime"].map(
                      (settingKey) => (
                        <SettingsInput
                          disabled={!selectedOption}
                          key={settingKey}
                          inputId={settingKey}
                          changeSetting={(e) => changeSetting(e, settingKey)}
                          setDefaultInput={() => setToDefault(settingKey)}
                          inputValue={getInput(settingKey)}
                          hasDefaultSetting={
                            store.getState().settings[selectedOption?.value]
                              ?.defaultSettings
                          }
                        />
                      )
                    )}
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Count left and right separately?
                      <input
                        type="checkbox"
                        disabled={
                          store.getState().settings[selectedOption?.value]
                            ?.defaultSettings || !selectedOption
                        }
                        checked={isTwoSide}
                        onChange={(e) => {
                          console.log(e.target.checked);
                          setIsTwoSide(e.target.checked);
                        }}
                        className="ml-4"
                      />
                    </label>
                    <div className="inline-flex my-4">
                      <label className="block mb-2 mr-4 text-sm font-medium text-gray-900">
                        Which body part?
                      </label>
                      <Select
                        className="h-4 mr-4"
                        options={[
                          { value: "arms", label: "Arms" },
                          { value: "legs", label: "Legs" },
                        ]}
                        isDisabled={
                          store.getState().settings[selectedOption?.value]
                            ?.defaultSettings || !selectedOption
                        }
                        value={bodyPoints}
                        onChange={(e) => {
                          setBodyPoints(e);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 mr-4 font-bold text-white bg-blue-500 border border-transparent rounded-md rounded-r-lg text-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:bg-blue-300"
                      onClick={saveSettings}
                      disabled={
                        !angleUpInput?.toString() ||
                        !angleDownInput?.toString() ||
                        !thresholdTime?.toString() ||
                        !bodyPoints
                      }
                    >
                      {selectedOption?.value === "newWorkout"
                        ? "Create and Save Setting"
                        : "Save Setting"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 mr-4 font-bold text-white bg-blue-500 border border-transparent rounded-md rounded-r-lg text-md disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover:bg-blue-300"
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
