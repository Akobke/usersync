let groupMappings = {};
let userUploadedMappings = false;
let groupPrefix = '';
let token = '';
let fileFormatSelection = "Default";

let userCreatedCount = 0;
let userUpdatedCount = 0;
let groupsUpdatedCount = 0;
let groupsCreatedCount = 0;

// Clear the output textarea
document.getElementById('csvOutput').value = "";
let textArea = document.getElementById('csvOutput');

async function processContent(content, mappings, delimiter = ":", rowSkips = 0) {
    console.log("[processContent] - Processing file...");
    const processedUsers = [];
    const rows = content.split("\n");

    const userPromises = rows.map(async (row) => {
        // Skip rows if needed, for example headers or empty lines
        if (rowSkips > 0) {
            rowSkips--;
            return null;
        }

        const columns = row.split(delimiter);

        const username = mappings.username(columns);
        const displayName = mappings.displayName(columns);
        const email = mappings.email(columns);

        let group1 = mappings.group1(columns);
        const groupMappingValue = groupMappings[group1];
        if (groupMappingValue !== undefined) {
            group1 = groupMappingValue;
        }
        group1 = groupPrefix + group1;

        // Handling of multiple majors
        const rawGroup2 = mappings.group2 ? mappings.group2(columns) : null;
        const additionalGroups = rawGroup2 
            ? rawGroup2.split('/').map(part => {
                const trimmedPart = part.trim();
                return groupPrefix  + (groupMappings[trimmedPart] || trimmedPart);
              })
            : [];

        const user = {
            username: username,
            displayName: displayName,
            email: email,
            groups: [group1, ...additionalGroups]
        };

        if(username.length<6 || username.length>9){
            document.getElementById('csvOutput').value += `Invalid username. Skipping row\n\n`;
            return null;
        }
        
        console.log("[processContent] - Processing user: ",username,", displayName: ", displayName, ", email: ",email,", group1: ", group1);

        try {
            const response = await fetch('createuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password: 'password', // Consider securing the password handling
                    displayName,
                    email,
                    groups: [group1, ...additionalGroups]
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                if (data.action === 'created') {
                    userCreatedCount++;
                    document.getElementById('csvOutput').value += "User created - [username: "+data.username+", display-name: "+data.displayName+", email: "+data.email+", groups: "+data.groups+"]\n\n";
                    console.log("[processContent] - User ",username," added");
                } else if (data.action === 'updated') {
                    userUpdatedCount++;
                    document.getElementById('csvOutput').value += "User updated - [username: "+data.username+", display-name: "+data.displayName+", email: "+data.email+", groups: "+data.groups+"]\n\n";
                    console.log("[processContent] - User ",username," updated");
                }
            }
        } catch (error) {
            console.error('[processContent] - Error:', error);
        }

        processedUsers.push({ username, displayName, email, groups: [group1, ...additionalGroups] });
    });
    //document.getElementById('csvOutput').value += "Finished processing file.\n------------------------\n";

    // Wait for all the user processing to complete
    await Promise.all(userPromises);

    // Return the processed users after all have been processed
    return processedUsers;
}

function processDefaultCSV(content) {
    const mappings = {
        username: columns => columns[5],
        displayName: columns => columns[6],
        email: columns => columns[5] + "@fiu.edu",
        group1: columns => (columns[0] + columns[1]).replace(/\s+/g, '').toLowerCase(),
        group2: columns => (columns[10]).replace(/\s+/g, '').toLowerCase()
    };
    //console.log("The following users were added or updated:")
    document.getElementById('csvOutput').value += `Processing Default CSV...\n\n`;
    processContent(content, mappings);
}

// Function to process Canvas CSV
function processCanvasCSV(content) {
    const mappings = {
        username: columns => columns[3],
        displayName: columns => columns[0],
        email: columns => columns[3] + "@fiu.edu",
        group1: columns => (columns[4].split('-')[2] + columns[4].split('-')[3]).replace(/\s+/g, '').toLowerCase(),
        group2: columns => null
    };
    //console.log("File column mappings: ", mappings.username(0))
    document.getElementById('csvOutput').value += `Processing Canvas CSV...\n\n`;
    processContent(content, mappings, ";", 2);
}

// Function to process Panthersoft XLSX
function processPanthersoftXLSX(content, filename) {
    const mappings = {
        username: columns => columns[2].split("@")[0],
        displayName: columns =>  columns[4].substring(0,columns[4].length-1)+ " "+columns[3].substring(1),
        email: columns => columns[2],
        group1: columns => filename.substring(0,filename.length-5).split('/').pop().replace(/\s+/g, ''),
        group2: columns => columns[7].replace(/[\n\r\s"']+/g, '').toLowerCase() // Removes newlines, spaces, and quotations
    };
    document.getElementById('csvOutput').value += `Processing Panthersoft XLSX...\n\n`;
    processContent(content, mappings, ",");
}

// Function to process CAPGroupsXLSX
function processCAPGroupsXLSX(content) {
    const mappings = {
        username: columns => columns[7].split("@")[0],
        displayName: columns => columns[9].substring(0,columns[9].length-1) + " " + columns[8].substring(1),
        email: columns => columns[7],
        group1: columns => columns[11].replace(/\s+/g, '').toLowerCase(),
        group2: columns => columns[12].replace(/\s+/g, '').toLowerCase()
    };
    document.getElementById('csvOutput').value += `Processing CAP Groups XLSX...\n\n`;
    processContent(content, mappings, ",");
}

function xlsxToCSVString(file, callback) {
    console.log("[xlsxToCSVString] - Function called");
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
    console.log("[xlsxToCSVString] - File processed");
}

async function updateGroupNamesBasedOnMappings() {
    console.log("[updateGroupNameBasedOnMappings] - Executing function...");
    try {
        const response = await fetch('getallgroups');
        const allGroups = await response.json();

        const groupPromises = allGroups.map(async (groupName) => {
            const dashIndex = groupName.indexOf('-'); // Find the index of the first dash
            const prefix = groupName.substring(0, dashIndex);
            const actualGroupName = groupName.substring(dashIndex+1); // Assuming a "-" after the prefix
            console.log("[updateGroupNameBasedOnMappings] - Found prefix: ",prefix,", and group name: ",actualGroupName);

            if (groupMappings[actualGroupName]) {
                const newGroupName = prefix + "-"+groupMappings[actualGroupName];

                try {
                    const renameResponse = await fetch('renamegroup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            oldGroupName: groupName,
                            newGroupName: newGroupName
                        })
                    });
                    const data = await renameResponse.json();
                    if (data.status === 'success') {
                        if (data.action === 'updated') {
                            groupsUpdatedCount++;
                            console.log(`[updateGroupNameBasedOnMappings] - Group updated from ${groupName} to ${newGroupName}`);
                        }
                    } else if (data.status === 'error') {
                        console.error(data.message);
                    }
                } catch (error) {
                    console.error('[updateGroupNameBasedOnMappings] - Error:', error);
                }
            }
        });

        // Wait for all the group renamings to complete
        await Promise.all(groupPromises);

        // Now update the log on the screen
        console.log(`[updateGroupNameBasedOnMappings] - Number of groups updated: ${groupsUpdatedCount}`);
        document.getElementById('csvOutput').value += `Number of groups updated: ${groupsUpdatedCount}\n\n`;
        // Update the on-screen log if necessary, for example:
        //document.getElementById('logOutput').value = `Groups updated: ${groupsUpdatedCount}\nGroups created: ${groupsCreatedCount}`;
    } catch (error) {
        console.error('[updateGroupNameBasedOnMappings] - Error fetching groups:', error);
    }
}

function loadMappings(content){
    console.log("[Load Mappings] - Loading mappings");
    const rows = content.split('\n');
    groupMappings = {}; // Reset the groupMappings
    rows.forEach(row => {
        const columns = row.split(',');
        if (columns.length >= 2) {
            const originalName = columns[0].trim().replace(/\s+/g, '').toLowerCase();
            const mappedName = columns[1].trim();
            groupMappings[originalName] = mappedName;
        }
    });
    console.log("[Load Mappings] - Mappings Loaded!");
    document.getElementById('csvOutput').value += "Mappings loaded\n\n";
    //alert('Group mappings loaded successfully!');
}

function checkForDefaultGroup(){
    //getUserAuth();
    console.log("[checkDefaultGroup] - Searching for default group...");
    fetch(OC.linkToRemoteBase('files' + '/UserSyncConfig/groupmapping.csv'))
    .then(response => response.text())
    .then(data => {
        console.log("[checkDefaultGroup] - Default group found!");
        loadMappings(data)
        return true;
    })
    .catch(error => {
        console.log("[checkDefaultGroup] - No default group found");
        return false;
    })
}

async function checkForDefaultPrefix() {
    console.log("[checkDefaultPrefix] - Searching for default prefix...");
    try {
        const response = await fetch(OC.linkToRemoteBase('files' + '/UserSyncConfig/groupprefix.txt'));
        if (!response.ok) {
            throw new Error('No default prefix found');
        }
        const data = await response.text();
        console.log("[checkDefaultPrefix] - Default prefix found!");
        groupPrefix = data.trim();
        return groupPrefix; // Return the fetched prefix
    } catch (error) {
        console.log("[checkDefaultPrefix] - No default prefix found");
        return ""; // Return an empty string if no prefix is found
    }
}

async function getGroupPrefix() {
    console.log("[getGroupPrefix] - Searching for group prefix...");
    let localPrefix = document.getElementById('groupPrefix').value.trim();

    if (localPrefix === "") {
        console.log("[getGroupPrefix] - Group prefix is empty");
        const defaultPrefix = await checkForDefaultPrefix();

        if (defaultPrefix !== "") {
            console.log("[getGroupPrefix] - Default group prefix found!");
            if (defaultPrefix.indexOf("-") < 0) { // Check if user added dash. If not add one.
                groupPrefix = defaultPrefix + "-";
            } else {
                groupPrefix = defaultPrefix;
            }
            
            return 1;
        }
    } else {
        console.log("[getGroupPrefix] - Group prefix found!");
        groupPrefix = localPrefix;
        if (groupPrefix.indexOf("-") < 0) { // Check if user added dash. If not add one.
            groupPrefix += "-";
        }
        return 1;
    }
    return 0;
}

// // Load CSV/XLSX user list from local file button event listener
// document.getElementById('selectFileButton').addEventListener('click', async function() {
//     console.log('[selectFileButton] - Local file browse button clicked!');

//     // Create a hidden file input element
//     const fileInput = document.createElement('input');

//     if(!userUploadedMappings){
//         checkForDefaultGroup();
//     }

//     const hasPrefix = await getGroupPrefix(); // Waits to see if default prefix is found in nextcloud

//     if(hasPrefix == 0) {
//         console.log('[selectFileButton] - No prefix found!');
//         alert("Please specify a prefix, or add a default prefix to /UserSyncConfig/groupprefix.txt");
//         return;
//     }

//     fileInput.type = 'file';
//     fileInput.accept = '.csv, .xlsx';
//     fileInput.style.display = 'none';

//     // Append it to the body (required for it to be clickable)
//     document.body.appendChild(fileInput);

//     // Add a change event listener to process the file when selected
//     fileInput.addEventListener('change', function() {
//         const file = fileInput.files[0];
//         if (file) {
//             console.log('[selectFileButton] - Local file browse selected');
//             const fileType = file.name.split('.').pop().toLowerCase();
//             if (fileType === 'csv') {
//                 const reader = new FileReader();
//                 reader.onload = function(event) {
//                     const csvContent = event.target.result;
//                     switch (fileFormatSelection) {
//                         case 'Default':
//                             console.log("[selectFileButton] - Processing default csv...");
//                             processDefaultCSV(csvContent);
//                             break;
//                         case 'Canvas':
//                             console.log("[selectFileButton] - Processing canvas csv...");
//                             processCanvasCSV(csvContent);
//                             break;
//                         case 'Panthersoft':
//                             // We assume that if it's a Panthersoft CSV, it's a mistake since Panthersoft is typically xlsx.
//                             console.log("[selectFileButton] - Invalid file selection");
//                             alert('Panthersoft files should be in .xlsx format.');
//                             break;
//                         case 'CAP2Groups':
//                             // We assume that if it's a CAP2Groups CSV, it's a mistake since CAP2Groups is typically xlsx.
//                             console.log("[selectFileButton] - Invalid file selection");
//                             alert('CAP2 Groups files should be in .xlsx format.');
//                             break;
//                         default:
//                             alert('Unsupported file selection format.');
//                     }
//                 };
//                 reader.readAsText(file);
//             } else if (fileType === 'xlsx') {
//                 xlsxToCSVString(file, function(csvContent) {
//                     switch (fileFormatSelection) {
//                         case 'Panthersoft':
//                             console.log("[selectFileButton] - Processing Panthersoft xlsx...");
//                             processPanthersoftXLSX(csvContent, file.name);
//                             break;
//                         case 'CAP2Groups':
//                             console.log("[selectFileButton] - Processing CAP2Groups xlsx...");
//                             processCAPGroupsXLSX(csvContent);
//                             break;
//                         default:
//                             alert('Selected xlsx format not supported for the current selection.');
//                     }
//                 });
//             } else {
//                 alert('Unsupported file type.');
//             }
//         }
//         // Clean up by removing the file input element after use
//         document.body.removeChild(fileInput);
//         //textArea.value += 'Finished processing file\n\n';
//     });

//     // Programmatically click the file input to open the file dialog
//     fileInput.click();
// });

// // Load CSV/XLSX user list from nextcloud file button event listener
// document.getElementById('ncBrowseButton').addEventListener('click', function() {
//     console.log('[ncBrowseButton] - Nextcloud file browse button clicked!');
//     OC.dialogs.filepicker("Select a CSV/XLSX user list file", function(targetPath) {
//         fetch(OC.linkToRemoteBase('files' + targetPath))
//         .then(response => response.text())
//         .then(data => {
//             console.log('[ncBrowseButton] - File selected');
//         })
//         .catch(error => {
//             console.error('[ncBrowseButton] - Error fetching the file:', error);
//         });
//     }, false, ["text/csv"], true);
// });


// Helper function to handle CSV content based on file format selection
function handleCSVContent(csvContent, fileFormatSelection) {
    switch (fileFormatSelection) {
        case 'Default':
            console.log("[handleCSVContent] - Processing default csv...");
            processDefaultCSV(csvContent);
            break;
        case 'Canvas':
            console.log("[handleCSVContent] - Processing canvas csv...");
            processCanvasCSV(csvContent);
            break;
        case 'Panthersoft':
            console.log("[handleCSVContent] - Invalid file selection");
            alert('Panthersoft files should be in .xlsx format.');
            break;
        case 'CAP2Groups':
            console.log("[handleCSVContent] - Invalid file selection");
            alert('CAP2 Groups files should be in .xlsx format.');
            break;
        default:
            alert('Unsupported file selection format.');
    }
}

// Helper function to handle XLSX content based on file format selection
function handleXLSXContent(csvContent, fileFormatSelection, fileName) {
    switch (fileFormatSelection) {
        case 'Panthersoft':
            console.log("[handleXLSXContent] - Processing Panthersoft xlsx...");
            processPanthersoftXLSX(csvContent, fileName);
            break;
        case 'CAP2Groups':
            console.log("[handleXLSXContent] - Processing CAP2Groups xlsx...");
            processCAPGroupsXLSX(csvContent);
            break;
        default:
            alert('Selected xlsx format not supported for the current selection.');
    }
}

// Common file processing function for both local and Nextcloud files
function processFile(file, isLocal = true) {
    const fileType = isLocal ? file.name.split('.').pop().toLowerCase() : file.type.split('.').pop().toLowerCase();
    if (fileType === 'csv'||fileType === 'text/csv') {
        const reader = new FileReader();
        reader.onload = function(event) {
            handleCSVContent(event.target.result, fileFormatSelection);
        };
        reader.readAsText(file);
    } else if (fileType === 'xlsx'||fileType ==='sheet') {
        xlsxToCSVString(file, function(csvContent) {
            handleXLSXContent(csvContent, fileFormatSelection, file.name);
        });
    } else {
        console.log("Filetype: ", fileType);
        console.log('Name, ',file.name);
        console.log(file.data);
        alert('Unsupported file type.');
    }
}

// Event listener for local file selection button
document.getElementById('selectFileButton').addEventListener('click', async function() {
    console.log('[selectFileButton] - Local file browse button clicked!');

    // Create a hidden file input element
    const fileInput = document.createElement('input');

    if(!userUploadedMappings){
        checkForDefaultGroup();
    }

    const hasPrefix = await getGroupPrefix(); // Waits to see if default prefix is found in nextcloud

    if(hasPrefix == 0) {
        console.log('[selectFileButton] - No prefix found!');
        alert("Please specify a prefix, or add a default prefix to /UserSyncConfig/groupprefix.txt");
        return;
    }

    fileInput.type = 'file';
    fileInput.accept = '.csv, .xlsx';
    fileInput.style.display = 'none';

    // Append it to the body (required for it to be clickable)
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            processFile(file);
        }
        document.body.removeChild(fileInput);
    });

    fileInput.click();
});

// Event listener for Nextcloud file selection button
document.getElementById('ncBrowseButton').addEventListener('click', async function() {
    console.log('[ncBrowseButton] - Nextcloud file browse button clicked!');

    // Create a hidden file input element
    const fileInput = document.createElement('input');

    if(!userUploadedMappings){
        const mappingsExists = await checkForDefaultGroup();
    }

    const hasPrefix = await getGroupPrefix(); // Waits to see if default prefix is found in nextcloud

    if(hasPrefix == 0) {
        console.log('[selectFileButton] - No prefix found!');
        alert("Please specify a prefix, or add a default prefix to /UserSyncConfig/groupprefix.txt");
        return;
    }

    OC.dialogs.filepicker("Select a CSV user list file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.blob()) // Changed to blob to handle binary data for XLSX files
        .then(blob => {
            const file = new File([blob], targetPath, { type: blob.type });
            processFile(file, false);
        })
        .catch(error => {
            console.error('[ncBrowseButton] - Error fetching the file:', error);
        });
    }, false, ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], true);
});



// File format button event listener
document.addEventListener('DOMContentLoaded', (event) => {
    const fileFormatDropdown = document.getElementById('fileFormatSelect');

    console.log('[FileFormatDropdown] - Initial File Format Selection: ', fileFormatSelection);

    fileFormatDropdown.addEventListener('change', function() {
        fileFormatSelection = this.value;
        console.log('[FileFormatDropdown] - New File Format Selection: ', fileFormatSelection);
    });
});

// Load mappings from local file button event listener
document.getElementById('loadMappingsButton').addEventListener('click', function() {
    console.log("[Mappings Event Listener] - Load mappings button clicked!");
    const fileInput = document.getElementById('groupMappingFile');
    const file = fileInput.files[0];
    if (file) {
        console.log("[Mappings Event Listener] - File found");
        userUploadedMappings = true;
        const reader = new FileReader();
        reader.onload = function(event) {
            loadMappings(event.target.result);
            updateGroupNamesBasedOnMappings();
        };
        reader.readAsText(file);
        console.log("[Mappings Event Listener] - Mappings file processed");
    } else if(userUploadedMappings || checkForDefaultGroup()) {
        console.log("[Mappings Event Listener] - Default mappings file found");
        updateGroupNamesBasedOnMappings()
        console.log("[Mappings Event Listener] - Mappings file processed");
    }else {
        console.log("[Mappings Event Listener] - No mappings file found");
        alert("Please provide a CSV file or have a default group mapping in the UserSyncConfig file")
    }
});

// Load mappings from Nextcloud file event listener
document.getElementById('ncLoadMappingsButton').addEventListener('click', function() {
    console.log("[ncLoadMappingsButton] - Load nextcloud mappings button clicked!");
    OC.dialogs.filepicker("Select a CSV mapping file", function(targetPath) {
        fetch(OC.linkToRemoteBase('files' + targetPath))
        .then(response => response.text())
        .then(userUploadedMappings = true)
        .then(data => {
            loadMappings(data);
            userUploadedMappings = true;
        })
        .catch(error => {
            console.error('[ncLoadMappingsButton] - Error fetching the file:', error);
        });
    }, false, ["text/csv"], true);
});

// Download the log file from the text output
document.getElementById('downloadLogButton').addEventListener('click', function() {
    const text = document.getElementById('csvOutput').value;
    const blob = new Blob([text], { type: 'text/plain' });

    const a = document.createElement('a');
    a.download = 'log.txt';
    a.href = window.URL.createObjectURL(blob);
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
});
