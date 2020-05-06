//might help with ghosts:
//https://www.masswerk.at/JavaPac/pacman-howto.html#sect3_5


var context;
var shape = new Object();
var firstEnemy=new Object() ;
var secondEnemy=new Object();
var thirdEnemy=new Object();
var fourthEnemy=new Object();
var sugar = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;

//mark

// sounds
var eatingPointsSound ;
var readySound;
var died;

let enemiesMovementOptions = [1,2,3,4] ;
let checkNumOfEnemies = 0; //tells us which enemy are we talking about
let lastPressedKey;


var up_key = 38;
var down_key = 40;
var left_key = 37;
var right_key = 39;

//these values will get their values from the Apply Settings button
var pickup_5_color;
var pickup_15_color;
var pickup_25_color;
var max_time;
var num_of_pickups;
var num_of_enemies;
var num_of_lives;
var num_of_pickups;//=$("#settings_pickups").val();
let enemiesNum

var keysDown = {};
addEventListener("keydown", function (e) { keysDown[e.keyCode] = true; }, false);
addEventListener(
	"keyup",
	function (e) {
		keysDown[e.keyCode] = false;
	},
	false
);


//Pseudo Enums
CELL_EMPTY = 0
//CELL_FOOD = 1
CELL_PACMAN = 2 
CELL_GHOST = 3
CELL_WALL = 4
CELL_CLOCK = 6
CELL_SHIELD = 7
CELL_RANDOM = 8

CELL_FOOD_5 = 5
CELL_FOOD_15 = 15
CELL_FOOD_25 = 25
CELL_SUGAR = 50

MOVING_UP=1
MOVING_DOWN=2
MOVING_LEFT=3
MOVING_RIGHT=4




function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

var gameIsOver = false
function Start() {

	//size of array
	board_height = $("#canvas").attr("height") / 60
	board_width = $("#canvas").attr("width") / 60
	enemiesNum = num_of_enemies
	gameIsOver = false
	eatingPointsSound = new sound("sounds\\eating.mp3");
	readySound = new sound("sounds\\ready.mp3");
	died = new sound("sounds\\die.mp3");
	//readySound.play(); disabled for now as we need a looping background music instead
	checkNumOfEnemies = 0;

	
	keysDown = {}
	board = new Array();
	lastPressedKey = [];
	num_of_lives = 5;
	score = 0;
	pac_color = "#ffff00";
	var cnt = 100;
	var food_remain = num_of_pickups;
	initFoodAmount()
	var pacman_remain = 1;
	start_time = new Date();
	playMusic()

	
	sugar.move=enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	firstEnemy.move= enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	secondEnemy.move=enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	thirdEnemy.move = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	fourthEnemy.move=enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];

	sugar.prev =0
	firstEnemy.prev=0
	secondEnemy.prev=0
	thirdEnemy.prev=0
	fourthEnemy.prev=0


	
	for (var i = 0; i < board_width; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < board_height; j++) {
			if(i==0 && j==6){
				board[i][j] = CELL_SUGAR;
				sugar.i=i;
				sugar.j=j;
			}
			if (isWallLocation(i, j)) {
				board[i][j] = CELL_WALL;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = getFoodType();
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					if (i != 0 && j != 0 /*|| i!=0&&j!=9 || i!=9&&j!=0 || i!=9&&j!=9*/) {
						shape.i = i;
						shape.j = j;
						pacman_remain--;
						board[i][j] = CELL_PACMAN;
					}
				}
				else {
					board[i][j] = CELL_EMPTY;
				}
				cnt--;
			}
		}
	}

	//place enemies
	while (enemiesNum != 0) {
		
		var i_ind = Math.random();
		var j_ind = Math.random();

		if (i_ind <= 0.5) { i_ind = 0; }
		else { i_ind = 9; }
		if (j_ind <= 0.5) { j_ind = 0; }
		else { j_ind = 9; }

		if (board[i_ind][j_ind] != 3) {
			checkNumOfEnemies++;
			putAnEnemy(i_ind, j_ind);
		}
	}

	//place food
	while (food_remain > 0) {
		let emptyCell = findRandomEmptyCell(board);
		board[emptyCell[0]][emptyCell[1]] = getFoodType();
		food_remain--;
	}

	//place clock powerup
	emptyCell = findRandomEmptyCell(board);
	board[emptyCell[0]][emptyCell[1]] = CELL_CLOCK

	//place shield powerup
	emptyCell = findRandomEmptyCell(board);
	board[emptyCell[0]][emptyCell[1]] = CELL_RANDOM

	clearInterval(interval)
	interval = setInterval(UpdatePosition, 250);
	//window.alert(interval)
}

function putAnEnemy(i,j){

	
	if(checkNumOfEnemies==1){
		board[i][j]=3;
		firstEnemy.i=i;
		firstEnemy.j=j;
		enemiesNum--;
		return;
	}
	else if(checkNumOfEnemies==2){
		board[i][j]=3;
		secondEnemy.i=i;
		secondEnemy.j=j;
		enemiesNum--;
		return;
	}
	else if(checkNumOfEnemies==3){
		board[i][j]=3;
		thirdEnemy.i=i;
		thirdEnemy.j=j;
		enemiesNum--;
		return;
	}
	else{
		board[i][j]=3;
		fourthEnemy.i=i;
		fourthEnemy.j=j;
		enemiesNum--;
		return;
	}
}	

function findRandomEmptyCell(board) {
	var i = Math.floor(Math.random() * (board_width-1) + 1);
	var j = Math.floor(Math.random() * (board_height-1) + 1);
	while (board[i][j] != CELL_EMPTY) {
		i = Math.floor(Math.random() * (board_width-1) + 1);
		j = Math.floor(Math.random() * (board_height-1) + 1);
	}
	return [i, j];
}

function GetKeyPressed() {
	if (keysDown[up_key]) {
		return 1;
	}
	if (keysDown[down_key]) {
		return 2;
	}
	if (keysDown[left_key]) {
		return 3;
	}
	if (keysDown[right_key]) {
		return 4;
	}
}

function changeDirectionAndDraw(x, y) {

	var center = new Object();
	center.x = x * 60 + 30;
	center.y = y * 60 + 30;
	var pressedKey = lastPressedKey[0];

	if (pressedKey == MOVING_UP) 
		drawDirection(1.2,1.8,15,2,x,y);
		
	if (pressedKey == MOVING_DOWN) 
		drawDirection(0.25,0.65,15,-4,x,y);
		
	if (pressedKey == MOVING_LEFT) 
		drawDirection(0.75,1.25,5,-15,x,y);
	
	if (pressedKey == MOVING_RIGHT) 
		drawDirection(1.75,0.25,5,-15,x,y);
	
}

function drawDirection(m,n,a,b,x,y){

	var center = new Object();
	center.x = x * 60 + 30;
	center.y = y * 60 + 30;

	context.clearRect(center.x - 30, center.y - 30, 60, 60);
	context.beginPath();
	context.arc(center.x , center.y, 30,  m* Math.PI, n* Math.PI, true);
	context.lineTo(center.x, center.y);
	context.fillStyle = pac_color; //color
	context.fill();
	context.beginPath();
	context.arc(center.x + a, center.y + b, 5, 0, 2 * Math.PI); // circle
	context.fillStyle = "black"; //color
	context.fill();

}


function Draw() {
	if(gameIsOver){return}
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = Math.round(max_time - time_elapsed)
	$("#lblLivesValue").text(num_of_lives) 

	const drawImageById = function(id){
		context.beginPath();
		let img = document.getElementById(id);
		context.drawImage(img, center.x - 30, center.y - 30, 60, 60)
	}

	//var x = GetKeyPressed();
	for (var i = 0; i < board_height; i++) {
		for (var j = 0; j < board_width; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == CELL_PACMAN) {
				context.beginPath();
				context.arc(center.x, center.y, 30, 0, 2 * Math.PI); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();

				changeDirectionAndDraw(i,j);
			} 
			else if (isFoodCell(board[i][j])) {
				context.beginPath();
				context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
				switch(board[i][j]){
					case CELL_FOOD_5:
						context.fillStyle = pickup_5_color; 
						break;
					case CELL_FOOD_15:
						context.fillStyle = pickup_15_color; 
						break;
					case CELL_FOOD_25:
						context.fillStyle = pickup_25_color; 
						break;
					case CELL_SUGAR:
						drawImageById("sugar")
					default:
						context.fillStyle = "black"; //color
						break;
				}
				context.fill();
			} 
			
			else if (board[i][j] == CELL_GHOST) {				
				drawImageById("ghost")
			}
			else if (board[i][j] == CELL_WALL) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
			else if(board[i][j] == CELL_CLOCK) {
				drawImageById("clock")
			}
			
			else if(board[i][j] == CELL_RANDOM) {
				drawImageById("question_mark")
			}
		}
	}
}

function goThroughThePacman(enemy,prev){ //for enemies that around the pacman
		
	//above the shape ************
	if( (enemy.j<shape.j && enemy.i < shape.i) || (enemy.j<shape.j && enemy.i > shape.i) || (enemy.j<shape.j && enemy.i == shape.i) ){
		if(enemy.i<shape.i){ //above + left
			
			if(board[enemy.i][enemy.j+1] !=CELL_WALL && board[enemy.i][enemy.j+1] !=CELL_GHOST){ //go eat him
			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i][enemy.j+1];
			enemy.j++;	
			}
			else if(board[enemy.i][enemy.j+1] ==CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){ //move right
				
				
				findAnotherPath(enemy)
				move(enemy, CELL_GHOST)
				
			}
			
		}
	
		
		else if(enemy.i>shape.i){ //above + right

			if(board[enemy.i][enemy.j+1] !=CELL_WALL && board[enemy.i][enemy.j+1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = enemy.prev;
				enemy.prev = board[enemy.i][enemy.j+1];
				enemy.j++;	
				}
				else if(board[enemy.i][enemy.j+1] ==CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){ //move left
					
					findAnotherPath(enemy)
					move(enemy, CELL_GHOST)
				}
		}
		else /*if(enemy.i==shape.i)*/{ //above
			if(board[enemy.i][enemy.j+1] != CELL_WALL && board[enemy.i][enemy.j+1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = enemy.prev;
				enemy.prev = board[enemy.i][enemy.j+1];
				enemy.j++;
			}
			else if(board[enemy.i][enemy.j+1] == CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){//move left
				
				findAnotherPath(enemy)
				move(enemy, CELL_GHOST)
			}
		}
		
	}

	//under the shape *********
	else if( (enemy.j>shape.j && enemy.i < shape.i) || (enemy.j>shape.j && enemy.i > shape.i) || (enemy.j>shape.j && enemy.i == shape.i) ){
		if(enemy.i<shape.i){ //under+left
			
			if(board[enemy.i][enemy.j-1] !=CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i][enemy.j-1];
			enemy.j--;	
			}
			else if(board[enemy.i][enemy.j-1] ==CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){ //move right
				
				findAnotherPath(enemy)
				move(enemy, CELL_GHOST)
			}
		}
		else if(enemy.i>shape.i){ //under+right
			
			if(board[enemy.i][enemy.j-1] !=CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = enemy.prev;
				enemy.prev = board[enemy.i][enemy.j-1];
				enemy.j--;	
				}
				else if(board[enemy.i][enemy.j-1] ==CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){ //move right
					
					findAnotherPath(enemy)
					move(enemy, CELL_GHOST)
				}
		}
		else{ //under
			if(board[enemy.i][enemy.j-1] != CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = enemy.prev;
				enemy.prev = board[enemy.i][enemy.j-1];
				enemy.j--;
			}
			else if(board[enemy.i][enemy.j-1] == CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){//move left
				
				findAnotherPath(enemy)
				move(enemy, CELL_GHOST)
			}
		}
	}

	//left ahead  the shape ****************
	else if(enemy.i<shape.i && enemy.j == shape.j){
		if(board[enemy.i+1][enemy.j] != CELL_WALL && board[enemy.i+1][enemy.j] != CELL_GHOST){
		board[enemy.i][enemy.j] = enemy.prev;
		enemy.prev = board[enemy.i+1][enemy.j];
		enemy.i++;
		}
		else if(board[enemy.i+1][enemy.j] == CELL_WALL || board[enemy.i+1][enemy.j] == CELL_GHOST){
			
			findAnotherPath(enemy)
			move(enemy, CELL_GHOST)
		}
	}

	//right ahead the shape ***********
	else{
		if(board[enemy.i-1][enemy.j] != CELL_WALL && board[enemy.i-1][enemy.j] != CELL_GHOST){
			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i-1][enemy.j];
			enemy.i--;
		}
		else if(board[enemy.i-1][enemy.j] == CELL_WALL || board[enemy.i-1][enemy.j] == CELL_GHOST){
			
			findAnotherPath(enemy)
			move(enemy, CELL_GHOST)
		}
	}

		board[enemy.i][enemy.j] =CELL_GHOST;
		
	
}

function checkIfAround(enemy){
	if( (Math.abs(shape.i-enemy.i)<=2) && (Math.abs(shape.j-enemy.j)<=2) /*&& (Math.abs(shape.j-enemy.j)!=0)*/ )
	return true;
}

function insertToPressedKeys(x){
	
	if(x==MOVING_UP || x==MOVING_DOWN || x==MOVING_LEFT || x==MOVING_RIGHT){
		lastPressedKey[0] = x;
		
	
	}
	
	

}
function isChanged(a){
	if(lastPressedKey[0] != x){return true;}
	return false;
	
}
function isStucked(enemy){
	if((enemy.i == 0 && enemy.move ==MOVING_LEFT) || (enemy.i==9 && enemy.move ==MOVING_RIGHT) || (enemy.j==0 && enemy.move ==MOVING_UP) || (enemy.j==9 && enemy.move ==MOVING_DOWN))
		return true;
	else if( (enemy.move == MOVING_RIGHT) && ((board[enemy.i+1][enemy.j] == CELL_GHOST) || (board[enemy.i+1][enemy.j] == CELL_WALL)) )
		return true;
	else if( (enemy.move == MOVING_LEFT) && ((board[enemy.i-1][enemy.j] == CELL_GHOST) || (board[enemy.i-1][enemy.j] == CELL_WALL)) )
		return true;
	else if( (enemy.move == MOVING_UP) && ((board[enemy.i][enemy.j-1] == CELL_GHOST) || (board[enemy.i][enemy.j-1] == CELL_WALL)) )
		return true;
	else if( (enemy.move == MOVING_DOWN) && ((board[enemy.i][enemy.j+1] == CELL_GHOST) || (board[enemy.i][enemy.j+1] == CELL_WALL)) )
		return true; 
	else
		return false;
}

function findAnotherPath(enemy){ // remove the current move and find another one
		
		var arr;
		var m;
		var temp = enemy.move;
		//var anotherMove;
		if(enemy.move==MOVING_UP){arr=[2,3,4]}
		else if(enemy.move==MOVING_DOWN){arr=[1,3,4]}
		else if(enemy.move==MOVING_LEFT){arr= [1,2,4]}
		else{arr=[1,2,3]}

		m= arr[Math.floor(Math.random()*arr.length)];
		enemy.move=m;

		if(!isStucked(enemy)){
			
			return;
		
			
		}
		else
			enemy.move=temp;
		
			
			
		
		
}
function _died(){

		died.play();
		num_of_lives=num_of_lives-1;
		score = score-10;
		//board[shape.i][shape.j] = 3;
		var randomCell = findRandomEmptyCell(board)
		shape.i=randomCell[0];
		shape.j=randomCell[1];
		
		
		board[randomCell[0]][randomCell[1]] = CELL_PACMAN
		board[shape.i][shape.j] = CELL_EMPTY;

		//sleep for two seconds
		setTimeout(() => { console.log("World!"); }, 2000);
}

function sugarWasEaten(){
		//board[shape.i][shape.j]=2;
		score=score+50;
		delete sugar.i;
		delete sugar.j;
}

function checkIfGotKilled(pacman_move){
	if(pacman_move==MOVING_UP){
		if((firstEnemy.j==shape.j-1 && firstEnemy.i==shape.i) || (secondEnemy.j==shape.j-1 && secondEnemy.i==shape.i) || (thirdEnemy.j==shape.j-1 && thirdEnemy.i==shape.i) ||
			(fourthEnemy.j==shape.j-1 && fourthEnemy.i==shape.i) ){
			_died();
		}
		if((sugar.j==shape.j-1 && sugar.i==shape.i) && sugar.move == MOVING_DOWN)
			sugarWasEaten();
	}
	else if(pacman_move==MOVING_DOWN){
		if((firstEnemy.j==shape.j+1 && firstEnemy.i==shape.i) || (secondEnemy.j==shape.j+1 && secondEnemy.i==shape.i) || (thirdEnemy.j==shape.j+1 && thirdEnemy.i==shape.i) ||
			(fourthEnemy.j==shape.j+1 && fourthEnemy.i==shape.i) ){
			_died();
			
		}
		if((sugar.j==shape.j+1 && sugar.i==shape.i) && sugar.move == MOVING_UP)
		sugarWasEaten();
	}
	else if(pacman_move==MOVING_LEFT){
		if((firstEnemy.i==shape.i-1 && firstEnemy.j==shape.j) || (secondEnemy.i==shape.i-1 && secondEnemy.j==shape.j) || (thirdEnemy.i==shape.i-1 && thirdEnemy.j==shape.j) ||
			(fourthEnemy.i==shape.i-1 && fourthEnemy.j==shape.j) ){
			_died();
		}
		if((sugar.i==shape.i-1 && sugar.j==shape.j) && sugar.move==MOVING_RIGHT)
		sugarWasEaten();
	}
	else{	
		if((firstEnemy.i==shape.i+1 && firstEnemy.j==shape.j) || (secondEnemy.i==shape.i+1 && secondEnemy.j==shape.j) || (thirdEnemy.i==shape.i+1 && thirdEnemy.j==shape.j) ||
		(fourthEnemy.i==shape.i+1 && fourthEnemy.j==shape.j) ){
		_died();
		
		}
		if((sugar.i==shape.i+1 && sugar.j==shape.j) && sugar.move == MOVING_LEFT )
			sugarWasEaten();
	}
	

		
}
function move(enemy,cell_value){
		
	if(enemy.move==MOVING_UP){
		if(enemy.j>0 && board[enemy.i][enemy.j-1] !=CELL_WALL && board[enemy.i][enemy.j-1] != CELL_GHOST&& board[enemy.i][enemy.j-1] != CELL_SUGAR){
			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i][enemy.j -1];
			enemy.j--;
		}
		
	}
	if(enemy.move==MOVING_DOWN){
		if(enemy.j<9 && board[enemy.i][enemy.j+1] != CELL_WALL && board[enemy.i][enemy.j+1] != CELL_GHOST&& board[enemy.i][enemy.j+1] != CELL_SUGAR){
			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i][enemy.j + 1];
			enemy.j++;
		}
		
	}
	if(enemy.move==MOVING_LEFT){
		if (enemy.i > 0 && board[enemy.i - 1][enemy.j] != CELL_WALL && board[enemy.i - 1][enemy.j] != CELL_GHOST && board[enemy.i - 1][enemy.j] != CELL_SUGAR) {

			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i - 1][enemy.j];
			enemy.i--;
		}
		
	}
	if (enemy.move == MOVING_RIGHT) {
		if (enemy.i < 9 && board[enemy.i + 1][enemy.j] != CELL_WALL && board[enemy.i + 1][enemy.j] != CELL_GHOST && board[enemy.i + 1][enemy.j] != CELL_SUGAR) {

			board[enemy.i][enemy.j] = enemy.prev;
			enemy.prev = board[enemy.i + 1][enemy.j];
			enemy.i++;
		}
		
	}
	board[enemy.i][enemy.j]=cell_value;


}

function UpdatePosition() {

	if(gameIsOver){return}
	
	$(document).ready(board[shape.i][shape.j] = CELL_EMPTY)
	var x = GetKeyPressed();
	insertToPressedKeys(x);
	var alwaysMoveTo = lastPressedKey[0];

	
	if(Number.isInteger(alwaysMoveTo)){checkIfGotKilled(alwaysMoveTo);}
	
	

		if (Number.isInteger(sugar.i)) {
			if(!isStucked(sugar)){
				move(sugar, CELL_SUGAR)
	
			}
			else{
				findAnotherPath(sugar);
				move(sugar, CELL_SUGAR);
			}
		 }
		
		
		if(checkIfAround(firstEnemy)){
			goThroughThePacman(firstEnemy);
		}
		else{
			if(!isStucked(firstEnemy)){
				move(firstEnemy, CELL_GHOST);
			}
			else{
				findAnotherPath(firstEnemy);
				move(firstEnemy, CELL_GHOST);

			}
		}
		
	
	if(checkNumOfEnemies>=2){
		if(checkIfAround(secondEnemy)){
			goThroughThePacman(secondEnemy);
		}
		else{
			if(!isStucked(secondEnemy)){
				move(secondEnemy, CELL_GHOST);
			}
			else{
				findAnotherPath(secondEnemy);
				move(secondEnemy, CELL_GHOST);

			}
		}
	} 
	
	if(checkNumOfEnemies>=3){
		if(checkIfAround(thirdEnemy)){
			goThroughThePacman(thirdEnemy);
		}
		else{
			if(!isStucked(thirdEnemy)){
				move(thirdEnemy, CELL_GHOST);
			}
			else{
				findAnotherPath(thirdEnemy);
				move(thirdEnemy, CELL_GHOST);

			}
		}
	} 
	
	if(checkNumOfEnemies==4){
		if(checkIfAround(fourthEnemy)){
			goThroughThePacman(fourthEnemy);
		}
		else{
			if(!isStucked(fourthEnemy)){
				move(fourthEnemy, CELL_GHOST);
			}
			else{
				findAnotherPath(fourthEnemy);
				move(fourthEnemy, CELL_GHOST);

			}
		}
	} 
	
	

	if (alwaysMoveTo == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != CELL_WALL) {
			shape.j--;
		}
	}
	if (alwaysMoveTo == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != CELL_WALL) {
			shape.j++;
		}
	}
	if (alwaysMoveTo == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != CELL_WALL) {
			shape.i--;
		}
	}
	if (alwaysMoveTo == 4) {
		if (shape.i < 9 && board[shape.i + 1][shape.j] != CELL_WALL) {
			shape.i++;
		}
	}
	if (isFoodCell(board[shape.i][shape.j])) {
		eatingPointsSound.play();
		readySound.stop();
		
		//score++;
		score = score + board[shape.i][shape.j]
	}

	if(board[shape.i][shape.j] == CELL_CLOCK){
		max_time = Number(max_time) + 30
	}

	if(board[shape.i][shape.j] == CELL_RANDOM){
		let min = -30
		let max = 50
		let range = max-min
		let bonus = Math.round(Math.random(range)) + min
		score = score + bonus
	}

	if( (shape.i == firstEnemy.i && shape.j == firstEnemy.j) || (shape.i == secondEnemy.i && shape.j == secondEnemy.j)
	|| (shape.i == thirdEnemy.i && shape.j == thirdEnemy.j) || (shape.i == fourthEnemy.i && shape.j == fourthEnemy.j) ){

		_died();

	}

	if(shape.i==sugar.i && shape.j==sugar.j){
		sugarWasEaten();
	}

	board[shape.i][shape.j] = CELL_PACMAN;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	
	if(!gameIsOver) {
		if (num_of_lives <= 0) { //lose
			endGame("Loser!")
		} 
		else if(time_elapsed >= max_time && score < 100) { //half win
			endGame("You are better than " + score.toString() + " points!")
		}
		else if(time_elapsed >= max_time && score >= 100) { //win
			endGame("Winner!!!")
		}
		
	}
	if(!gameIsOver) {
		Draw();
	}
}

function endGame(msg){
	gameIsOver = true
	window.clearInterval(interval);
	$("#gameover_modal").modal('show')
	$("#gameover_text").text(msg)
	stopMusic()
}

//calculates amount of each food type
var foodsList = []
function initFoodAmount() {
	let food_5_amount = Math.round(num_of_pickups * 0.6)
	let food_15_amount = Math.round(num_of_pickups * 0.3)
	let food_25_amount = Math.round(num_of_pickups * 0.1)

	while(food_5_amount > 0){
		foodsList.push(CELL_FOOD_5)
		food_5_amount--
	}
	while(food_15_amount > 0){
		foodsList.push(CELL_FOOD_15)
		food_15_amount--
	}
	while(food_25_amount > 0){
		foodsList.push(CELL_FOOD_25)
		food_25_amount--
	}

	foodsList = shuffle(foodsList)
}

//returns a food type from what is remaining
function getFoodType() {
	if(foodsList.length > 0) {
		return foodsList.pop()
	}
	return CELL_EMPTY
}

function isFoodCell(cell_value) {
	return (cell_value == CELL_FOOD_5 || cell_value == CELL_FOOD_15 || cell_value == CELL_FOOD_25 || cell_value ==CELL_SUGAR)
}

//taken from 
//https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function isWallLocation(i, j) {
	let matrix = 
	[
		[0, 0, 0, 0, 0, 1, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 1, 0, 1, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 1, 0 ],// , 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],

		// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0  , 0, 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0  , 0, 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0  , 0, 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0  , 0, 0, 0, 0, 0],
		// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0  , 0, 0, 0, 0, 0],
	]
	return matrix[i][j] == 1
}

