import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
import { toggleAddBookPopup } from "./popUpSlice";
import { toast } from "react-toastify";
const bookSlice = createSlice({
    name: "books",
    initialState: {
        loading: false,
        error: null,
        message: null,
        books: [],
        selectedBook: null,
    },
    reducers: {
        fetchBookRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        fetchBookSuccess(state, action) {
            state.loading = false;
            state.books = action.payload;
        },
        fetchBookFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.message = null;
        },
        addBookRequest(state) {
            state.loading = true;
            state.error = null;
            state.message = null;
        },
        addBookSuccess(state, action) {
            state.loading = false;
            state.message = action.payload;
        },
        addBookFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        resetBookSlice(state) {
            state.error = null;
            state.message = null;
            state.loading = false;
        },
        setSelectedBookRequest(state) {
            state.loading = true;
            state.error = null;
        },
        setSelectedBookSuccess(state, action) {
            state.loading = false;
            state.selectedBook = action.payload;
        },
        setSelectedBookFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

    },
})

export const fetchAllBooks = () => async (dispatch) => {
    dispatch(bookSlice.actions.fetchBookRequest());
    await axios.get("http://localhost:4000/api/v1/books/all", { withCredentials: true }).then((res) => {
        dispatch(bookSlice.actions.fetchBookSuccess(res.data.books))
    }).catch((err) => {
        dispatch(bookSlice.actions.fetchBookFailed(err.response.data.message))
    })
};

export const addBook = (data) => async (dispatch) => {
    dispatch(bookSlice.actions.addBookRequest())
    await axios.post("http://localhost:4000/api/v1/books/admin/add", data, {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => {
        dispatch(bookSlice.actions.addBookSuccess(res.data.message));
        toast.success(res.data.message);
        dispatch(toggleAddBookPopup());
        dispatch(fetchAllBooks());
    }).catch((err) => {
        dispatch(bookSlice.actions.addBookFailed(err.response.data.message));
    })
};

export const resetBookSlice = () => (dispatch) => {
    dispatch(bookSlice.actions.resetBookSlice());
}
export const fetchBookById = (id) => async (dispatch) => {
    dispatch(bookSlice.actions.setSelectedBookRequest());
    try {
        const res = await axios.get(`http://localhost:4000/api/v1/books/${id}`, {
            withCredentials: true,
        });
        dispatch(bookSlice.actions.setSelectedBookSuccess(res.data.book));
    } catch (err) {
        dispatch(bookSlice.actions.setSelectedBookFailed(err.response?.data?.message || "Failed to fetch book."));
    }
};


export default bookSlice.reducer;