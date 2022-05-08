# Poker backend engine
This is a poker game server developed in TS using NodeJS for a future frontend app (to be written in Flutter)

This project was first written in Processing 3 Java, than rewritten for Processing 4 Java (z.b. to use Lambda) and now it's becoming a serverside component.

## REST vs WebSocket API
The REST API is made for the main purpose of game control and game init. It's also quite useful for testing. The WebSocket API is the one that the game actually runs on, as soon a valid connection has been established (probably using REST). The main reason for using WS is to push realtime updates to all players so that they allways see exactly what cards have been played and what other players are betting.

Here is the list of currently exposed REST endpoints:

- /newgame - create a new game with or without custom id (expects gameId as payload)
- /join - create a new player with no WS connection attached (used for testing, expects gameId as payload)
- /progress - skips betting, makes the game play the next round

WS API expects a JSON message containing gameId, action and args field. Args are dependant on action:
- "join" - start talking with the server, connection with no join message will be tossed (args: "name")
- "setName" - change the connections nickname (args: "name")
- "nudgeMoney" - change the current "account balance" of the player by some ammount (can be negative, args: "ammount")
- "bet" - send a bet action, this action is verified on the backend and can throw errors (args: "ammount")

WS API status messages are really the reason for it, theyre actions can be:
- "success" (200)
- "error" (sends also "description")
- "update" (general refresh, brings with it some or all game state info)
- "startBet" (command to start the betting process)

### CardMatch
The main component is the CardMatch class.
It provides the CardMatch.match(deck: Deck): CardMatch[] function, which resolves all the combinations of cards posible in Texas Hold'em poker and ranks them apropriatly.
