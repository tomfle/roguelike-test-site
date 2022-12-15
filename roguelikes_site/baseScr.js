/*

 */

var canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
var demoContainer = document.getElementById("demo_container");
demoContainer.appendChild(canvas);
//canvas.style.border = "none";
//canvas.style.padding = "0px 0px 0px 0px";
var ctx = canvas.getContext("2d");
ctx.font = "30px Arial";
//document.body.appendChild(canvas);

var fillStyleBlack = "#000000";

var fillStyleAlt = "#ff0000"

var deltaTime;

var blarg = 0;

var gravity = 125;

var progress = 0;
var speed = 70;

addEventListener('click', (event) => {
    blarg++;
    player.thrustStop();
});

addEventListener('mousedown', (event) => {
    blarg++;
    player.thrustStart();
});

class GameObject{
    constructor(x, y, width, height, col){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.col = col;
    }
    draw(){
        var preExistingCol = ctx.fillStyle;
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x - progress, this.y, this.width, this.height);
        ctx.fillStyle = preExistingCol;
    }
}

class Player{
    //there is a reason why I didn't have the player inherit from the game object
    //that reason is idiocy
    constructor(startX, startY, width, height){
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
        this.reset();
    }
    reset(){
        this.x = this.startX;
        this.y = this.startY;
        this.col = "#ff00ff";
        this.velY = 0;
        this.thrustStrength = 300;
        this.thusting = false;
    }
    draw(){
        var preExistingCol = ctx.fillStyle;
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = preExistingCol;
    }
    update(){
        this.velY += gravity * deltaTime;
        this.y += this.velY * deltaTime;
        if(this.thusting){
            this.velY -= this.thrustStrength * deltaTime;
        }
    }
    thrustStart(){
        //Missus!
        this.thusting = true;
    }
    thrustStop(){
        this.thusting = false;
    }
}

var player = new Player(200, 200, 64, 64);

var backgroundImageReady = false;
var backgroundImage = new Image();
backgroundImage.src = "background.png";

var blockWidth = 64;
var caveCenterPoint = canvas.height / 2;
var maxCaveCenterPointDelta = 64;
var maxCaveCenterPoint = (canvas.height * 0.5) + 50;
var minCaveCenterPoint = (canvas.height * 0.5) - 50;
var numOfCaveColumns = 20;
var caveHeight = 300;

var caveRoof = [];
var caveFloor = [];

function setCave(){
    for(var i = 0; i < numOfCaveColumns; i++){

        caveCenterPoint -= maxCaveCenterPointDelta * 0.5;
        caveCenterPoint += Math.floor(Math.random() * maxCaveCenterPointDelta);
        caveCenterPoint = Math.max(caveCenterPoint, minCaveCenterPoint);
        caveCenterPoint = Math.min(caveCenterPoint, maxCaveCenterPoint);
        //Does js really not have a built in clamp() !?

        caveRoof.push(new GameObject(i * blockWidth, 0,
             blockWidth, caveCenterPoint - (caveHeight * 0.5), "#00ff00"));
        var floorY = caveCenterPoint + (caveHeight * 0.5);
        caveFloor.push(new GameObject(i * blockWidth, floorY, 
            blockWidth, canvas.height - floorY , "#00ff00"));
    }
}

var numOfObstacles = 10;
var obstacles = [];

function setObjects(){
    for(var i = 0; i < numOfObstacles; i++){
        //obstacles.push(new GameObject(i * 90, 200, 64, 64, "#00ff00"));
    }
}
setObjects();
function updateObstacles(){

}

function drawWorld(){
    for(var i = 0; i < obstacles.length; i++){
        obstacles[i].draw();
    }
    for(var i = 0; i < numOfCaveColumns; i++){
        caveRoof[i].draw();
        caveFloor[i].draw();
    }
}

function reset(){
    progress = 0;
    setObjects();
    setCave();
    player.reset();
}
reset();

function update(){
    player.update();
    progress += speed * deltaTime;
}

var main = function(){
    var now = Date.now();
    deltaTime = (now - then) / 1000;
    update();
    render();
    then = now;
    requestAnimationFrame(main);
};
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var render = function(){
    backgroundImageReady = true;
    ctx.fillStyle = fillStyleAlt;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.drawImage(backgroundImage, 0, 0, 512, 576);
    ctx.fillStyle = fillStyleBlack;
    player.draw();
    drawWorld();
    ctx.fillText("Hello thar .. my good fellow ..." + deltaTime, 0, 32);
    ctx.fillText("Clicks: " + blarg, 0, 64);

};

var then = Date.now();
main();
