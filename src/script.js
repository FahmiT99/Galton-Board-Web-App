// Get the canvas element and its context
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerHeight * 0.3; //ca. 500px
canvas.height = window.innerHeight*0.4;
console.log(window.innerWidth);

// Define some constants for the simulation
var stop = false; //stop execution
var active = false; //animation is not active 
var rows = 5;//Number of rows of pegs
var cols = 2; // Number of columns of pegs it is a constant
var gap = 250/rows; // Gap between pegs // standard value = 250/rows / update: dynamic size based on rows
var radius = 50/rows; // Radius of pegs and balls //standard value = 50/rows  // same
var bins = []; // Array to store the number of balls in each bin
var timer = null;// Variable to store the timer
var speed = 300; //canot be reseted unsing resetValues()

function resetValues()
{
    stop = false; //stop execution
    active = false; //animation is not active 
    cols = 2; // Number of columns of pegs it is a constant
    gap = 250/rows; // Gap between pegs // standard value = 250/rows / update: dynamic size based on rows
    radius = 50/rows; // Radius of pegs and balls //standard value = 50/rows  // same
    bins = []; // Array to store the number of balls in each bin
    timer = null;

    for (var i = 0; i < cols; i++) {
        bins[i] = 0;
    }

    statsWatcher = {};
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
            // Calculate the x and y coordinates of the peg
            var x = (canvas.width-gap) / 2 + gap * (j - i / 2);
            var y = gap * (i + 1);
            // Draw a circle with the peg color
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
           // console.log("i is "+ i);   
            if (i == rows - 1)
            {
                drawVerticalLine(x, y);
            }
        }
        cols += 1; // increasing the column content incrementally
    }
    drawHorizontalLine(x, y); //�bergabe der letzten Peg's Position
}

function drawHorizontalLine(x, y) {
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo((canvas.width-gap) / 2 + gap * (-(rows-1)/ 2), y * 2.25);
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();

}

var coordinates = []; //deepest level pegs coordinates

function drawVerticalLine(x, y)
{
    coordinates.push(x);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + radius );
    ctx.lineTo(x, y * 2.25);
    ctx.stroke();
}


function drawball(x_position = canvas.width / 2, y_position = gap) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x_position, y_position, radius, 0, Math.PI * 2);
    ctx.fill();

}

function wait(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

// n / initial_n ratio is 2/7 optimally!
async function ballProbabilityMotion(n = 100, initial_n = 100) {  //muss n mal durchlaufen
    if (n<0) {active= false; statsWatcher ={}; return;}
    var j = 0; // Platz zwischen pegs //standard Value: 0, also Mitte 
    var i = 1; //j gerade falls i ungerade und umgekehrt //Höhenebene
    var xPos = canvas.width / 2 - 0.5 * gap * j;
    var yPos = gap * i;
    var arr = [];
    var y = gap * rows;
    while (i <= rows+1)
    {
        if (!stop)
        {
            ctx.clearRect(0, 0, canvas.width, y +radius); //clear the upper half only
            drawball(xPos, yPos);
            drawPegs();
            await wait(speed);
            cols = 2;
            console.log("i is " + i + " but row is " + Number(Number(rows)+1));
            if(i==Number(Number(rows)+1)) //the last level? 
            {
                

                //use statLength to draw the how often a ball fits 
                //between nth pegs. Implement and call drawStats() from here
                drawStats(xPos, y , initial_n);  
                drawStatsCount(xPos, y);     
                //await wait(300);   
                break;
            }
  


            var xPos = canvas.width / 2 - 0.5 * gap * j;
            var yPos = gap * i;
            var random = Math.random(); //Muss angepasst wegen Variationsm�glichkeit 3
            arr.push(random);           // Dazu muss die 0,5 in If-statement angepasst 
            if (random <= 0.5) {
                j += 1; //going right 
            }
            else j -= 1; //going left


            i += 1;  //go to the next level(downwards)
            //console.log("i is " + i);
        }
        else 
        {
            stop = false;
            active = false;
            statsWatcher= {};
            return;
        }
        //console.log("row nr. " + rows);
    }
    console.log("recursion round!");
    ballProbabilityMotion(n-1);
}

var statsWatcher = {}; // contains the x postion of the buckets as keys and 
// an array of corresponding length and how often the ball entered the bucket
// as a second value x:[corresponding length, count]

function drawStats(x, y, n)
{
    console.log("drawSTATS() entered!");
    ctx.lineWidth = gap-2;
    let = startingPoint = y * 2.25;
    var length = (y + radius)/ n; 
    ctx.beginPath();


    const gradient = ctx.createLinearGradient(0,0,canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("1.0", "red");
    gradient.addColorStop("1.0", "red");

    ctx.strokeStyle = gradient// "red";
    
    if (!statsWatcher.hasOwnProperty(x))
    {
        statsWatcher[x] = [length, 1];
        ctx.moveTo(x, startingPoint);
        console.log("n is " +n );
        ctx.lineTo(x, startingPoint - length);       
    }
    else
    {
        ctx.moveTo(x,startingPoint - statsWatcher[x][0]);
        statsWatcher[x][0]+=length;
        statsWatcher[x][1]+=1;
        console.log("statswateher has " + statsWatcher[x][1]);
        console.log("n is " +n );
        ctx.lineTo(x, startingPoint - statsWatcher[x][0]);
    }
    ctx.stroke(); 
    ctx.strokeStyle = "black";
}

function drawStatsCount(x, y)
{
    y = y * 2.25 +gap/2;
    let fontSize = gap*0.66;
    ctx.font ="bold " +fontSize + "px Arial"; //
    ctx.fillStyle = "red";
    ctx.clearRect(x-gap/2, y-gap/2, gap, gap*1.5);
    if (statsWatcher[x][1]<10)
    ctx.fillText(statsWatcher[x][1], x-gap/6, y+gap/6);
    else ctx.fillText(statsWatcher[x][1], x-gap/3, y);
}




// Get the start and stop buttons
var startButton = document.getElementById("start");
var stopButton = document.getElementById("stop");
var rangeInput = document.getElementById("rangeInput"); //rows adjustment control
var rangeValue = document.getElementById("rangeValue"); //current rows display
var confirmButton = document.getElementById("confirm");
var speedRangeInput = document.getElementById("rangeInput2"); //speed adjustment control
var speedRangeValue = document.getElementById("rangeValue2"); //current speed display
var ballsAmountRangeInput = document.getElementById("rangeInput3"); //TODO
var ballsAmountRangeValue = document.getElementById("rangeValue3"); //TODO


var newRowValue = rows; // temp save of the rows
rangeValue.textContent = "Anzahl Reihen = " + rangeInput.value;


ballsAmountRangeInput.addEventListener("input", () => 
{
    // TODO 
    return;
});



speedRangeInput.addEventListener("input", () => {
    speed = 300 - speedRangeInput.value ;
    speedRangeValue.textContent = "Fallgeschwindigkeit = " + Math.floor((speedRangeInput.value*100)/300) + "%";
});

rangeInput.addEventListener("input", () => {
    rangeValue.textContent = "Anzahl Reihen = " + rangeInput.value;
    newRowValue = rangeInput.value;
});


confirmButton.addEventListener("click", () => {
    if (!active)
    {
        rows = newRowValue;
        rangeValue.textContent = "Anzahl Reihen = " + rows;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetValues();
        drawPegs();
    }
});


// Add event listeners to the buttons
startButton.addEventListener("click", () => {

    if (!active) //assert the function runs only once at a time
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cols= 2;
        active = true;
        ballProbabilityMotion(); 
    }

});
stopButton.addEventListener("click", async () => {
    if (active)
    {
        stop = true;
        await wait(200);
        statsWatcher = {};
    }
});


// Draw the galton board for the first time
//Initialization
drawPegs();
