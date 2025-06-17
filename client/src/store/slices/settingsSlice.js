import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        loading: false,
        error: null,
        settings: null,
        message: null,
    },
    reducers: {
        fetchSettingsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        fetchSettingsSuccess(state, action) {
            state.loading = false;
            state.settings = action.payload;
        },
        fetchSettingsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        updateSettingsRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        updateSettingsSuccess(state, action) {
            state.loading = false;
            state.message = action.payload.message;
            state.settings = action.payload.settings;
        },
        updateSettingsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        resetSettingsSlice(state) {
            state.error = null;
            state.message = null;
        }
    }
});

export const {
    fetchSettingsRequest, fetchSettingsSuccess, fetchSettingsFailed,
    updateSettingsRequest, updateSettingsSuccess, updateSettingsFailed,
    resetSettingsSlice
} = settingsSlice.actions;


export const fetchSettings = () => async (dispatch) => {
    dispatch(fetchSettingsRequest());
    try {
        const { data } = await axios.get("http://localhost:4000/api/v1/settings/", { withCredentials: true });
        dispatch(fetchSettingsSuccess(data.settings));
    } catch (error) {
        dispatch(fetchSettingsFailed(error.response.data.message));
    }
};

export const updateSettings = (settingsData) => async (dispatch) => {
    dispatch(updateSettingsRequest());
    try {
        const { data } = await axios.put("http://localhost:4000/api/v1/settings/update", settingsData, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" }
        });
        dispatch(updateSettingsSuccess(data));
        toast.success(data.message);
    } catch (error) {
        dispatch(updateSettingsFailed(error.response.data.message));
        toast.error(error.response.data.message);
    }
};

export default settingsSlice.reducer;