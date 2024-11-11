function searchBooks() {
    const query = document.getElementById("searchBar").value;
    const searchResultsHeading = document.getElementById("searchResultsHeading");
    const bookList = document.getElementById("bookList");

    // Display the entered query in a pop-up
    //alert(`Current Search Query: ${query}`);

    // Toggle the search results heading and clear results if the query is empty
    if (query.trim() === "") {
        searchResultsHeading.style.display = "none"; // Hide the heading
        bookList.innerHTML = ""; // Clear previous results
        return; // Exit the function
    } else {
        searchResultsHeading.style.display = "block"; // Show the heading if there is text
    }

    // Fetch search results based on the query
    fetch(`/searchBooks?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
            bookList.innerHTML = ""; // Clear previous results

            // Check if there are no results
            if (data.length === 0) {
                const noResultsMessage = document.createElement("p");
                noResultsMessage.textContent = "No results found"; // Message to show
                noResultsMessage.classList.add("no-results"); 
                bookList.appendChild(noResultsMessage);
                return; // Exit if no results
            }

            // Limit the results to only 4 items
            const limitedData = data.slice(0, 4);

            limitedData.forEach((book) => {
                // Create a card for each book using the createCard function
                const card = createCard(book);
                bookList.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error fetching search results:", error);
        });
}

// Front End CSS
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
