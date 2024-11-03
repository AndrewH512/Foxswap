

function searchBooks() {
    const query = document.getElementById("searchBar").value;

    fetch(`/searchBooks?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(books => {
            renderBooks(books);
        })
        .catch(error => console.error("Error fetching books:", error));
}

function renderBooks(books) {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = ''; // Clear previous results

    books.forEach(book => {
        const bookItem = document.createElement("div");
        bookItem.classList.add("book-item");
        bookItem.innerHTML = `
        <h3>${book.Title}</h3>
        <p>Author: ${book.Author}</p>
        <p>ISBN: ${book.ISBN}</p>
        <p>Class: ${book.Class_Name}</p>
        <p>Price: ${book.Price}</p>
      `;
        bookList.appendChild(bookItem);
    });
}