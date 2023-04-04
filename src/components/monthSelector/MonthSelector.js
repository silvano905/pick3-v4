import React, {useState, useEffect, Fragment} from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

export default function MonthSelector({setSelectedMonth, selectedMonth}) {

    const handleChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    let list;
    list = months.map(month =>{
        return(
            <MenuItem key={month} value={month}>
                {month}
            </MenuItem>
        )
    })
    return (
        <FormControl variant="standard" style={{width: 200, margin: 5}}>
            <Select
                displayEmpty
                labelId="demo-simple-select-helper-label"
                id="month-select"
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return <em>Select Month</em>;
                    }
                    return selected
                }}
                value={selectedMonth}
                onChange={handleChange}
            >
                {list}
            </Select>
        </FormControl>
    );
}