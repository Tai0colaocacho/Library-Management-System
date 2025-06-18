import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

// ASYNC THUNKS
export const fetchAllMetadata = createAsyncThunk('metadata/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const [authorsRes, categoriesRes, publishersRes] = await Promise.all([
            axios.get("http://localhost:4000/api/v1/authors/all", { withCredentials: true }),
            axios.get("http://localhost:4000/api/v1/categories/all", { withCredentials: true }),
            axios.get("http://localhost:4000/api/v1/publishers/all", { withCredentials: true })
        ]);
        return {
            authors: authorsRes.data.authors,
            categories: categoriesRes.data.categories,
            publishers: publishersRes.data.publishers
        };
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const createCrudThunk = (entity, entityApi) => {
  return {
    create: createAsyncThunk(`metadata/create${entity}`, async (data, { rejectWithValue }) => {
      try {
        const response = await axios.post(`http://localhost:4000/api/v1/${entityApi}/add`, data, { withCredentials: true });
        toast.success(response.data.message);
        return response.data;
      } catch (err) { return rejectWithValue(err.response.data.message); }
    }),
    update: createAsyncThunk(`metadata/update${entity}`, async ({ id, data }, { rejectWithValue }) => {
      try {
        const response = await axios.put(`http://localhost:4000/api/v1/${entityApi}/update/${id}`, data, { withCredentials: true });
        toast.success(response.data.message);
        return response.data;
      } catch (err) { return rejectWithValue(err.response.data.message); }
    }),
    delete: createAsyncThunk(`metadata/delete${entity}`, async (id, { rejectWithValue }) => {
      try {
        const response = await axios.delete(`http://localhost:4000/api/v1/${entityApi}/delete/${id}`, { withCredentials: true });
        toast.success(response.data.message);
        return { id };
      } catch (err) { return rejectWithValue(err.response.data.message); }
    }),
  };
};

export const { create: createCategory, update: updateCategory, delete: deleteCategory } = createCrudThunk('Category', 'categories');
export const { create: createAuthor, update: updateAuthor, delete: deleteAuthor } = createCrudThunk('Author', 'authors');
export const { create: createPublisher, update: updatePublisher, delete: deletePublisher } = createCrudThunk('Publisher', 'publishers');

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
        const crudCases = (entity, thunks) => {
            builder
                .addCase(thunks.create.fulfilled, (state, action) => { state[entity].push(action.payload[entity.slice(0, -1)]); })
                .addCase(thunks.update.fulfilled, (state, action) => { state[entity] = state[entity].map(item => item._id === action.payload[entity.slice(0, -1)]._id ? action.payload[entity.slice(0, -1)] : item); })
                .addCase(thunks.delete.fulfilled, (state, action) => { state[entity] = state[entity].filter(item => item._id !== action.payload.id); });
        };

        builder
            .addCase(fetchAllMetadata.pending, (state) => { state.loading = true; })
            .addCase(fetchAllMetadata.fulfilled, (state, action) => {
                state.loading = false;
                state.authors = action.payload.authors;
                state.categories = action.payload.categories;
                state.publishers = action.payload.publishers;
            })
            .addCase(fetchAllMetadata.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

        crudCases('categories', { create: createCategory, update: updateCategory, delete: deleteCategory });
        crudCases('authors', { create: createAuthor, update: updateAuthor, delete: deleteAuthor });
        crudCases('publishers', { create: createPublisher, update: updatePublisher, delete: deletePublisher });
    }
});

export default metadataSlice.reducer;