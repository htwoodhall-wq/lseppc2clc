const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store collected marketing data in memory
const marketingData = [];

// Track votes
let voteCounts = {
    "Song A": 0,
    "Song B": 0,
    "Song C": 0,
    "Song D": 0
};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Send current votes to new hosts immediately
    socket.emit('updateVotes', voteCounts);

    // 1. Handle User Registration
    socket.on('submitUserData', (userData) => {
        // IMPORTANT: Log this so you can see it in Render Dashboard Logs
        console.log("MARKETING_DATA_CAPTURE:", JSON.stringify(userData));
        
        marketingData.push(userData);
        socket.emit('registrationSuccess');
    });

    // 2. Handle the Vote
    socket.on('castVote', (songName) => {
        if (voteCounts[songName] !== undefined) {
            voteCounts[songName]++;
            io.emit('updateVotes', voteCounts); 
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
