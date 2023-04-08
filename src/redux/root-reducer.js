import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import userReducer from '../redux/user/userSlice';
import picksReducer from '../redux/picks/picksSlice';
import guessesReducer from '../redux/guesses/guessesSlice'


const persistConfig = {
    key: 'p3-v4',
    storage,
    whitelist: ['user', 'picks', 'guesses']
};

const rootReducer = combineReducers({
    user: userReducer,
    picks: picksReducer,
    guesses: guessesReducer
});

export default persistReducer(persistConfig, rootReducer);