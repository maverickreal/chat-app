const express = require('express'),
    path = require('path'),
    http = require('http'),
    badWords = require('bad-words'),
    moment = require('moment'),
    { addUser, removeUser, getUser, getRoomMates } = require('./utils/user.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

//app.set('view engine', 'hbs');

const server = http.createServer(app),
    io = require('socket.io')(server);

function getDateTime(message, user = '') {
    return {
        message, dateTime: moment(new Date()).format('H:m'), user
    };
}

io.on('connection', (socket) => {
    console.log('Connection');

    socket.on('join', (User, Room, callback) => {
        //const User = options.user, Room = options.room;
        const { error, id, user, room } = addUser(socket.id, User, Room);
        if (error)
            return callback(error);

        socket.join(room);
        socket.emit('message', { message: `Welcome ${user}` });
        socket.broadcast.to(room).emit('message', getDateTime(`${user} joined`, user));
        io.to(room).emit('roomData', { room, users: getRoomMates(room) });
        //callback();
    });

    socket.on('message', (msg, callback) => {
        const filter = new badWords();
        if (filter.isProfane(msg))
            callback('Profanity not allowed.');
        else {
            const User = getUser(socket.id);
            console.log(User.room);
            io.to(User.room).emit('message', getDateTime(msg, User.user));
            callback();
        }
    });

    socket.on('location', (coords, callback) => {
        const User = getUser(socket.id);
        coords.user = User.user;
        io.to(User.room).emit('location', coords);
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', getDateTime(`{${user.user} left.`));
            io.to(user.room).emit('roomData', { room: user.room, users: getRoomMates(user.room) });
        }
    });
});

server.listen(process.env.EXPRESS);