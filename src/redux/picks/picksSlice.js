import { createSlice } from '@reduxjs/toolkit';

export const picksSlice = createSlice({
    name: 'picks',
    initialState: {
        picks: null
    },
    reducers: {
        getPicks: (state, action) => {
            state.picks = action.payload
        }

    },
});

export const { getPicks } = picksSlice.actions;

export const selectPicks = (state) => state.picks.picks?state.picks.picks:null;



export default picksSlice.reducer;