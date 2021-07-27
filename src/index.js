const express = require('express'),
    path = require('path'),
    http = require('http'),
    badWords = require('bad-words');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'hbs');

const server = http.createServer(app),
    io = require('socket.io')(server);

function getDateTime(message) {
    return {
        message, dateTime: require('moment')(new Date()).format('H:m')
    };
}

io.on('connection', (socket) => {
    console.log('Connection');

    socket.emit('message', getDateTime('welcome'));
    socket.broadcast.emit('message', getDateTime('1 joined'));
    socket.on('message', (msg, callback) => {
        const filter = new badWords();
        if (filter.isProfane(msg))
            callback('Profanity not allowed.');
        else {
            io.emit('message', getDateTime(msg));
            callback();
        }
    });
    socket.on('location', (coords, callback) => {
        io.emit('location', coords);
        callback();
    })
    socket.on('disconnect', () => io.emit('message', getDateTime('1 left')));
});

server.listen(process.env.EXPRESS);