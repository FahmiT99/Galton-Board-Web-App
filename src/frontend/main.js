
// Get canvas and context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var galtonSize = 1.73; 

//resize Galton board based on the amount of bins
function resizeGalton(r = rows)
{
    switch(r)
    {
        case 1: galtonSize = 1; break;
        case 2: galtonSize = 1.3; break;
        case 3: galtonSize = 1.5; break;
        case 4: galtonSize = 1.65; break;
        case 5: galtonSize = 1.73; break;
        case 6: galtonSize = 1.8; break;
        case 7: galtonSize = 1.9; break;
        case 8: galtonSize = 1.9; break;
        case 9: galtonSize = 1.95; break;
        case 10: galtonSize = 2; break;
    }
    return;
}


// Will be called on load and when the browser window being resized
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.6;
    canvas.height = window.innerHeight * 0.6;
    gap = canvas.height / (rows + 2) /galtonSize;
    radius = gap / 5;
    reloadCanvas();
}


// Extract 'group_id, user_id' from the current URL
const urlParams = new URLSearchParams(window.location.search);
var group_name = urlParams.get('group_id');
const user_id = urlParams.get('user_id');

// Hide group export button if no group_id
if (!group_name) {
    group_name =".";
    document.getElementById("GroupExportData").style.display ="none";
}


// Animation and simulation variables
var skip = 0; // used to skip Frames of the Animation for more speed 
var stop = false;
var pause = false;
var active = false;
var rows = 5; 
var balls = 500;
var cols = 2; //Constant used to make the shape of galton
var gap = canvas.height / (rows + 2) /galtonSize; // distance between pegs
var radius = gap / 5; 
var bins = [];
var timer = null;
var speed = 15;
var horizontalLineWidth = 3;
var verticalLineWidth = 2;
var animate;
var coordinates = [];
var statsWatcher = {};
var prog_statsWathcer = {};
var simplifiedStats = [];
var simplifiedPrognosis = [];
var remainedBalls = balls;
var BallsRemaining = balls;
var probabilityRight = 50;
var probabilityLeft = 50;
var prognosis_current_value = 0;
var data = {user_id: user_id, group_id: group_name, rows: 0, balls: 0, probabilityLeft: 0, probabilityRight: 0, stats: [], prog_stats: []};


/*                                                      Animation
********************************************************************************************************************************** */

//Generate Array for the last row of the pegs
function generateLastArray(size) {
    let array = [];
    for (let i = -size + 1; i < size; i += 2) {
        array.push(i);
    }
    return array;
}

//simplifies the statistics, making them easy to analyse in the backend
function filterStats(stats) {

    var arr = [];
    var keys = Object.keys(stats).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        arr.push(stats[key][1]);
    }
    return arr;
}


function reloadCanvas(x1 = 0, y1 = 0, x2 = canvas.width, y2 = canvas.height) {
    ctx.clearRect(x1, y1, x2, y2);
    if (x1 == y1 == 0 & x2 == canvas.width & y2 == canvas.height) {
        resetValues();
        drawPegs();
    }
}

// Reset the prognose for a new experiment
function resetProg() {  

    simplifiedPrognosis = [];
    prognosisInputDisplay.innerHTML =  balls;
    remainedBalls = balls;
    prog_statsWathcer = {};
    
    // Initialize the pro_coordinates array with zeros
    for (var i = 0; i < coordinates.length-1; i++) {
        prog_statsWathcer[coordinates[i][0]] = [0,0];
        drawStatsCountPrognosis(coordinates[i][0], coordinates[i][1], prog_statsWathcer);
    }      
    const progInputs = document.querySelectorAll("#prognosisInput");    
    progInputs.forEach((input) => {
            input.max = remainedBalls ;
            input.value = 0;         
        });     
}


// Reset the values for a new experiment
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

// Draw Line on the canvas
function drawLine(x1, y1, x2, y2){

    ctx.lineWidth = verticalLineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

 

// Draw the pegs on the canvas
function drawPegs(only_vertical_Lines = false) {
    var lines = [];
    if (!only_vertical_Lines)
    coordinates = [];
    // Loop through the rows and columns of pegs
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var x = (canvas.width - gap) / 2 + gap * (j - i / 2); 
            var y = gap * (i + 1);
            
            if(i == 0 && (j == 0 ||  j == cols-1)) lines.push([x,y]);

            // Draw a circle with the peg color
            if (j > 0 && j < cols-1)
            {
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            if (i == rows - 1) { 
                coordinates.push([x+gap/2 ,y]);
                drawVerticalLine(x, y);
            }
        }
        cols += 1;
    }

    //draw diagonal borders from left and right side
    if(!only_vertical_Lines)
    {
        var cl = coordinates.length-1;
        drawLine(lines[0][0], lines[0][1], coordinates[0][0]-gap/2, coordinates[0][1]);
        drawLine(coordinates[cl][0]-gap/2, coordinates[cl][1], lines[1][0], lines[1][1]);
        drawHorizontalLine(x, y);
    }

}

function drawHorizontalLine(x, y) {
    ctx.lineWidth = horizontalLineWidth;
    ctx.beginPath();
    ctx.moveTo((canvas.width - gap) / 2 + gap * (-(rows - 1) / 2), y * 2.25);
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();
}

function drawVerticalLine(x, y) {

    ctx.lineWidth = verticalLineWidth;
    ctx.beginPath();
    ctx.moveTo(x, y +radius);
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();
    
}

// Draw a red ball on the canvas
function drawball(x_position = canvas.width / 2, y_position = gap, size=0, col ="red") {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x_position, y_position, Math.abs(radius-size), 0, Math.PI*2 );
    ctx.fill();
    
}

function clearBall(x_position, y_position ) {

    ctx.clearRect(x_position-4 , y_position-4 , (radius-4)*3, (radius-4) *3);
}

// Wait for a specified amount of time
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}





// Draw the statistics for prognosis section
function drawStatsPrognosis(x, y, n,stats = statsWatcher, value, col1 = "red", col2 = "magenta") {
    ctx.lineWidth = gap *0.85;
    let startingPoint = y * 2.25 - horizontalLineWidth/2; 
    var length = 1.1 * (y + radius) / n;
    if (rows == 2) length *= 0.94;

    if (stats.hasOwnProperty(x)) {
        ctx.beginPath();
        ctx.strokeStyle = "#ffffff"; // match background color
        ctx.moveTo(x, startingPoint);
        ctx.lineTo(x, startingPoint - stats[x][0]-1);
        ctx.stroke();
    }
    ctx.lineWidth-= 1.25;

    ctx.beginPath();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", col2);
    gradient.addColorStop("1.0", col1);
    ctx.strokeStyle = gradient;
 
    if (!stats.hasOwnProperty(x)) {
        stats[x] = [length, 1];
        ctx.moveTo(x, startingPoint);
        ctx.lineTo(x, startingPoint - length);
    } else {
        ctx.moveTo(x, startingPoint);
        stats[x][0] = length * (value);
        stats[x][1] = value;
        prognosis_current_value = value;
        ctx.strokeStyle = gradient;
        ctx.lineTo(x, startingPoint - stats[x][0]);
    }
    ctx.stroke();
    ctx.strokeStyle = "black";
    drawHorizontalLine((canvas.width + gap * rows) / 2 , gap * rows, 4); // ensure no differences between bins
}

// Draw the count of statistics for prognosis
function drawStatsCountPrognosis(x, y, stats = statsWatcher) {
    y = y * 2.25 + gap / 2;
    let fontSize = gap * 0.66;
    ctx.font = "bold " + fontSize + "px Arial";
    ctx.fillStyle = "red";
    ctx.clearRect(x - gap / 2, y - gap / 3, gap, gap * 1.5);
    if (stats[x][1] < 10)
        ctx.fillText(stats[x][1], x - gap / 6, y + gap / 6);
    else if (stats[x][1] < 100) ctx.fillText(stats[x][1], x - gap / 3, y + gap / 6);
    else
    {
        ctx.font = "bold " + fontSize * 0.7 + "px Arial";
        if (stats[x][1] < 1000)
        {
            ctx.fillText(stats[x][1], x - gap / 3, y + gap / 8);
        }
        else 
        {
            ctx.font = "bold " + fontSize * 0.65 + "px Arial";
            ctx.fillText(stats[x][1], x - gap / 2, y + gap / 8);
        }
    }

  
}

// Draw the statistics on the canvas
function drawStats(x, y, n, col1 = "red", col2 = "magenta") {
    ctx.lineWidth = gap - 2;
    let startingPoint = y * 2.25 - 2;
    var length = 1.1 * (y + radius) / n;
     
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", col2);
    gradient.addColorStop("1.0", col1);
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

// Draw the count of statistics on the canvas
function drawStatsCount(x, y) {
    y = y * 2.25 + 1.5 + gap/2;
    let fontSize = gap * 0.462; 
    ctx.font = "bold " + fontSize + "px Arial";
    ctx.fillStyle = "red";
    ctx.clearRect(x - gap / 2, y - gap / 2, gap, gap * 1.5);10
    if (statsWatcher[x][1] < 10)
        ctx.fillText(statsWatcher[x][1], x - gap / 6, y + gap / 6);
    else if (statsWatcher[x][1] < 100) ctx.fillText(statsWatcher[x][1], x - gap / 3.5, y + gap / 6);
    else if (statsWatcher[x][1] < 1000){
        ctx.fillText(statsWatcher[x][1], x - gap / 2.5, y + gap / 6);
    }
    else{ctx.fillText(statsWatcher[x][1], x - gap / 2, y + gap / 6); }
}




// mainAnimationLoop is an asynchronous function that repeatedly calls the animate function
// as long as the animation is active and not paused. This function is responsible for 
// continuously updating the animation.
async function mainAnimationLoop() {
    BallsRemaining = balls;

    
    while (active && !pause) {
        await animate();

        if (skip > 0) {
            skip--;
        }   
        if (skip <= 0 && speed==0) {
            await wait(200);
        }
        if (skip <= 0 && speed!=100 && speed!=0) {
            await wait((100-speed)/5);
            skip = (speed/100) * (BallsRemaining/10);
        }
    }
}

// Lock or unlock the GUI controls
function lock_unlock_GUI(value) {
    rowRangeInput.disabled = value;
    ballsAmountRangeInput.disabled = value;
    probabilityRangeInput.disabled = value;
}

// createAnimation is a higher-order function that returns animateOneStep,
// which uses closures to remember its state between calls so that we can pause the animation
function createAnimation(n, initial_n, probability) {  
    var j = 0; // space between pegs; default=0, which is middle
    var i = 1; // j is odd if i is even and vice versa
    var xPos = canvas.width / 2 - 0.5 * gap * j;
    var yPos = gap * i;
    var arr = [];
    var y = gap * rows;

    return async function animateOneStep() {
        if (n < 0) {
            active = false;
            saveData();
            lock_unlock_GUI(false);
            submitButton.disabled = false;                    
            resetValues();
            return;
        }

        if (i <= rows + 1) {
            ctx.clearRect(0, 0, canvas.width, y + radius * 1.2);
            drawball(xPos, yPos);
            drawPegs();
            cols = 2;

            if (i == rows + 1) {

                drawStats(xPos, y, initial_n);
                drawStatsCount(xPos, y);
                BallsRemaining -= 1; 
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

//temporal data save for exportation to the server
function saveData() {
    data.balls = balls;
    data.rows = rows;
    data.probabilityLeft = probabilityLeft / 100;
    data.probabilityRight = probabilityRight / 100;
    simplifiedStats = filterStats(statsWatcher);
    simplifiedPrognosis = filterStats (prog_statsWathcer);
    data.stats = simplifiedStats;
    data.prog_stats = simplifiedPrognosis;

}

// Create the prognosis input elements
function createProgInputs() {
    // Clear existing inputs
    const progRangeInputs = document.getElementById('prognosisButtons');
    while (progRangeInputs.firstChild) {
        progRangeInputs.removeChild(progRangeInputs.firstChild);
    }

    // Create new range inputs
    for (let i = 0; i < rows; i++) {
        const input = document.createElement('input');
        input.id = 'prognosisInput';
        input.type = 'range';
        input.max = balls;
        input.min = '0';
        input.value = '0';
        input.step = '1';
        input.autocomplete = 'off';

        progRangeInputs.appendChild(input);

        // Add event listener to the input
        progInputsEventListener(input, i);
    }
}


/*                                                     Eventhandlers
**********************************************************************************************************************************/


const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const pauseButton = document.getElementById("pause");
const submitButton = document.getElementById("sendData");
const GroupExportButton = document.getElementById("GroupExportData");
const UserExportButton = document.getElementById("UserExportData");
const continueWithoutProg = document.getElementById("continue-without-prog");
const continueWithProg = document.getElementById("continue-with-prog");
const newExperimentButton = document.getElementById("newExperiment");
var rowRangeInput = document.getElementById("rowRangeInput"); 
var rowRangeDisplay = document.getElementById("rowRangeDisplay"); 
var speedRangeInput = document.getElementById("speedRangeInput"); 
var speedRangeDisplay = document.getElementById("speedRangeDisplay"); 
var ballsAmountRangeInput = document.getElementById("ballsAmountRangeInput");
var ballsAmoutRangeDisplay = document.getElementById("ballsAmoutRangeDisplay");
var probabilityRangeInput = document.getElementById("probabilityRangeInput");
var probabilityRangeDisplay = document.getElementById("probabilityRangeDisplay");
var statusSymbol = document.getElementById("statusSymbol");
var prognosisInputDisplay = document.getElementById("prognosisInputDisplay");
const probabilityInfoIcon = document.querySelector('.info-container');
const probabilityInfoWindow = document.querySelector('.info-window');
const continueInfoWindow = document.querySelector(".continue-info-window"); 


document.addEventListener('DOMContentLoaded', () => {
    const toggleVisibility = (event) => {
      const target = event.target.closest('.info-container, .prog-info-container');
      if (target) {
        event.stopPropagation();
        const infoWindow = target.querySelector('.info-window, .prog-info-window');
        infoWindow.classList.toggle('visible');
      } else {
        document.querySelectorAll('.info-window.visible, .prog-info-window.visible').forEach(window => {
          window.classList.remove('visible');
        });
      }
    };
  
    document.addEventListener('click', toggleVisibility);
  });

  
ballsAmountRangeInput.addEventListener("input", () => {

    balls = Number(ballsAmountRangeInput.value);
    ballsAmoutRangeDisplay.innerHTML = "Anzahl Bälle<br>" + Number(balls);

    lock_unlock_GUI(false);
    reloadCanvas();
    resetValues();
    drawPegs();
    resetProg();  

});

probabilityRangeInput.addEventListener("input", () => {
    probabilityLeft = Number(probabilityRangeInput.value);
    probabilityRight = 100 - probabilityLeft;
    probabilityRangeDisplay.innerHTML = "Wahrscheinlichkeit<br> " + probabilityLeft + " % | " + probabilityRight + " % ";
});

speedRangeInput.addEventListener("input", () => {
    speed =  speedRangeInput.value;
      
});

rowRangeInput.addEventListener("input", () => {
    rowRangeDisplay.innerHTML = "Anzahl Reihen<br>" + rowRangeInput.value;
    rows = Number(rowRangeInput.value);
    
    lock_unlock_GUI(false);
   
    resizeGalton();
    reloadCanvas();
    resetValues();
  
    drawPegs();
    resetProg();
    createProgInputs();
    
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
        lock_unlock_GUI(true);

        //intialisiere Statswatcher mit Nullen
        var binsArray = generateLastArray(rows);
        for (let s = 0; s < binsArray.length; s++) {
            statsWatcher[canvas.width / 2 - 0.5 * gap * binsArray[s]] = [null, 0];
        }

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

    lock_unlock_GUI(false);
   
    await wait(300);
    reloadCanvas();
    resetValues();
    drawPegs();
    
});

submitButton.addEventListener("click", async () => {
    try {
        const response = await fetch("/submit_data", {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const jsonResponse = await response.json();

        if (response.status === 201) {
            submitButton.disabled = true;
            data = {user_id: user_id, group_id: group_name, rows: 0, balls: 0, probabilityLeft: 0, probabilityRight: 0, stats: [], prog_stats: []};

            statusSymbol.classList.remove("error-style");
            statusSymbol.innerHTML = "&#10003;"; // Checkmark symbol
            statusSymbol.classList.add("success-style");
            statusSymbol.style.visibility = "visible";
            // Remove the symbol after 5 seconds (5000 milliseconds)
            setTimeout(() => { statusSymbol.style.visibility = "hidden"; }, 1000);
            

        } else {        
            // Display error symbol (cross)
            statusSymbol.classList.remove("success-style");
            statusSymbol.innerHTML = "&#10007;"; // cross symbol
            statusSymbol.classList.add("error-style");
            statusSymbol.style.visibility = "visible";
            throw new Error(jsonResponse.detail);
        }

    } catch (error) {
        setTimeout(() => { statusSymbol.style.visibility = "hidden"; }, 1000);
        console.error(error.message);
    }
});



function progInputsEventListener(progInput, index) {
    progInput.addEventListener("input", () => {
        const x = coordinates[index][0];
        const y = coordinates[index][1];
        let value = Number(progInput.value);
        const currentValue = prog_statsWathcer[x][1];

        const currentTotal = Array.from(document.querySelectorAll("#prognosisInput"))
            .reduce((total, input) => total + Number(input.value), 0);

        const newRemainedBalls = balls - currentTotal + value;

        // If the new total exceeds the limit or would result in negative remaining balls
        if (currentTotal > balls || newRemainedBalls < 0) {
            value = Math.min(balls - (currentTotal - value), balls);
            progInput.value = value;
        }

        drawStatsPrognosis(x, y, balls, prog_statsWathcer, value);
        drawStatsCountPrognosis(x, y, prog_statsWathcer);

        remainedBalls = balls - Array.from(document.querySelectorAll("#prognosisInput"))
            .reduce((total, input) => total + Number(input.value), 0);
        prognosisInputDisplay.innerHTML = remainedBalls;
    });
}
  
   


if (window.matchMedia("(orientation: portrait)").matches) {
    probabilityInfoIcon.addEventListener('click', function() {
    
        if (probabilityInfoWindow.style.visibility === 'visible') {
            probabilityInfoWindow.style.visibility = 'hidden';
            probabilityInfoWindow.style.opacity = '0';
        } else {
            probabilityInfoWindow.style.visibility = 'visible';
            probabilityInfoWindow.style.opacity = '1';
        }
    });
    
    // Close the info window when clicking outside of it
    document.addEventListener('click', function(event) {
        if (!probabilityInfoIcon.contains(event.target)) {
            probabilityInfoWindow.style.visibility = 'hidden';
            probabilityInfoWindow.style.opacity = '0';
        }
    });
 }



continueWithProg.addEventListener("click", async () => {
    
    if(remainedBalls == 0) {


        document.getElementById("settings-container").style.display = "none";
        document.querySelector(".prognosis").style.display = "none";
   
        document.getElementById("button-container").style.display ="";
        document.getElementById("speed-container").style.display="";
        newExperimentButton.style.display="";

    }
    else {

        continueInfoWindow.style.visibility = 'visible';
        continueInfoWindow.style.opacity = '1';

        await wait(2000);

        continueInfoWindow.style.visibility = 'hidden';
        continueInfoWindow.style.opacity = '0';
         
        
    }
});

continueWithoutProg.addEventListener("click", function() {
    // reset prog_watcher 
    document.getElementById("settings-container").style.display = "none";
    document.querySelector(".prognosis").style.display = "none";
   
    document.getElementById("button-container").style.display ="";
    document.getElementById("speed-container").style.display="";
    newExperimentButton.style.display="";
});

newExperimentButton.addEventListener("click", function() {
     
    location.reload();
});

GroupExportButton.addEventListener("click", async () => {
    try {
         window.location.href = `/results?group_id=${group_name}&user_id=${user_id}`; 
       
    } catch (error) {
        console.error(error.message);
    }
});



UserExportButton.addEventListener("click", async () => {
    try {     

        window.location.href = `/results?user_id=${user_id}`; 

    } catch (error) {
        console.error(error.message);
    }
});


//Resizing the window, forces redrawing canvas
window.addEventListener('resize', function(event) { 
    resizeCanvas();
    resetValues();
    drawPegs();
    resetProg();
}, true);


 /*                                                       Initialization
************************************************************************************************************************************/


resizeGalton();
resizeCanvas();
drawPegs();
createProgInputs();

// Initialize the pro_coordinates array with zeros
for (var i = 0; i < coordinates.length-1; i++) {
 prog_statsWathcer[coordinates[i][0]] = [0,0];
 drawStatsCountPrognosis(coordinates[i][0], coordinates[i][1], prog_statsWathcer);
}  
submitButton.disabled = true;
prognosisInputDisplay.innerHTML =  balls;