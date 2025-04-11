import { configureStore } from "@reduxjs/toolkit";
import { postsReducer } from "./slices/posts";
import { authReducer } from "./slices/auth";
import userReducer from "./slices/getme"; // Импортируем userReducer из getme.js

const store = configureStore({
    reducer: {
        posts: postsReducer,
        auth: authReducer,
        user: userReducer, // Добавляем userReducer в хранилище
        
    },
    // Redux Toolkit automatically sets up the Redux DevTools and applies thunk middleware
});

export default store;