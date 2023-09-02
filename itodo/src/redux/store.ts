import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "./features/counterSlice";
import { userApi } from './services/userApi';
import { unsplashApi } from './services/unsplashApi';
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import { loginApi } from './services/loginApi';
import { categoryApi } from './services/categoryApi';
import userReducer from './features/userInfoSlice';
import { taskApi } from './services/taskApi';
import categoryReducer from './features/categorySlice'

export const store = configureStore({
    reducer:{
        categoryReducer,
        counterReducer,
        userReducer,
        [userApi.reducerPath]:userApi.reducer,
        [unsplashApi.reducerPath]:unsplashApi.reducer,
        [loginApi.reducerPath]:loginApi.reducer,
        [categoryApi.reducerPath]:categoryApi.reducer,
        [taskApi.reducerPath]:taskApi.reducer,
    },
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware()
    .concat([userApi.middleware])
    .concat([unsplashApi.middleware])
    .concat([loginApi.middleware])
    .concat([categoryApi.middleware])
    .concat([taskApi.middleware])
})

setupListeners(store.dispatch)

export type RootState = ReturnType <typeof store.getState>
export type appDispatch = typeof store.dispatch