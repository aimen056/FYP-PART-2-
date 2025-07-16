import { configureStore } from "@reduxjs/toolkit";
import alertReducer from "./features/alertSlice";
import repPollutionReducer from "./features/repPollutionSlice";

export default configureStore({
  reducer: {
    alert: alertReducer,
    pollution: repPollutionReducer,
  },
});