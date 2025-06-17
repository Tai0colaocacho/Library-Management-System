import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popUpSlice";
import userReducer from "./slices/userSlice";
import bookReducer from "./slices/bookSlice";
import borrowReducer from "./slices/borrowSlice";
import settingsReducer from "./slices/settingsSlice";
import metadataReducer from "./slices/metadataSlice";
import notificationReducer from "./slices/notificationSlice";
export const store = configureStore({
    reducer: {
        auth: authReducer,
        popup: popupReducer,
        user: userReducer,
        book: bookReducer,
        borrow: borrowReducer, 
        settings: settingsReducer,
        metadata: metadataReducer,
        notifications: notificationReducer,
    },
})