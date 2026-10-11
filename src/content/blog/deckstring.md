---
title: "DeckString"
date: 2024-07-19T16:33Z
---

function createDeck() { const suits = \['S', 'H', 'D', 'C'\]; const deck = \[\]; for (let suit of suits) { for (let num = 1; num <= 13; num++) { const cardNumber = num.toString().padStart(2, '0'); deck.push(cardNumber + suit); } } return deck; } function shuffleDeck(deck) { for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() \* (i + 1)); \[deck\[i\], deck\[j\]\] = \[deck\[j\], deck\[i\]\]; } return deck; } function getShuffledDeck() { const deck = createDeck(); const shuffledDeck = shuffleDeck(deck); return shuffledDeck.join(''); } function generate() { const result = getShuffledDeck() const elem = document.getElementById("result") elem.value = result elem.style.display = '' }

I recently discovered that when you shuffle a deck of cards the chances of anyone ever (in the past or future) having the same sequence of cards is close to impossible. This doesn't sound intuitively true but it is since the odds of repeating the exact shuffle is 1 in 52! (factorial). To get an idea how rare that is, that's more than the [grains of sand on Earth](https://worldmetrics.org/sand-grain-count-statistics/) and more than the [observable stars in the universe](https://www.worldatlas.com/articles/are-there-more-grains-of-sand-or-stars-in-the-earth.html).

So go ahead, hit the Shuffle Deck button and get your probably unique string representing a shuffled deck of cards. Numbers are represented as 01, 02, and so on. The suits are represented as S, H, D and C. All results are 156 characters long.

Shuffle Deck

##
