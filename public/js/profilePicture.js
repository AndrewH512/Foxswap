function displayProfilePicture() {
    // Extract the username from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
  
    // Check if the username parameter exists
    if (username) {
      // Make a GET request to fetch user data, including the profile picture
      fetch(`/api/Users?username=${encodeURIComponent(username)}`)
        .then((response) => response.json()) // Parse the response as JSON
        .then((data) => {
          // Verify that data is returned and includes at least one user
          if (data.length > 0) {
            // Find the specific user object by matching the username
            const user = data.find((u) => u.Username === username);
            
            // Check if the user has a Profile_Picture property
            if (user && user.Profile_Picture) {
              // Create an <img> element to display the profile picture
              const profileImg = document.createElement("img");
              profileImg.src = user.Profile_Picture; // Set the image source to the profile picture URL
              profileImg.alt = "Profile Picture"; // Set the alt attribute for accessibility
              profileImg.classList.add("profile-picture"); // Add a CSS class for styling
  
              // Inline styling to set the profile picture's size and position
              profileImg.style.width = "90px"; // Width of the image
              profileImg.style.height = "100px"; // Height of the image
              profileImg.style.borderRadius = "60%"; // Round the edges for a circular or oval shape
              profileImg.style.position = "absolute"; // Position it absolutely
              profileImg.style.top = "20px"; // Set distance from the top
              profileImg.style.right = "20px"; // Set distance from the right side
  
              // Append the profile image to the body of the document
              document.body.appendChild(profileImg);
            }
          } else {
            // Log a message if no user data is found
            console.log("User not found.");
          }
        })
        .catch((error) => {
          // Log any error that occurs during the fetch operation
          console.error("Error fetching user data:", error);
        });
    } else {
      // Log a message if the username parameter is not in the URL
      console.log("No username found in the URL.");
    }
  }
  
  // Call the function to execute it and display the profile picture
  displayProfilePicture();