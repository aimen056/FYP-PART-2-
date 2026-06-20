import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch all reports
export const fetchReports = createAsyncThunk(
  "pollution/fetchReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reports`);
      console.log("Fetched reports:", response.data); // Debug log
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch pollution reports.");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add a new report
export const addReport = createAsyncThunk(
  "pollution/addReport",
  async (report, { rejectWithValue, dispatch }) => {
    try {
      // Dispatch fetchReports to update the state with the new report
      await dispatch(fetchReports());
      return report; // Return the report from the component's axios call
    } catch (error) {
      toast.error("Failed to submit report");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit a report
export const editReport = createAsyncThunk(
  "pollution/editReport",
  async ({ id, ...report }, { rejectWithValue, dispatch }) => {
    try {
      // Update the state with the edited report data
      return { _id: id, ...report }; // Return the updated report
    } catch (error) {
      toast.error("Failed to update report");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a report
export const deleteReport = createAsyncThunk(
  "pollution/deleteReport",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/reports/${id}`);
      toast.success("Pollution report deleted!");
      // Dispatch fetchReports to update the state
      await dispatch(fetchReports());
      return id;
    } catch (error) {
      toast.error("Failed to delete report");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Verify a report
export const verifyReport = createAsyncThunk(
  "pollution/verifyReport",
  async ({ id, verificationStatus, rejectionComment }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/reports/${id}`, {
        verificationStatus,
        rejectionComment,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify report");
    }
  }
);

// Resolve a report
export const resolveReport = createAsyncThunk(
  "pollution/resolveReport",
  async ({ id, resolved }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/reports/${id}`, {
        resolved,
      });
      console.log("Resolved report:", response.data); // Debug log
      toast.success(`Report ${resolved ? "resolved" : "reopened"} successfully`);
      // Dispatch fetchReports to update the state
      await dispatch(fetchReports());
      return response.data;
    } catch (error) {
      console.error("Resolution error:", error);
      toast.error("Failed to update resolution status");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const repPollutionSlice = createSlice({
  name: "pollution",
  initialState: {
    pollutions: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.pollutions = action.payload;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addReport.fulfilled, (state, action) => {
        // State is already updated via fetchReports
      })
      .addCase(addReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editReport.fulfilled, (state, action) => {
        // Update the specific report in the state
        const index = state.pollutions.findIndex(report => report._id === action.payload._id);
        if (index !== -1) {
          state.pollutions[index] = action.payload;
        }
      })
      .addCase(editReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        // State is already updated via fetchReports
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(verifyReport.fulfilled, (state, action) => {
        // State is already updated via fetchReports
      })
      .addCase(verifyReport.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        // State is already updated via fetchReports
      })
      .addCase(resolveReport.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default repPollutionSlice.reducer;