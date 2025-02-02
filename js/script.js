// 1. Global Variables

// Tracks whether the game has started
let gameStarted = false; 

// Tracks whether the game has ended
let isGameOver = false; 

// Tracks if it's the main player's turn
let isMainPlayerTurn = true; 

// Tracks if the player has drawn a card this turn
let hasDrawnThisTurn = false; 

// Tracks whether the player has played their first meld
let hasPlayedMeld = false; 

// Game State
let deck = [];
let discardPile = [];
let playerHand = [];
let selectedCards = [];

// Simulate other players' hands
let topRightPlayerHand = [];
let topLeftPlayerHand = [];
let bottomLeftPlayerHand = [];
let bottomRightPlayerHand = []; 

// Track melds on the table
const tableMelds = {
  player: [],       // Main player's melds
  topRight: [],     // Top-right player's melds
  topLeft: [],      // Top-left player's melds
  bottomLeft: [],    // Bottom-left player's melds
  bottomRight: []   // Bottom-right player's melds
};

// Checks to see if someone has won
function checkForWinner() {
    if (playerHand.length === 0) {
      alert('You win! Congratulations!');
      endGame();
      return;
    }
    if (topRightPlayerHand.length === 0 || topLeftPlayerHand.length === 0 || bottomLeftPlayerHand.length === 0) {
      alert('An AI player wins! Better luck next time.');
      endGame();
      return;
    }
}
  
// Ends game if someone has won
function endGame() {
    isGameOver = true; // Mark the game as over
  
    // Disable all actions
    document.getElementById('draw-pile').style.pointerEvents = 'none';
    document.getElementById('discard-pile').style.pointerEvents = 'none';
    document.querySelector('.discard-button').disabled = true;
    document.querySelector('.meld-button').disabled = true;
  
    // Add a "New Game" button if it doesn't already exist
    const newGameButton = document.getElementById('new-game-button');
    if (!newGameButton) {
      const button = document.createElement('button');
      button.id = 'new-game-button';
      button.textContent = 'New Game';
      button.addEventListener('click', resetGame);
      document.body.appendChild(button);
    }
  
    gameStarted = false; // Reset the gameStarted flag
}

// Initialize the game
function initGame() {
    deck = createDeck();
    deck = shuffleDeck(deck);
    dealCards(deck);
    updateUI();
}

// Resets game once New Game is selected
function resetGame() {
    console.log('Resetting game...');
  
    // Clear all global variables
    deck = [];
    discardPile = [];
    playerHand = [];
    selectedCards = [];
    topRightPlayerHand = [];
    topLeftPlayerHand = [];
    bottomLeftPlayerHand = [];
    tableMelds = {
      player: [],
      topRight: [],
      topLeft: [],
      bottomLeft: []
    };
    hasPlayedMeld = false;
    gameStarted = false;
    isGameOver = false;
  
    // Clear the UI
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('discard-pile').innerHTML = '';
    document.querySelector('.player-meld').innerHTML = '';
    document.querySelector('.top-left-meld').innerHTML = '';
    document.querySelector('.top-right-meld').innerHTML = '';
    document.querySelector('.bottom-left-meld').innerHTML = '';
  
    // Reinitialize the game
    initGame();
  
    console.log('Game reset successfully.');
}

// 2. Deck and Game Initialization //

// Create and shuffle the deck
function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  const deck = [];
  
  // Add three copies of each card
  for (let i = 0; i < 3; i++) { // Loop for three decks
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(`${rank} of ${suit}`);
      }
    }
    // Add Jokers for each deck
    deck.push('joker-black');
    deck.push('joker-red');
  }

  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Deal cards to all players
function dealCards(deck) {
  playerHand = deck.splice(0, 10); // Main player gets 10 cards
  topRightPlayerHand = deck.splice(0, 10); // Top-right player gets 10 cards
  topLeftPlayerHand = deck.splice(0, 10); // Top-left player gets 10 cards
  bottomLeftPlayerHand = deck.splice(0, 10); // Bottom-left player gets 10 cards
  bottomRightPlayerHand = deck.splice(0, 10); // Bottom-right player gets 10 cards
}


// 3. Player Actions //

// Draw a card from the draw pile or discard pile
function drawFromPile(pileType) {
    if (isGameOver) return; // Prevent drawing if the game is over
  
    if (hasDrawnThisTurn) {
      alert('You can only draw one card per turn!');
      return;
    }
  
    const maxHandSize = 11 - tableMelds.player.flat().length; // Adjust max hand size based on melds
    if (playerHand.length >= maxHandSize) {
      alert(`You already have the maximum number of cards (${maxHandSize}). Discard a card first.`);
      return;
    }
  
    let drawnCard;
  
    if (pileType === 'draw') {
      if (deck.length === 0) {
        if (discardPile.length <= 1) {
          alert('Both the draw pile and discard pile are empty!');
          return;
        }
        const topCard = discardPile.pop();
        deck = shuffleDeck([...discardPile]);
        discardPile = [topCard];
        console.log('Reshuffled discard pile into draw pile.');
      }
      drawnCard = deck.pop();
    } else if (pileType === 'discard') {
      if (discardPile.length > 0) {
        drawnCard = discardPile.pop();
      } else {
        alert('The discard pile is empty!');
        return;
      }
    }
  
    playerHand.push(drawnCard);
    hasDrawnThisTurn = true; // Mark that the player has drawn a card this turn
    updateUI();
    console.log(`You drew: ${drawnCard}`);
}

// Select/Deselect a card in the player's hand
function toggleCardSelection(cardIndex) {
  const cardElement = document.querySelectorAll('#player-hand img')[cardIndex];
  if (selectedCards.includes(cardIndex)) {
    // Deselect the card
    selectedCards = selectedCards.filter(index => index !== cardIndex);
    cardElement.classList.remove('selected');
  } else {
    // Select the card
    selectedCards.push(cardIndex);
    cardElement.classList.add('selected');
  }
}

function discardSelectedCard() {
    if (selectedCards.length !== 1) {
      alert('You must select exactly one card to discard to finish your turn!');
      return;
    }
    const cardIndex = selectedCards[0];
    const discardedCard = playerHand.splice(cardIndex, 1)[0];
    discardPile.push(discardedCard);
    selectedCards = [];
    updateUI();
    console.log(`You discarded: ${discardedCard}`);
  
    // Check for a winner
    checkForWinner();
  
    // Simulate other players' turns
    simulateOtherPlayersTurns();
}

// Play selected cards as a meld
function playSelectedCards() {
    gameStarted = true; // Mark the game as started
  if (selectedCards.length === 0) {
    alert('No cards selected!');
    return;
  }
  // Extract selected cards from the player's hand
  const selectedCardNames = selectedCards.map(index => playerHand[index]);
  const isValidMeld = validateMeld(selectedCardNames);
  if (!isValidMeld) {
    alert('Selected cards do not form a valid meld!');
    return;
  }
  // Remove selected cards from the player's hand
  selectedCards.sort((a, b) => b - a); // Sort descending to avoid index issues
  selectedCards.forEach(index => playerHand.splice(index, 1));
  // Clear selection and update UI
  selectedCards = [];
  updateUI();
  // Display the played meld in the player's meld space
  showMeld(document.querySelector('.player-meld'), selectedCardNames);
  // Add the meld to the table
  tableMelds.player.push(selectedCardNames);

  // Mark that the player has played a meld
  hasPlayedMeld = true;
}

function handleCardDropOnMeld(event, meldGroup) {
    event.preventDefault();
    meldGroup.style.border = ''; // Remove highlight
  
    if (!hasPlayedMeld) {
      alert('You must play a meld before you can add cards to any meld on the table.');
      return;
    }
  
    if (draggedIndex === null) return;
    const droppedCard = playerHand[draggedIndex];
    if (!droppedCard) return;
  
    const meldCards = Array.from(meldGroup.querySelectorAll('img')).map(img => img.alt);
    if (!canExtendMeld(droppedCard, meldCards)) {
      alert('The card cannot be added to this meld.');
      return;
    }
  
    meldCards.push(droppedCard);
    meldGroup.innerHTML = '';
    meldCards.forEach((card) => {
      const img = document.createElement('img');
      img.src = getCardImage(card);
      img.alt = card;
      img.style.width = '40px';
      meldGroup.appendChild(img);
    });
  
    playerHand.splice(draggedIndex, 1);
    draggedIndex = null;
    updateUI();
}

// 4. Validation Logic //

// Validate if selected cards form a valid meld (set or run)
function validateMeld(cards) {
  const sets = findSets(cards);
  const runs = findRuns(cards);
  return sets.length > 0 || runs.length > 0;
}

// Allow dropping by preventing the default behavior
function allowDrop(event) {
    event.preventDefault();
}
  
// Handle the start of dragging a card
function dragStart(event, index) {
    event.dataTransfer.setData('text/plain', index); // Store the card index
}
  
// Handle dropping a card onto a meld space
function dropCard(event) {
    event.preventDefault();
    const cardIndex = event.dataTransfer.getData('text/plain'); // Retrieve the card index
    const card = playerHand[cardIndex]; // Get the card from the player's hand
  
    // Find the target meld space
    const meldSpace = event.target.closest('.meld');
    if (!meldSpace) {
      console.error('Meld space not found!');
      return;
    }
  
    const playerKey = getPlayerKeyFromMeldSpace(meldSpace.id); // Determine which player's meld space this is
    const melds = tableMelds[playerKey];
  
    // Check if the card can be added to any existing meld
    let addedToMeld = false;
    for (const meld of melds) {
      const newMeld = [...meld, card];
      if (validateMeld(newMeld)) {
        meld.push(card);
        playerHand.splice(cardIndex, 1); // Remove the card from the player's hand
        updateUI();
        console.log(`Added ${card} to ${playerKey}'s meld.`);
        addedToMeld = true;
        break;
      }
    }
  
    if (!addedToMeld) {
      alert('The selected card cannot be added to any existing meld!');
    }
}
  
// Helper function to determine the player key from the meld space ID
function getPlayerKeyFromMeldSpace(meldSpaceId) {
    const keyMap = {
      'player-meld': 'player',
      'top-left-meld': 'topLeft',
      'top-right-meld': 'topRight',
      'bottom-left-meld': 'bottomLeft',
      'bottom-right-meld': 'bottomRight'
    };
    return keyMap[meldSpaceId];
}

// Helper function to find sets (e.g., three Kings)
function findSets(hand) {
  const rankCount = {};
  hand.forEach(card => {
    if (card.startsWith('joker')) return; // Skip Jokers
    const rank = card.split(' ')[0];
    rankCount[rank] = (rankCount[rank] || 0) + 1;
  });
  const sets = [];
  for (const [rank, count] of Object.entries(rankCount)) {
    if (count + countWildcards(hand) >= 3) {
      sets.push(Array(count).fill(`${rank}`));
    }
  }
  return sets;
}

function findRuns(hand) {
    const suitMap = {};
    let wildcards = []; // Track Jokers as wildcards
  
    // Separate Jokers and group cards by suit
    hand.forEach(card => {
      if (card.startsWith('joker')) {
        wildcards.push(card); // Add Joker to the wildcard list
        return;
      }
      const [rank, , suit] = card.split(' ');
      if (!suitMap[suit]) suitMap[suit] = [];
      suitMap[suit].push(rank);
    });
  
    const runs = [];
  
    for (const suit in suitMap) {
      const sortedRanks = suitMap[suit]
        .map(rank => getRankValue(rank))
        .filter(rank => rank !== -1)
        .sort((a, b) => a - b);
  
      let currentRun = [];
      let wildcardsUsed = wildcards.length; // Use Jokers as wildcards
  
      for (let i = 0; i < sortedRanks.length; i++) {
        if (currentRun.length === 0 || sortedRanks[i] === sortedRanks[i - 1] + 1) {
          currentRun.push(sortedRanks[i]);
        } else if (wildcardsUsed > 0) {
          // Use a Joker to fill the gap
          currentRun.push(sortedRanks[i - 1] + 1);
          wildcardsUsed--;
          i--; // Retry the current card
        } else {
          // Check if the current run is valid (at least 3 cards)
          if (currentRun.length >= 3) {
            runs.push(currentRun.map(rank => `${getRankName(rank)} of ${suit}`));
          }
          currentRun = [sortedRanks[i]];
        }
      }
  
      // Check the last run
      if (currentRun.length + wildcardsUsed >= 3) {
        runs.push(currentRun.map(rank => `${getRankName(rank)} of ${suit}`));
      }
    }
  
    return runs;
}

// Validate if a card can extend a meld
function canExtendMeld(card, meldCards) {
  // Check if the meld is a set
  const isSet = meldCards.every(c => c.split(' ')[0] === meldCards[0].split(' ')[0]);
  if (isSet) {
    const rank = meldCards[0].split(' ')[0];
    return card.split(' ')[0] === rank; // Card must have the same rank
  }

  // Check if the meld is a run
  const suit = meldCards[0].split(' ')[2];
  const ranks = meldCards.map(c => getRankValue(c.split(' ')[0])).sort((a, b) => a - b);
  const cardRank = getRankValue(card.split(' ')[0]);

  // Card must match the suit and fit into the sequence
  if (card.split(' ')[2] !== suit) return false;

  // Check if the card extends the run at the start or end
  return cardRank === ranks[0] - 1 || cardRank === ranks[ranks.length - 1] + 1;
}

// Count wildcards (Jokers) in a hand
function countWildcards(hand) {
  return hand.filter(card => card.startsWith('joker')).length;
}


// 5. Utility Functions //

// Map card names to image URLs
function getCardImage(card) {
    if (card.startsWith('joker')) {
      return 'https://raw.githubusercontent.com/zookcruzr/Frustration/main/assets/cards/joker.png'; // Joker image
    }
  
    const [rank, suit] = card.split(' ');
    const rankMap = {
      'A': 'ace', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
      '7': '7', '8': '8', '9': '9', '10': '10', 'J': 'jack', 'Q': 'queen', 'K': 'king'
    };
    const suitMap = { 'H': 'hearts', 'D': 'diamonds', 'C': 'clubs', 'S': 'spades' };
  
    const rankName = rankMap[rank];
    const suitName = suitMap[suit];
  
    return `https://raw.githubusercontent.com/zookcruzr/Frustration/main/assets/cards/${rankName}_of_${suitName}.png`;
}

// Map card rank to numerical value
function getRankValue(rank) {
  const rankOrder = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  return rankOrder.indexOf(rank.toLowerCase());
}

// Map numerical value back to card rank
function getRankName(value) {
  const rankOrder = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
  return rankOrder[value];
}

// Helper function to convert playerKey to meld space ID
function getPlayerMeldSpaceId(playerKey) {
    return playerKey.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '-meld';
}

// Sort meld cards in sequential order
function sortMeld(cards) {
    const suitsMap = {};
    cards.forEach(card => {
      if (card.startsWith('joker')) return; // Skip Jokers
      const [rank, , suit] = card.split(' ');
      if (!suitsMap[suit]) suitsMap[suit] = [];
      suitsMap[suit].push(rank);
    });
  
    const sortedCards = [];
    for (const suit in suitsMap) {
      const sortedRanks = suitsMap[suit]
        .map(rank => getRankValue(rank)) // Map ranks to numerical values
        .filter(rank => rank !== -1) // Exclude invalid ranks
        .sort((a, b) => a - b) // Sort numerically
        .map(rank => `${getRankName(rank)} of ${suit}`); // Map back to card names
  
      sortedCards.push(...sortedRanks);
    }
  
    // Add Jokers at the end
    sortedCards.push(...cards.filter(card => card.startsWith('joker')));
  
    return sortedCards;
}

  
// 6. UI Updates //

// Update the UI to display card images
function updateUI() {
    console.log('Updating UI...');
  
    // Update player's hand
    const playerHandDiv = document.getElementById('player-hand');
    playerHandDiv.innerHTML = ''; // Clear previous content
    playerHand.forEach((card, index) => {
      const img = document.createElement('img');
      const imageUrl = getCardImage(card); // Get the image URL
      console.log(`Card: ${card}, Image URL: ${imageUrl}`); // Log the generated URL
  
      if (!imageUrl) {
        console.error(`Failed to load image for card: ${card}`);
        return;
      }
  
      img.src = imageUrl;
      img.alt = card;
  
      // Highlight selected cards
      if (selectedCards.includes(index)) {
        img.classList.add('selected');
      }
  
      // Enable drag-and-drop
      img.draggable = true;
  
      // Add event listeners for card interactions
      img.addEventListener('click', () => toggleCardSelection(index)); // Select on click
      img.addEventListener('dragstart', (e) => dragStart(e, index)); // Start dragging
      img.addEventListener('dragover', (e) => e.preventDefault()); // Allow dropping
      img.addEventListener('drop', (e) => dropCardOnHand(e, index)); // Handle dropping within the hand
  
      playerHandDiv.appendChild(img);
    });
  
    // Display the top card of the discard pile or a card back if empty
    const discardPileDiv = document.getElementById('discard-pile');
    if (discardPile.length > 0) {
      const topCard = discardPile[discardPile.length - 1];
      const img = document.createElement('img');
      img.src = getCardImage(topCard);
      img.alt = topCard;
      discardPileDiv.innerHTML = '';
      discardPileDiv.appendChild(img);
    } else {
      discardPileDiv.innerHTML = `<img src="https://raw.githubusercontent.com/zookcruzr/Frustration/main/assets/cards/back-1.png" alt="Card Back">`;
    }
  
    console.log('UI updated.');
}

// Drag-and-drop functionality
let draggedIndex = null;
// Start the drag operation
function dragStart(event, index) {
  event.dataTransfer.setData('text/plain', index); // Store the card index
  draggedIndex = index; // Track the dragged card's index
}
// Drop on Hand (Reordering)
function dropCardOnHand(event, targetIndex) {
    event.preventDefault();
    const draggedCardIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
  
    if (draggedCardIndex === null || draggedCardIndex === targetIndex) return;
  
    // Reorder the player's hand
    const [draggedCard] = playerHand.splice(draggedCardIndex, 1);
    playerHand.splice(targetIndex, 0, draggedCard);
  
    // Update the UI
    updateUI();
}
// Drop on Meld Space (Adding to Melds)
function dropCardOnMeld(event) {
    event.preventDefault();
    const draggedCardIndex = parseInt(event.dataTransfer.getData('text/plain'), 10);
    const draggedCard = playerHand[draggedCardIndex];
  
    // Find the target meld space
    const meldSpace = event.target.closest('.meld');
    if (!meldSpace) {
      console.error('Meld space not found!');
      return;
    }
  
    const playerKey = getPlayerKeyFromMeldSpace(meldSpace.id); // Determine which player's meld space this is
    const melds = tableMelds[playerKey];
  
    // Check if the card can be added to any existing meld
    let addedToMeld = false;
    for (const meld of melds) {
      const newMeld = [...meld, draggedCard];
      if (validateMeld(newMeld)) {
        meld.push(draggedCard);
        playerHand.splice(draggedCardIndex, 1); // Remove the card from the player's hand
        updateUI();
        console.log(`Added ${draggedCard} to ${playerKey}'s meld.`);
        addedToMeld = true;
        break;
      }
    }
  
    if (!addedToMeld) {
      alert('The selected card cannot be added to any existing meld!');
    }
}

// Show melds dynamically
function showMeld(meldElement, cards) {
    if (!meldElement) {
      console.error('Meld space not found!');
      return;
    }
  
    // Create a new meld group container
    const meldGroup = document.createElement('div');
    meldGroup.classList.add('meld-group');
  
    // Sort the cards in the meld
    const sortedCards = sortMeld(cards);
  
    // Add cards to the meld group
    sortedCards.forEach((card) => {
      const img = document.createElement('img');
      img.src = getCardImage(card);
      img.alt = card;
      img.style.width = '40px'; // Adjust size for meld space
      meldGroup.appendChild(img);
    });
  
    // Append the new meld group to the meld space
    meldElement.appendChild(meldGroup);
}


// 7. AI Logic //

// Attempt to form a meld for an AI player
function attemptMeld(hand, playerKey) {
    console.log(`Attempting meld for ${playerKey} player...`);
    const sets = findSets(hand);
    const runs = findRuns(hand);
  
    if (sets.length > 0 || runs.length > 0) {
      console.log(`${playerKey} player found a valid meld.`);
      // Remove the melded cards from the player's hand
      const meldedCards = sets.concat(runs).flat();
      meldedCards.forEach(card => {
        const index = hand.indexOf(card);
        if (index !== -1) hand.splice(index, 1);
      });
  
      // Convert playerKey to meld space ID
      const meldSpaceId = getPlayerMeldSpaceId(playerKey); // Use the helper function
      const meldSpace = document.getElementById(meldSpaceId);
  
      if (!meldSpace) {
        console.error(`Meld space not found for ${playerKey} player (ID: ${meldSpaceId})`);
        return false;
      }
  
      // Show the meld on the table
      showMeld(meldSpace, meldedCards);
  
      // Track the meld in the global tableMelds object
      tableMelds[playerKey].push(meldedCards);
      return true;
    }
  
    console.log(`${playerKey} player could not find a valid meld.`);
    return false;
}

// Simulate other players' turns
function simulateOtherPlayersTurns() {
    console.log('simulateOtherPlayersTurns called.');
    if (isGameOver) {
      console.log('Game is over. Skipping AI turns.');
      return; // Stop AI turns if the game is over
    }
  
    const players = [
      { hand: topRightPlayerHand, key: 'topRight' },
      { hand: topLeftPlayerHand, key: 'topLeft' },
      { hand: bottomLeftPlayerHand, key: 'bottomLeft' },
      { hand: bottomRightPlayerHand, key: 'bottomRight' }
    ];
  
    console.log('Simulating AI players\' turns...');
  
    // Disable draw buttons for the main player
    document.getElementById('draw-pile').style.pointerEvents = 'none';
    document.getElementById('discard-pile').style.pointerEvents = 'none';
  
    players.forEach(({ hand, key }, index) => {
      setTimeout(() => {
        if (isGameOver) {
          console.log('Game is over. Skipping remaining AI turns.');
          return; // Stop AI turns if the game is over
        }
  
        console.log(`Simulating turn for ${key} player...`);
  
        // Reshuffle discard pile if draw pile is empty
        if (deck.length === 0) {
          if (discardPile.length <= 1) {
            console.log('Both the draw pile and discard pile are empty!');
            return;
          }
          const topCard = discardPile.pop(); // Keep the top card of the discard pile
          deck = shuffleDeck([...discardPile]); // Shuffle the remaining discard pile
          discardPile = [topCard]; // Restore the top card to the discard pile
          console.log('Reshuffled discard pile into draw pile.');
        }
  
        const drawnCard = deck.pop();
        hand.push(drawnCard);
        console.log(`${key} player drew: ${drawnCard}`);
  
        const melded = attemptMeld(hand, key);
  
        if (!melded) {
          const discardedCard = hand.shift(); // Discard the first card
          discardPile.push(discardedCard);
          updateUI();
          console.log(`${key} player discarded: ${discardedCard}`);
        } else {
          updateUI();
          console.log(`${key} player melded.`);
        }
  
        // Re-enable draw buttons after all AI players have taken their turns
        if (index === players.length - 1) {
          document.getElementById('draw-pile').style.pointerEvents = 'auto';
          document.getElementById('discard-pile').style.pointerEvents = 'auto';
          hasDrawnThisTurn = false; // Reset the draw flag for the main player's next turn
          console.log('AI turns complete. Main player can now draw.');
        }
      }, (index + 1) * 1000); // Stagger turns
    });
}

// Attach event listener to the "New Game" button
document.getElementById('new-game-button').addEventListener('click', () => {
    if (gameStarted && confirm('Are you sure you want to start a new game? All progress will be lost.')) {
      resetGame(); // Reset the game state
    } else if (!gameStarted) {
      resetGame(); // No prompt if the game hasn't started yet
    }
});

// Attach event listeners to buttons
document.querySelector('.discard-button').addEventListener('click', discardSelectedCard);
document.querySelector('.meld-button').addEventListener('click', playSelectedCards);
document.getElementById('draw-pile').addEventListener('click', () => drawFromPile('draw'));
document.getElementById('discard-pile').addEventListener('click', () => drawFromPile('discard'));

// Start the game
initGame();