import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAllMetadata = createAsyncThunk(
    'metadata/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const [authorsRes, categoriesRes, publishersRes] = await Promise.all([
                axios.get("http://localhost:4000/api/v1/books/authors/all", { withCredentials: true }),
                axios.get("http://localhost:4000/api/v1/books/categories/all", { withCredentials: true }),
                axios.get("http://localhost:4000/api/v1/books/publishers/all", { withCredentials: true })
            ]);
            return {
                authors: authorsRes.data.authors,
                categories: categoriesRes.data.categories,
                publishers: publishersRes.data.publishers
            };
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const metadataSlice = createSlice({
    name: "metadata",
    initialState: {
        authors: [],
        categories: [],
        publishers: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllMetadata.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllMetadata.fulfilled, (state, action) => {
                state.loading = false;
                state.authors = action.payload.authors;
                state.categories = action.payload.categories;
                state.publishers = action.payload.publishers;
            })
            .addCase(fetchAllMetadata.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default metadataSlice.reducer;