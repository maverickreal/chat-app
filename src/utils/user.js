const users = [];

const addUser = (Id, User, Room) => {
    User = User.trim().toLowerCase();
    Room = Room.trim().toLowerCase();

    if (!(User && Room))
        return { error: 'user and room are required!' };

    if (users.find(user => user.room === Room && user.user === User))
        return { error: 'user is in use!' };

    let tmpObj = { id: Id, user: User, room: Room };
    users.push(tmpObj);
    return { error: '', ...tmpObj };
}

const removeUser = id => {
    const ind = users.findIndex(user => user.id === id);
    return ind == -1 ? {} : users.splice(ind, 1)[0];
}
const getUser = user => {
    for (i in users) {
        if (users[i].id == user)
            return users[i];
    }
    return {};
}

const getRoomMembers = room => {
    const res = [];
    for (i in users) {
        if (users[i].room == room)
            res.push(users[i]);
    }
    return res;
}

/* addUser('a', 'b', 'c');
addUser('b', 'c', 'd');
addUser('b', 'c', 'd');
addUser('c', 'd', 'd');

console.log(users);

console.log(getUser('c'));
console.log(getRoomMembers('d')); */
module.exports = { addUser, removeUser, getUser, getRoomMembers };