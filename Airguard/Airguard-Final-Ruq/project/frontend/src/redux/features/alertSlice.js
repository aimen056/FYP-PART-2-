import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

// Fetch all alerts
export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAlerts",
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/alerts`);
    return response.data;
  }
);

// Create new alert
export const createAlert = createAsyncThunk(
  "alerts/createAlert",
  async (alertData) => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/alerts`, alertData);
    return response.data;
  }
);

// Update an alert
export const updateAlert = createAsyncThunk(
  "alerts/updateAlert",
  async ({ id, ...alertData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/auth/alerts/${id}`, alertData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Delete an alert
export const deleteAlert = createAsyncThunk(
  "alerts/deleteAlert",
  async (id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/auth/alerts/${id}`);
    console.log("Deleted Alert ID:", id);  // Debugging log

    return id;
  }
);

// Toggle alert status
export const toggleAlertStatus = createAsyncThunk(
  "alerts/toggleAlertStatus",
  async (id) => {
    const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/auth/alerts/${id}/toggle-status`);
    return response.data;
  }
);

const alertSlice = createSlice({
  name: "alerts",
  initialState: {
    alerts: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Alerts
      .addCase(fetchAlerts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Create Alert
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alerts.push(action.payload);
      
      })

      // Update Alert
      .addCase(updateAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(
          (alert) => alert._id === action.payload._id
        );
        if (index !== -1) {
          state.alerts[index] = action.payload;
          toast.success("Alert Updated Successfully");
        }
      })
      

      // Delete Alert
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter((alert) => alert._id !== action.payload);
        toast.success("Alert Deleted Successfully");
      })
      
      // Toggle Alert Status
      .addCase(toggleAlertStatus.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(
          (alert) => alert._id === action.payload._id
        );
        if (index !== -1) {
          state.alerts[index].status = action.payload.status;
        }
      });
  },
});

export default alertSlice.reducer;
