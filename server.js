const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store collected marketing data
const marketingData = [];

// Jukebox Queue
let musicQueue = [];

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    // On connect, send current queue to the Host only
    socket.emit('updateQueue', musicQueue);

    // 1. Handle User Registration (Landing Page)
    socket.on('submitUserData', (userData) => {
        console.log("MARKETING_DATA_CAPTURE:", JSON.stringify(userData));
        marketingData.push(userData);
        socket.emit('registrationSuccess');
    });

    // 2. Handle Song Request (User adds to Queue)
    socket.on('requestSong', (song) => {
        // Add to server queue
        musicQueue.push(song);
        console.log(`Song Added: ${song.title}`);
        
        // Update the HOST so it sees the new song
        io.emit('updateQueue', musicQueue);
    });

    // 3. Handle Queue Updates from Host (Removing songs/Skipping)
    socket.on('syncQueue', (newQueue) => {
        musicQueue = newQueue;
        // Broadcast new queue state (optional, mostly for Host consistency)
        socket.broadcast.emit('updateQueue', musicQueue);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
