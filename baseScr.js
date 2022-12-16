/*
Just a note that I wrote this code pretty quickly, and I'm Very rusty on javascript
..just getting my excuses out in advance there :)
 */

var canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
var demoContainer = document.getElementById("demo-container");
demoContainer.appendChild(canvas);
//canvas.style.border = "none";
//canvas.style.padding = "0px 0px 0px 0px";
var ctx = canvas.getContext("2d");
ctx.font = "30px Arial";
//document.body.appendChild(canvas);

var backgroundCol = "#000000";

var fillStyleAlt = "#ff0000"

let startGameScreenCol = "#000000";

let endGameScreenCol = "#000000";

let caveCol = "#b93700";

let playerCol = "#0fb300";
let trailCol = "#0fb300";

let textCol = "#ffffff";

var deltaTime;

var blarg = 0;

var gravity = 125;

let progress = 0;
let startSpeed = 90;
let speed = startSpeed;
let acceleration = 2.5;
let nextColumnToBeSpawned = 0;

var caveBlockStartXOffset = -128;

let gameState = 0;//0 start, 1 playing, 2 retry 
let endGameWaitPeriod = 0.75;
let endGameWaitTimeElapsed = 0;

function endGame() {
    gameState = 2;
    endGameWaitTimeElapsed = 0.0;
}

function retryGame() {
    if (endGameWaitTimeElapsed > endGameWaitPeriod) {
        reset();
    }
}


canvas.addEventListener('click', (event) => {
    blarg++;
    event.preventDefault();
    if (gameState == 0) {
        reset();
    }
    else if (gameState == 1) {
        player.thrustStop();
    }
    else {
        retryGame();
    }
});

canvas.addEventListener('mousedown', (event) => {
    blarg++;
    event.preventDefault();
    if (gameState == 1) {
        player.thrustStart();
    }
});

class GameObject {
    constructor(x, y, width, height, col) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.col = col;
    }
    set(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    draw() {
        var preExistingCol = ctx.fillStyle;
        ctx.fillStyle = this.col;
        //im over drawing the objects by 2 pixels on the x axis, should avoid seams on the cave
        ctx.fillRect((this.x - progress) - 1, this.y, this.width + 2, this.height);
        ctx.fillStyle = preExistingCol;
    }
    checkCollision(xB, yB, widthB, heightB) {
        let xA = this.x - progress;
        let yA = this.y;
        if (xA + this.width > xB && xA < xB + widthB) {
            //max of xA is greater than min of xB and min xA is less than max of xB
            if (yA + this.height > yB && yA < yB + heightB) {
                //max of yA is greater than min of yB and min yA is less than max of yB
                //Collide!
                return true;
            }
        }
        return false;
    }
}

class Player {
    //there is a reason why I didn't have the player inherit from the game object
    //that reason is idiocy
    constructor(startX, startY, width, height) {
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
        this.reset();
    }
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.col = playerCol;
        this.velY = 0;
        this.thrustStrength = 300;
        this.thusting = false;
    }
    draw() {
        var preExistingCol = ctx.fillStyle;
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = preExistingCol;
    }
    update() {
        this.velY += gravity * deltaTime;
        this.y += this.velY * deltaTime;
        if (this.thusting) {
            this.velY -= this.thrustStrength * deltaTime;
        }
    }
    thrustStart() {
        
        this.thusting = true;
    }
    thrustStop() {
        this.thusting = false;
    }
}

var player = new Player(200, 200, 24, 24);

var backgroundImageReady = false;
var backgroundImage = new Image();
backgroundImage.src = "background.png";

var blockWidth = 64;
var caveCenterPoint = canvas.height / 2;
var maxCaveCenterPointDelta = 64;
var maxCaveCenterPoint = (canvas.height * 0.5) + 50;
var minCaveCenterPoint = (canvas.height * 0.5) - 50;
var numOfCaveColumns = 12;
var caveHeight = 300;

let nextObstacleColumn = 0;
let minObstacleGap = 3;
let maxObstacleGap = 5;
let obstacleHeight = 80;

var caveRoof = [];
var caveFloor = [];
var obstacles = [];
for (let i = 0; i < numOfCaveColumns; i++) {
    caveRoof.push(new GameObject(0, 0, 0, 0, caveCol));
    caveFloor.push(new GameObject(0, 0, 0, 0, caveCol));
    obstacles.push(new GameObject(0, 0, 0, 0, caveCol));
}

function caveGen(columnNum) {

    let index = columnNum % numOfCaveColumns;

    caveCenterPoint -= maxCaveCenterPointDelta * 0.5;
    caveCenterPoint += Math.floor(Math.random() * maxCaveCenterPointDelta);
    caveCenterPoint = Math.max(caveCenterPoint, minCaveCenterPoint);
    caveCenterPoint = Math.min(caveCenterPoint, maxCaveCenterPoint);
    //Does js really not have a built in clamp() !?

    caveRoof[index].set((columnNum * blockWidth) + caveBlockStartXOffset, 0, blockWidth, caveCenterPoint - (caveHeight * 0.5));
    var floorY = caveCenterPoint + (caveHeight * 0.5);
    caveFloor[index].set((columnNum * blockWidth) + caveBlockStartXOffset, floorY, blockWidth, canvas.height - floorY);

    if(columnNum == nextObstacleColumn){
        obstacles[index].set((columnNum * blockWidth) + caveBlockStartXOffset,
        Math.floor(Math.random() * (canvas.height - obstacleHeight)), blockWidth, obstacleHeight);
        //No random range() either?!
        nextObstacleColumn += Math.floor(Math.random() * (maxObstacleGap - minObstacleGap)) + minObstacleGap;
    }
    else{
        //out of site, out of mind. I did say this code was done in a rush....
        obstacles[index].set((columnNum * blockWidth) + caveBlockStartXOffset, -1000, blockWidth, obstacleHeight);
    }
    nextColumnToBeSpawned++;
}

function setCave() {
    nextColumnToBeSpawned = 0;
    nextObstacleColumn = numOfCaveColumns + 1;
    for (let i = 0; i < numOfCaveColumns; i++) {
        caveGen(i);
        // caveCenterPoint -= maxCaveCenterPointDelta * 0.5;
        // caveCenterPoint += Math.floor(Math.random() * maxCaveCenterPointDelta);
        // caveCenterPoint = Math.max(caveCenterPoint, minCaveCenterPoint);
        // caveCenterPoint = Math.min(caveCenterPoint, maxCaveCenterPoint);
        // //Does js really not have a built in clamp() !?

        // caveRoof.push(new GameObject(i * blockWidth, 0,
        //     blockWidth, caveCenterPoint - (caveHeight * 0.5), "#00ff00"));
        // var floorY = caveCenterPoint + (caveHeight * 0.5);
        // caveFloor.push(new GameObject(i * blockWidth, floorY,
        //     blockWidth, canvas.height - floorY, "#00ff00"));
    }
}

// var numOfObstacles = 10;


// function setObjects() {
//     for (let i = 0; i < numOfObstacles; i++) {
//         //obstacles.push(new GameObject(i * 90, 200, 64, 64, "#00ff00"));
//     }
// }
// setObjects();
// function updateObstacles() {

// }

let trail = [];
let trailInterval = 0.3; //in seconds
let trailIntervalElapsed = 0;
let nexTrailIndex = 0;
let trailSize = 5;
for(let i = 0; i < 20; i++){
    trail.push(new GameObject(-1000, 0, 0, 0, trailCol));
}

function resetTrail(){
    for(let i = 0; i < trail.length; i++){
        trail[i].set(-1000, 0, 0, 0);
    }
    trailIntervalElapsed = 0;
    nexTrailIndex= 0;
}

function drawWorld() {
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].draw();
    }
    for (let i = 0; i < numOfCaveColumns; i++) {
        caveRoof[i].draw();
        caveFloor[i].draw();
    }
}

function drawTrail(){
    for(let i = 0; i < trail.length; i++){
        trail[i].draw();
    }
}

function printCenteredTxt(tx, y){
    ctx.fillText(tx, (canvas.width * 0.5) - (ctx.measureText(tx).width * 0.5), y);
}

function reset() {
    progress = 0;
    gameState = 1;
    speed = startSpeed;
    //setObjects();
    setCave();
    player.reset();
    resetTrail();
}
//reset();

function checkCollision() {
    for (let i = 0; i < numOfCaveColumns; i++) {
        //yeah... this is pretty inefficeint given the player is locked to a certain x pos
        //errm, I'm in a rush
        if (caveRoof[i].checkCollision(player.x, player.y, player.width, player.height)) {
            return true;
        }
        if (caveFloor[i].checkCollision(player.x, player.y, player.width, player.height)) {
            return true;
        }
        if (obstacles[i].checkCollision(player.x, player.y, player.width, player.height)) {
            return true;
        }
    }
    return false;
}

function update() {
    if (gameState == 0) {

    }
    else if (gameState == 1) {
        if (player.y + player.height < 0 || player.y > canvas.height) {
            endGame();
        }
        trailIntervalElapsed += deltaTime;
        if(trailIntervalElapsed > trailInterval){
            if(nexTrailIndex >= trail.length){
                nexTrailIndex = 0;
            }
            trail[nexTrailIndex].set(player.x + progress, player.y, trailSize, trailSize);
            trailIntervalElapsed -= trailInterval;
            nexTrailIndex++;
        }
        player.update();
        if (checkCollision()) {
            endGame();
        }
        if (progress > (nextColumnToBeSpawned - numOfCaveColumns) * blockWidth) {
            caveGen(nextColumnToBeSpawned);
        }
        progress += speed * deltaTime;
        speed += acceleration * deltaTime;
    }
    else {
        endGameWaitTimeElapsed += deltaTime;
    }
}

var main = function () {
    var now = Date.now();
    deltaTime = (now - then) / 1000;
    update();
    render();
    then = now;
    requestAnimationFrame(main);
};
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var render = function () {
    ctx.fillStyle = backgroundCol;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.drawImage(backgroundImage, 0, 0, 512, 576);

    ctx.fillStyle = textCol;
    if (gameState == 0) {
        //ctx.fillText("Click to Start", 100, 150);
        printCenteredTxt("Guide your cuboid craft", 100);
        printCenteredTxt("through the cave!", 140);
        printCenteredTxt("Avoid hitting the sides...", 250);
        printCenteredTxt("click to go up!", 290);
        printCenteredTxt("Click to Start!", 450);
    }
    else if (gameState == 1) {
        drawTrail();
        player.draw();
        drawWorld();
        printCenteredTxt("Score: " + Math.round(progress * 0.1), 40);
    }
    else {
        //ctx.fillText("Game over!", 100, 150);
        printCenteredTxt("Game Over!", 220);
        printCenteredTxt("Score: " + Math.floor(progress * 0.1), 260)
        if (endGameWaitTimeElapsed > endGameWaitPeriod) {
            printCenteredTxt("Click to retry!", 300);
        }
    }
    //ctx.fillText("canvas x:" + canvas.offsetLeft, 100, 180);
    //ctx.fillText("Hello thar .. my good fellow ..." + deltaTime, 0, 32);


};

var then = Date.now();
main();
