document.addEventListener("DOMContentLoaded", function () {
  const calorieTargetInput = document.getElementById("calorie-target");
  const editGlobalCaloriesButton = document.getElementById("edit-global-calories");
  const playerList = document.getElementById("player-list");
  const gameSetupForm = document.getElementById("game-setup-form");
  const gameArea = document.getElementById("game-area");
  const exerciseDetails = document.getElementById("exercise-details");
  const addExercisesButton = document.getElementById("add-exercises");
  const playerDetails = document.getElementById("player-details");
  const addPlayersButton = document.getElementById("add-players");
  const finishButton = document.getElementById("finish-button");
  const gameOverArea = document.getElementById("game-over-area");

  let gameData = {
      exercises: [],
      players: [],
      calorieTarget: 0,
      startTime: null
  };

  // Додавання вправ
  addExercisesButton.addEventListener("click", () => {
      const count = parseInt(document.getElementById("exercise-count").value, 10);
      if (isNaN(count) || count <= 0) {
          alert("Enter a valid number of exercises.");
          return;
      }
      exerciseDetails.innerHTML = "";
      for (let i = 0; i < count; i++) {
          const div = document.createElement("div");
          div.innerHTML = `
              <label>Exercise ${i + 1}</label>
              <input type="text" placeholder="Exercise name" data-index="${i}" class="exercise-name">
              <input type="number" placeholder="Calories per repetition" data-index="${i}" class="exercise-calories">
              <input type="number" placeholder="Repetitions" data-index="${i}" class="exercise-reps">
          `;
          exerciseDetails.appendChild(div);
      }
  });

  // Додавання гравців
  addPlayersButton.addEventListener("click", () => {
      const count = parseInt(document.getElementById("player-count").value, 10);
      if (isNaN(count) || count <= 0) {
          alert("Enter a valid number of players.");
          return;
      }
      playerDetails.innerHTML = "";
      for (let i = 0; i < count; i++) {
          const div = document.createElement("div");
          div.innerHTML = `
              <label>Player ${i + 1}</label>
              <input type="text" placeholder="Player name" data-index="${i}" class="player-name">
          `;
          playerDetails.appendChild(div);
      }
  });

  // Запуск гри
  gameSetupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      gameData.calorieTarget = parseInt(calorieTargetInput.value, 10);
      gameData.players = Array.from(document.querySelectorAll(".player-name")).map(input => ({
          name: input.value,
          caloriesBurned: 0,
          calorieTarget: gameData.calorieTarget,
          repetitions: {},
          exercisesUsed: {},
          startTime: null,
          endTime: null
      }));
      gameData.exercises = Array.from(document.querySelectorAll(".exercise-name")).map((input, index) => ({
          name: input.value,
          calories: parseFloat(document.querySelector(`.exercise-calories[data-index="${index}"]`).value),
          reps: parseInt(document.querySelector(`.exercise-reps[data-index="${index}"]`).value, 10)
      }));

      gameData.startTime = Date.now();
      gameArea.classList.remove("hidden");
      updatePlayerList();
  });

  // Оновлення списку гравців
  function updatePlayerList() {
      playerList.innerHTML = "";
      gameData.players.forEach((player, index) => {
          const div = document.createElement("div");
          const completedClass = player.caloriesBurned >= player.calorieTarget ? "completed-player" : "";
          div.innerHTML = `
              <button class="${completedClass}" onclick="selectPlayer(${index})">${player.name}: ${player.caloriesBurned.toFixed(2)}/${player.calorieTarget.toFixed(2)} calories</button>
          `;
          playerList.appendChild(div);
      });

      // Перевірка, чи всі гравці завершили гру
      const allCompleted = gameData.players.every(player => player.caloriesBurned >= player.calorieTarget);
      if (allCompleted) {
          finishButton.click();
      }
  }

  // Вибір гравця
  window.selectPlayer = function (playerIndex) {
      const player = gameData.players[playerIndex];
      let exerciseButtons = gameData.exercises.map((exercise, i) => 
          `<button onclick="recordExercise(${playerIndex}, ${i})">${exercise.name} (${exercise.reps} reps = ${exercise.calories} cal)</button>`
      ).join("");
  
      playerList.innerHTML = `
          <h3>${player.name}'s Turn</h3>
          ${exerciseButtons}
          <button onclick="cancelSelection()">Cancel</button>
      `;
  };

  window.cancelSelection = function () {
    updatePlayerList(); // повертає список гравців
  };

  // Запис вправи та підрахунок калорій з урахуванням неповної кількості повторів
  window.recordExercise = function (playerIndex, exerciseIndex) {
      let reps = prompt(`Enter repetitions for ${gameData.exercises[exerciseIndex].name}:`);
      if (!reps || isNaN(reps) || reps <= 0) {
          alert("Invalid number of repetitions.");
          return;
      }

      reps = parseInt(reps, 10);
      let exercise = gameData.exercises[exerciseIndex];

      // Розрахунок калорій
      let caloriesBurned = parseFloat(((reps / exercise.reps) * exercise.calories).toFixed(2));
      gameData.players[playerIndex].caloriesBurned = parseFloat((gameData.players[playerIndex].caloriesBurned + caloriesBurned).toFixed(2));

      // Запис результатів по вправах
      if (!gameData.players[playerIndex].repetitions[exercise.name]) {
          gameData.players[playerIndex].repetitions[exercise.name] = 0;
          gameData.players[playerIndex].exercisesUsed[exercise.name] = 0;
      }
      gameData.players[playerIndex].repetitions[exercise.name] += reps;
      gameData.players[playerIndex].exercisesUsed[exercise.name]++;

      // Перевірка на досягнення цілі
      if (gameData.players[playerIndex].caloriesBurned >= gameData.players[playerIndex].calorieTarget) {
          gameData.players[playerIndex].endTime = Date.now();
          alert(`${gameData.players[playerIndex].name} has reached the target calories!`);
      }

      updatePlayerList();
  };

  // Завершення гри
  finishButton.addEventListener("click", function () {
      gameArea.classList.add("hidden");
      gameOverArea.classList.remove("hidden");
      displayResults();
  });

  // Відображення фінального звіту
  function displayResults() {
    let resultsList = `<h2>Game Over</h2>`;
    
    gameData.players.forEach(player => {
        let timeSpent = player.endTime ? ((player.endTime - gameData.startTime) / 60000).toFixed(2) + " min" : "N/A";
        let totalReps = Object.values(player.repetitions).reduce((a, b) => a + b, 0);

        let exerciseDetails = Object.entries(player.repetitions).map(([exerciseName, reps]) => `
            <p>${exerciseName}: Selected ${gameData.players.find(p => p.name === player.name).exercisesUsed[exerciseName]} times, Total Reps: ${reps}</p>`
        ).join("");

        resultsList += `
            <div>
                <h3>${player.name}</h3>
                <p>Time Spent: ${timeSpent}</p>
                ${exerciseDetails}
                <p><strong>Total Reps: ${totalReps}</strong></p>
            </div>
            <hr>
        `;
    });

    gameOverArea.innerHTML = resultsList + '<button id="restart-button">Again</button>';
    document.getElementById("restart-button").addEventListener("click", () => location.reload());
  }
});
