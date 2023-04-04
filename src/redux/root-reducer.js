import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import userReducer from '../redux/user/userSlice';
import picksReducer from '../redux/picks/picksSlice';


const persistConfig = {
    key: 'p3-v4',
    storage,
    whitelist: ['user', 'picks']
};

const rootReducer = combineReducers({
    user: userReducer,
    picks: picksReducer
});

export default persistReducer(persistConfig, rootReducer);