// Helper: Shuffle the deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }
  
  // Helper: Create a deck of cards
  function createDeck(numDecks = 3) {
    const suits = ['H', 'D', 'C', 'S'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let deck = [];
  
    for (let i = 0; i < numDecks; i++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push(`${rank} ${suit}`);
        }
      }
      // Add jokers for each deck
      deck.push('joker', 'joker');
    }
  
    return deck;
  }
  
  // Helper: Get the numerical value of a card rank
  function getRankValue(rank) {
    const rankMap = {
      'A': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10,
      'J': 11,
      'Q': 12,
      'K': 13
    };
    return rankMap[rank] || 0; // Default to 0 for invalid ranks
  }
  
  // Helper: Validate a set (three or more cards of the same rank)
  function validateSet(cards) {
    if (cards.length < 3) return false;
  
    const sortedCards = cards.map(card => {
      if (card.startsWith('joker')) return { rank: 'joker', suit: 'joker' };
      const [rank, , suit] = card.split(' ');
      return { rank, suit };
    });
  
    const targetRank = sortedCards[0].rank;
    let wildcards = sortedCards.filter(card => card.rank === 'joker').length;
  
    return sortedCards.every(card => card.rank === targetRank || card.rank === 'joker') &&
      (sortedCards.length + wildcards >= 3);
  }
  
  // Helper: Validate a run (three or more consecutive cards of the same suit)
  function validateRun(cards) {
    if (cards.length < 3) return false;
  
    const sortedCards = cards.map(card => {
      if (card.startsWith('joker')) return { rank: 'joker', suit: 'joker' };
      const [rank, , suit] = card.split(' ');
      return { rank, suit };
    }).sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
  
    const targetSuit = sortedCards[0].suit;
    let wildcards = sortedCards.filter(card => card.rank === 'joker').length;
    const nonWildcards = sortedCards.filter(card => card.rank !== 'joker');
  
    // Ensure all non-wildcards are of the same suit
    if (!nonWildcards.every(card => card.suit === targetSuit)) return false;
  
    for (let i = 1; i < nonWildcards.length; i++) {
      const gap = getRankValue(nonWildcards[i].rank) - getRankValue(nonWildcards[i - 1].rank);
      if (gap > 1) {
        wildcards -= gap - 1;
        if (wildcards < 0) return false;
      } else if (gap < 1) {
        return false; // Duplicate ranks in a run
      }
    }
  
    return true;
  }
  
  // Example validators
  function validateTwoSetsOfThree(cards) {
    const sets = findSets(cards);
    return sets.length >= 2 && sets.every(set => set.length >= 3);
  }
  
  function findSets(cards) {
    const groupedByRank = {};
    cards.forEach(card => {
      if (card.startsWith('joker')) {
        groupedByRank['joker'] = (groupedByRank['joker'] || []).concat(card);
      } else {
        const [rank] = card.split(' ');
        groupedByRank[rank] = (groupedByRank[rank] || []).concat(card);
      }
    });
  
    const sets = [];
    for (const rank in groupedByRank) {
      if (rank === 'joker') continue;
      const set = groupedByRank[rank];
      if (set.length + (groupedByRank['joker']?.length || 0) >= 3) {
        sets.push([...set, ...(groupedByRank['joker'] || [])]);
      }
    }
  
    return sets;
  }