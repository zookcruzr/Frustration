// Simulate AI player turns
async function simulateAITurn(player) {
    console.log(`Simulating turn for ${player.name}...`);
  
    // Step 1: Draw a card
    const drawnCard = await aiDrawCard(player);
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
    aiLayOffCards(player);
  
    // Step 4: Discard a card
    const discardedCard = aiDiscardCard(player);
    gameState.discardPile.push(discardedCard);
    console.log(`${player.name} discarded: ${discardedCard}`);
  
    // Check if the round should end
    if (player.hand.length === 0 && melded) {
      endRound();
    }
}
  
// AI draws a card (prefers discard pile if useful)
async function aiDrawCard(player) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate thinking time
  
    const topDiscardCard = gameState.discardPile[gameState.discardPile.length - 1];
    const isUseful = isCardUseful(player.hand, topDiscardCard);
  
    if (isUseful) {
      console.log(`${player.name} picked up from the discard pile: ${topDiscardCard}`);
      return gameState.discardPile.pop();
    } else {
      console.log(`${player.name} drew from the draw pile.`);
      return gameState.deck.pop();
    }
}
  
// AI lays off additional cards onto existing melds
function aiLayOffCards(player) {
    if (!player.hasCompletedCurrentContract) return;
  
    const melds = getAllMeldsOnTable(); // Get all melds on the table
    let handCopy = [...player.hand];
  
    for (const meld of melds) {
      for (let i = 0; i < handCopy.length; i++) {
        const card = handCopy[i];
        const newMeld = [...meld, card];
        if (validateMeld(newMeld)) {
          meld.push(card); // Add the card to the meld
          handCopy.splice(i, 1); // Remove the card from the AI's hand
          console.log(`${player.name} laid off ${card} onto an existing meld.`);
          break;
        }
      }
    }
  
    player.hand = handCopy; // Update the AI's hand
}
  
// AI discards a card (tries to discard the least useful card)
function aiDiscardCard(player) {
    const leastUsefulCard = findLeastUsefulCard(player.hand);
    const discardedCard = player.hand.splice(player.hand.indexOf(leastUsefulCard), 1)[0];
    console.log(`${player.name} discarded: ${discardedCard}`);
    return discardedCard;
}
  
// Determine if a card is useful for the AI's hand
function isCardUseful(hand, card) {
    const handWithCard = [...hand, card];
    const potentialSets = findSets(handWithCard);
    const potentialRuns = findRuns(handWithCard);
  
    return potentialSets.length > 0 || potentialRuns.length > 0;
}
  
// Find the least useful card in the AI's hand
function findLeastUsefulCard(hand) {
    // Prioritize discarding cards that don't contribute to any potential melds
    const sets = findSets(hand);
    const runs = findRuns(hand);
  
    for (const card of hand) {
      const isPartOfSet = sets.some(set => set.includes(card));
      const isPartOfRun = runs.some(run => run.includes(card));
  
      if (!isPartOfSet && !isPartOfRun) {
        return card;
      }
    }
  
    // If all cards are part of melds, discard the highest-ranked card
    return hand.reduce((leastUseful, current) => {
      return getRankValue(current.split(' ')[0]) > getRankValue(leastUseful.split(' ')[0])
        ? current
        : leastUseful;
    });
}
  
// Get all melds currently on the table
function getAllMeldsOnTable() {
    const allMelds = [];
    gameState.players.forEach(player => {
      player.melds.forEach(meld => {
        allMelds.push(meld);
      });
    });
    return allMelds;
}