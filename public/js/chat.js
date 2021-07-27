const socket = io(),
    form = document.querySelector('#form'),
    msg_tmplt = document.querySelector('#messageTemplate'),
    loc_tmplt = document.querySelector('#locationTemplate'),
    messages = document.querySelector('#messages'),
    locations = document.querySelector('#location'),
    locationButton = document.querySelector('#locationButton');

function getDateTime(message) {
    return {
        message, dateTime: moment(new Date()).format('H:m')
    };
}


socket.on('message', message => {
    console.log(message);
    const html = Mustache.render(msg_tmplt.innerHTML, message);
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('location', message => {
    console.log(message);
    const html = Mustache.render(loc_tmplt.innerHTML, getDateTime(`https://google.com/maps?q=${message.latitude},${message.longitude}`));
    locations.insertAdjacentHTML('beforeend', html);
});

form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelector('button').setAttribute('disabled', 'disabled');
    socket.emit('message', e.target.elements.send.value, (err) => {
        if (err)
            console.log(err);
        else
            console.log('message delivered.');
        form.querySelector('button').removeAttribute('disabled', 'disabled');
        form.querySelector('input').value = '';
        form.querySelector('input').focus();
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
            longitude: pos.coords.longitude
        }, () => {
            console.log('Location delivered');
            locationButton.removeAttribute('disabled');
        });
    });
});