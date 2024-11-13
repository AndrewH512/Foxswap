// Fetch users to populate the dropdown
fetch('/api/reports/users')
    .then(response => response.json())
    .then(users => {
        const dropdown = document.getElementById('userDropdown');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.messagee;
            option.textContent = user.messagee;
            dropdown.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching users:', error);
    });

// Handle report submission on button click
document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector('button[type="submit"]');
    const form = document.querySelector("form");
    
    submitButton.addEventListener('click', (event) => {
        event.preventDefault();  // Prevents default form submission

        const selectedUser = document.getElementById('userDropdown').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;

        // Check if data is captured correctly
        console.log('Form Data:', { selectedUser, title, description });

        if (!selectedUser || !title || !description) {
            alert('Please fill in all fields.');
            return;
        }

        // Send report to the server
        fetch('/api/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reportedUser: selectedUser,
                title: title,
                description: description
            })
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message || 'Report submitted successfully!');
            })
            .catch(error => {
                console.error('Error reporting user:', error);
            });
    });
});

// list reports
document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/listReports')
        .then(response => response.json())
        .then(reports => {
            const reportList = document.getElementById('reportList');
            reports.forEach(report => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                
                link.href = `viewReports.html?id=${report.Report_ID}`;
                link.textContent = report.Title;

                listItem.appendChild(link);
                reportList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching report titles:', error);
        });
});

// View Reports
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportID = urlParams.get('id');

    if (reportID) {
        fetch(`/api/report/${reportID}`)
            .then(response => response.json())
            .then(report => {
                document.getElementById('reportTitle').textContent = report.Title;
                document.getElementById('reportDescription').textContent = report.Description;
                document.getElementById('reportedUser').textContent = report.Reported_User;
                document.getElementById('reportingUser').textContent = report.Reporting_User;
            })
            .catch(error => {
                console.error('Error fetching report details:', error);
            });
    }
});