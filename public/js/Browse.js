

function searchBooks() {
    const query = document.getElementById("searchBar").value;

    // Fetch search results based on the query
    fetch(`/searchBooks?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
            const bookList = document.getElementById("bookList");
            bookList.innerHTML = ""; // Clear previous results

            data.forEach((book) => {
                // Create a card for each book using the createCard function
                const card = createCard(book);
                bookList.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error fetching search results:", error);
        });
}

function createCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-id", item.Book_ID);

    card.innerHTML = `
      <img src="${item.Cover_Picture}" alt="Cover Image">
      <h3>${item.Title}</h3>
      <p class="condition"><strong>Condition:</strong> ${item.Book_Condition}</p>
      <p class="seller"><strong>Seller:</strong> ${item.Seller}</p>
      <p class="price"><strong>Price:</strong> $${item.Price}</p>
    `;

    card.addEventListener("click", function () {
        // Handle card click 
        window.location.href = `textbook_info.html?id=${item.Post_ID}&username=${encodeURIComponent(username)}`;
    });

    return card;
}