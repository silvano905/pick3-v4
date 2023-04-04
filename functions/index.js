const functionsFirebase = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const axios = require("axios");
const cheerio = require("cheerio");

exports.getAll = functionsFirebase.https.onRequest(async (request, response) => {
    let today = new Date();
    let options = {
        timeZone: 'America/Chicago',
        year: "numeric", month: "short", day: "numeric"
    };

    let newDate = new Date()
    const optionsM = {month: "short", timeZone: 'America/Chicago'};
    let month = new Intl.DateTimeFormat("en-US", optionsM).format(newDate);

    let gridBallPicks = [];

    const checkResults = async () => {
        let previousPick = null;
        for (let pageNum = 9; pageNum >= 1; pageNum--) {
            const ll = await axios.get(`https://www.illinoislottery.com/dbg/results/pick3?page=${pageNum}`);
            const $ = cheerio.load(ll.data);

            const divsWithClassDfs = $('.results__list-item').get().reverse();

            for (let i = 0; i < divsWithClassDfs.length; i++) {
                const elem = divsWithClassDfs[i];
                const drawMonthText = $(elem).find('.dbg-results__date-info');
                const middayOrEvening = $(elem).find('.dbg-results__draw-info');
                const divWithClassFs = $(elem).find('.dbg-results__date-info');
                if (divWithClassFs.text().substring(0, 3) === 'Mar') {
                    const pick = $(elem)
                        .find(".grid-ball--pick3-primary")
                        .map((pickIndex, pickElement) => {
                            let xx = $(pickElement).text()
                            return parseInt(xx.replace(/[^0-9]/g, ""));
                        })
                        .get();

                    let fireball = $(elem)
                        .find(".grid-ball--pick3-secondary")
                        .map((pickIndex, pickElement) => {
                            let xx = $(pickElement).text()
                            return parseInt(xx.replace(/[^0-9]/g, ""));
                        })
                        .get()

                    if (previousPick !== null) {
                        const numberDifferences = pick.map((number, index) => {
                            return number - previousPick[index];
                        });

                        //assigning numbers an uniq id
                        let r = parseInt(drawMonthText.text().match(/\d+/)?.[0])
                        let y = middayOrEvening.text().replace(/[^a-zA-Z]+/g, "")
                        if(y==='midday'){
                            r = r * 2
                        }else {
                            r = (r * 2) + 1
                        }

                        const evenOddCheck = pick.map(num => {
                            return num % 2 === 0 ? 'even' : 'odd'
                        })

                        const evenOddCheckFirstTwo = pick.slice(0, 2).map(num => {
                            return num % 2 === 0 ? 'even' : 'odd'
                        })

                        const evenOddCheckLastTwo = pick.slice(-2).map(num => {
                            return num % 2 === 0 ? 'even' : 'odd'
                        })

                        let firstAndLastArr = [pick[0], pick[2]]
                        const evenOddCheckFirstAndLast = firstAndLastArr.map(num => {
                            return num % 2 === 0 ? 'even' : 'odd'
                        })

                        let letter = [];

                        for (let i = 0; i < pick.length - 1; i++) {
                            if (pick[i] > pick[i + 1]) {
                                letter.push("L");
                            }
                            if (pick[i] === pick[i + 1]) {
                                letter.push("E");
                            }
                            if (pick[i] < pick[i + 1]) {
                                letter.push("H");
                            }
                        }

                        gridBallPicks.push({
                            numbers: [...pick],
                            drawDate: divWithClassFs.text(),
                            drawMonth: drawMonthText.text().substring(0, 3),
                            index: r,
                            time: middayOrEvening.text().replace(/[^a-zA-Z]+/g, ""),
                            fireball: fireball[0],
                            lowHighEqual: letter.join(''),
                            fullNumsString: pick.join(''),
                            firstTwoNumsObj: {
                                firstTwoNumsString: pick.slice(0, 2).join(''),
                                firstTwoNumsSum: pick[0] + pick[1],
                                firstTwoEvenOdd: evenOddCheckFirstTwo.join('')
                            },
                            lastTwoNumsObj: {
                                lastTwoNumsString: pick.slice(-2).join(''),
                                lastTwoNumsSum: pick[1] + pick[2],
                                lastTwoEvenOdd: evenOddCheckLastTwo.join('')
                            },
                            firstAndLastNumsObj: {
                                firstAndLastNumsString: [pick[0], pick[pick.length - 1]].join(''),
                                firstAndLastNumsSum: pick[0] + pick[2],
                                firstAndLastEvenOdd: evenOddCheckFirstAndLast.join(',')
                            },
                            timestamp: admin.firestore.Timestamp.now(),
                            winningCombinationsObj: {
                                list: [
                                    [fireball[0], pick[1], pick[2]].join(''),
                                    [pick[0], fireball[0], pick[2]].join(''),
                                    [pick[0], pick[1], fireball[0]].join('')
                                ]
                            },
                            sumAllThreeNums: pick[0] + pick[1] + pick[2],
                            evenOdd: evenOddCheck.join(','),
                            previousDrawTwoNumDown:{
                                first: [pick[0], previousPick[0]].join(''),
                                second: [pick[1], previousPick[1]].join(''),
                                third: [pick[2], previousPick[2]].join('')
                            },
                            previousDrawDifference: {
                                first: {
                                    difference: numberDifferences[0],
                                    position: numberDifferences[0] > 0 ? 'above' : numberDifferences[0] < 0 ? 'below' : 'equal'

                                },
                                second: {
                                    difference: numberDifferences[1],
                                    position: numberDifferences[1] > 0 ? 'above' : numberDifferences[1] < 0 ? 'below' : 'equal'
                                },
                                third: {
                                    difference: numberDifferences[2],
                                    position: numberDifferences[2] > 0 ? 'above' : numberDifferences[2] < 0 ? 'below' : 'equal'
                                },
                                allDifferenceFirstTwoString: numberDifferences.slice(0, 2).join(','),
                                allDifferenceLastTwoString: numberDifferences.slice(1, 3).join(','),
                                allDifferenceFirstAndLastString: numberDifferences[0] + ',' + numberDifferences[2],
                                allDifferenceString: numberDifferences.join(','),
                                allPositionsString: numberDifferences.map(difference => {
                                    return difference > 0 ? 'above' : difference < 0 ? 'below' : 'equal'
                                }).join(','),
                                movement: numberDifferences.map((difference, index) => {
                                    if (index === 0) {
                                        return null;
                                    } else {
                                        if (numberDifferences[index - 1] > difference) {
                                            return 'down';
                                        } else if (numberDifferences[index - 1] < difference) {
                                            return 'up';
                                        } else {
                                            return 'equal';
                                        }
                                    }
                                }).join(',')
                            }

                        });
                    }

                    previousPick = pick;
                }
            }
        }
    };


    await checkResults();
    const infoCollection = admin.firestore().collection('picks');
    const batch = admin.firestore().batch();

    // Loop through the array and add write operations to the batch
    gridBallPicks.forEach(numObj => {
        const docRef = infoCollection.doc();
        batch.set(docRef, numObj);
    });

    // Commit the batch
    batch.commit().then(() => {
        console.log('Batch write succeeded');
    }).catch(error => {
        console.error('Batch write failed:', error);
    });
    response.send('done');
});


exports.checkPicks = functionsFirebase.https.onRequest(async (request, response) => {
    const newDateTwo = new Date()
    const optionsMM = {month: "short", timeZone: 'America/Chicago'};

    let month = new Intl.DateTimeFormat("en-US", optionsMM).format(newDateTwo);

    const drawsCollection = admin.firestore().collection('picks').where('drawMonth', '==', 'Mar').orderBy('index', 'desc');
    const snapshot = await drawsCollection.get();
    const draws = [];

    // Loop through the documents and add them to the array
    snapshot.forEach(doc => {
        const drawData = doc.data();
        drawData.id = doc.id; // Add the document ID to the draw data\
        drawData.reasonsList = [];
        drawData.points = {
            critical: 0,
            nonCritical: 0
        };
        draws.push(drawData);
    });

    // Loop through the draws and check if sumAllThreeNums is greater than 6 and less than 21
    for (const [index, draw] of draws.entries()) {
        if (draw.sumAllThreeNums > 6 && draw.sumAllThreeNums < 21) {
            // Update the draw object to include a new key called points with a value of 0
            draw.points.nonCritical += 0;
        } else if (draw.sumAllThreeNums >= 21 || draw.sumAllThreeNums <= 6) {
            // If the sumAllThreeNums is less than or equal to 6 or greater than or equal to 21, set draw.points to 1
            draw.points.nonCritical += 1;
            draw.reasonsList.push('sumAllThreeNums');

        }

        // Function to check if sumAllThreeNums appears in the previous 3 draws
        function countPreviousDraws(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 4, draws.length);
            const currentSum = draws[currentIndex].sumAllThreeNums;
            let count = 0;

            for (let i = start; i < end; i++) {
                if (draws[i].sumAllThreeNums === currentSum) {
                    count++;
                }
            }

            return count;
        }


        // add points based on the number of occurrences
        const sumOccurrences = countPreviousDraws(draws, index);
        if (sumOccurrences > 0) {
            draw.points.nonCritical += sumOccurrences;
            draw.reasonsList.push(`sumAllThreeNumsInPrevious3: ${sumOccurrences} occurrences`);
        }


        function countPreviousDrawTwoNumDown(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 7, draws.length);
            const currentDraw = draws[currentIndex];
            let count = 0;

            for (let i = start; i < end; i++) {
                let matchInfo = {
                    first: draws[i].previousDrawTwoNumDown.first === currentDraw.previousDrawTwoNumDown.first,
                    second: draws[i].previousDrawTwoNumDown.second === currentDraw.previousDrawTwoNumDown.second,
                    third: draws[i].previousDrawTwoNumDown.third === currentDraw.previousDrawTwoNumDown.third,
                };

                if (matchInfo.first || matchInfo.second || matchInfo.third) {
                    count++;
                }
            }

            return count;
        }


        // add points based on the number of occurrences
        const previousDrawTwoNumDownOccurrences = countPreviousDrawTwoNumDown(draws, index);
        if (previousDrawTwoNumDownOccurrences > 0) {
            draw.points.nonCritical += previousDrawTwoNumDownOccurrences;
            draw.reasonsList.push(`previousDrawTwoNumDownInPrevious6: ${previousDrawTwoNumDownOccurrences} occurrences`);
        }


        // Count the number of occurrences of previousDrawDifference in the previous 31 draws
        function countPreviousDrawDifference(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 32, draws.length);
            const currentDraw = draws[currentIndex];
            const results = {
                allDifferenceString: 0,
                allPositionsString: 0,
            };

            for (let i = start; i < end; i++) {
                //the following if runs only for the first 3 draws
                if (i < start + 3 && draws[i].previousDrawDifference.allPositionsString === currentDraw.previousDrawDifference.allPositionsString) {
                    results.allPositionsString++;
                }

                if (draws[i].previousDrawDifference.allDifferenceString === currentDraw.previousDrawDifference.allDifferenceString) {
                    results.allDifferenceString++;
                }
            }

            return results;
        }


        // Add points based on the number of occurrences
        const previousDrawDifferenceOccurrences = countPreviousDrawDifference(draws, index);
        if (previousDrawDifferenceOccurrences.allDifferenceString > 0) {
            draw.points.nonCritical += previousDrawDifferenceOccurrences.allDifferenceString;
            draw.reasonsList.push(`previousDrawDifferenceAllDifferenceInPrevious31: ${previousDrawDifferenceOccurrences.allDifferenceString} occurrences`);
        }
        if (previousDrawDifferenceOccurrences.allPositionsString > 0) {
            draw.points.nonCritical += previousDrawDifferenceOccurrences.allPositionsString;
            draw.reasonsList.push(`previousDrawDifferenceAllPositionsInPrevious3: ${previousDrawDifferenceOccurrences.allPositionsString} occurrences`);
        }


        // Function to count the number of occurrences of fullNumsString in winningCombinationsObj.list for all previous draws
        function countFullNumsStringOccurrences(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 32, draws.length);
            const currentDraw = draws[currentIndex];
            const currentFullNumsString = currentDraw.fullNumsString;
            let count = 0;

            for (let i = start; i < end; i++) {
                if (draws[i].winningCombinationsObj.list.includes(currentFullNumsString)) {
                    count++;
                }
            }

            return count;
        }


        // add points based on the number of occurrences
        const fullNumsStringOccurrences = countFullNumsStringOccurrences(draws, index);
        if (fullNumsStringOccurrences > 0) {
            draw.points.nonCritical += fullNumsStringOccurrences;
            draw.reasonsList.push(`fullNumsStringInWinningCombinationsObjList: ${fullNumsStringOccurrences} occurrences`);
        }


        // Function to count the number of occurrences of fullNumsString in all previous draws
        function countFullNumsStringOccurrencesInAllDraws(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 50, draws.length);
            const currentDraw = draws[currentIndex];
            const currentFullNumsString = currentDraw.fullNumsString;
            let count = 0;

            for (let i = start; i < end; i++) {
                if (draws[i].fullNumsString === currentFullNumsString) {
                    count++;
                }
            }

            return count;
        }


        // Add points based on the number of occurrences
        const fullNumsStringOccurrencesInAllDraws = countFullNumsStringOccurrencesInAllDraws(draws, index);
        if (fullNumsStringOccurrencesInAllDraws > 0) {
            draw.points.nonCritical += fullNumsStringOccurrencesInAllDraws;
            draw.reasonsList.push(`fullNumsStringInAllPreviousDraws: ${fullNumsStringOccurrencesInAllDraws} occurrences`);
        }


        // Function to count the number of occurrences of firstTwo/lastTwo/firstAndLast in all previous draws
        function countFirstTwoLastTwoFirstAndLast(draws, currentIndex) {
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 11, draws.length);
            const currentDraw = draws[currentIndex];
            let count = 0;

            for (let i = start; i < end; i++) {
                if(currentDraw.firstTwoNumsObj.firstTwoNumsSum===draws[i].firstTwoNumsObj.firstTwoNumsSum&&
                    currentDraw.lastTwoNumsObj.lastTwoNumsSum===draws[i].lastTwoNumsObj.lastTwoNumsSum){
                    count++;
                }
                if(currentDraw.firstTwoNumsObj.firstTwoNumsSum===draws[i].firstTwoNumsObj.firstTwoNumsSum&&
                    currentDraw.firstAndLastNumsObj.firstAndLastNumsSum===draws[i].firstAndLastNumsObj.firstAndLastNumsSum){
                    count++;
                }
                if(currentDraw.firstAndLastNumsObj.firstAndLastNumsSum===draws[i].firstAndLastNumsObj.firstAndLastNumsSum&&
                    currentDraw.lastTwoNumsObj.lastTwoNumsSum===draws[i].lastTwoNumsObj.lastTwoNumsSum){
                    count++;
                }
            }

            return count;
        }

        // Add points based on the number of occurrences
        const fullCountFirstTwoLastTwoFirstAndLast = countFirstTwoLastTwoFirstAndLast(draws, index);
        if (fullCountFirstTwoLastTwoFirstAndLast > 0) {
            draw.points.nonCritical += fullCountFirstTwoLastTwoFirstAndLast;
            draw.reasonsList.push(`fullCountFirstTwoLastTwoFirstAndLast: ${fullCountFirstTwoLastTwoFirstAndLast} occurrences`);
        }


        // Function to count similar pairs in fullNumsString for all previous draws
        function countSimilarPairsInFullNumsString(draws, currentIndex) {
            const currentDraw = draws[currentIndex];
            const currentFullNumsString = currentDraw.fullNumsString;
            let count = 0;
            const start = currentIndex + 1;
            const end = Math.min(currentIndex + 11, draws.length);

            for (let i = start; i < end; i++) {
                const firstTwoMatch = currentFullNumsString.slice(0, 2) === draws[i].fullNumsString.slice(0, 2);
                const lastTwoMatch = currentFullNumsString.slice(-2) === draws[i].fullNumsString.slice(-2);
                const firstAndLastMatch = currentFullNumsString[0] === draws[i].fullNumsString[0] && currentFullNumsString.slice(-1) === draws[i].fullNumsString.slice(-1);

                if (firstTwoMatch || lastTwoMatch || firstAndLastMatch) {
                    count++;
                }
            }

            return count;
        }


        // Update this part of the script to add points based on the number of similar pairs
        const similarPairsCount = countSimilarPairsInFullNumsString(draws, index);
        if (similarPairsCount > 0) {
            draw.points.nonCritical += similarPairsCount;
            draw.reasonsList.push(`similarPairsInFullNumsString: ${similarPairsCount} occurrences`);
        }

        // The applyRules function takes an object with critical and noncritical points as input.
        // It converts every 2 noncritical points into 1 critical point and updates the object accordingly.
        // The updated object with the converted points is then returned.
        // Function to apply the rules
        function applyRules(obj) {
            const criticalPointsFromNoncritical = Math.floor(obj.nonCritical / 2);
            obj.nonCritical -= criticalPointsFromNoncritical * 2;
            obj.critical += criticalPointsFromNoncritical;
            return obj;
        }

        // Apply the rules to the input object
        const updatedObject = applyRules(draw.points)
        // Update the Firestore document with the new points and reasonsList
        await admin.firestore().collection('picks').doc(draw.id).update({
            points: updatedObject,
            reasonsList: draw.reasonsList
        });
    }

    response.send('done');

});
