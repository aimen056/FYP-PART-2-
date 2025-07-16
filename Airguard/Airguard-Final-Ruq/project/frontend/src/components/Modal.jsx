import React, { useEffect, useRef, useState } from "react";
import { BsXLg } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { createAlert, updateAlert } from "../redux/features/alertSlice";
import { useDispatch } from "react-redux";

const Modal = ({ modalClose, alertData }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    unregister,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (alertData) {
      reset(alertData);
    } else {
      reset({
        alertName: "",
        location: "",
        pollutantName: "",
        thresholdType: "AQI",
        aqiCondition: "",
        aqiValue: "",
        status: true,
      });
    }
  }, [alertData]);

  const selectedThreshold = watch("thresholdType");

  const modalRef = useRef();
  const onClose = (e) => {
    if (modalRef.current === e.target) {
      modalClose();
    }
  };
  const onSubmit = (data) => {
    const alertId = alertData?._id || Date.now(); // Generate a unique ID if missing
    if (alertData) {
      dispatch(updateAlert({ id: alertId, ...data }));
      
    } else {
      dispatch(createAlert({ id: alertId, ...data }));
      reset()
    }
    modalClose();
  };

  // No need for unregister since we only have AQI type now

  return (
    <div
      ref={modalRef}
      onClick={onClose}
      className="fixed inset-0 bg-slate-500/80 backdrop-blur-[2px] z-30 flex justify-center items-center dark:text-[#E4E4E7]"
    >
      <div className="m-6 flex flex-col gap-2 sm:w-full sm:max-w-3xl sm:min-w-[300px]">
        <button onClick={modalClose}>
          <BsXLg className="place-self-end size-6" />
        </button>
        <div className="bg-surfaceColor p-7 flex flex-col gap-3  max-h-[80vh] overflow-y-scroll sm:overflow-y-hidden">
          <div>
            <h1 className="text-xl uppercase font-semibold place-self-center underline underline-offset-4 decoration-primaryBtnBg decoration-2 ">
              {alertData ? "Edit Alert" : "Add New Alert"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center sm:w-full"
          >
            <div className="flex flex-col sm:flex-row sm:gap-16 w-full">
              <div className="flex flex-col gap-3 sm:w-1/2">
                <div className="flex flex-col mt-6">
                  <label
                    htmlFor="alertName"
                    className="text-primaryText/70 dark:text-[#E4E4E7]/80 font-semibold uppercase text-sm"
                  >
                    Alert Name
                  </label>
                  <input
                    type="text"
                    id="alertName"
                    placeholder="Enter Alert Name"
                    className="w-full p-2 border border-primaryBtnText/50 rounded-md bg-background"
                    // className={errors.alertName ? "AlertName" : ""}
                    {...register("alertName", {
                      required: true,
                    })}
                  />
                  {errors.alertName && (
                    <span className="text-xs text-red-600">
                      **Enter Alert Name
                    </span>
                  )}
                </div>
                <div className="flex flex-col mt-6">
                  <label
                    htmlFor="location"
                    className="text-primaryText/70 dark:text-[#E4E4E7]/80 font-semibold uppercase text-sm"
                  >
                    Location
                  </label>
                  <select
                    id="location"
                    {...register("location", {
                      required: true,
                    })}
                    className="w-full p-2 mt-1 border border-primaryBtnText/50 rounded-md bg-background text-primaryText/60 font-medium text-sm"
                  >
                    <option value="">Select Location</option>
                    <option value="Zone1">Zone 1</option>
                    <option value="Zone2">Zone 2</option>
                    <option value="Zone3">Zone 3</option>
                  </select>
                  {errors.location && (
                    <span className="text-red-600 text-xs">
                      **Select Location
                    </span>
                  )}
                </div>
                <div className="flex flex-col mt-6">
                  <label
                    htmlFor="pollutantName"
                    className="text-primaryText/70 dark:text-[#E4E4E7]/80 font-semibold uppercase text-sm"
                  >
                    Pollutant Name
                  </label>
                  <select
                    id="pollutantName"
                    {...register("pollutantName", {
                      required: true,
                    })}
                    className="w-full p-2 mt-1 border border-primaryBtnText/50 rounded-md bg-background text-primaryText/60 font-medium text-sm"
                  >
                    <option value="">Please Select Pollutant Name</option>
                    <option value="PM2.5">PM2.5</option>
                    <option value="PM10">PM10</option>
                    <option value="NO2">NO2</option>
                    <option value="O3">O3</option>
                    <option value="CO">CO</option>
                  </select>
                  {errors.pollutantName && (
                    <span className="text-red-600 text-xs">
                      **Select Pollutant Name
                    </span>
                  )}
                </div>

                <div></div>
              </div>
              <div className="flex flex-col gap-3 sm:w-1/2">
                <div className="flex flex-col mt-6">
                  <label className="text-primaryText/70 dark:text-[#E4E4E7]/80 font-semibold uppercase text-sm">
                    Threshold Type
                  </label>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex">
                      <input
                        type="radio"
                        id="aqi"
                        value="AQI"
                        checked
                        {...register("thresholdType", {
                          required: "Please select a threshold type",
                        })}
                      />
                      <label
                        htmlFor="aqi"
                        className="ml-2 text-primaryText/80 font-medium text-sm"
                      >
                        {"AQI (e.g., >100 or <50)"}
                      </label>
                    </div>
                  </div>
                                    {/* AQI Options */}
                    <div className="mt-6 text-primaryText/60 font-medium text-sm">
                      <label className="text-primaryText/70 dark:text-[#E4E4E7]/80 font-semibold uppercase text-sm">
                        AQI Options:
                      </label>
                      <div className="flex items-center gap-2">
                        <div>
                          {/* Condition Selector */}
                          <select
                            {...register("aqiCondition", {
                            required: "Please select a condition",
                            })}
                            className="p-2 border border-primaryBtnText/50 rounded-md bg-background"
                          >
                            <option value="">Select Condition</option>
                            <option value="greater">Greater than</option>
                            <option value="less">Less than</option>
                          </select>
                          {errors.aqiCondition && (
                            <span className="text-xs text-red-600">
                              **{errors.aqiCondition.message}
                            </span>
                          )}
                        </div>

                        <div>
                          {" "}
                          <select
                            {...register("aqiValue", {
                            required: "Please select an AQI value",
                            })}
                            className="p-2 border border-primaryBtnText/50 rounded-md bg-background"
                          >
                            <option value="">Select AQI Value</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="150">150</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                          </select>
                          {errors.aqiValue && (
                            <span className="text-xs text-red-600">
                              **{errors.aqiValue.message}
                            </span>
                          )}
                        </div>
                        {/* AQI Value Selector */}
                      </div>

                      {/* Error Messages */}
                    </div>


                </div>
              </div>
            </div>

            <input
              type="submit"
              className="bg-primaryBtnBg text-primaryBtnText font-semibold p-2 mt-4 w-1/2 rounded-md cursor-pointer"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
// alertId: "",
// alertName: "",
// pollutantName: [],
// thresholdValue: "",
// alertType: "",
// alertStatus: "",
// createdAt: "",
// location: "",
// healthConcernType: "",
// frequencyOfAlert: "",
export default Modal;