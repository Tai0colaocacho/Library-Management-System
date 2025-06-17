import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { toggleRecordBookPopup } from "./popUpSlice";
import { toast } from 'react-toastify';
const borrowSlice = createSlice({
    name: "borrowings",
    initialState: {
        loading: false,
        error: null,
        userBorrowedBooks: [],
        allBorrowedBooks: [],
        message: null,
    },
    reducers: {
        fetchUserBorrowedBooksRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchUserBorrowedBooksSuccess(state, action) {
            state.loading = false;
            state.userBorrowedBooks = action.payload;
        },
        fetchUserBorrowedBooksFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        recordBookRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        recordBookSuccess(state, action) {
            state.loading = false;
            state.message = action.payload;
        },
        recordBookFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        fetchAllBorrowedBooksRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchAllBorrowedBooksSuccess(state, action) {
            state.loading = false;
            state.allBorrowedBooks = action.payload;
        },
        fetchAllBorrowedBooksFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        returnBookRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        returnBookSuccess(state, action) {
            state.loading = false;
            state.message = action.payload;
        },
        returnBookFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        resetBorrowSlice(state) {
            state.loading = false;
            state.error = null;
            state.message = null;
        }
    }
})


export const fetchUserBorrowedBooks = () => async (dispatch) => {
    dispatch(borrowSlice.actions.fetchUserBorrowedBooksRequest())
    await axios.get("http://localhost:4000/api/v1/borrowings/my-borrowed-books", { withCredentials: true }).then((res) => {
        dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(res.data.borrowedBooks))
    }).catch((err) => {
        dispatch(borrowSlice.actions.fetchUserBorrowedBooksFailed(err.response.data.message))
    })
}
export const fetchAllBorrowedBooks = () => async (dispatch) => {
    dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest())
    await axios.get("http://localhost:4000/api/v1/borrowings/borrowed-books-by-users", { withCredentials: true }).then((res) => {
        dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(res.data.borrowedBooks))
    }).catch((err) => {
        dispatch(borrowSlice.actions.fetchAllBorrowedBooksFailed(err.response.data.message))
    })
}
export const recordBorrowBook = (email, id) => async (dispatch) => {
    dispatch(borrowSlice.actions.recordBookRequest())
    await axios.post(`http://localhost:4000/api/v1/borrowings/record-borrow-book/${id}`, { email }, {
        withCredentials: true, headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => {
        dispatch(borrowSlice.actions.recordBookSuccess(res.data.message))
        dispatch(toggleRecordBookPopup())
    }).catch((err) => {
        dispatch(borrowSlice.actions.recordBookFailed(err.response.data.message))
    })
}

export const returnBook = (email, id) => async (dispatch) => {
    dispatch(borrowSlice.actions.returnBookRequest())
    await axios.put(`http://localhost:4000/api/v1/borrowings/return-borrowed-book/${id}`, { email }, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => {
        dispatch(borrowSlice.actions.returnBookSuccess(res.data.message))
    }).catch((err) => {
        dispatch(borrowSlice.actions.returnBookFailed(err.response.data.message))
    })
}

export const resetBorrowSlice = () => (dispatch) => {
    dispatch(borrowSlice.actions.resetBorrowSlice());
}

export const confirmPickup = (borrowingId) => async (dispatch) => {
    try {
        const res = await axios.put(`http://localhost:4000/api/v1/borrowings/admin/pickup/${borrowingId}/confirm`, {}, { withCredentials: true });
        toast.success(res.data.message);
        dispatch(fetchAllBorrowedBooks());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to confirm pickup.");
    }
};

export const returnBookAdmin = (borrowingId) => async (dispatch) => {
    try {
        const res = await axios.put(`http://localhost:4000/api/v1/borrowings/admin/return/${borrowingId}`, {}, { withCredentials: true });
        toast.success(res.data.message);
        dispatch(fetchAllBorrowedBooks());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to return book.");
    }
};

export const renewBook = (borrowingId) => async (dispatch) => {
    try {
        const res = await axios.put(`http://localhost:4000/api/v1/borrowings/admin/renew/${borrowingId}`, {}, { withCredentials: true });
        toast.success(res.data.message);
        dispatch(fetchAllBorrowedBooks());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to renew book.");
    }
};

export const reportLostOrDamaged = (borrowingId, finalStatus) => async (dispatch) => {
    try {
        const res = await axios.put(`http://localhost:4000/api/v1/borrowings/admin/report-lost-or-damaged/${borrowingId}`, { finalStatus }, { withCredentials: true });
        toast.success(res.data.message);
        dispatch(fetchAllBorrowedBooks());
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to report status.");
    }
};

export default borrowSlice.reducer;