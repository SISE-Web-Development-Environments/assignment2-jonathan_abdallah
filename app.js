//might help with ghosts:
//https://www.masswerk.at/JavaPac/pacman-howto.html#sect3_5


var context;
var shape = new Object();
var firstEnemy=new Object() ;
var secondEnemy=new Object();
var thirdEnemy=new Object();
var fourthEnemy=new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;

//variables for the index that the enemy is going to
let prevP_firstEnemy=0;
let prevP_secondEnemy=0;
let prevP_thirdEnemy=0;
let prevP_fourthEnemy=0;

// sounds
var eatingPointsSound ;
var readySound;
var died;

let enemiesMovementOptions = [1,2,3,4] ;
let checkNumOfEnemies = 0; //tells us which enemy are we talking about
let lastPressedKey;
let enemy1_currentMove;
let enemy2_currentMove;
let enemy3_currentMove;
let enemy4_currentMove;

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
let enemiesNum = $("#settings_enemies").val();

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

	gameIsOver = false
	eatingPointsSound = new sound("sounds\\eating.mp3");
	readySound = new sound("sounds\\ready.mp3");
	died = new sound("sounds\\die.mp3");
	//readySound.play(); disabled for now as we need a looping background music instead
	checkNumOfEnemies = 0;

	//lengthOfPressedKeys=0;
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
	
	/*firstEnemy.movement=enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	secondEnemy.movement = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	thirdEnemy.movement = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	fourthEnemy.movement = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];*/

	enemy1_currentMove= enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy2_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy3_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy4_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];

	//if(count>=1){

	//window.clearInterval(interval);
	//window.alert(interval)
	//}
	for (var i = 0; i < board_width; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < board_height; j++) {
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

				/*else if(num_of_enemies != 0){
					if( (i==0 && j==0) || (i==0 && j==9) || (i==9 && j==0) || (i==9 && j==9) ){
						
						checkNumOfEnemies++;
						putAnEnemy(i, j);

					}
				}*/
					

				else {
					board[i][j] = CELL_EMPTY;
				}
				cnt--;
			}
		}
	}

	//place enemies
	while (num_of_enemies != 0) {
		
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
		num_of_enemies--;
		return;
	}
	if(checkNumOfEnemies==2){
		board[i][j]=3;
		secondEnemy.i=i;
		secondEnemy.j=j;
		num_of_enemies--;
		return;
	}
	if(checkNumOfEnemies==3){
		board[i][j]=3;
		thirdEnemy.i=i;
		thirdEnemy.j=j;
		num_of_enemies--;
		return;
	}
	if(checkNumOfEnemies==4){
		board[i][j]=3;
		fourthEnemy.i=i;
		fourthEnemy.j=j;
		num_of_enemies--;
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

	if (pressedKey == 1) 
		drawDirection(1.2,1.8,15,2,x,y);
		
	if (pressedKey == 2) 
		drawDirection(0.25,0.65,15,-4,x,y);
		
	if (pressedKey == 3) 
		drawDirection(0.75,1.25,5,-15,x,y);
	
	if (pressedKey == 4) 
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
			board[enemy.i][enemy.j] = prev;
			prev = board[enemy.i][enemy.j+1];
			enemy.j++;	
			}
			else if(board[enemy.i][enemy.j+1] ==CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){ //move right
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i+1][enemy.j];
				enemy.i++;
			}
			//console.log("go")
			//	console.log(prev)
			//	console.log(prevP_firstEnemy)
		}
	
		
		else if(enemy.i>shape.i){ //above + right

			if(board[enemy.i][enemy.j+1] !=CELL_WALL && board[enemy.i][enemy.j+1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j+1];
				enemy.j++;	
				}
				else if(board[enemy.i][enemy.j+1] ==CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){ //move left
					board[enemy.i][enemy.j] = prev;
					prev = board[enemy.i-1][enemy.j];
					enemy.i--;
				}
		}
		else /*if(enemy.i==shape.i)*/{ //above
			if(board[enemy.i][enemy.j+1] != CELL_WALL && board[enemy.i][enemy.j+1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j+1];
				enemy.j++;
			}
			else if(board[enemy.i][enemy.j+1] == CELL_WALL || board[enemy.i][enemy.j+1] ==CELL_GHOST){//move left
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i-1][enemy.j];
				enemy.i--;
			}
		}
		
	}

	//under the shape *********
	else if( (enemy.j>shape.j && enemy.i < shape.i) || (enemy.j>shape.j && enemy.i > shape.i) || (enemy.j>shape.j && enemy.i == shape.i) ){
		if(enemy.i<shape.i){ //under+left
			
			if(board[enemy.i][enemy.j-1] !=CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
			board[enemy.i][enemy.j] = prev;
			prev = board[enemy.i][enemy.j-1];
			enemy.j--;	
			}
			else if(board[enemy.i][enemy.j-1] ==CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){ //move right
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i+1][enemy.j];
				enemy.i++;
			}
		}
		else if(enemy.i>shape.i){ //under+right
			
			if(board[enemy.i][enemy.j-1] !=CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j-1];
				enemy.j--;	
				}
				else if(board[enemy.i][enemy.j-1] ==CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){ //move right
					board[enemy.i][enemy.j] = prev;
					prev = board[enemy.i+1][enemy.j];
					enemy.i++;
				}
		}
		else{ //under
			if(board[enemy.i][enemy.j-1] != CELL_WALL && board[enemy.i][enemy.j-1] !=CELL_GHOST){ //go eat him
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j-1];
				enemy.j--;
			}
			else if(board[enemy.i][enemy.j-1] == CELL_WALL || board[enemy.i][enemy.j-1] ==CELL_GHOST){//move left
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i+1][enemy.j];
				enemy.i++;
			}
		}
	}

	//left ahead  the shape ****************
	else if(enemy.i<shape.i && enemy.j == shape.j){
		if(board[enemy.i+1][enemy.j] != CELL_WALL && board[enemy.i+1][enemy.j] != CELL_GHOST){
		board[enemy.i][enemy.j] = prev;
		prev = board[enemy.i+1][enemy.j];
		enemy.i++;
		}
		else if(board[enemy.i+1][enemy.j] == CELL_WALL || board[enemy.i+1][enemy.j] == CELL_GHOST){
			board[enemy.i][enemy.j]=prev;
			prev=board[enemy.i][enemy.j-1];
			enemy.j--;
		}
	}

	//right ahead the shape ***********
	else{
		if(board[enemy.i-1][enemy.j] != CELL_WALL && board[enemy.i-1][enemy.j] != CELL_GHOST){
			board[enemy.i][enemy.j] = prev;
			prev = board[enemy.i-1][enemy.j];
			enemy.i--;
		}
		else if(board[enemy.i-1][enemy.j] == CELL_WALL || board[enemy.i-1][enemy.j] == CELL_GHOST){
			board[enemy.i][enemy.j]=prev;
			prev = board[enemy.i][enemy.j+1];
			enemy.j++;
		}
	}

		board[enemy.i][enemy.j] =3;
		if(enemy==firstEnemy)
				prevP_firstEnemy=prev;
		else if(enemy==secondEnemy)
				prevP_secondEnemy=prev;
		else if(enemy==thirdEnemy)
				prevP_thirdEnemy=prev;
		else
				prevP_fourthEnemy=prev;
	
}

function checkIfAround(enemy){
	if( (Math.abs(shape.i-enemy.i)<=2) && (Math.abs(shape.j-enemy.j)<=2) /*&& (Math.abs(shape.j-enemy.j)!=0)*/ )
	return true;
}

function insertToPressedKeys(x){
	//console.log("insert")
	//console.log(x);
	if(x==1 || x==2 || x==3 || x==4){
		lastPressedKey[0] = x;
		
	//lengthOfPressedKeys++;
	}
	
	//console.log(lastPressedKey[0]);
	//console.log(lengthOfPressedKeys);
	//console.log("asasa")
	//console.log(lastPressedKey[0])

}
function isChanged(a){
	if(lastPressedKey[0] != x){return true;}
	return false;
	
}
function isStucked(enemy,move){
	if((enemy.i == 0 && move ==3) || (enemy.i==9 && move ==4) || (enemy.j==0 && move ==1) || (enemy.j==9 && move ==2))
		return true;
	else if( (move == 4) && ((board[enemy.i+1][enemy.j] == CELL_GHOST) || (board[enemy.i+1][enemy.j] == CELL_WALL)) )
		return true;
	else if( (move == 3) && ((board[enemy.i-1][enemy.j] == CELL_GHOST) || (board[enemy.i-1][enemy.j] == CELL_WALL)) )
		return true;
	else if( (move == 1) && ((board[enemy.i][enemy.j-1] == CELL_GHOST) || (board[enemy.i][enemy.j-1] == CELL_WALL)) )
		return true;
	else if( (move == 2) && ((board[enemy.i][enemy.j+1] == CELL_GHOST) || (board[enemy.i][enemy.j+1] == CELL_WALL)) )
		return true; 
	else
		return false;
}

function findAnotherPath(enemy,move){ // remove the current move and find another one
		
		var arr;
		var m;
		//var anotherMove;
		if(move==1){arr=[2,3,4]}
		else if(move==2){arr=[1,3,4]}
		else if(move==3){arr= [1,2,4]}
		else{arr=[1,2,3]}

		m= arr[Math.floor(Math.random()*arr.length)];
		if(!isStucked(enemy,m)){

			if(enemy==firstEnemy)
				enemy1_currentMove=m;
			else if(enemy==secondEnemy)
					enemy2_currentMove=m;
			else if(enemy==thirdEnemy)
					enemy3_currentMove=m;
			else
					enemy4_currentMove=m;
			
		}
		
			
			
		
		/*if(  (board[enemy.i][enemy.j-1] == CELL_PACMAN) || (board[enemy.i][enemy.j-1] == CELL_FOOD_5) || (board[enemy.i][enemy.j-1] == CELL_FOOD_15) 
				|| (board[enemy.i][enemy.j-1] == CELL_FOOD_25) || (board[enemy.i][enemy.j-1] == CELL_EMPTY)  )
				return [enemy.i,enemy.j-1,1];

		else if((board[enemy.i][enemy.j+1] == CELL_PACMAN) || (board[enemy.i][enemy.j+1] == CELL_FOOD_5) || (board[enemy.i][enemy.j+1] == CELL_FOOD_15) 
				|| (board[enemy.i][enemy.j+1] == CELL_FOOD_25) || (board[enemy.i][enemy.j+1] == CELL_EMPTY))
				return [enemy.i,enemy.j+1,2];

		else if((board[enemy.i-1][enemy.j] == CELL_PACMAN) || (board[enemy.i-1][enemy.j] == CELL_FOOD_5) || (board[enemy.i-1][enemy.j] == CELL_FOOD_15) 
				|| (board[enemy.i-1][enemy.j] == CELL_FOOD_25) || (board[enemy.i-1][enemy.j] == CELL_EMPTY))
				return [enemy.i-1,enemy.j,3];

		else
			return [enemy.i+1,enemy.j,4];*/
		//commit
}

function UpdatePosition() {

	if(gameIsOver){return}
	//console.log("prevP_firstEnemy");
	//console.log(prevP_firstEnemy);
	board[shape.i][shape.j] = CELL_EMPTY;
	var x = GetKeyPressed();
	insertToPressedKeys(x);
	var alwaysMoveTo = lastPressedKey[0];

	//if(isChanged(lastPressedKey)){

	//}

	
	//var pressedKey =x;

	// start of enemies position update

	/*enemy1_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy2_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy3_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	enemy4_currentMove = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];*/


	//if(!isStucked(firstEnemy,alwaysMoveTo)){
		if(checkIfAround(firstEnemy)){
			goThroughThePacman(firstEnemy,prevP_firstEnemy);
		}
		else{
			if(!isStucked(firstEnemy,enemy1_currentMove)){
				move(firstEnemy,enemy1_currentMove,prevP_firstEnemy);
			}
			else{
				findAnotherPath(firstEnemy,enemy1_currentMove);
				move(firstEnemy,enemy1_currentMove,prevP_firstEnemy);

			}
		}
		/*else{
			if(alwaysMoveTo==1){
				move(firstEnemy,1,prevP_firstEnemy);
			}
			else if(alwaysMoveTo==2){
				move(firstEnemy,2,prevP_firstEnemy);
			}
			else if(alwaysMoveTo==3){
				move(firstEnemy,3,prevP_firstEnemy);
			}
			else if(alwaysMoveTo==4){
				move(firstEnemy,4,prevP_firstEnemy);
			}

		}*/
//	}
/*	else{

		var newPosition = findAnotherPath(firstEnemy);
		board[firstEnemy.i][firstEnemy.j]=prevP_firstEnemy;
		firstEnemy.i=newPosition[0]-1;
		firstEnemy.j=newPosition[1]-1;
		
		move(firstEnemy,newPosition[2],prevP_firstEnemy);
	}*/
	
	if(checkNumOfEnemies>=2){
		if(checkIfAround(secondEnemy)){
			goThroughThePacman(secondEnemy,prevP_secondEnemy);
		}
		else{
			if(!isStucked(secondEnemy,enemy2_currentMove)){
				move(secondEnemy,enemy2_currentMove,prevP_secondEnemy);
			}
			else{
				findAnotherPath(secondEnemy,enemy2_currentMove);
				move(secondEnemy,enemy2_currentMove,prevP_secondEnemy);

			}
		}
	} 
	
	if(checkNumOfEnemies>=3){
		if(checkIfAround(thirdEnemy)){
			goThroughThePacman(thirdEnemy,prevP_thirdEnemy);
		}
		else{
			if(!isStucked(thirdEnemy,enemy3_currentMove)){
				move(thirdEnemy,enemy3_currentMove,prevP_thirdEnemy);
			}
			else{
				findAnotherPath(thirdEnemy,enemy3_currentMove);
				move(thirdEnemy,enemy3_currentMove,prevP_thirdEnemy);

			}
		}
	} 
	
	if(checkNumOfEnemies==4){
		if(checkIfAround(fourthEnemy)){
			goThroughThePacman(fourthEnemy,prevP_fourthEnemy);
		}
		else{
			if(!isStucked(fourthEnemy,enemy4_currentMove)){
				move(fourthEnemy,enemy4_currentMove,prevP_fourthEnemy);
			}
			else{
				findAnotherPath(fourthEnemy,enemy4_currentMove);
				move(fourthEnemy,enemy4_currentMove,prevP_fourthEnemy);

			}
		}
	} 
	
	/*console.log("absolute value")
	console.log(firstEnemy.i-shape.i)
	console.log(Math.abs(firstEnemy.i-shape.i))*/

	//for the first enemy (there is always first enemy no need to check if it is exist)
	//move(firstEnemy,enemy1,prevP_firstEnemy);

	// for the second enemy
	//if (checkNumOfEnemies >= 2) {move(secondEnemy,enemy2,prevP_secondEnemy);}

	//for the third enemy 
	//if (checkNumOfEnemies >= 3) {move(thirdEnemy,enemy3,prevP_thirdEnemy);}

	//for the fourth enemy
	//if (checkNumOfEnemies == 4) {move(fourthEnemy,enemy4,prevP_fourthEnemy);}

	function move(enemy,move,prev){
		
		//let prev = prev;
		if(move==1){
			if(enemy.j>0 && board[enemy.i][enemy.j-1] !=4 && board[enemy.i][enemy.j-1] != 3){
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j -1];
				enemy.j--;
			//	console.log("move")
				//console.log(prev)
				//console.log(prevP_firstEnemy)
			}
			else{
				if(enemy.j==0){
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i-1][enemy.j];
				enemy.i--;
				}
			}
		}
		if(move==2){
			if(enemy.j<9 && board[enemy.i][enemy.j+1] != 4 && board[enemy.i][enemy.j+1] != 3){
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i][enemy.j + 1];
				enemy.j++;
			}
			else{
				if(enemy.j<9){
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i+1][enemy.j];
				enemy.i++;
				}
			}
		}
		if(move==3){
			if (enemy.i > 0 && board[enemy.i - 1][enemy.j] != 4 && board[enemy.i - 1][enemy.j] != 3) {

				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i - 1][enemy.j];
				enemy.i--;
			}
			else{
				if(enemy.i > 0){
					board[enemy.i][enemy.j] = prev;
					prev = board[enemy.i][enemy.j-1];
					enemy.j--;
				}
			}
		}
		if (move == 4) {
			if (enemy.i < 9 && board[enemy.i + 1][enemy.j] != CELL_WALL && board[enemy.i + 1][enemy.j] != CELL_GHOST) {
	
				board[enemy.i][enemy.j] = prev;
				prev = board[enemy.i + 1][enemy.j];
				enemy.i++;
			}
			else{
				if(enemy.i < 9){
					board[enemy.i][enemy.j] = prev;
					prev = board[enemy.i][enemy.j+1];
					enemy.j++;
				}
			}
		}
		board[enemy.i][enemy.j]=3;

		if(enemy==firstEnemy)
			prevP_firstEnemy=prev;
		else if(enemy==secondEnemy)
			prevP_secondEnemy=prev;
		else if(enemy==thirdEnemy)
			prevP_thirdEnemy=prev;
		else
			prevP_fourthEnemy=prev;
	}

	///////// end of enemies position update




	
	//pacman position update

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

		died.play();
		num_of_lives--;
		score = score-10;
		board[shape.i][shape.j] = 3;
		var randomCell = findRandomEmptyCell(board)
		shape.i=randomCell[0];
		shape.j=randomCell[1];
		
		
		board[randomCell[0]][randomCell[1]] = CELL_PACMAN

		//sleep for two seconds
		setTimeout(() => { console.log("World!"); }, 2000);

	}

	board[shape.i][shape.j] = CELL_PACMAN;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	
	if(!gameIsOver) {
		if (num_of_lives == 0) { //lose
			endGame("Loser!")
		} 
		else if(time_elapsed >= max_time && score < 100) { //half win
			endGame("You are better than " + score.toString() + " points!")
		}
		else if(time_elapsed >= max_time && score >= 100) { //win
			endGame("Winner!!!")
		}
		//else if(score==num_of_pickups)
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
	return (cell_value == CELL_FOOD_5 || cell_value == CELL_FOOD_15 || cell_value == CELL_FOOD_25)
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
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],// , 0, 0, 0, 0, 0],
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

