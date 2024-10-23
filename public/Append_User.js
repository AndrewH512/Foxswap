// Get the current URL
const url = window.location.href;

console.log("hello!!!")

// Create a URLSearchParams object to parse the query string
const params = new URLSearchParams(window.location.search);

// Get the value of the 'username' parameter
const username2 = params.get('username');

console.log("username: " + username2)

document.querySelectorAll('a').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('username', username2);
    link.href = url.toString();
});

