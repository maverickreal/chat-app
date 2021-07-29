const socket = io(),
    messageForm = document.querySelector('#form'),
    sid_tmplt = document.querySelector('#sidebarTemplate'),
    msg_tmplt = document.querySelector('#messageTemplate'),
    loc_tmplt = document.querySelector('#locationTemplate'),
    sidebar = document.querySelector('#sidebar'),
    messages = document.querySelector('#messages'),
    // locations = document.querySelector('#location'),
    locationButton = document.querySelector('#locationButton');

function getDateTime(message, user = '') {
    return {
        message, user, dateTime: moment(new Date()).format('H:m')
    };
}

function autoScroll() {
    const newMessage = messages.lastElementChild,
        newMessageStyles = getComputedStyle(newMessage),
        newMessageMargin = parseInt(newMessageStyles.marginBottom),
        newMessageHeight = newMessage.offsetHeight + newMessageMargin,
        visibleHeight = messages.offsetHeight,
        containerHeight = messages.scrollHeight,
        scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset)
        messages.scrollTop = messages.scrollHeight;
}

const { user, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });
//console.log('           ' + user + ' ' + room + '           ');

socket.on('message', msg => {
    console.log(msg);
    const html = Mustache.render(msg_tmplt.innerHTML, msg);
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('location', msg => {
    console.log(msg);
    const html = Mustache.render(loc_tmplt.innerHTML, getDateTime(`https://google.com/maps?q=${msg.latitude},${msg.longitude}`, msg.user));
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', (roomData) => {
    const html = Mustache.render(sid_tmplt.innerHTML, roomData);
    sidebar.innerHTML = html;
})

messageForm.addEventListener('submit', e => {
    e.preventDefault();
    messageForm.querySelector('button').setAttribute('disabled', 'disabled');

    socket.emit('message', e.target.elements.message.value, (err) => {
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
            longitude: pos.coords.longitude
        }, () => {
            console.log('Location delivered');
            locationButton.removeAttribute('disabled');
        });
    });
});

socket.emit('join', user, room, (err) => {
    alert(err);
    location.href = '/';
});