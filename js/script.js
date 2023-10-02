// Function to process the CSV content
/*
function processCSVContent(csvContent) {
	document.getElementById('csvOutput').value = csvContent;

	const rows = csvContent.split('\n');

	// Initialize counters for users created and updated
	let userCreatedCount = 0;
	let userUpdatedCount = 0;

	rows.forEach(row => {
		const columns = row.split(':');

		const username = columns[5];
		const displayName = columns[6];
		const email = columns[5] + "@fiu.edu";
		const group1 = columns[0] + columns[1] + " " + columns[3];
		const group2 = columns[10];
		console.log(username);
		// Send this data to the server to create the user and assign groups
		fetch('createuser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username,
				password: 'password',
				displayName,
				email,
				groups: [group1, group2]
			})
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					if (data.userCreated) {
						// Increment the user created count
						userCreatedCount++;
					}
					if (data.userUpdated) {
						// Increment the user updated count
						userUpdatedCount++;
					}
					// Update the output
					document.getElementById('csvOutput').value = `Number of users added: ${userCreatedCount}\nNumber of users updated: ${userUpdatedCount}`;
				} else {
					console.error(data.message);
				}
			})
			.catch(error => {
				console.error('Error:', error);
				console.log(body)
			});
	});
}*/

function processCSVContent(csvContent) {
	document.getElementById('csvOutput').value = csvContent;

	const rows = csvContent.split('\n');

	// Initialize counters for users created and updated
	let userCreatedCount = 0;
	let userUpdatedCount = 0;

	rows.forEach(row => {
		const columns = row.split(':'); // Split by ":" instead of ","
		
		const username = columns[5];
		const displayName = columns[6];
		const email = columns[5] + "@fiu.edu";
		const group1 = columns[0] + columns[1] + " " + columns[3];
		const group2 = columns[10];
		
		// Split group2 by "/" and trim each part
		const additionalGroups = group2.split('/').map(part => part.trim());

		// Send this data to the server to create the user and assign groups
		fetch('createuser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username,
				password: 'password',
				displayName,
				email,
				groups: [group1, ...additionalGroups] // Include additionalGroups in the groups array
			})
		})
			.then(response => response.json())
			.then(data => {
				if (data.status === 'success') {
					if (data.userCreated) {
						// Increment the user created count
						userCreatedCount++;
					}
					if (data.userUpdated) {
						// Increment the user updated count
						userUpdatedCount++;
					}
					// Update the output
				} else {
					console.error(data.message);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	});
	document.getElementById('csvOutput').value = `Number of users added: ${userCreatedCount}\nNumber of users updated: ${userUpdatedCount}`;
}

document.getElementById('selectFileButton').addEventListener('click', function() {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';

    // Append it to the body (required for it to be clickable)
    document.body.appendChild(fileInput);

    // Add a change event listener to process the file when selected
    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const csvContent = event.target.result;
                processCSVContent(csvContent);
            };
            reader.readAsText(file);
        }

        // Clean up by removing the file input element after use
        document.body.removeChild(fileInput);
    });

    // Programmatically click the file input to open the file dialog
    fileInput.click();
});


document.getElementById('browseButton').addEventListener('click', function() {
    OC.dialogs.filepicker("Select a CSV file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.text())
        .then(processCSVContent)
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});
