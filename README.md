# Poker backend engine
This is a poker game server developed in TS using NodeJS for a future frontend app (to be written in Flutter)

This project was first written in Processing 3 Java, than rewritten for Processing 4 Java (z.b. to use Lambda) and now it's becoming a serverside component.

### CardMatch
The main component is the CardMatch class
It provides the CardMatch.match(deck: Deck): CardMatch[] function, which resolves all the combinations of cards posible in Texas Hold'em poker and ranks them apropriatly.
