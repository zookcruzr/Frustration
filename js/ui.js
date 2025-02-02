// DOM Elements
const scoreBoard = document.getElementById('score-board');
const drawPile = document.getElementById('draw-pile');
const discardPile = document.getElementById('discard-pile');

let draggedCardIndex = null;

// Initialize the UI
function initializeUI() {
  console.log("Initializing UI...");

  // Render initial game state
  renderPlayerHands();
  renderDrawPile();
  renderDiscardPile();
  renderMeldSpaces();

  // Bind event listeners
  bindEventListeners();

  console.log("UI initialized.");
}

// Render player hands
function renderPlayerHands() {
  gameState.players.forEach((player, index) => {
    const handContainer = document.getElementById(`player-${index}-hand`);
    handContainer.innerHTML = ''; // Clear previous cards

    player.hand.forEach((card, cardIndex) => {
      const img = createCardElement(card, cardIndex);
      handContainer.appendChild(img);
    });
  });
}

// Render the draw pile
function renderDrawPile() {
  drawPile.innerHTML = '<img src="assets/cards/back.png" alt="Draw Pile">';
}

// Render the discard pile
function renderDiscardPile() {
  discardPile.innerHTML = ''; // Clear previous cards

  if (gameState.discardPile.length > 0) {
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const img = createCardElement(topCard);
    discardPile.appendChild(img);
  }
}

// Render meld spaces
function renderMeldSpaces() {
  gameState.players.forEach((player, index) => {
    const meldSpace = document.getElementById(`player-${index}-melds`);
    meldSpace.innerHTML = ''; // Clear previous melds

    player.melds.forEach(meld => {
      meld.forEach(card => {
        const img = createCardElement(card);
        meldSpace.appendChild(img);
      });
    });
  });
}

// Create a card element
function createCardElement(card, index = null) {
  const img = document.createElement('img');
  img.src = getCardImage(card);
  img.alt = card;
  img.classList.add('card');

  if (index !== null) {
    img.setAttribute('draggable', true);
    img.addEventListener('dragstart', (e) => handleDragStart(e, index));
    img.addEventListener('dragend', () => img.classList.remove('dragging'));
  }

  return img;
}

// Handle drag start
function handleDragStart(event, index) {
  event.dataTransfer.setData('text/plain', index);
  draggedCardIndex = index;
  event.target.classList.add('dragging');
}

// Handle drop
function handleDrop(event, meldSpace) {
  event.preventDefault();
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const draggedCard = currentPlayer.hand[draggedCardIndex];

  // Validate the meld
  const meldCards = Array.from(meldSpace.children).map(img => img.alt);
  const newMeld = [...meldCards, draggedCard];
  const isValid = validateMeld(newMeld); // Use helpers.js validation

  if (isValid) {
    meldSpace.appendChild(createCardElement(draggedCard));
    currentPlayer.hand.splice(draggedCardIndex, 1);
    updateUI();
  } else {
    alert('Invalid meld!');
  }
}

// Bind event listeners
function bindEventListeners() {
  // Draw from draw pile
  drawPile.addEventListener('click', () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    takeTurn(currentPlayer);
    updateUI();
  });

  // Draw from discard pile
  discardPile.addEventListener('click', () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const topCard = gameState.discardPile.pop();
    currentPlayer.hand.push(topCard);
    updateUI();
  });

  // Meld button
  document.getElementById('meld-button').addEventListener('click', () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const currentContract = getCurrentContract(currentPlayer);
    const melded = attemptMeld(currentPlayer.hand, currentContract.validator);

    if (melded) {
      console.log(`${currentPlayer.name} successfully melded.`);
      updateUI();
    } else {
      alert('Invalid meld!');
    }
  });

  // Discard button
  document.getElementById('discard-button').addEventListener('click', () => {
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const discardedCard = discardCard(currentPlayer);
    gameState.discardPile.push(discardedCard);
    updateUI();
  });

  // Drag-and-drop for meld spaces
  document.querySelectorAll('.meld-space').forEach(meldSpace => {
    meldSpace.addEventListener('dragover', (e) => e.preventDefault());
    meldSpace.addEventListener('drop', (e) => handleDrop(e, meldSpace));
  });
}

// Update the UI dynamically
function updateUI() {
  renderPlayerHands();
  renderDrawPile();
  renderDiscardPile();
  renderMeldSpaces();
  updateScores();
}

// Update scores
function updateScores() {
  scoreBoard.innerHTML = ''; // Clear previous scores

  gameState.players.forEach(player => {
    const scoreRow = document.createElement('div');
    scoreRow.textContent = `${player.name}: ${player.score}`;
    scoreBoard.appendChild(scoreRow);
  });
}