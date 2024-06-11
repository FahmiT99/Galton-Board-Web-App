var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var galtonSize = 1.73; // On start with rows = 5

function resizeGalton(r = rows)
{
    switch(r)
    {
        case 1:
            galtonSize = 1;
            break;
        case 2 :
            galtonSize = 1.3;
            break;
        case 3:
            galtonSize = 1.5;
            break;
        case 4: 
            galtonSize = 1.65;
            break;
        case 5 :
            galtonSize = 1.73;
            break;
        case 6:
            galtonSize = 1.8;
            break;
        case 7: 
            galtonSize = 1.9;
            break;
        case 8: 
            galtonSize = 1.9;
            break;
        case 9: 
            galtonSize = 1.95;
            break;
        case 10: 
            galtonSize = 2;
            break;
    }
    return;
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.6;
    gap = canvas.height / (rows + 2) /galtonSize;
    radius = gap / 5;
    reloadCanvas();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Extract 'group_id, user_id' from the current URL
const urlParams = new URLSearchParams(window.location.search);
var group_name = urlParams.get('group_id');
const user_id = urlParams.get('user_id');
if (!group_name) {
    group_name =".";
    // document.getElementById("exportData").style.visibility ="hidden";
    document.getElementById("exportData").style.display ="none";
}



var superSpeed = false;
var skip = 0;
var stop = false;
var pause = false;
var active = false;
var rows = 5;
var balls = 250;
var cols = 2;
var gap = canvas.height / (rows + 2) /galtonSize;
var radius = gap / 5;
var bins = [];
var timer = null;
var speed = 1000;
var animate;
var coordinates = [];
var statsWatcher = {};
var simplifiedStats = [];
var newRowValue = rows;
var newBallValue = balls;
var probabilityRight = 50;
var probabilityLeft = 50;
var data = {user_id: user_id, group_id: group_name, rows: 0, balls: 0, probabilityLeft: 0, probabilityRight: 0, stats: []};
console.log(group_name);
console.log(user_id);

/*                                                      Animation
********************************************************************************************************************************** */


function generateLastArray(size) {
    let array = [];
    for (let i = -size + 1; i < size; i += 2) {
        array.push(i);
    }
    return array;
}

function filterStats(stats) {
    var arr = [];
    console.log(stats);
    var keys = Object.keys(stats).map(Number).sort((a, b) => a - b);
    console.log("stats= ", keys.length);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        arr.push(stats[key][1]);
    }
    console.log("simplified array ", arr, "array size = ", arr.length);
    return arr;
}

function reloadCanvas(x1 = 0, y1 = 0, x2 = canvas.width, y2 = canvas.height) {
    if (x1 == y1 == 0 & x2 == canvas.width & y2 == canvas.height) {
        ctx.clearRect(x1, y1, x2, y2);
        resetValues();
        drawPegs();
    } else ctx.clearRect(x1, y1, x2, y2);
}


function resetValues() {
    pause = false; //stop execution
    active = false;  //animation is not active 
    cols = 2; // Number of columns of pegs it is a constant
    gap = canvas.height / (rows + 2)/galtonSize;  // Gap between pegs // **standard value = 250/rows** / update: dynamic size based on rows and **canvas height**
    radius = gap / 5; // Radius of pegs and balls //standard value = 50/rows  // same
    bins = []; // Array to store the number of balls in each bin
    timer = null;

    for (var i = 0; i < cols; i++) {
        bins[i] = 0;
    }

    statsWatcher = {};
    simplifiedStats = [];
}


// Initialize the bins array with zeros
for (var i = 0; i < cols; i++) {
    bins[i] = 0;
}

// Draw the pegs on the canvas
function drawPegs() {
    // Loop through the rows and columns of pegs
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var x = (canvas.width - gap) / 2 + gap * (j - i / 2); 
            var y = gap * (i + 1);

            // Draw a circle with the peg color
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            if (i == rows - 1) {
                drawVerticalLine(x, y);
            }
        }
        cols += 1;
        console.log("j: ", j, " i:", i );
    }
    console.log("rows: ", rows, ", cols: ", cols);
    drawHorizontalLine(x, y);
}

function drawHorizontalLine(x, y, width = 3) {
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo((canvas.width - gap) / 2 + gap * (-(rows - 1) / 2), y * 2.25);
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();
}

function drawVerticalLine(x, y) {
    coordinates.push(x);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();
}

function drawball(x_position = canvas.width / 2, y_position = gap) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x_position, y_position, radius, 0, Math.PI * 2);
    ctx.fill();
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function drawStats(x, y, n, p) {
    ctx.lineWidth = gap - 2;
    let startingPoint = y * 2.25 - 2;
    var length = 1.1 * (y + radius) / n;

    ctx.beginPath();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("1.0", "red");
    ctx.strokeStyle = gradient;

    if (!statsWatcher.hasOwnProperty(x)) {
        statsWatcher[x] = [length, 1];
        ctx.moveTo(x, startingPoint);
        ctx.lineTo(x, startingPoint - length);
    } else {
        ctx.moveTo(x, startingPoint);
        statsWatcher[x][0] += length;
        statsWatcher[x][1] += 1;
        reloadCanvas(x - gap / 2 + 2, startingPoint - 2, gap - 3, -statsWatcher[x][0]);// Speicherüberflussvermeidung
        ctx.lineTo(x, startingPoint - statsWatcher[x][0]);
    }
    ctx.stroke();
    ctx.strokeStyle = "black";
}

function drawStatsCount(x, y) {
    y = y * 2.25 + gap / 2;
    let fontSize = gap * 0.66;
    ctx.font = "bold " + fontSize + "px Arial";
    ctx.fillStyle = "red";
    ctx.clearRect(x - gap / 2, y - gap / 2, gap, gap * 1.5);
    if (statsWatcher[x][1] < 10)
        ctx.fillText(statsWatcher[x][1], x - gap / 6, y + gap / 6);
    else if (statsWatcher[x][1] < 100) ctx.fillText(statsWatcher[x][1], x - gap / 3, y + gap / 6);
    else {
        ctx.font = "bold " + fontSize * 0.7 + "px Arial";
        ctx.fillText(statsWatcher[x][1], x - gap / 3, y + gap / 8);
    }
}


// mainAnimationLoop is an asynchronous function that repeatedly calls the animate function
// as long as the animation is active and not paused. This function is responsible for 
// continuously updating the animation.
async function mainAnimationLoop() {
    while (active && !pause) {
        await animate();
        if (skip > 0) {
            skip--;
            if (skip == 0 && superSpeed && speedRangeInput.value == 1000) {
                if (rows%2==0) skip =12;
                else skip = 11;
                //await wait(speed);
            }
            else if(skip == 0 && superSpeed && speedRangeInput.value< 1000)
            {
                if (rows%2==0) skip = 4;
                else skip = 5;
                skip = 4;
                await wait(speed);
            }
        } else await wait(speed);
    }
}



// createAnimation is a higher-order function that returns animateOneStep,
// which uses closures to remember its state between calls so that we can pause the animation
function createAnimation(n, initial_n, probability) {  
    var j = 0; // Platz zwischen pegs //standard Value: 0, also Mitte 
    var i = 1; //j gerade falls i ungerade und umgekehrt //Höhenebene
    var xPos = canvas.width / 2 - 0.5 * gap * j;
    var yPos = gap * i;
    var arr = [];
    var y = gap * rows;

    return async function animateOneStep() {
        if (n < 0) {
            drawHorizontalLine((canvas.width + gap * rows) / 2 , gap * rows, 4); // Fixed black line mess in the result
            active = false;
            saveData();
            submitButton.disabled = false;
            rowRangeInput.disabled = false;
            ballsAmountRangeInput.disabled = false;
            probabilityRangeInput.disabled = false;
            return;
        }

        if (i <= rows + 1) {
            ctx.clearRect(0, 0, canvas.width, y + radius * 1.2);
            drawball(xPos, yPos);
            drawPegs();
            cols = 2;

            if (i == rows + 1) {
                drawStats(xPos, y, initial_n, probability);
                drawStatsCount(xPos, y);
            }

            xPos = canvas.width / 2 - 0.5 * gap * j;
            yPos = gap * i;
            var random = Math.random();
            arr.push(random);
            if (random <= probability) {
                j += 1;
            } else j -= 1;
            i += 1;
        }

        if (i > rows + 1) {
            n -= 1;
            j = 0;
            i = 1;
            xPos = canvas.width / 2 - 0.5 * gap * j;
            yPos = gap * i;
            arr = [];
            y = gap * rows;

        }
    }
}

function saveData() {
    data.balls = balls;
    data.rows = rows;
    data.probabilityLeft = probabilityLeft / 100;
    data.probabilityRight = probabilityRight / 100;
    simplifiedStats = filterStats(statsWatcher);
    data.stats = simplifiedStats;
}


/*                                                     Eventhandlers
**********************************************************************************************************************************/


var startButton = document.getElementById("start");
var stopButton = document.getElementById("stop");
var pauseButton = document.getElementById("pause");
var submitButton = document.getElementById("sendData");
var exportButton = document.getElementById("exportData");
var exportButton2 = document.getElementById("exportData2");
var rowRangeInput = document.getElementById("rangeInput"); // rows adjustment control
var rowRangeValue = document.getElementById("rangeValue"); // current rows display
var speedRangeInput = document.getElementById("rangeInput2"); // speed adjusment control
var speedRangeValue = document.getElementById("rangeValue2"); // current speed display
var ballsAmountRangeInput = document.getElementById("rangeInput3");
var ballsAmountRangeValue = document.getElementById("rangeValue3");
var probabilityRangeInput = document.getElementById("rangeInput4");
var probabilityRangeValue = document.getElementById("rangeValue4");
var statusSymbol = document.getElementById("statusSymbol");

ballsAmountRangeInput.addEventListener("input", () => {
    newBallValue = Number(ballsAmountRangeInput.value);
    ballsAmountRangeValue.textContent = "Anzahl Bälle = " + Number(newBallValue);
    balls = newBallValue;
});

probabilityRangeInput.addEventListener("input", () => {
    probabilityLeft = Number(probabilityRangeInput.value);
    probabilityRight = 100 - probabilityLeft;
    probabilityRangeValue.innerHTML = "Wahrscheinlichkeit " + probabilityLeft + " % | " + probabilityRight + " % ";
});

speedRangeInput.addEventListener("input", () => {
    speed = 1000 - (Number(speedRangeInput.value));
    // speedRangeValue.textContent = "Fallgeschwindigkeit = " + Math.ceil((speedRangeInput.value * 100) / 7000) + "%"; //((value - min) / (max - min)) * 100;
    speedRangeValue.textContent = "Fallgeschwindigkeit = " + Math.max(1 ,Math.ceil((speedRangeInput.value - 900) / (1000 - 900) * 100)) + "%";

    if (speedRangeInput.value == 1000) {
        superSpeed = true;
        skip = 12;
    }
    else if (speedRangeInput.value > 950)
    {
        superSpeed = true;
        skip = 4; 
    }
    else {
        superSpeed = false;
        skip = 0;
    }
});

rowRangeInput.addEventListener("input", () => {
    rowRangeValue.textContent = "Anzahl Reihen = " + rowRangeInput.value;
    newRowValue = Number(rowRangeInput.value);
    rows = newRowValue;
    resizeGalton();
    reloadCanvas();
    resetValues();
    drawPegs();
});

startButton.addEventListener("click", () => {
    if (pause) {
        // If the animation was paused, resume it
        pause = false;
        mainAnimationLoop();
    } else if (!active) {
        // If the animation was not active, start it
        reloadCanvas();
        resetValues();
        active = true;
        submitButton.disabled = true;
        rowRangeInput.disabled = true;
        ballsAmountRangeInput.disabled = true;
        probabilityRangeInput.disabled = true;

        //intialisiere Statswatcher mit Nullen
        var binsArray = generateLastArray(rows);
        for (let s = 0; s < binsArray.length; s++) {
            statsWatcher[canvas.width / 2 - 0.5 * gap * binsArray[s]] = [null, 0];
        }
        console.log(statsWatcher);

        animate = createAnimation(balls - 1, balls - 1, probabilityLeft / 100);
        mainAnimationLoop();
    }
});

pauseButton.addEventListener("click", () => {
    if (active) {
        pause = true;
    }
});

stopButton.addEventListener("click", async () => {
    active = false;
    rowRangeInput.disabled = false;
    ballsAmountRangeInput.disabled = false;
    probabilityRangeInput.disabled = false;
    await wait(300);
    statsWatcher = {};
    reloadCanvas();
    resetValues();
    drawPegs();
});

submitButton.addEventListener("click", async () => {
    try {
        const response = await fetch('http://localhost:8000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const jsonResponse = await response.json();

        if (response.status === 201) {
            submitButton.disabled = true;
            data = {user_id: user_id, group_id: group_name, rows: 0, balls: 0, probabilityLeft: 0, probabilityRight: 0, stats: []};

            statusSymbol.classList.remove("error-style");
            statusSymbol.innerHTML = "&#10003;"; // Checkmark symbol
            statusSymbol.classList.add("success-style");
            statusSymbol.style.visibility = "visible";
            // Remove the symbol after 5 seconds (5000 milliseconds)
            setTimeout(() => { statusSymbol.style.visibility = "hidden"; }, 1000);
            return;

        } else {        
            // Display error symbol (cross)
            statusSymbol.classList.remove("success-style");
            statusSymbol.innerHTML = "&#10007;"; // cross symbol
            statusSymbol.classList.add("error-style");
            statusSymbol.style.visibility = "visible";
            console.log(jsonResponse.detail);
            throw new Error(jsonResponse.detail);
        }

    } catch (error) {
        setTimeout(() => { statusSymbol.style.visibility = "hidden"; }, 1000);
        console.error(error.message);
    }
});


exportButton.addEventListener("click", async () => {
    try {
         window.location.href = `http://localhost:8000/results?group_id=${group_name}&user_id=${user_id}`; 
       
    } catch (error) {
        console.error(error.message);
    }
});



exportButton2.addEventListener("click", async () => {
    try {     

        window.location.href = `http://localhost:8000/results?user_id=${user_id}`; 

    } catch (error) {
        console.error(error.message);
    }
});

//Resizing the window, forces redrawing canvas
window.addEventListener('resize', function(event) { 
    resizeCanvas();
    resetValues();
    drawPegs();
}, true);


 /*                                                       Main
************************************************************************************************************************************/


//Initialization
drawPegs();
//drawHorizontalLine(290,200); //  x ist der letzte Punkt, y ist einfach die Höhe
submitButton.disabled = true;