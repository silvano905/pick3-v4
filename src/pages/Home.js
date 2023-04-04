import React, {useState, useEffect, Fragment} from 'react';
import {auth, db} from '../config-firebase/firebase'
import {useDispatch, useSelector} from "react-redux";
import MonthSelector from "../components/monthSelector/MonthSelector";
import ConfirmDelete from "../components/delete/ConfirmDelete";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

import {selectPicks, getPicks} from "../redux/picks/picksSlice";
import {collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query, where} from "firebase/firestore";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

function Home() {
    const picks = useSelector(selectPicks)
    const dispatch = useDispatch()
    let newDate = new Date()
    const optionsM = {month: "short", timeZone: 'America/Chicago'};
    let month = new Intl.DateTimeFormat("en-US", optionsM).format(newDate);
    const [selectedMonth, setSelectedMonth] = useState(month)
    useEffect(() => {
        const q = query(collection(db, "picks"), orderBy('index', 'desc'), where("drawMonth", "==", 'Mar'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            dispatch(
                getPicks(
                    querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        data.timestamp = data.timestamp.toDate().toISOString(); // Convert Firestore Timestamp to ISO string
                        return {data: data, id: doc.id};
                    })
                )
            )
        });



    }, [selectedMonth]);




    let picksList;
    if(picks){
        picksList = picks.map((item, index) => {
            return (
                <Grid item xs={6} sm={6} lg={6} key={index}>
                    <Card sx={{ minWidth: 20 }} style={{color: '#03071e', margin: 4}}>
                        <CardContent style={{ textAlign: "center" }}>
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                <Typography variant="h5" gutterBottom>
                                    {item.data.fullNumsString}
                                </Typography>
                                <Avatar sx={{ bgcolor: '#fb8500', width: 24, height: 24}} style={{ marginTop: -9}}>
                                    {item.data.fireball}
                                </Avatar>
                            </Stack>

                            <Typography variant="body1" gutterBottom>
                                {item.data.drawDate}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {item.data.time}
                            </Typography>

                            {item.data.points&&
                                <>
                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{marginTop: 5}}>
                                        {item.data.points.critical>=1?<HighlightOffIcon color='warning'/>:<CheckCircleIcon color='success'/>}
                                    </Typography>

                                    <Typography variant="body1" gutterBottom>
                                        Critical Points: {item.data.points.critical}
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        Noncritical Points: {item.data.points.nonCritical}
                                    </Typography>
                                </>

                            }



                            {item.data.reasonsList && item.data.reasonsList.length > 0 && (
                                <Grid container spacing={1}>
                                    {item.data.reasonsList.map((reason, index) => {
                                        return (
                                            <Grid key={index} item xs={12} sm={6} md={4}>
                                                <Typography variant="body1" gutterBottom>
                                                    <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{reason}</span>
                                                </Typography>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}

                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <MoreHorizIcon/>
                                </AccordionSummary>
                                <AccordionDetails style={{ textAlign: "center" }}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{color: '#023047'}}>
                                        sum
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{marginTop: -12}}>
                                        {item.data.sumAllThreeNums}
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{color: '#023047'}}>
                                        evenOdd
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{marginTop: -12}}>
                                        {item.data.evenOdd}
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{color: '#023047'}}>
                                        LowHighEqual
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{marginTop: -12}}>
                                        {item.data.lowHighEqual}
                                    </Typography>

                                    <Typography variant="h6" color="text.secondary" gutterBottom style={{color: '#023047'}}>
                                        winning combs
                                    </Typography>
                                    <div>
                                        {[...item.data.winningCombinationsObj.list].map((i, index) => {
                                            return (
                                                <Typography key={index} variant="h6" color="text.secondary" gutterBottom>
                                                    {i}
                                                </Typography>
                                            );
                                        })}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            <ConfirmDelete doc={doc} item={item} db={db} deleteDoc={deleteDoc}/>
                        </CardContent>

                    </Card>
                </Grid>
            )
        })
    }




    return (
        <>
            <div style={{textAlign: "center", marginTop: 8}}>
                <Typography variant="h5" gutterBottom style={{color: 'black', margin: "auto"}}>
                    Winning Numbers
                </Typography>
                <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}/>
            </div>


            <Grid container direction="row" justifyContent="space-evenly" alignItems="center">
                <Grid item xs={12} sm={12} lg={7}>
                    <Grid container direction="row" justifyContent="space-evenly" alignItems="center">
                        {picksList}
                    </Grid>
                </Grid>
            </Grid>
        </>

    );
}

export default Home;