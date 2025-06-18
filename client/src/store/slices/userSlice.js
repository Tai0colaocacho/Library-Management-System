import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const userSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        loading: false,
    },
    reducers: {
        fetchAllUserRequest(state) {
            state.loading = true;
        },
        fetchAllUserSuccess(state, action) {
            state.loading = false;
            state.users = action.payload;
        },
        fetchAllUserFailed(state) {
            state.loading = false;
        },
        addNewAdminRequest(state) {
            state.loading = true;
        },
        addNewAdminSuccess(state) {
            state.loading = false;
        },
        addNewAdminFailed(state) {
            state.loading = false;
        },
    },
});

export const fetchAllUsers = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchAllUserRequest());
    await axios.get("http://localhost:4000/api/v1/users/admin/all", { withCredentials: true }).then((res) => {
        dispatch(userSlice.actions.fetchAllUserSuccess(res.data.users))
    }).catch((err) => {
        dispatch(userSlice.actions.fetchAllUserFailed(err.response.data.message))
    })
}

export const updateUser = (userId, userData) => async (dispatch) => {

    dispatch(userSlice.actions.addNewAdminRequest());
    try {
        const res = await axios.put(`http://localhost:4000/api/v1/users/admin/update/${userId}`, userData, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        });
        toast.success(res.data.message);
        dispatch(userSlice.actions.addNewAdminSuccess());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update user.");
        dispatch(userSlice.actions.addNewAdminFailed());
    }
};

export const addUser = (userData) => async (dispatch) => {
    dispatch(userSlice.actions.addNewAdminRequest());
    try {
        const res = await axios.post("http://localhost:4000/api/v1/users/admin/add", userData, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        });
        toast.success(res.data.message);
        dispatch(userSlice.actions.addNewAdminSuccess());
        dispatch(fetchAllUsers());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add user.");
        dispatch(userSlice.actions.addNewAdminFailed());
    }
};

export default userSlice.reducer; 