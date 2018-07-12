# SPOK

This game of wordplay involves at least 2 players. The aim of the game is to create complete sentences by writing one part of that sentence during your turn. There are typically 4 parts of a sentence: SUBJECT, VERB, OBJECT, ADJECTIVE or ADVERB. At the end of each round, the new sentences made up of the entered words are generated. At this point, you should understand why this game can be hillarious.

This game uses NodeJS and Socket.IO to handle the real time communications. The front end uses React to simplify the UI update logic. The project is currently not using any database, all data is session based and stored in memory on the server, nothing is persisted (this might change in the future). To start, a person needs to be the host and create a room. After a room is created, a 5-character GUID is generated as the room code, which other players can use to join. After all expected players have joined, the host can start a round. Each time an update is made (like a part of a sentence is submitted), a message is sent  to the server to update the game state that is stored in memory. Then a state update event is broadcasted to all players in the room, that will trigger React to update the UI.

## Contributing

All contribution needs to be made through pull requests and must be reviewed by repository admin.