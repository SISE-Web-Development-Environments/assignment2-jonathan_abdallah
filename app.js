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
var prevP_firstEnemy=0;
var prevP_secondtEnemy=0;
var prevP_thirdtEnemy=0;
var prevP_fourthEnemy=0;

// sounds
var eatingPointsSound ;
var readySound;

let enemiesMovementOptions = [1,2,3,4] ;
let checkNumOfEnemies =0;

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

//Pseudo Enums
CELL_EMPTY = 0
//CELL_FOOD = 1
CELL_PACMAN = 2 
CELL_GHOST = 3
CELL_WALL = 4

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
	gameIsOver = false
	eatingPointsSound = new sound("sounds\\eating.mp3");
	readySound = new sound("sounds\\ready.mp3");
	readySound.play();

	board = new Array();
	num_of_lives = 5;
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
			if (isWallLocation(i,j)
				// (i == 3 && j == 3) ||
				// (i == 3 && j == 4) ||
				// (i == 3 && j == 5) ||
				// (i == 6 && j == 1) ||
				// (i == 6 && j == 2)
			) {
				board[i][j] = CELL_WALL;
			} else {
				var randomNum = Math.random();
				if (randomNum <= (1.0 * food_remain) / cnt) {
					food_remain--;
					board[i][j] = getFoodType();
				} else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
					if(i!=0&&j!=0 /*|| i!=0&&j!=9 || i!=9&&j!=0 || i!=9&&j!=9*/ ){
						shape.i = i;
						shape.j = j;
						pacman_remain--;
						board[i][j] = CELL_PACMAN;
					}
				} else {
					board[i][j] = CELL_EMPTY;
				}
				cnt--;
			}
		}
	}

	while(num_of_enemies!=0){
		//else if(num_of_enemies !=0 ){
		var i_ind = Math.random();

		var j_ind=Math.random();
		
			
		if(i_ind<=0.5){i_ind=0;}
		else
			{i_ind=9;}
		if(j_ind<=0.5){j_ind=0;}
		else
			{j_ind=9;}

		if(board[i_ind][j_ind] !=3 ){
			//board[i_ind][j_ind] =3;
			//num_of_enemies--;
			checkNumOfEnemies++ ;
			//checkNumOfEnemies=true;
			putAnEnemy(i_ind,j_ind);
		}
	}

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
	var i = Math.floor(Math.random() * 9 + 1);
	var j = Math.floor(Math.random() * 9 + 1);
	while (board[i][j] != CELL_EMPTY) {
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

function changeDirectionAndDraw(x,y){
	
	var center =new Object();
	center.x=x*60+30;
	center.y=y*60+30;
	var pressedKey = GetKeyPressed();

	if(pressedKey==1){
		context.clearRect(center.x-30,center.y-30, 60,60);
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
	if(pressedKey==2){
		context.clearRect(center.x-30,center.y-30, 60,60);
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
	if(pressedKey==3){
		context.clearRect(center.x-30,center.y-30, 60,60);
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
	if(pressedKey==4){
		context.clearRect(center.x-30,center.y-30, 60,60);
		context.beginPath();
		context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
		context.lineTo(center.x, center.y);
		context.fillStyle = pac_color; //color
		context.fill();
		context.beginPath();
		context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
		context.fillStyle = "black"; //color
		context.fill();
	}

}


function Draw() {
	canvas.width = canvas.width; //clean board
	lblScore.value = score;
	lblTime.value = time_elapsed;
	lblLivesValue.value = num_of_lives
	//var x = GetKeyPressed();
	for (var i = 0; i < 10; i++) {
		for (var j = 0; j < 10; j++) {
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
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "blue"; //color
				context.fill();

			}
			else if (board[i][j] == CELL_WALL) {
				context.beginPath();
				context.rect(center.x - 30, center.y - 30, 60, 60);
				context.fillStyle = "grey"; //color
				context.fill();
			}
		}
	}
}

function UpdatePosition() {
	board[shape.i][shape.j] = CELL_EMPTY;
	var x = GetKeyPressed();


	//let lastKey = []
	//lastKey[0]=1;
	//lastKey[1] = x;

	// ******* Code for the enemies ********

	var enemy1 = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	var enemy2 = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	var enemy3 = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];
	var enemy4 = enemiesMovementOptions[Math.floor(Math.random()*enemiesMovementOptions.length)];

	//for the first enemy
	
		if(enemy1==1){
			if(firstEnemy.j>0 && board[firstEnemy.i][firstEnemy.j-1] != 4 && board[firstEnemy.i][firstEnemy.j-1] != 3){
				 
				board[firstEnemy.i][firstEnemy.j]=prevP_firstEnemy;
				prevP_firstEnemy = board[firstEnemy.i][firstEnemy.j-1];
				firstEnemy.j--;
				//board[firstEnemy.i][firstEnemy.j]=3;
				//board[firstEnemy.i][firstEnemy.j+1]=prevP_firstEnemy;*/
			}
				
		}
		if(enemy1==2){
			if(firstEnemy.j<9 && board[firstEnemy.i][firstEnemy.j+1] != 4&& board[firstEnemy.i][firstEnemy.j+1] != 3){
			

			    board[firstEnemy.i][firstEnemy.j]=prevP_firstEnemy ;
				prevP_firstEnemy = board[firstEnemy.i][firstEnemy.j+1];
				firstEnemy.j++;
				//board[firstEnemy.i][firstEnemy.j]=3;
				//board[firstEnemy.i][firstEnemy.j-1]=prevP_firstEnemy;
			}
		}
		if(enemy1==3){
			if(firstEnemy.i>0&&board[firstEnemy.i-1][firstEnemy.j] != 4&&board[firstEnemy.i-1][firstEnemy.j] != 3){

				board[firstEnemy.i][firstEnemy.j]=prevP_firstEnemy ;
				prevP_firstEnemy=board[firstEnemy.i-1][firstEnemy.j];
				firstEnemy.i--;
				//board[firstEnemy.i][firstEnemy.j]=3;
				//board[firstEnemy.i+1][firstEnemy.j] =prevP_firstEnemy;
			}		
		}
		if(enemy1==4){
			if(firstEnemy.i<9 && board[firstEnemy.i+1][firstEnemy.j] != 4&& board[firstEnemy.i+1][firstEnemy.j] != 3){

				board[firstEnemy.i][firstEnemy.j]=prevP_firstEnemy ;	
				prevP_firstEnemy = board[firstEnemy.i+1][firstEnemy.j];
				firstEnemy.i++;
				//board[firstEnemy.i][firstEnemy.j]=3;
				//board[firstEnemy.i-1][firstEnemy.j] = prevP_firstEnemy;
		}
		}
		board[firstEnemy.i][firstEnemy.j]=3;
		
   

	// for the second enemy
	if(checkNumOfEnemies>=2){
		if(enemy2==1){
			if(secondEnemy.j>0 && board[secondEnemy.i][secondEnemy.j-1] != 4&& board[secondEnemy.i][secondEnemy.j-1] != 3){

			board[secondEnemy.i][secondEnemy.j]=prevP_secondtEnemy;
			prevP_secondtEnemy = board[secondEnemy.i][secondEnemy.j-1];
			secondEnemy.j--;
			//board[secondEnemy.i][secondEnemy.j]=3;
			}
		}
		if(enemy2==2){
			if(secondEnemy.j<9 && board[secondEnemy.i][secondEnemy.j+1] != 4&& board[secondEnemy.i][secondEnemy.j+1] != 3){

			//prevP_secondtEnemy = board[secondEnemy.i][secondEnemy.j+1];
			board[secondEnemy.i][secondEnemy.j]=prevP_secondtEnemy;
			prevP_secondtEnemy = board[secondEnemy.i][secondEnemy.j+1] ;

			secondEnemy.j++;
			//board[secondEnemy.i][secondEnemy.j]=3;
			}
		}
		if(enemy2==3){
			if(secondEnemy.i>0&&board[secondEnemy.i-1][secondEnemy.j] != 4&&board[secondEnemy.i-1][secondEnemy.j] != 3){

			board[secondEnemy.i][secondEnemy.j]=prevP_secondtEnemy;
			prevP_secondtEnemy= board[secondEnemy.i-1][secondEnemy.j];
			secondEnemy.i--;
			//board[secondEnemy.i][secondEnemy.j]=3;
			}
		}
		if(enemy2==4){
			if(secondEnemy.i<9 && board[secondEnemy.i+1][secondEnemy.j] != 4&& board[secondEnemy.i+1][secondEnemy.j] != 3){

			board[secondEnemy.i][secondEnemy.j]=prevP_secondtEnemy;
			prevP_secondtEnemy = board[secondEnemy.i+1][secondEnemy.j] ;
			secondEnemy.i++;
			//board[secondEnemy.i][secondEnemy.j]=3;
			}
			
		}
		board[secondEnemy.i][secondEnemy.j]=3;
    }

	  //for the third enemy 
	if(checkNumOfEnemies>=3){
		if(enemy3==1){
			if(thirdEnemy.j>0 && board[thirdEnemy.i][thirdEnemy.j-1] != 4&& board[thirdEnemy.i][thirdEnemy.j-1] != 3){
			board[thirdEnemy.i][thirdEnemy.j]=prevP_thirdtEnemy;
			prevP_thirdtEnemy= board[thirdEnemy.i][thirdEnemy.j-1];
			thirdEnemy.j--;
			}
			
		}
		if(enemy3==2){
			if(thirdEnemy.j<9 && board[thirdEnemy.i][thirdEnemy.j+1] != 4 && board[thirdEnemy.i][thirdEnemy.j+1] != 3){
			board[thirdEnemy.i][thirdEnemy.j]=prevP_thirdtEnemy;
			prevP_thirdtEnemy = board[thirdEnemy.i][thirdEnemy.j+1];
			thirdEnemy.j++;
			}
		}
		if(enemy3==3){
			if(thirdEnemy.i>0&&board[thirdEnemy.i-1][thirdEnemy.j] != 4&&board[thirdEnemy.i-1][thirdEnemy.j] != 3){
			board[thirdEnemy.i][thirdEnemy.j]=prevP_thirdtEnemy;
			prevP_thirdtEnemy = board[thirdEnemy.i-1][thirdEnemy.j];
			thirdEnemy.i--;
			}
		}
		if(enemy3==4){
			if(thirdEnemy.i<9 && board[thirdEnemy.i+1][thirdEnemy.j] != 4&& board[thirdEnemy.i+1][thirdEnemy.j] != 3){
			board[thirdEnemy.i][thirdEnemy.j]=prevP_thirdtEnemy;
			prevP_thirdtEnemy = board[thirdEnemy.i+1][thirdEnemy.j];
			thirdEnemy.i++;
			}
		}
		board[thirdEnemy.i][thirdEnemy.j]=3;
    }

	//for the fourth enemy
	if(checkNumOfEnemies==4){
		if(enemy4==1){ 
			if(fourthEnemy.j>0 && board[fourthEnemy.i][fourthEnemy.j-1] != 4&& board[fourthEnemy.i][fourthEnemy.j-1] != 3){
			board[fourthEnemy.i][fourthEnemy.j] = prevP_fourthEnemy;
			prevP_fourthEnemy = board[fourthEnemy.i][fourthEnemy.j-1];
			fourthEnemy.j--;
			}
		}
		if(enemy4==2){
			if(fourthEnemy.j<9 && board[fourthEnemy.i][fourthEnemy.j+1] != 4&& board[fourthEnemy.i][fourthEnemy.j+1] != 3){
			board[fourthEnemy.i][fourthEnemy.j] = prevP_fourthEnemy;
			prevP_fourthEnemy = board[fourthEnemy.i][fourthEnemy.j+1];
			fourthEnemy.j++;
			}
		}
		if(enemy4==3){
			if(fourthEnemy.i>0&&board[fourthEnemy.i-1][fourthEnemy.j] != 4&&board[fourthEnemy.i-1][fourthEnemy.j] != 3){
			board[fourthEnemy.i][fourthEnemy.j] = prevP_fourthEnemy;
			prevP_fourthEnemy = board[fourthEnemy.i-1][fourthEnemy.j];
			fourthEnemy.i--;
			}
		}
		if(enemy4==4){
			if(fourthEnemy.i<9 && board[fourthEnemy.i+1][fourthEnemy.j] != 4&& board[fourthEnemy.i+1][fourthEnemy.j] != 3){
			board[fourthEnemy.i][fourthEnemy.j] = prevP_fourthEnemy;
			prevP_fourthEnemy = board[fourthEnemy.i+1][fourthEnemy.j];
			fourthEnemy.i++;
			}
			
		}
		board[fourthEnemy.i][fourthEnemy.j]=3;
	}

	// end Code of the enemies

	
	//var upd =true;
	//while(lastKey.length!=0){

	if (x == 1) {
		if (shape.j > 0 && board[shape.i][shape.j - 1] != CELL_WALL) {
			shape.j--;
		}
	}
	if (x == 2) {
		if (shape.j < 9 && board[shape.i][shape.j + 1] != CELL_WALL) {
			shape.j++;
		}
	}
	if (x == 3) {
		if (shape.i > 0 && board[shape.i - 1][shape.j] != CELL_WALL) {
			shape.i--;
		}
	}
	if (x == 4) {
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
	board[shape.i][shape.j] = CELL_PACMAN;
	var currentTime = new Date();
	time_elapsed = (currentTime - start_time) / 1000;
	if (score >= 20 && time_elapsed <= 10) {
		pac_color = "green";
	}
	
	if(!gameIsOver) {
		if (num_of_lives == 0) { //lose
			gameIsOver = true
			window.clearInterval(interval);
			//window.alert("Loser!");
			$("#gameover_modal").modal('show')
			$("#gameover_text").text("Loser!")
		} 
		else if(time_elapsed >= max_time && score < 100) { //half win
			gameIsOver = true
			window.clearInterval(interval);
			//window.alert("You are better than " + score.toString() + " points!");
			$("#gameover_modal").modal('show')
			$("#gameover_text").text("You are better than " + score.toString() + " points!")
		}
		else if(time_elapsed >= max_time && score >= 100) { //win
			gameIsOver = true
			window.clearInterval(interval);
			//window.alert("Winner!!!");
			$("#gameover_modal").modal('show')
			$("#gameover_text").text("Winner!!!")
		}
	}
	if(!gameIsOver) {
		Draw();
	}
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
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	]
	return matrix[i][j] == 1
}