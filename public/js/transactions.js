let allTransactions = []; // Array to store all transactions

// Function to fetch and display transactions
function loadTransactions() {
  fetch("/api/viewTran", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      allTransactions = data; // Store all transactions for filtering
      displayTransactions(data); // Display all transactions initially
    })
    .catch((error) => {
      console.error("Error fetching transactions:", error);
      const transactionsContainer =
        document.querySelector(".main-content");
      transactionsContainer.innerHTML =
        "<p>Error loading transactions. Please try again later.</p>";
    });
}

// Function to display transactions
function displayTransactions(transactions) {
  const transactionsContainer = document.querySelector(".main-content");
  transactionsContainer.innerHTML = ""; // Clear existing content

  if (transactions.length > 0) {
    transactions.forEach((transaction) => {
      const transactionDiv = document.createElement("div");
      transactionDiv.classList.add("transaction-item");
      transactionDiv.innerHTML = `
                    <img src="${transaction.Cover_Picture || "default-cover.jpg"
      }" alt="Book Cover" class="cover-picture">
                    <div>
                        <h3>Transaction Number: ${transaction.Transaction_ID
      }</h3>
                        <p>The book "${transaction.Title}" was sold by ${transaction.Seller
      } and bought by ${transaction.Buyer} for the price of $${transaction.Transaction_Price
      }.</p>
                        <p><strong>Post Status:</strong> ${transaction.Post_Status
      }</p>
                        <p><strong>Book Condition:</strong> ${transaction.Book_Condition
      }</p>
                        <p><strong>Transaction Type:</strong> ${transaction.Transaction_Type
      }</p>
                        <p><strong>Due Date:</strong> ${transaction.Due_Date || "N/A"
      }</p>
                    </div>
                `;
      transactionsContainer.appendChild(transactionDiv);
    });
  } else {
    transactionsContainer.innerHTML = "<p>No transactions found.</p>";
  }
}

// Function to filter transactions based on transaction number, seller, or buyer
function filterTransactions() {
  const searchQuery = document
    .getElementById("search-bar")
    .value.toLowerCase();
  const filteredTransactions = allTransactions.filter((transaction) => {
    const transactionID = transaction.Transaction_ID.toString().toLowerCase();
    const seller = transaction.Seller.toLowerCase();
    const buyer = transaction.Buyer.toLowerCase();
    
    // Check if the search query matches the transaction ID, seller, or buyer
    return transactionID.includes(searchQuery) || seller.includes(searchQuery) || buyer.includes(searchQuery);
  });

  displayTransactions(filteredTransactions); // Display filtered transactions
}

// Load transactions when the page is loaded
window.onload = loadTransactions;
