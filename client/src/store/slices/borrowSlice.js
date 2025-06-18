import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
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
        reserveCopyRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        reserveCopySuccess(state, action) {
            state.loading = false;
            state.message = action.payload;
        },
        reserveCopyFailed(state, action) {
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
    await axios.get("http://localhost:4000/api/v1/borrowings/my-history", { withCredentials: true }).then((res) => {
        dispatch(borrowSlice.actions.fetchUserBorrowedBooksSuccess(res.data.history))
    }).catch((err) => {
        dispatch(borrowSlice.actions.fetchUserBorrowedBooksFailed(err.response.data.message))
    })
}
export const fetchAllBorrowedBooks = () => async (dispatch) => {
    dispatch(borrowSlice.actions.fetchAllBorrowedBooksRequest())
    await axios.get("http://localhost:4000/api/v1/borrowings/admin/all", { withCredentials: true }).then((res) => {
        dispatch(borrowSlice.actions.fetchAllBorrowedBooksSuccess(res.data.borrowings))
    }).catch((err) => {
        dispatch(borrowSlice.actions.fetchAllBorrowedBooksFailed(err.response.data.message))
    })
}

export const reserveCopy = createAsyncThunk(
    'borrowings/reserveCopy',
    async ({ copyId, bookId }, { dispatch, rejectWithValue }) => {
        try {
            const res = await axios.post(
                `http://localhost:4000/api/v1/borrowings/reserve`, 
                { bookId: bookId, copyId: copyId },
                { withCredentials: true }
            );
            // dispatch(fetchUserBorrowedBooks());
            // dispatch(fetchAllBooks()); 
            
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || "Reservation failed.";
            // toast.error(message);
            return rejectWithValue(message);
        }
    }
);


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

export const cancelReservation = (borrowingId) => async (dispatch) => {
    try {
        const {data} = await axios.put(`http://localhost:4000/api/v1/borrowings/reservations/${borrowingId}/cancel`, {}, { withCredentials: true });
        dispatch(fetchUserBorrowedBooks());
        return { success: true, message: data.message };
    } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to cancel reservation.";
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
    }
};

export const directBorrowBook = createAsyncThunk(
    'borrowings/directBorrow',
    async (borrowData, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post("http://localhost:4000/api/v1/borrowings/admin/direct-borrow", borrowData, { withCredentials: true });
            toast.success(response.data.message);
            dispatch(fetchAllBorrowedBooks());  
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || "Direct borrow failed.";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export default borrowSlice.reducer;