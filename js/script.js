let groupMappings = {};
let userUploadedMappings = false;
let groupPrefix = '';
let token = '';
let fileFormatSelection = "Default";


function processContent(content, mappings, delimiter = ":", rowSkips = 0) {
    console.log(content);
    const processedUsers = [];
    //const rows = content.trim().split("\n"); 
    const rows = content.split("\n"); 

    for (const row of rows) {
        console.log("Reading row: ",row);
        const columns = row.split(delimiter);
        const username = mappings.username(columns);
        const displayName = mappings.displayName(columns);
        const email = mappings.email(columns);
        const group1 = groupPrefix + mappings.group1(columns);

        console.log("Display name: ", displayName);
        console.log("group1: ", group1);
        
        // Handling of multiple majors
        const rawGroup2 = mappings.group2 ? mappings.group2(columns) : null;
        const additionalGroups = rawGroup2 
            ? rawGroup2.split('/').map(part => {
                const trimmedPart = part.trim();
                return groupPrefix  + (groupMappings[trimmedPart] || trimmedPart);
              })
            : [];

        console.log(additionalGroups);

        const user = {
            username: username,
            displayName: displayName,
            email: email,
            groups: [group1, ...additionalGroups]
        };
        
        console.log("Adding user: ",username,", displayName: ", displayName, ", email: ",email,", group1: ", group1);

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
        .catch(error => {
            console.error('Error:', error);
        });

        processedUsers.push(user);
    }
    //Send this data to the server to create the user and assign groups
    return processedUsers;
}

function processDefaultCSV(content) {
    const mappings = {
        username: columns => columns[5],
        displayName: columns => columns[6],
        email: columns => columns[5] + "@fiu.edu",
        group1: columns => (groupMappings[columns[0] + columns[1]] || columns[0] + columns[1]),
        group2: columns => groupMappings[columns[10]] || columns[10]
    };
    console.log("The following users were added or updated:")
    console.log(processContent(content, mappings));
}

// Function to process Canvas CSV
function processCanvasCSV(content) {
    const mappings = {
        username: columns => columns[3],
        displayName: columns => columns[0],
        email: columns => columns[3] + "@fiu.edu",
        group1: columns => (groupPrefix + columns[4].split('-')[2] + columns[4].split('-')[3]).toLowerCase(),
        group2: columns => null
    };
    console.log("File column mappings: ", mappings.username(0))
    processContent(content, mappings, ";", 2);
}

// Function to process Panthersoft XLSX
function processPanthersoftXLSX(content, filename) {
    const mappings = {
        username: columns => columns[2].split("@")[0],
        displayName: columns =>  columns[4].substring(0,columns[4].length-1)+ " "+columns[3].substring(1),
        email: columns => columns[2],
        group1: columns => "-"+filename.substring(0,filename.length-5).toLowerCase(),
        group2: columns => columns[7]
    };
    processContent(content, mappings, ",");
}

// Function to process CAPGroupsXLSX
function processCAPGroupsXLSX(content) {
    const mappings = {
        username: columns => columns[7].split("@")[0],
        displayName: columns => columns[9].substring(0,columns[9].length-1) + " " + columns[8].substring(1),
        email: columns => columns[7],
        group1: columns => "cap2",
        group2: columns => columns[12]
    };
    processContent(content, mappings, ",");
}

function xlsxToCSVString(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, {type: 'binary'});

        // Assuming your data is in the first sheet:
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the worksheet to CSV:
        let csvData = XLSX.utils.sheet_to_csv(worksheet);

        // Split by newline to get rows:
        const rows = csvData.split("\n");

        // If the data has at least one row (the header), remove it:
        if (rows.length > 0) {
            rows.shift();
        }

        // Merge multiline cell values:
        let mergedRows = [];
        let tempRow = "";
        rows.forEach(row => {
            tempRow += row;
            // Count quotation marks in the row:
            const quoteCount = (tempRow.match(/"/g) || []).length;
            // If the number of quotation marks is even, push the merged row to the result:
            if (quoteCount % 2 === 0) {
                mergedRows.push(tempRow);
                tempRow = "";
            }
        });

        // Preprocess each merged row:
        const processedRows = mergedRows.map(row => 
            // Remove newline characters within quotes:
            row.replace(/"\s*\n\s*"/g, ' ')
            // Convert to lowercase:
            .toLowerCase()
        );

        // Join the processed rows back together:
        csvData = processedRows.join("\n");

        callback(csvData);
    };
    reader.readAsBinaryString(file);
}

function removeAllGroups() {
    fetch('removeallgroups', {
        method: 'POST'
    }).then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("All groups (except admin) removed successfully.");
        }
    });
}
function removeAllUsers() {
    fetch('removeallusers', {
        method: 'POST'
    }).then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log("All users (except admin) removed successfully.");
        }
    });
}

function updateGroupNamesBasedOnMappings() {
    fetch('getallgroups')
    .then(response => response.json())
    .then(allGroups => {
        allGroups.forEach(groupName => {
            const prefix = groupName.substring(0, 5);
            const actualGroupName = groupName.substring(5,groupName.length); // Assuming a "-" after the prefix
            //console.log(allGroups)
            console.log('Found: ',actualGroupName)
            console.log('Groupname: ',groupName)
            console.log(groupMappings)
            console.log("Mapping:",groupMappings[actualGroupName])
            console.log("--------------------------------------------")
            if (groupMappings[actualGroupName]) {
                console.log('Working2')
                const newGroupName = prefix + groupMappings[actualGroupName];
                fetch('renamegroup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        oldGroupName: groupName,
                        newGroupName: newGroupName
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'error') {
                        console.error(data.message);
                    }
                });
            }
        });
    });
}

function getGroupPrefix(){
    console.log("Called group prefix")
    if(document.getElementById('groupPrefix').value == ""){
        console.log("Group Prefix is empty")
        checkForDefaultPrefix();
    }else{
        console.log("Group Prefix not empty")
        groupPrefix = document.getElementById('groupPrefix').value + "-";
    }
        
}

document.getElementById('selectFileButton').addEventListener('click', function() {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    if(!userUploadedMappings){
        checkForDefaultGroup();
    }
    getGroupPrefix()
    fileInput.type = 'file';
    fileInput.accept = '.csv, .xlsx';
    fileInput.style.display = 'none';

    // Append it to the body (required for it to be clickable)
    document.body.appendChild(fileInput);

    // Add a change event listener to process the file when selected
    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
            if (fileType === 'csv') {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const csvContent = event.target.result;
                    switch (fileFormatSelection) {
                        case 'Default':
                            console.log("Processing default csv...");
                            processDefaultCSV(csvContent);
                            break;
                        case 'Canvas':
                            console.log("Processing canvas csv...");
                            processCanvasCSV(csvContent);
                            break;
                        case 'Panthersoft':
                            // We assume that if it's a Panthersoft CSV, it's a mistake since Panthersoft is typically xlsx.
                            alert('Panthersoft files should be in .xlsx format.');
                            break;
                        case 'CAP2Groups':
                            // We assume that if it's a CAP2Groups CSV, it's a mistake since CAP2Groups is typically xlsx.
                            alert('CAP2Groups files should be in .xlsx format.');
                            break;
                        default:
                            alert('Unsupported file selection format.');
                    }
                };
                reader.readAsText(file);
            } else if (fileType === 'xlsx') {
                xlsxToCSVString(file, function(csvContent) {
                    switch (fileFormatSelection) {
                        case 'Panthersoft':
                            processPanthersoftXLSX(csvContent, file.name);
                            break;
                        case 'CAP2Groups':
                            processCAPGroupsXLSX(csvContent);
                            break;
                        default:
                            alert('Selected xlsx format not supported for the current selection.');
                    }
                });
            } else {
                alert('Unsupported file type.');
            }
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
        .then(data => {
            
        })
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});

document.getElementById('loadMappingsButton').addEventListener('click', function() {
    const fileInput = document.getElementById('groupMappingFile');
    const file = fileInput.files[0];
    console.log("mappingsButton")
    if (file) {
        userUploadedMappings = true;
        const reader = new FileReader();
        reader.onload = function(event) {
            loadMappings(event.target.result);
            console.log(event.target.result)
            updateGroupNamesBasedOnMappings();
        };
        reader.readAsText(file);
    } else if(checkForDefaultGroup()) {
        updateGroupNamesBasedOnMappings()
    }else{
        alert("Please provide a CSV file or have a default group mapping in the UserSyncConfig file")
    }
});

function loadMappings(content){
    console.log("Load Mappings")
    const rows = content.split('\n');
    groupMappings = {}; // Reset the groupMappings
    rows.forEach(row => {
        const columns = row.split(',');
        if (columns.length >= 2) {
            const originalName = columns[0].trim();
            const mappedName = columns[1].trim();
            groupMappings[originalName] = mappedName;
        }
    });
    //alert('Group mappings loaded successfully!');
    
}
document.getElementById('ncLoadMappingsButton').addEventListener('click', function() {
    OC.dialogs.filepicker("Select a CSV mapping file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.text())
        .then(userUploadedMappings = true)
        .then(data => {
            console.log(data)
            loadMappings(data)
        })
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});

function checkForDefaultGroup(){
    //getUserAuth();
    fetch(OC.linkToRemoteBase('files' + '/UserSyncConfig/groupmapping.csv'))
    .then(response => response.text())
    .then(data => {
        console.log(data)
        loadMappings(data)
        return true;
    })
    .catch(error => {
        console.log("No file found")
        return false;
    })
    
}

function checkForDefaultPrefix(){
    fetch(OC.linkToRemoteBase('files' + '/UserSyncConfig/groupprefix.txt'))
    .then(response => response.text())
    .then(data => {
        groupPrefix = data + "-"
    })
    .catch(error => {
        console.log("No file found")
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    const fileFormatDropdown = document.getElementById('fileFormatSelect');

    console.log('Initial File Format Selection:', fileFormatSelection);

    fileFormatDropdown.addEventListener('change', function() {
        fileFormatSelection = this.value;
        console.log('New File Format Selection:', fileFormatSelection);
    });
});

function preChecks(){

}


