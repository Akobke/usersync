<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
declare(strict_types=1);
script('core', 'OC-dialogs');
script('core', 'jquery.fileupload');
style('usersync', 'styles');
script('usersync', 'script');
?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>

<style>
    body, html {
        height: 100%;
        margin: 0;
        padding: 0;
    }

    
    .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }

    
    #csvUploadForm {
        text-align: center;
        background-color: #f9f9f9;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
        width: 50%;
    }

    #csvUploadForm hr {
        border: 0; /* Removes default border */
        height: 2px; /* Increase the height for a thicker line */
        background-color: #ccc; /* Set the line color */
        margin-top: 10px; /* Spacing above the line */
        margin-bottom: 10px; /* Spacing below the line */
    }

    
    label {
        color: black;
        font-weight: bold;
        display: block;
        margin-bottom: 10px;
    }

    input[type="file"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fff;
    }

    
    #selectFileButton {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #selectFileButton: hover {
        background-color: #0056b3;
    }

    #selectLocalMappingsButton {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #groupMappingFile {
        display: none;
    }

    #ncBrowseButton {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #ncLoadMappingsButton {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #localLoadMappingsButton {
        width: 100%;
        padding: 10px;
        color: #fff;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #ncBrowseButton: hover {
        background-color: #0056b3;
    }
    
    #csvOutput {
        height: 550px;
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 0;
        background-color: rgba(0, 0, 0, 0.75);
        color: #fff;
        resize: none; 
    }
    #csvFile {
        display: none;
    }
    #groupPrefix {
        width: 100%;
    }
</style>

<div class="container">
    <form id="csvUploadForm">
        <label for="groupPrefix">Group Prefix:</label>
        <input type="text" id="groupPrefix" placeholder="Enter prefix (e.g., FA23)">
        
        <label for="groupMappingFile">Upload Group Mappings CSV:</label>
        <input type="file" name="groupMappingFile" id="groupMappingFile" accept=".csv">
        <button type="button" id="selectLocalMappingsButton">Local Mappings Upload</button>
        <button type="button" id="ncLoadMappingsButton">Nextcloud Mapping Upload</button>
        <button type="button" id="loadMappingsButton">Load Mappings</button>

        <hr>

        <label for="fileFormatSelect">Input File Source</label>
        <select id="fileFormatSelect">
            <option value="Default">Default (.csv)</option>
            <option value="Canvas">Canvas (.csv)</option>
            <option value="Panthersoft">Panthersoft (.xlsx)</option>
            <option value="CAP2Groups">CAP2Groups (.xlsx)</option>
        </select>

        <label for="csvFile">Upload CSV/XLSX:</label>
        <input type="file" name="csvFile" id="csvFile" accept=".csv">
	    <button type="button" id="selectFileButton">Local Userlist Upload</button>
	    <button type="button" id="ncBrowseButton">Nextcloud Userlist Upload</button>
        <button id="downloadLogButton">Download Log</button>

    </form>
    <textarea id="csvOutput"></textarea>
</div>