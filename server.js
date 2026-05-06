const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('.'));

let users = [];

io.on('connection', (socket) => {
    const userName = `User_${socket.id.slice(0, 4)}`;
    users.push({ id: socket.id, name: userName });
    
    io.emit('user_joined', {
        text: `${userName} зашел в чат`,
        users: users
    });
    
    socket.on('send_message', (msg) => {
        io.emit('new_message', {
            userId: socket.id,
            name: userName,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });
    
    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('user_left', {
            text: `${userName} вышел из чата`,
            users: users
        });
    });
});

http.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});