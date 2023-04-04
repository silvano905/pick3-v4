// import { configureStore } from '@reduxjs/toolkit'
// import { persistStore } from 'redux-persist'
// import rootReducer from './root-reducer';
//
// export const store = configureStore({
//     reducer: rootReducer
// });
//
// export const persistor = persistStore(store);

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './root-reducer';

const persistConfig = {
    key: 'p3-v4',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };
