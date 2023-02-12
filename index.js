/* global sessionStorage*/

// HTML jQuery Objects
let board = document.querySelector('#board');
let scoreElement = document.querySelector('#score');
let highScoreElement = document.querySelector('#highScore');

// game variables
let snake = {};
let apple;
let score;

// interval variable required for stopping the update function when the game ends
let updateInterval;

// Constant Variables
let SQUARE_SIZE = 4;
let ROWS = COLUMNS = 100/SQUARE_SIZE;
let KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

let xDown = null;                                                        
let yDown = null;    


// turn on keyboard inputs
document.querySelector('body').addEventListener('keydown', setNextDirection);
document.addEventListener('touchstart', handleTouchStart);        
document.addEventListener('touchmove', handleTouchMove);

// start the game
init();
alert("Use your keyboard or swipe to control the snake.")

function init() {
  // initialize the snake's body and head
  snake.body = [];
  snake.head = makeSnakeSquare(10, 10)
  snake.head.setAttribute('id', 'snake-head');
  
  // initialize the first apple
  apple = makeApple();
  
  // set score to 0
  scoreElement.innerHTML = "Score: 0";
  score = 0;
  calculateAndDisplayHighScore();
  
  // start update interval
  updateInterval = setInterval(update, 100);
}


/* 
 * On each update tick update each bubble's position and check for
 * collisions with the walls.
 */
function update() {
  moveSnake();
  
  if (hasCollidedWithApple()) {
    handleAppleCollision();
  }
  
  if (hasCollidedWithSnake() || hasHitWall()) {
    endGame();
  }
}

function moveSnake() {
  // starting at the tail, each snakeSquare moves to the (row, column) position
  // of the snakeSquare that comes before it. The head is moved separately
  for (let i = snake.body.length - 1; i >= 1; i--) {
    let snakeSquare = snake.body[i];
    let nextSnakeSquare = snake.body[i - 1];

    snakeSquare.direction = nextSnakeSquare.direction;

    repositionSquare(snakeSquare, nextSnakeSquare.row, nextSnakeSquare.column);
  }
  
  /* snake.head.nextDirection is set using keyboard input and only changes if the
  next direction is perpendicular to snake.head.direction. This prevents the 
  snake from turning back on itself if multiple commands are issued before the
  next udpate.
  
  snake.head.direction is then only set once at the moment the snake is prepared
  to move forward
  */
  snake.head.direction = snake.head.nextDirection;
  if (snake.head.direction === "left") { snake.head.column--; }
  else if (snake.head.direction === "right") { snake.head.column++; }
  else if (snake.head.direction === "up") { snake.head.row--; }
  else if (snake.head.direction === "down") { snake.head.row++; }
  
  repositionSquare(snake.head, snake.head.row, snake.head.column);
}

function hasCollidedWithApple() {
  return snake.head.row === apple.row && snake.head.column === apple.column;
}

function handleAppleCollision() {
  // increase the score and update the score DOM element
  score++;
  scoreElement.innerHTML = "Score: " + score;
  
  // Remove existing Apple and create a new one
  apple.remove();
  makeApple();
  
  // calculate the location of the next snakeSquare based on the current
  // position and direction of the tail, then create the next snakeSquare
  let row = snake.tail.row;
  let column = snake.tail.column;
  if (snake.tail.direction === "left") { column++; }
  else if (snake.tail.direction === "right") { column--; }
  else if (snake.tail.direction === "up") { row++; }
  else if (snake.tail.direction === "down") { row--; }
  makeSnakeSquare(row, column);
}

function hasCollidedWithSnake() {
  for (let i = 1; i < snake.body.length; i++) {
    if (snake.head.row === snake.body[i].row && snake.head.column === snake.body[i].column) {
      return true;
    }
  }
}

function hasHitWall() {
  return snake.head.row > ROWS || snake.head.row < 1 || snake.head.column > COLUMNS || snake.head.column < 1;
}

function endGame() {
  // stop update function from running
  clearInterval(updateInterval);

  // clear board of all elements
  removeAllChildElements(board);
  
  calculateAndDisplayHighScore();
  
  // restart the game after 500 ms
  setTimeout(function() { init(); }, 500);
}


function removeAllChildElements(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/* Create an HTML element for a snakeSquare using jQuery. Then, given a row and
 * column on the board, position it on the screen. Finally, add the new 
 * snakeSquare to the snake.body Array and set a new tail.
 */
function makeSnakeSquare(row, column) {
  // make the snakeSquare jQuery Object and append it to the board
  let snakeSquare = document.createElement('div');
  snakeSquare.setAttribute('class', 'snakeSquare');
  board.appendChild(snakeSquare);

  // set the position of the snake on the screen
  repositionSquare(snakeSquare, row, column);
  
  // add snakeSquare to the end of the body Array and set it as the new tail
  snake.body.push(snakeSquare);
  snake.tail = snakeSquare;
  
  return snakeSquare;
}

/* Given a gameSquare (which may be a snakeSquare or the apple), update that
 * game Square's row and column properties and then position the gameSquare on the
 * screen. 
 */
function repositionSquare(square, row, column) {  
  // update the row and column properties on the square Object
  square.row = row;
  square.column = column;

  // position the square on the screen according to the row and column
  const leftOffset = (column-1) * SQUARE_SIZE + "%";
  const topOffset = (row-1) * SQUARE_SIZE + "%";
  square.style.left = leftOffset;
  square.style.top = topOffset;
}

/* Create an HTML element for the apple using jQuery. Then find a random 
 * position on the board that is not occupied and position the apple there.
 */
function makeApple() {
  // make the apple jQuery Object and append it to the board
  apple = document.createElement('div')
  apple.setAttribute('id', 'apple')
  board.appendChild(apple);

  // get a random available position on the board and position the apple
  let randomPosition = getRandomAvailablePosition();
  repositionSquare(apple, randomPosition.row, randomPosition.column);

  return apple;
}

/* Returns a (row,column) Object that is not occupied by another game component 
 */
function getRandomAvailablePosition() {
  let spaceIsAvailable;
  let randomPosition = {};
  
  /* Generate random positions until one is found that doesn't overlap with the snake */
  while (!spaceIsAvailable) {
    randomPosition.column = Math.ceil(Math.random() * COLUMNS);
    randomPosition.row = Math.ceil(Math.random() * ROWS);
    spaceIsAvailable = true;
    
    for (let i = 0; i < snake.body.length; i++) {
      let snakeSquare = snake.body[i];
      if (snakeSquare.row === randomPosition.row && snakeSquare.column === randomPosition.column) {
        spaceIsAvailable = false;
      }
    }
  }
  
  return randomPosition;
}

/* Triggered when keybord input is detected. Sets the snake head's nextDirection
 * property when an arrow key is pressed. Only perpendicular movement is allowed
 */
function setNextDirection(event) {
  let keyPressed = event.which;

  /* only set the next direction if it is perpendicular to the current direction */
  if (snake.head.direction !== "left" && snake.head.direction !== "right") {
    if (keyPressed === KEY.LEFT) { snake.head.nextDirection = "left"; }
    if (keyPressed === KEY.RIGHT) { snake.head.nextDirection = "right"; }
  }
  
  if (snake.head.direction !== "up" && snake.head.direction !== "down") {
    if (keyPressed === KEY.UP) { snake.head.nextDirection = "up"; }
    if (keyPressed === KEY.DOWN) { snake.head.nextDirection = "down"; }
  }
}

function calculateAndDisplayHighScore() {
  // retrieve the high score from session storage if it exists, or set it to 0
  let highScore = sessionStorage.getItem("highScore") || 0;

  if (score > highScore) {
    sessionStorage.setItem("highScore", score);
    highScore = score;
    alert("New High Score!");
  }
  
  // update the highScoreElement to display the highScore
  highScoreElement.innerHTML = "High Score: " + highScore;
}



                                                    
/* Touch Controls */
function handleTouchStart(evt) {                               
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};                                                

function handleTouchMove(evt) {                             
    if ( ! xDown || ! yDown ) {
        return;
    }
    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    /* choose the most significant */
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
      if (snake.head.direction !== "left" && snake.head.direction !== "right") {
        snake.head.nextDirection = xDiff > 0 ? "left" : "right";
      }
    }
    else {
      if (snake.head.direction !== "up" && snake.head.direction !== "down") {
        snake.head.nextDirection = yDiff > 0 ? "up" : "down";
      }
    }
    
    /* reset values */
    xDown = null;
    yDown = null;                                             
};