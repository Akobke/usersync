let groupMappings = {};

function processCSVContent(csvContent, groupPrefix) {
    // Clear the output textarea
    document.getElementById('csvOutput').value = "";

    const rows = csvContent.split('\n');

    // Initialize counters for users created and updated
    let userCreatedCount = 0;
    let userUpdatedCount = 0;

    rows.forEach(row => {
        const columns = row.split(':'); // Split by ":"

        const username = columns[5];
        const displayName = columns[6];
        const email = columns[5] + "@fiu.edu";
        const group1 = groupPrefix + "-" + (groupMappings[columns[0] + columns[1]] || columns[0] + columns[1]);
        const group2 = (groupMappings[columns[10]] || columns[10]);

        // Split group2 by "/" and trim each part, then map to the groupMappings
        const additionalGroups = group2.split('/').map(part => {
            const trimmedPart = part.trim();
            return groupPrefix + "-" + (groupMappings[trimmedPart] || trimmedPart);
        });

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
                groups: [group1, ...additionalGroups]
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
                userUpdatedCount++;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

function removeAllGroups() {
    fetch('/apps/myapp/removeallgroups', {
        method: 'POST'
    }).then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("All groups (except admin) removed successfully.");
        }
    });
}

document.getElementById('selectFileButton').addEventListener('click', function() {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
	const groupPrefix = document.getElementById('groupPrefix').value;
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
                processCSVContent(csvContent,groupPrefix);
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
    OC.dialogs.filepicker("Select a CSV user list file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.text())
        .then(processCSVContent)
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});

document.getElementById('loadMappingsButton').addEventListener('click', function() {
    const fileInput = document.getElementById('groupMappingFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvContent = event.target.result;
            const rows = csvContent.split('\n');
            rows.forEach(row => {
                const columns = row.split(',');
                if (columns.length >= 2) {
                    const originalName = columns[0].trim();
                    const mappedName = columns[1].trim();
                    groupMappings[originalName] = mappedName;
                }
            });
            alert('Group mappings loaded successfully!');
        };
        reader.readAsText(file);
    } else {
        alert('Please select a valid CSV file.');
    }
});

document.getElementById('ncLoadMappingsButton').addEventListener('click', function() {
    OC.dialogs.filepicker("Select a CSV mapping file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.text())
        .then(processCSVContent)
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});