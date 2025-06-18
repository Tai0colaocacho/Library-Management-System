import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const { data } = await axios.get("http://localhost:4000/api/v1/notifications/my-notifications", { 
                withCredentials: true,
                params: filters
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { dispatch, rejectWithValue }) => {
        try {
            await axios.put(`http://localhost:4000/api/v1/notifications/my-notifications/${notificationId}/mark-read`, {}, { withCredentials: true });
            dispatch(fetchNotifications());
            return notificationId;
        } catch (error) {
            toast.error("Failed to mark as read.");
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const { data } = await axios.put("http://localhost:4000/api/v1/notifications/my-notifications/mark-all-read", {}, { withCredentials: true });
            toast.success(`${data.modifiedCount} notifications marked as read.`);
            dispatch(fetchNotifications());
        } catch (error) {
            toast.error("Failed to mark all as read.");
            return rejectWithValue(error.response.data.message);
        }
    }
);


const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.notifications.filter(n => n.status === 'unread').length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default notificationSlice.reducer;