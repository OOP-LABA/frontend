import {configureStore} from '@reduxjs/toolkit';
import appSlice from './slices/appSlice.js';

export const store = configureStore({
    reducer: {
        app: appSlice, 
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActionPaths: ['meta.arg.file'],
            },
        }),
})
