// Footer Script
fetch("footer.html")
      .then((response) => response.text())
      .then((data) => {
        document.getElementById("footer-placeholder").innerHTML = data;
      })
      .catch((error) => console.error("Error loading footer:", error));

// Add event listener to the phone number input field
document.getElementById('phoneNumber').addEventListener('input', function(event) {
  let phoneNumber = event.target.value;

  // Remove any non-numeric characters
  phoneNumber = phoneNumber.replace(/\D/g, '');

  // Add dashes after the third and sixth digits
  if (phoneNumber.length > 3 && phoneNumber.length <= 6) {
    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3);
  } else if (phoneNumber.length > 6) {
    phoneNumber = phoneNumber.slice(0, 3) + '-' + phoneNumber.slice(3, 6) + '-' + phoneNumber.slice(6, 10);
  }

  // Update the input value with formatted phone number
  event.target.value = phoneNumber;
});