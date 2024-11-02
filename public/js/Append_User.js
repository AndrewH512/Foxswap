document.addEventListener('DOMContentLoaded', () => {
    const url = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const username2 = params.get('username');

    console.log("username: " + username2);

    if (username2) {
        document.querySelectorAll('a').forEach(link => {
            const linkUrl = new URL(link.href);
            linkUrl.searchParams.set('username', username2);
            link.href = linkUrl.toString();
        });
    }
});
