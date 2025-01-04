import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  query as dbQuery,
  orderByChild,
  limitToFirst,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWDNw_bQp9kK3uNxNUZF2bTi1KlFjUl-o",
  authDomain: "snake-fun-moblie.firebaseapp.com",
  databaseURL:
    "https://snake-fun-moblie-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "snake-fun-moblie",
  storageBucket: "snake-fun-moblie.firebasestorage.app",
  messagingSenderId: "151201893432",
  appId: "1:151201893432:web:5bd01925199d3c0c086acd",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to save a player's score
function saveScore(playerName, score) {
  const scoresRef = ref(database, `scores/${playerName}`);

  onValue(scoresRef, (snapshot) => {
    const existingData = snapshot.val();

    if (!existingData || existingData.score < score) {
      set(scoresRef, {
        name: playerName,
        score: score,
      })
       
    }
  });
}

// Function to display top scores on the leaderboard
function displayTopScores() {
  const scoresRef = ref(database, "scores");
  const topScoresQuery = dbQuery(
    scoresRef,
    orderByChild("score"),
    limitToFirst(10)
  );

  onValue(topScoresQuery, (snapshot) => {
    const scores = [];
    snapshot.forEach((childSnapshot) => {
      scores.push(childSnapshot.val());
    });

    // Sort scores in descending order
    scores.sort((a, b) => b.score - a.score);

    // Display scores on the leaderboard
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = scores
      .map((player, index) => {
        return `<tr><td>${index + 1}</td><td>${player.name}</td><td>${
          player.score
        }</td></tr>`;
      })
      .join("");
  });
}

document.addEventListener("DOMContentLoaded", displayTopScores);

const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction-text");
const logo = document.getElementById("logo");
const score = document.getElementById("score");
const highScoretext = document.getElementById("highScore");

// Define game variables
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = generateFood();
let direction = "right";
let nextDirection = "right"; // New variable to prevent abrupt direction changes
let gameInterval;
let gameSpeedDelay = 330;
let gameStarted = false;
let highScore = 0;

// Draw game map, snake, food
function draw() {
  board.innerHTML = "";
  drawSnake();
  drawFood();
  updateScore();
}

// Draw Snake
function drawSnake() {
  if (gameStarted) {
    snake.forEach((segment) => {
      const snakeElement = createGameElement("div", "snake");
      setPosition(snakeElement, segment);
      board.appendChild(snakeElement);
    });
  }
}

// Create a snake or food cube/div
function createGameElement(tag, className) {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

// Set the position of snake or food
function setPosition(element, position) {
  element.style.gridColumn = position.x;
  element.style.gridRow = position.y;
}

// Draw food function
function drawFood() {
  if (gameStarted) {
    const foodElement = createGameElement("div", "food");
    setPosition(foodElement, food);
    board.appendChild(foodElement);
  }
}

// Generate food
function generateFood() {
  const x = Math.floor(Math.random() * gridSize) + 1;
  const y = Math.floor(Math.random() * gridSize) + 1;
  return { x, y };
}

// Moving the snake
function move() {
  const head = { ...snake[0] };

  // Update direction based on the nextDirection
  direction = nextDirection;

  switch (direction) {
    case "right":
      head.x++;
      break;
    case "left":
      head.x--;
      break;
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
  }

  snake.unshift(head);

  // Check if the snake eats the food
  if (head.x === food.x && head.y === food.y) {
    food = generateFood();
    gameSpeedDelay = Math.max(100, gameSpeedDelay - 11); // Speed up but cap at a minimum delay
    clearInterval(gameInterval); // Clear the existing interval
    gameInterval = setInterval(() => {
      move();
      draw();
    }, gameSpeedDelay);
  } else {
    snake.pop();
  }

  // Check for collisions with walls or itself
  checkCollision();
}

// Collision detection
function checkCollision() {
  const head = snake[0];

  // Check wall collision
  if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
    resetGame();
  }

  // Check self-collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      resetGame();
    }
  }
}

// Start Game function
function startGame() {
  gameStarted = true;
  instructionText.style.display = "none";
  logo.style.display = "none";
  gameInterval = setInterval(() => {
    move();
    draw();
  }, gameSpeedDelay);
}

// Reset Game function
function resetGame() {
  updateHighScore();
  stopGame();
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = "right";
  nextDirection = "right";
  gameSpeedDelay = 400;
  updateScore();
  run();
}

//to update hight scoore
function updateScore() {
  const currentScore = snake.length - 1;
  score.textContent = currentScore.toString().padStart(3, "0");
}


// Stop Game function
function stopGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  instructionText.style.display = "block";
  logo.style.display = "block";
  showNameInput();
}

//hight score
function updateHighScore() {
  const currentScore = snake.length - 1;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoretext.textContent = highScore.toString().padStart(3, "0");
  }
  if (hasName) {
    saveScore(playerName, highScore);
  }
  highScoretext.style.display = "block";
}


// Control the snake
function handleControl(direction) {
  if (!gameStarted && direction == "start") {
    startGame();
  } else {
    switch (direction) {
      case "up":
        if (nextDirection !== "down") nextDirection = "up";
        break;
      case "down":
        if (nextDirection !== "up") nextDirection = "down";
        break;
      case "left":
        if (nextDirection !== "right") nextDirection = "left";
        break;
      case "right":
        if (nextDirection !== "left") nextDirection = "right";
        break;
    }
  }
}


let hasName = false;
let playerName = "";

function showNameInput() {
  return new Promise((resolve) => {
    if (!hasName) {
      const inputContainer = document.getElementById("name-input-container");

      // Show the input container after 2 seconds
      setTimeout(() => {
        inputContainer.style.display = "block";
      }, 1000);

      // Handle name submission
      document.getElementById("submit-name").addEventListener("click", () => {
        playerName = document.getElementById("player-name").value;
        if (playerName.trim() !== "") {
          inputContainer.style.display = "none";
          hasName = true;
          
          resolve(playerName); // Resolve when the name is entered
        }
      });
    } else {
      resolve(playerName); 
    }
  });
}

async function run() {
  const playerName = await showNameInput(); 
  saveScore(playerName, highScore); 
}


window.startGame = startGame;
window.handleControl = handleControl;
