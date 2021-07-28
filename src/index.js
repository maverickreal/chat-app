const express = require('express'),
    path = require('path'),
    http = require('http'),
    badWords = require('bad-words'),
    moment = require('moment'),
    { addUser, removeUser, getUser, getRoomMembers } = require('./utils/user.js');

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

    socket.on('join', (options, callback) => {
        //const User = options.user, Room = options.room;
        const { error, id, user, room } = addUser(socket.id, options.user, options.room);
        if (error)
            return callback(error);

        socket.join(room);
        socket.emit('message', getDateTime(`welcome ${user}`, user));
        socket.broadcast.to(room).emit('message', getDateTime(`${user} joined`,user));
        //callback();
    });

    socket.on('message', (msg, callback) => {
        const filter = new badWords();
        if (filter.isProfane(msg.message))
            callback('Profanity not allowed.');
        else {
            console.log(msg.room);
            io.to(msg.room).emit('message', getDateTime(msg.message,msg.user));
            callback();
        }
    });

    socket.on('location', (coords, callback) => {
        io.to(coords.room).emit('location', coords);
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user)
            io.to(user.room).emit('message', getDateTime(`{${user.user} left.`));
    });
});

server.listen(process.env.EXPRESS);