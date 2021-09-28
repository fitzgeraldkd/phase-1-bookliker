document.addEventListener("DOMContentLoaded", function() {
    sendRequest('books', '', addBooks);
});

function showDetails(book, userId=1) {
    const panel = document.getElementById('show-panel');

    const image = newElement('img');
    image.src = book.img_url;

    const title = newElement('h1', book.title);;
    const subtitle = newElement('h2', book.subtitle);
    const author = newElement('h2', book.author);
    const description = newElement('p', book.description);
    
    const users = newElement('ul');
    const currentLikes = book.users;
    currentLikes.forEach((user) => {
        const userItem = newElement('li', user.username);
        users.appendChild(userItem);
    });

    const likeBttn = newElement('button');
    likeBttn.id = `like-button-${book.id}`;
    if (book.users.some((user) => user.id === userId)) {
        likeBttn.textContent = "Unlike";
    } else {
        likeBttn.textContent = "Like";
    }
    likeBttn.addEventListener('click', (e) => handleLikeClick(e, book.id));

    panel.replaceChildren(image, title, subtitle, author, description, users, likeBttn);
}

function newElement(tag, textContent='') {
    const element = document.createElement(tag);
    element.textContent = textContent;
    return element;
}

function sendRequest(resource, id='', callback=() => {}, options={}) {
    id = String(id).length > 0 ? `/${id}` : '';
    fetch(`http://localhost:3000/${resource}${id}`, options)
        .then(response => response.json())
        .then(results => callback(results));
}

function addBooks(books) {
    const bookList = document.getElementById('list');
    books.forEach((book) => {
        const newItem = newElement('li', book.title);
        const callback = (results) => showDetails(results);
        newItem.addEventListener('click', () => sendRequest('books', book.id, callback));
        bookList.appendChild(newItem);
    });
}

function handleLikeClick(e, bookId, userId=1) {
    const callback = (activeUser, book) => toggleLike(activeUser, book)
    const userCallback = (user) => sendRequest('books', bookId, (results) => callback(user, results));
    sendRequest('users', userId, userCallback);
}

function toggleLike(activeUser, book) {
    const userLiked = book.users.some((user) => user.id === activeUser.id);
    const newLikes = {};
    const button = document.getElementById(`like-button-${book.id}`);
    if (userLiked) {
        newLikes.users = book.users.filter((user) => user.id !== activeUser.id);
        button.textContent = 'Like';
    } else {
        newLikes.users = [...book.users, activeUser];
        button.textContent = 'Unlike';
    }
    const callback = (results) => showDetails(results);
    const options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLikes)
    };
    sendRequest('books', book.id, callback, options);
}