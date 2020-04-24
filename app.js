var context;
var shape = new Object();
var board;
var score;
var pac_color;
var start_time;
var time_elapsed;
var interval;

// sounds
var eatingPointsSound ;
var readySound;


var up_key = 38;
var down_key = 40;
var left_key = 37;
var right_key = 39;
//these values will get their values from the Apply Settings button
var pickup_5_color;
var pickup_15_color;
var pickup_25_color;
var max_time;
var num_of_pickups=$("#settings_pickups").val();
var food_5_remaining; //value is initialized in initFoodAmount()
var food_15_remaining; //value is initialized in initFoodAmount()
var food_25_remaining; //value is initialized in initFoodAmount()
var num_of_enemies;

//Psuedo Enums
CELL_EMPTY = 0
//CELL_FOOD = 1
CELL_PACMAN = 2 
CELL_GHOST = 3
CELL_WALL = 4

CELL_FOOD_5 = 5
CELL_FOOD_15 = 6
CELL_FOOD_25 = 7


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

function Start() {
	eatingPointsSound = new sound("eating.mp3");
	readySound = new sound("ready.mp3");
	readySound.play();

	board = new Array();
	score = 0;
	pac_color = "#ffff00";
	var cnt = 100;
	var food_remain = num_of_pickups;
	initFoodAmount()
	var pacman_remain = 1;
	start_time = new Date();
	for (var i = 0; i < 10; i++) {
		board[i] = new Array();
		//put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
		for (var j = 0; j < 10; j++) {
			if (
				(i == 3 && j == 3) ||
				(i == 3 && j == 4) ||
				(i == 3 && j == 5) ||
				(i == 6 && j == 1) ||
				(i == 6 && j == 2)
			) {
				board[i][j] = CELL_WALL;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = getFoodType();
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					shape.i = i;
					shape.j = j;
					pacman_remain--;
					board[i][j] = CELL_PACMAN;
				} else {
					board[i][j] = CELL_EMPTY;
				}
				cnt--;
			}
		}
	}

	let num_of_5_points = 0.6 * food_remain

	while (food_remain > 0) {
		var emptyCell = findRandomEmptyCell(board);
		board[emptyCell[0]][emptyCell[1]] = getFoodType();
		food_remain--;
	}
	keysDown = {};
	addEventListener("keydown",function(e) {keysDown[e.keyCode] = true;},false);
	addEventListener(
		"keyup",
		function(e) {
			keysDown[e.keyCode] = false;
		},
		false
	);
	interval = setInterval(UpdatePosition, 250);
}

function findRandomEmptyCell(board) {
	var i = Math.floor(Math.random() * 9 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != 0) {
		i = Math.floor(Math.random() * 9 + 1);
		j = Math.floor(Math.random() * 9 + 1);
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

function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = time_elapsed;
	var x = GetKeyPressed();
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
			var center = new Object();
			center.x = i * 60 + 30;
			center.y = j * 60 + 30;
			if (board[i][j] == 2) {
				
				context.beginPath();
				context.arc(center.x, center.y, 30, 0, 2 * Math.PI); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
				
				/*if(x==1){
					//clearRect(center.x, center.y, 1.2*Math.PI,1.8*Math.PI)
					context.beginPath();
				context.arc(center.x, center.y, 30, 1.2*Math.PI,1.8*Math.PI,true); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 15, center.y +2, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
				}
				if(x==2){
					context.beginPath();
				context.arc(center.x, center.y, 30, 0.25*Math.PI,0.65*Math.PI,true); // half circle
				context.lineTo(center.x, center.y);
				context.fillStyle = pac_color; //color
				context.fill();
				context.beginPath();
				context.arc(center.x + 15, center.y -4, 5, 0, 2 * Math.PI); // circle
				context.fillStyle = "black"; //color
				context.fill();
				}
				if(x==3){
					context.beginPath();
					context.arc(center.x, center.y, 30, 0.75 * Math.PI, 1.25 * Math.PI,true); // half circle
					context.lineTo(center.x, center.y);
					context.fillStyle = pac_color; //color
					context.fill();
					context.beginPath();
					context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
					context.fillStyle = "black"; //color
					context.fill();
				}
				if(x==4){
					context.beginPath();
					context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
					context.lineTo(center.x, center.y);
					context.fillStyle = pac_color; //color
					context.fill();
					context.beginPath();
					context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
					context.fillStyle = "black"; //color
					context.fill();
				}*/
				
			} else if (board[i][j] == CELL_FOOD_5 || board[i][j] == CELL_FOOD_15 || board[i][j] == CELL_FOOD_25) {
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
			} else if (board[i][j] == CELL_WALL) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	board[shape.i][shape.j] = 0;
	var x = GetKeyPressed();
	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != 4) {
			shape.j--;
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != 4) {
			shape.j++;
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != 4) {
			shape.i--;
		}
	}
	if (x == 4) {
		if (shape.i < 9 && board[shape.i + 1][shape.j] != 4) {
			shape.i++;
		}
	}
	if (board[shape.i][shape.j] == 1) {
		eatingPointsSound.play();
		readySound.stop();
				
		score++;
	}
	board[shape.i][shape.j] = 2;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	if (score == 50) {
		window.clearInterval(interval);
		window.alert("Game completed");
	} else {
		Draw();
	}
}

//calculates amount of each food type
function initFoodAmount() {
	food_5_remaining = Math.round(num_of_pickups * 0.6)
	food_15_remaining = Math.round(num_of_pickups * 0.3)
	food_25_remaining = Math.round(num_of_pickups * 0.1)
	//let diff = num_of_pickups - (food_5_remaining+ food_15_remaining + food_25_remaining)
	//food_5_remaining = food_5_remaining + diff
}

//returns a food type from what is remaining
function getFoodType() {
	if(food_5_remaining > 0) {
		food_5_remaining = food_5_remaining - 1
		return CELL_FOOD_5
	}
	if(food_15_remaining > 0) {
		food_15_remaining = food_15_remaining - 1
		return CELL_FOOD_15
	}
	if(food_25_remaining > 0) {
		food_25_remaining = food_25_remaining - 1
		return CELL_FOOD_25
	}
	return CELL_EMPTY
}