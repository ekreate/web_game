$(document).ready(function () {$("#loading").hide();});
$(document).ajaxStop(function () {$("#loading").hide();});
$("#level_text").hide();
function degrees_to_radians(degrees) {var pi = Math.PI;return degrees * (pi/180);}
var myVar;
var background_width = 1152;
var max_fuel = 150;
var myGamePiece;
var myObstacles = [];
var myFuelTanks = [];
var Levels = [0,200,270];
var myAnimations = [];
var myScore;
var level_text = document.getElementById("level_text")
var sub             = document.createElement("img");
var airplane        = document.createElement("img");
var iceberg         = document.createElement("img");
var splash          = document.createElement("img");
var balloon         = document.createElement("img");
var burst           = document.createElement("img");
var fueltank        = document.createElement("img");
var fuel            = document.createElement("img");
var splash_audio    = new Audio('assets/splash.wav');
var puff_audio      = new Audio('assets/puff.wav');
var bg_music        = new Audio('assets/Monkey-Island-Puzzler_quiet.mp3');
var Score;
bg_music.loop = true;

function startGame() {
  Score =       document.getElementById("score");
  Score.innerHTML ="SCORE: " + myGameArea.frameNo;
  $("#level_text").hide();
  document.getElementById("pos").innerHTML = "";
  fuel.setAttribute("src", "assets/fuel_guage_live.jpg");
  airplane.setAttribute("src", "assets/airplane_live.png");
  sub.setAttribute("src", "assets/sub_live.png");
  iceberg.setAttribute("src", "assets/iceberg_live.png");
  splash.setAttribute("src", "assets/splash_lite.png");
  splash.frames = 17;
  balloon.setAttribute("src", "assets/balloon_lite2.png");
  balloon.width = 805;
  balloon.height =  1091;
  burst.setAttribute("src", "assets/burst_3.png");
  burst.width = 476;
  burst.height = 357;
  burst.frames = 41;
  fueltank.setAttribute("src", "assets/fuel_live.png");
  fueltank.width = 512;
  fueltank.height = 512;
  myGamePiece = new gamePiece(40, 40, "sub", -40, 200);
  myGamePiece.canvas = document.createElement('canvas');
  myGamePiece.ctx = myGamePiece.canvas.getContext("2d");
  myGamePiece.canvas.setAttribute("id", "gamePiece_canvas");
  myGamePiece.canvas.width = 200;
  myGamePiece.canvas.height = 400;
  document.body.insertBefore(myGamePiece.canvas, document.body.childNodes[1]);
  myScore = new component("50px", "VT323", "black", 280, 40, "text");
  w = new Worker("../scripts/calculate_hit.js");
  myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.setAttribute("id", "main_canvas");
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.fuel = max_fuel;
        this.level = 0;
        this.sealevel = 140;
        this.end_game = 0;
        updateGameArea();
        },
    clear : function() {
      for (i = 0; i < myObstacles.length; i += 1) {this.context.clearRect(myObstacles[i].x -10 , myObstacles[i].y - 4, myObstacles[i].width +20,  myObstacles[i].height + 8);}
      for (i = 0; i < myFuelTanks.length; i += 1) {this.context.clearRect(myFuelTanks[i].x, myFuelTanks[i].y, myFuelTanks[i].width,  myFuelTanks[i].height);}
      this.context.clearRect(19, 19, max_fuel + 4,23); //fuelguage
      this.context.clearRect(this.canvas.width/3, this.canvas.height/18, this.canvas.width/3.5,this.canvas.height/19); //fuelguage
    }
}

function gamePiece(width, height, img, x, y) {
    this.img = img;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.gravitySpeed = 0;
    this.angle = 0;
    this.gravity = 0.005;
    this.state = "water";
    this.transitionState = 0;
    this.update = function() {
        this.ctx.translate(this.x, this.y);
        var mid_x = this.width / 2;
        var mid_y = this.height / 2;
        this.ctx.translate(mid_x, mid_y);
        this.ctx.rotate(degrees_to_radians(this.angle));
        this.ctx.drawImage(window[this.img], Math.floor(-mid_x), Math.floor(-mid_y),Math.floor(width),Math.floor(height));
        this.ctx.rotate(-degrees_to_radians(this.angle));
        this.ctx.translate(-mid_x, -mid_y);
        this.ctx.translate(-this.x,-this.y);
    }
    this.newPos = function() {
        if (this.x < 40) {this.x += 1;}
        else{
          this.gravitySpeed += this.gravity;
          this.y += this.gravitySpeed;
          if ((this.gravitySpeed < 0) && (this.angle > -30)){
              if(myGamePiece.state == "water"){this.angle -= 0.6;}
              if(myGamePiece.state == "air"){this.angle -=0.3;}

          }
          if ((this.gravitySpeed > 0) && (this.angle < 30)){
              if(myGamePiece.state == "water"){this.angle += 0.8;}
              if(myGamePiece.state == "air"){this.angle +=0.4;}
          }
        }
        this.hitBottom();
        this.hitSeaLevel();
    }
    this.hitSeaLevel = function() {
      this.transitionState += 1;
      if (this.transitionState > 30){
        if((this.y - myGameArea.sealevel > -4) && (this.y - myGameArea.sealevel < 4)){
          this.transitionState = 0;
          if(myAnimations.find(checkSplash) === undefined){myAnimations.push(new component(150, 100, "splash", this.x,  myGameArea.sealevel));splash_audio.play();}
          if(this.state == "air" ){this.gravitySpeed = 1.5; this.state = "water"; accelerate(0.05); myGamePiece.img = "sub"; }
          else{this.gravitySpeed = -2;this.state = "air";accelerate(0.05); myGamePiece.img = "airplane";}

          }
      }
    }
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    }
    this.hitWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        if ((mybottom <= othertop + 1) || (mytop + 1 >= otherbottom) || (myright <= otherleft + 1) || (myleft + 1 >= otherright)) {return}
        else{
          var Cx = myleft < otherleft ? Math.floor(otherleft):Math.floor(myleft);
          var Cy = mytop < othertop ? Math.floor(othertop):Math.floor(mytop);
          var CX = myright < otherright ? Math.floor(myright):Math.floor(otherright);
          var CY = mybottom < otherbottom ? Math.floor(mybottom):Math.floor(otherbottom);
          var iO = myGameArea.context.getImageData(Cx,Cy,CX-Cx,CY-Cy);
          var iA = this.ctx.getImageData(Cx,Cy,CX-Cx,CY-Cy);
          w.postMessage({ia: iA.data.buffer,io: iO.data.buffer},[iA.data.buffer, iO.data.buffer]);
          w.onmessage = function(event) {
            if (event.data == true){otherobj.collision = true;}
        };
        }
    }
    this.clear = function(){
    for (i = 0; i < myAnimations.length; i += 1) {this.ctx.clearRect(myAnimations[i].x - 20, myAnimations[i].y - 20, myAnimations[i].width + 40,  myAnimations[i].height + 40);}
    this.ctx.clearRect(myGamePiece.x - 3 , myGamePiece.y - 5, myGamePiece.width + 8,  myGamePiece.height + 10);
    }
}

function component(width, height, img, x, y, type) {
    this.collision = false;
    this.type = type;
    this.img = img;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.angle = 0;
    this.animate = function() {
        this.ctx = myGamePiece.ctx;
        if ((img == "splash") && (this.frame <= splash.frames)){
            this.ctx.drawImage(window[img], 0, this.frame * 108, 192, 108,  Math.floor(this.x - 50),  Math.floor(this.y - 35) , Math.floor(width), Math.floor(height));
            this.frame += 1;
        }
        if ((img == "burst") && (this.frame <= burst.frames)){
            this.ctx.translate(this.x, this.y);
            var mid_x = this.width / 2;
            var mid_y = this.height / 2;
            this.ctx.translate(mid_x, mid_y);
            this.ctx.rotate(degrees_to_radians(myGamePiece.angle));
            this.ctx.drawImage(window[img], 0,this.frame * burst.height,  Math.floor(burst.width) ,  Math.floor(burst.height), Math.floor(-mid_x), Math.floor(-mid_y), Math.floor(width), Math.floor(height));
            this.ctx.rotate(-degrees_to_radians(myGamePiece.angle));
            this.ctx.translate(-mid_x, -mid_y);
            this.ctx.translate(-this.x, -this.y);
            this.frame += 1;
        }
    }
    this.update = function() {
      myGameArea.context.drawImage(window[this.img], Math.floor(this.x), Math.floor(this.y),Math.floor(this.width),Math.floor(this.height));
      // ctx.translate(this.x, this.y);
      // var mid_x = this.width / 2;
      // var mid_y = this.height / 2;
      // ctx.translate(mid_x, mid_y);
      // ctx.rotate(degrees_to_radians(this.angle));
      // ctx.drawImage(window[this.img],-mid_x,-mid_y,width,height);
      // ctx.rotate(-degrees_to_radians(this.angle));
      // ctx.translate(-mid_x, -mid_y);
      // ctx.translate(-this.x,-this.y);
    }
}

function updateGameArea() {

    if(myGameArea.end_game != 0){ cancelAnimationFrame(animation); myVar = setInterval(endGame,15); return;}
    updateObstacles();
    checkCollision();
    updateFuelguage();
    for (var i = 0; i < myAnimations.length; i += 1) {myAnimations[i].x += -1;  }
    myGamePiece.newPos();
    Score.innerHTML ="SCORE: " + myGameArea.frameNo;
    myGameArea.frameNo += 1;
    updateLevel();
    myGameArea.context.beginPath();
    myGamePiece.ctx.beginPath();
    moveBackground();
    var animation = requestAnimationFrame(drawGameArea);
}

function drawGameArea(){
  myGameArea.clear();
  myGamePiece.clear();
  myGamePiece.update();
  for (var i = 0; i < myAnimations.length; i += 1) {myAnimations[i].animate();}
  for (i = 0; i < myObstacles.length; i += 1) {myObstacles[i].update()};
  for (i = 0; i < myFuelTanks.length; i += 1) {myFuelTanks[i].update()};
  ctx = myGameArea.context;
  ctx.rect(20,20,max_fuel + 2,20);
  ctx.stroke();
  ctx.drawImage(fuel,21,21,Math.floor(myGameArea.fuel),18);

  updateGameArea();
}

function updateFuelguage(){
  myGameArea.fuel -= 0.1;
  if(myGameArea.fuel <= 0) {myAnimations.push(new component( burst.width/5, burst.height/5, "burst",myGamePiece.x, myGamePiece.y));myGameArea.end_game = 1; }
}

function updateLevel(){
  if ((myGameArea.frameNo >= Levels[1]) && (myGameArea.frameNo < Levels[2]) ) {myGameArea.level = 1; if(myGameArea.frameNo < Levels[1] + 4){levelup();}}
  else if ( myGameArea.frameNo >= Levels[2]) {myGameArea.level = 2;}
}

function levelup(){
  $("#level_text").fadeIn();
  $("#level_text").fadeOut();
}
function checkCollision(){
  for (var i = 0; i < myFuelTanks.length; i += 1) {myGamePiece.hitWith(myFuelTanks[i]);
    if (myFuelTanks[i].collision == true) {
      myGameArea.fuel += 60;
      myGameArea.fuel = Math.min(myGameArea.fuel, max_fuel);
      myAnimations.push(new component(burst.width/5, burst.height/5, "burst",myFuelTanks[i].x - 20, myFuelTanks[i].y - 20));
      puff_audio.play();
      myGameArea.context.clearRect(myFuelTanks[i].x, myFuelTanks[i].y, myFuelTanks[i].width,  myFuelTanks[i].height);
      myFuelTanks.splice(i,1);

    }
  }
  for (var i = 0; i < myObstacles.length; i += 1) {myGamePiece.hitWith(myObstacles[i]);
      if (myObstacles[i].collision == true) {
        myGameArea.end_game = 1;
        myAnimations.push(new component( burst.width/5, burst.height/5, "burst",myGamePiece.x, myGamePiece.y));
        puff_audio.play();
        return;
      }
  }
}

function insertObstacles(){
  var x, y_gap,y_minGap, y_maxGap, x_gap, x_minGap, x_maxGap;
  x = myGameArea.canvas.width;
  y_minGap = 200;
  y_maxGap = 300;
  y_gap = Math.floor(Math.random()*(y_maxGap-y_minGap+1)+y_minGap);
  x_minGap = 0;
  x_maxGap = 100;
  x_gap = Math.floor(Math.random()*(x_maxGap-x_minGap+1)+x_minGap);
  if (Math.random() > 0.4){
    myObstacles.push(new component(100, 80, "iceberg", x, myGameArea.sealevel));
  }
  if(Math.random() > (myGameArea.fuel-12)/(max_fuel)){
    myFuelTanks.push(new component(fueltank.width/16, fueltank.height/16, "fueltank", x, myGameArea.sealevel + y_gap/2));
  }
  if ((myGameArea.level == 2)&&(Math.random() > 0.7)){ //((myGameArea.level == 2)&&(Math.random() > 0.7))
    myObstacles.push(new component(balloon.width/7, balloon.height/7, "balloon", x + x_gap, myGameArea.sealevel - y_gap));
  }
      //myAnimations.push(new component(50, 20, "astroid", x, 0));
}

function updateObstacles(){
  for (i = 0; i < myObstacles.length; i += 1) {
      myObstacles[i].x -= 1.5;
      if(myGameArea.frameNo%2 ==0){
        if(Math.abs(myObstacles[i].wind_flow) > 8){
          if(Math.random() > 0.5){myObstacles[i].y += -0.3; myObstacles[i].wind_flow = -1;}
          else{myObstacles[i].y += 0.3; myObstacles[i].wind_flow = 1;}
        }
        else if(myObstacles[i].wind_flow >= 0){myObstacles[i].y += 0.3; myObstacles[i].wind_flow +=1;}
        else if(myObstacles[i].wind_flow < 0){myObstacles[i].y -= 0.3; myObstacles[i].wind_flow -=1;}
      }
      if (myGameArea.level == 1) {myObstacles[i].y += 1;}
  }
  for (i = 0; i < myFuelTanks.length; i += 1) {myFuelTanks[i].x += -1;if (myGameArea.level == 1) {myFuelTanks[i].y += 1;}}
  if (myGameArea.frameNo == 0 || everyinterval(150)) {insertObstacles();}
}

function everyinterval(n) {
    if ((myGameArea.frameNo % n) == 0) {return true;}
    return false;
}

function accelerate(n) {
    if(myGamePiece.state == "water"){if(n < 0){myGamePiece.gravity =  n/8;}else{myGamePiece.gravity = n/8;}}
    else if(myGamePiece.state == "air"){if(n < 0){myGamePiece.gravity = n/4 - myGamePiece.angle/2000}     else{myGamePiece.gravity = n*1.2;}}
}

function moveBackground(){
    if(myGameArea.level == 0)       {myGameArea.canvas.style.backgroundPosition =  myGameArea.frameNo * ( -3.5 ) + 'px -250px';}
    else if (myGameArea.level == 1) {myGameArea.canvas.style.backgroundPosition =  myGameArea.frameNo * ( -3.5 ) + 'px ' + (myGameArea.frameNo -Levels[1] -250)  +'px'; myGameArea.sealevel += 1;}
    else if (myGameArea.level == 2) {myGameArea.canvas.style.backgroundPosition =  myGameArea.frameNo * ( -3.5 ) + 'px ' + ((Levels[2] - Levels[1]) - 250) + 'px' ;}
}

function endGame() {
  myGameArea.clear();
  myGamePiece.clear();
  for (i = 0; i < myObstacles.length; i += 1) {myObstacles[i].update();}
  for (i = 0; i < myAnimations.length; i += 1) {
    myAnimations[i].animate();
    if (myAnimations[i].frame == burst.frames){clearInterval(myVar); gameOver();}
  }

}

function gameOver(){
    myGameArea.clear();
    document.getElementById("gameOver").style.zIndex = 10;
    $("#loading").show();
    grecaptcha.execute('6Ldq4ngUAAAAANztKrZWIK01nWTN1rbQ5cIl0l6g', {action: 'highscore'}).then(function(token){
    getHighScores(token);});
}
function restartGame(){
  document.getElementById("pos").innerHTML = "";
  document.getElementById("gameOver").style.paddingBottom = "4.5rem";
  myObstacles.length = 0;
  myAnimations.length = 0;
  myFuelTanks.length = 0;
  document.getElementById("gameOver").style.zIndex = -2;
  myGameArea.frameNo = 0;
  myGamePiece.x = -40;
  myGamePiece.y = 200;
  myGamePiece.angle = 0;
  myGamePiece.state = "water";
  myGamePiece.img = "sub";
  myGameArea.start();
}
function checkSplash(component){
  return component.type == "splash";
}
function getHighScores(token){
  var hS = { hs:myGameArea.frameNo,recaptcha:token};
  console.log(JSON.stringify(hS));
  $.ajax({
    url : "http://kapitalc.pythonanywhere.com/",
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(hS),
  }).done(function(data){
    var response_data = data.split(",");
    var position = ((parseFloat(response_data[1]) - parseFloat(response_data[0])) /parseFloat(response_data[1]) * 100).toFixed(2);
    document.getElementById("pos").innerHTML ="Your score is better than<br>" + position.toString() + '% of players.';
    document.getElementById("gameOver").style.paddingBottom = "0rem";
  });
}
//KEY MAPPING
