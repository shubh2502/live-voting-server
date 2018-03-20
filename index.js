var express = require('express');
var app = express();
var server = require('http').createServer(app); 
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');

server.listen(4300, function () {
    console.log('Server listening to port: 4300');
});

// server.listen(4300);

app.use('/server',express.static(path.join(__dirname, 'server')));

app.use('/client',express.static(path.join(__dirname, 'client')));

app.get('/server', function (req, res) {
    res.sendFile(__dirname + '/server/index.html');
});

app.get('/client', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

var currentRoom = null, dataObj = {};

io.on('connection', function (socket) {

    socket.on('join server room', function (data, fs) {
        // console.log('Server joined');
        currentRoom = data.room;
        socket.join(data.room);
        socket.broadcast.emit('Join this room', { room: data.room });
        fs({ room: currentRoom, data: dataObj[currentRoom] });
    });

    socket.on('Reset data', function (data, fs) {
        currentRoom = null;
        dataObj = {};
        socket.broadcast.emit('Leave this room', { room: currentRoom });
        fs(currentRoom);
    });

    socket.on('join room', function (data) {
        // console.log('çurrent room', currentRoom);
        socket.join(data.room || currentRoom);
    });

    socket.on('vote', function (data, fs) {
        socket.to(data.room || currentRoom).emit('vote_option', data);
        applyObject(currentRoom, data);
        //send response
        fs(currentRoom);
    });

    socket.on('leave room', function (data) {
        socket.leave(currentRoom);
    });

    socket.on('check room', function (room, fs) {
        var flag = room == currentRoom;
        fs(flag);
    });

    socket.on('getTotal', function (data, fs) {
        var total = getNoOfUsers();
        fs(total);
    });

});

function applyObject(currenRoom, data) {
    dataObj[currenRoom] = dataObj[currenRoom] || {};
    dataObj[currenRoom].comments = dataObj[currenRoom].comments || '';
    data.comment = data.comment || '';
    dataObj[currenRoom].cnt1 = dataObj[currenRoom].cnt1 || 0;
    dataObj[currenRoom].cnt2 = dataObj[currenRoom].cnt2 || 0;
    if (data.type === 'option1') {
        dataObj[currenRoom].cnt1++;
    } else if (data.type === 'option2') {
        dataObj[currenRoom].cnt2++;
    }
    if (data.comment.length > 2) {
        dataObj[currenRoom].comments = dataObj[currenRoom].comments + '\n---> ' + data.comment;
    }
};

function getNoOfUsers() {
    // console.log('----------------------------------------------');
    var clients = io.sockets.adapter.rooms;
    var total = 0;
    for (var clientId in clients) {
        if (io.sockets.connected[clientId])
            total++;
    }
    // console.log('----------------------------------------------');
    return total;
}