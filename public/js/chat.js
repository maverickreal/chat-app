const socket = io(),
    messageForm = document.querySelector('#form'),
    msg_tmplt = document.querySelector('#messageTemplate'),
    loc_tmplt = document.querySelector('#locationTemplate'),
    messages = document.querySelector('#messages'),
    // locations = document.querySelector('#location'),
    locationButton = document.querySelector('#locationButton');

function getDateTime(message, user = '') {
    return {
        message, dateTime: moment(new Date()).format('H:m'), user
    };
}

const { user, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
//console.log('           ' + user + ' ' + room + '           ');

socket.on('message', msg => {
    console.log(msg);
    const html = Mustache.render(msg_tmplt.innerHTML, msg);
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('location', msg => {
    console.log(msg);
    const html = Mustache.render(loc_tmplt.innerHTML, getDateTime(`https://google.com/maps?q=${msg.latitude},${msg.longitude}`, msg.user));
    messages.insertAdjacentHTML('beforeend', html);
});

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    messageForm.querySelector('button').setAttribute('disabled', 'disabled');

    socket.emit('message', { message: e.target.elements.message.value, room, user }, (err) => {
        if (err)
            console.log(err);
        else
            console.log('message delivered.');
        messageForm.querySelector('button').removeAttribute('disabled', 'disabled');
        messageForm.querySelector('input').value = '';
        messageForm.querySelector('input').focus();
    });
});

locationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation)
        return alert('geolocation api not supported');
    e.preventDefault();
    locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(pos => {
        socket.emit('location', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            room, user
        }, () => {
            console.log('Location delivered');
            locationButton.removeAttribute('disabled');
        });
    });
});

socket.emit('join', { user, room }, (err) => {
    alert(err);
    location.href = '/';
});