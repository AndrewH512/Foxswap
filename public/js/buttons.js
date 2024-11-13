// Javascript file to keep the username in the URL when clicking on buttons
const username = new URLSearchParams(window.location.search).get('username');

function redirectTo(page) {
    window.location.href = `${page}?username=${username}`;
}