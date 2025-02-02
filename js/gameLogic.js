// Game State
const gameState = {
    deck: [],
    discardPile: [],
    players: [], // Array of player objects
    currentPlayerIndex: 0,
    roundNumber: 1, // Current round (starts at 1)
    gameOver: false
};
  
// Contracts
const contracts = [
    { description: "Two sets of three of a kind", validator: validateTwoSetsOfThree },
    { description: "A run of four and three of a kind", validator: validateRunAndSet },
    { description: "A run of seven", validator: validateRunOfSeven }
];
  
// Initialize the game
function initializeGame(numPlayers) {
    console.log("Initializing game...");
  
    // Reset game state
    gameState.deck = shuffleDeck(createDeck());
    gameState.discardPile = [];
    gameState.players = [];
    gameState.currentPlayerIndex = 0;
    gameState.roundNumber = 1;
    gameState.gameOver = false;
  
    // Create players
    for (let i = 0; i < numPlayers; i++) {
      gameState.players.push({
        name: `Player ${i + 1}`,
        hand: gameState.deck.splice(0, 11), // Deal 11 cards
        currentContractIndex: 0, // Start with the first contract
        score: 0
      });
    }
  
    // Flip the first card to start the discard pile
    gameState.discardPile.push(gameState.deck.pop());
  
    console.log("Game initialized.");
}
  
// Get the current contract for a player
  function getCurrentContract(player) {
    return contracts[player.currentContractIndex];
}
  
// Take a player's turn
function takeTurn(player) {
    console.log(`It's ${player.name}'s turn.`);
  
    // Step 1: Draw a card
    const drawnCard = drawCard(player);
    console.log(`${player.name} drew: ${drawnCard}`);
  
    // Step 2: Attempt to meld
    const currentContract = getCurrentContract(player);
    if (!currentContract) {
      console.log(`${player.name} has already completed all contracts.`);
      return;
    }
  
    const melded = attemptMeld(player.hand, currentContract.validator);
    if (melded) {
      console.log(`${player.name} completed their contract: ${currentContract.description}`);
    }
  
    // Step 3: Lay off additional cards
    layOffCards(player);
  
    // Step 4: Discard a card
    const discardedCard = discardCard(player);
    gameState.discardPile.push(discardedCard);
    console.log(`${player.name} discarded: ${discardedCard}`);
  
    // Check if the round should end
    if (player.hand.length === 0 && melded) {
      endRound();
    }
}

// End the current round
function endRound() {
    console.log(`Round ${gameState.roundNumber} has ended.`);
  
    // Calculate scores for all players
    calculateScores();
  
    // Advance players who completed their contract
    gameState.players.forEach(player => {
      const currentContract = getCurrentContract(player);
      if (currentContract && attemptMeld(player.hand, currentContract.validator)) {
        player.currentContractIndex++; // Move to the next contract
        console.log(`${player.name} advances to the next contract.`);
      }
    });
  
    // Check if the game is over
    const playersWhoCompletedAllContracts = gameState.players.filter(
      player => player.currentContractIndex === contracts.length
    );
  
    if (playersWhoCompletedAllContracts.length > 0) {
      gameState.gameOver = true;
  
      // Determine the winner
      const winner = playersWhoCompletedAllContracts.reduce((lowest, current) =>
        current.score < lowest.score ? current : lowest
      );
  
      console.log(`${winner.name} has the lowest score and wins the game!`);
      return;
    }
  
    // Start the next round
    gameState.roundNumber++;
    resetRound();
}
  
// Reset the round
function resetRound() {
    console.log(`Starting Round ${gameState.roundNumber}.`);
  
    // Reshuffle the deck and deal new hands
    gameState.deck = shuffleDeck(createDeck());
    gameState.discardPile = [];
    gameState.players.forEach(player => {
      player.hand = gameState.deck.splice(0, 11); // Deal 11 cards
    });
  
    // Flip the first card to start the discard pile
    gameState.discardPile.push(gameState.deck.pop());
}
  
// Calculate scores for all players
function calculateScores() {
    gameState.players.forEach(player => {
      if (player.hand.length === 0) {
        player.score -= 25; // Bonus for finishing the hand
      } else {
        player.hand.forEach(card => {
          if (card.startsWith('A')) player.score += 15;
          else if (['10', 'J', 'Q', 'K'].includes(card.split(' ')[0])) player.score += 10;
          else if (['2', 'joker'].includes(card.split(' ')[0])) player.score += 25;
          else player.score += 5;
        });
      }
    });
  
    console.log('Updated scores:', gameState.players.map(p => `${p.name}: ${p.score}`));
}
  
// Helper: Draw a card
function drawCard(player) {
    const drawnCard = gameState.deck.pop();
    player.hand.push(drawnCard);
    return drawnCard;
}
  
// Helper: Discard a card
function discardCard(player) {
    const discardedCard = player.hand.shift(); // Remove the first card
    return discardedCard;
}
  
// Helper: Lay off additional cards
function layOffCards(player) {
    // Logic for laying off cards onto existing melds
    console.log(`${player.name} lays off additional cards.`);
}
  
