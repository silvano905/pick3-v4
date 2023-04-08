import { createSlice } from '@reduxjs/toolkit';

export const guessesSlice = createSlice({
    name: 'guesses',
    initialState: {
        guesses: null
    },
    reducers: {
        getGuesses: (state, action) => {
            state.guesses = action.payload
        }

    },
});

export const { getGuesses } = guessesSlice.actions;

export const selectGuesses = (state) => state.guesses.guesses?state.guesses.guesses:null;



export default guessesSlice.reducer;