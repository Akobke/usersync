document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvContent = event.target.result;
            document.getElementById('csvOutput').value = csvContent;

            // Process the CSV content
            const rows = csvContent.split('\n');

	    rows.forEach(row => {
        	const columns = row.split(',');
        
        	const username = columns[4];
        	const displayName = columns[5];
        	const email = columns[4] + "@fiu.edu";
        	const group1 = columns[0] + " " + columns[2];
        	const group2 = columns[8];
        
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
        });
    });
            // ... (rest of the code to process rows)
        };
        reader.readAsText(file);
    }
});
