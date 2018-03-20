"use strict"

var voteModule = (function () {
    // Initial socket object
    var socket = {}, currentRoom = null, cnt1 = 0, cnt2 = 0, totalValue = 0, _comment = '';
    var url = "http://localhost:4300";

    var initialValues = function () {
        $('#countOption1').text(cnt1);
        $('#countOption2').text(cnt2);
        $('#totalValue').text(totalValue);
    };

    var registerEvents = function () {
        $('#resetRoom').click(function () {
            loader(true);
            resetSocket();
        });
    };

    var applyServerData = function (data) {
        if (data) {
            console.log('Server data', data);
            cnt1 = data.cnt1;
            cnt2 = data.cnt2;
            _comment = data.comments;
            $('#countOption1').text(cnt1);
            $('#countOption2').text(cnt2);
            $('#textArea').val(_comment);
        }
    };

    var registerSocket = function () {
        socket = io(url);
        var _currentRoom = localStorage.getItem('currentRoom') || currentRoom;
        socket.emit('join server room', { room: _currentRoom }, function (data) {
            currentRoom = data.room;
            localStorage.setItem('currentRoom', currentRoom);
            applyServerData(data.data);
        });
    };

    var resetSocket = function () {
        socket.emit('Reset data', {}, function () {
            socket.emit('leave room');
            setTimeout(function () {
                cnt1 = 0;
                cnt2 = 0;
                totalValue = 0;
                localStorage.clear();
                setTimeout(function () {
                    loader(false);
                }, 1000);
                socket.emit('join server room', { room: new Date().getTime() }, function (room) {
                    currentRoom = room;
                    localStorage.setItem('currentRoom', currentRoom);
                    $('#textArea').val('');
                    initialValues();
                });
            }, 2000);
        });
    };

    var applyCount = function () {
        if (totalValue > cnt1) {
            var percent = (cnt1 / totalValue) * 100;
            percent = parseInt(percent) + '%';
            $('#option1 > div').css('width', percent);
        }

        if (totalValue > cnt2) {
            var percent = (cnt2 / totalValue) * 100;
            percent = parseInt(percent) + '%';
            $('#option2 > div').css('width', percent);
        }
    };

    var applyOptions = function (data) {
        data.comment = data.comment || '';
        if (data.type === "option1") {
            cnt1++;
            $('#countOption1').text(cnt1);
        } else if (data.type === "option2") {
            cnt2++;
            $('#countOption2').text(cnt2);
        }
        if (data.comment.length > 2) {
            var val = $('#textArea').val();
            $('#textArea').val(val + '\n---> ' + data.comment);
        }
        applyCount();
    };

    var applyTotal = function () {
        socket.emit('getTotal', {}, function (data) {
            totalValue = data;
            $('#totalValue').text(data);
            applyCount();
        });
    };

    var listenAndShowData = function () {
        socket.on('vote_option', function (data) {
            console.log('data came', data);
            if (data.clientName === 'server') {
                applyOptions(data);
            }
        });
    };


    var init = function () {
        currentRoom = new Date().getTime();

        initialValues();

        // register socket
        registerSocket();

        // register jquery events
        registerEvents();

        // listen and show data
        listenAndShowData();

        setInterval(function () {
            applyTotal();
        }, 600)
    };

    return {
        init: init
    }
})();

$(function () {
    loader(true);
    setTimeout(function () {
        voteModule.init();
        setTimeout(function () {
            loader(false);
        }, 1000);
    }, 1000);
});

function loader(showLoader) {
    if (showLoader) {
        $('#sloader').show();
    } else {
        $('#sloader').hide();
    }
}