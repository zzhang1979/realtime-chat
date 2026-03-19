const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static('public'));

// Store connected users
const users = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user setting their nickname
  socket.on('set nickname', (nickname) => {
    users.set(socket.id, {
      id: socket.id,
      nickname: nickname || `User${Math.floor(Math.random() * 1000)}`
    });
    
    // Notify all users about the new user
    io.emit('user joined', {
      id: socket.id,
      nickname: users.get(socket.id).nickname,
      userCount: users.size
    });
    
    // Send current user list to the newly connected user
    socket.emit('init users', Array.from(users.values()));
    
    console.log(`User set nickname: ${users.get(socket.id).nickname}`);
  });

  // Handle incoming chat messages
  socket.on('chat message', (msg) => {
    const user = users.get(socket.id);
    if (user && msg.trim() !== '') {
      const messageWithTimestamp = {
        text: msg,
        nickname: user.nickname,
        userId: user.id,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Message from ${user.nickname}: ${msg}`);
      // Broadcast message to all connected clients
      io.emit('chat message', messageWithTimestamp);
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      // Notify all users about the user leaving
      io.emit('user left', {
        id: socket.id,
        nickname: user.nickname,
        userCount: users.size
      });
      console.log(`User disconnected: ${user.nickname}`);
    } else {
      console.log('Client disconnected (no nickname set)');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});