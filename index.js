const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle incoming chat messages
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    // Broadcast message to all connected clients
    io.emit('chat message', msg);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});