"use strict"

$(function () {
    var url = "http://localhost:4300";

    var socket = io(url);

    socket.on('Join this room', function (data) {
        socket.emit('join room', data);
        localStorage.clear();
        $('#txtValue').val('');
        $('#panel_submit').show();
        $('#panel_submitted').hide();
    });

    socket.emit('join room', {});

    checkInitial();

    function checkInitial() {
        loader(true);
        if (localStorage.getItem('submitted')) {
            socket.emit('check room', localStorage.getItem('submitted'), function (submitted) {
                loader(false);
                if (submitted) {
                    $('#panel_submit').hide();
                    $('#panel_submitted').show();
                } else {
                    $('#txtValue').val('');
                    $('#panel_submit').show();
                    $('#panel_submitted').hide();
                }
            });
        } else {
            loader(false);
            $('#txtValue').val('');
            $('#panel_submit').show();
            $('#panel_submitted').hide();
        }
    }

    $("#example").fadeIn(500);
    $("#example .close-x").click(function () {
        $("#example").hide();
    });
    $('.li-vil').click(function () {
        $('.cnt .imgs').removeClass('city').addClass('vil');
        $(this).addClass('active').siblings().removeClass('active');
        $('.cnt').css({ 'background': '#004282' });
        $('.cnt p').css({ 'color': '#fff' });
    });
    $('.li-city').click(function () {
        $('.cnt .imgs').removeClass('vil').addClass('city');
        $(this).addClass('active').siblings().removeClass('active');
        $('.cnt').css({ 'background': '#e5df9d' });
        $('.cnt p').css({ 'color': '#303030' });
    });
    $('#submit_vote').click(function () {
        var data = {};
        data.clientName = 'server';
        if ($('.li-city').hasClass('active')) {
            data.type = 'option2';
        } else if ($('.li-vil').hasClass('active')) {
            data.type = 'option1';
        }
        data.comment = $('#txtValue').val();
        loader(true);
        socket.emit('vote', data, function (room) {
            console.log('data submitted');
            localStorage.setItem('submitted', room);
            $('#panel_submit').hide();
            $('#panel_submitted').show();
            loader(false);
        });
    });

    socket.on('Leave this room', function (data) {
        socket.emit('leave room');
    });

    function loader(showLoader) {
        if (showLoader) {
            $('#sloader').show();
        } else {
            $('#sloader').hide();
        }
    }
});

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}