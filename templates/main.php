<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
declare(strict_types=1);
<<<<<<< HEAD
//script('core', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js');
script('core', 'OC-dialogs');
script('core', 'jquery.fileupload');
//script('usersync', 'assets/xlsx.full.min');
=======
script('core', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js');
script('core', 'OC-dialogs');
script('core', 'jquery.fileupload');
script('usersync', 'assets/xlsx.full.min');
>>>>>>> f7e74c0bf68c6d7461384e5a79ab1cd944d307c5
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
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
    }

    
    #csvUploadForm {
        text-align: center;
        background-color: #f9f9f9;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
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

    #ncBrowseButton {
        width: 100%;
        padding: 10px;
        background-color: #008bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #ncLoadMappingsButton {
        width: 100%;
        padding: 10px;
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
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #ncBrowseButton: hover {
        background-color: #0056b3;
    }
    
    #csvOutput {
        width: 100%;
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 0;
        background-color: #000;
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
        
        <button type="button" id="ncLoadMappingsButton">Nextcloud Mapping Upload</button>
        <button type="button" id="loadMappingsButton">Load Mappings</button>

        <label for="fileFormatSelect">Input File Source</label>
        <select id="fileFormatSelect">
<<<<<<< HEAD
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
=======
            <option value="Default">Default</option>
            <option value="Canvas">Canvas</option>
            <option value="Panthersoft">Panthersoft</option>
            <option value="CAP2Groups">CAP2Groups</option>
        </select>

        <label for="csvFile">Upload CSV:</label>
        <input type="file" name="csvFile" id="csvFile" accept=".csv">
	    <button type="button" id="selectFileButton">Local CSV Upload</button>
	    <button type="button" id="browseButton">Nextcloud CSV Upload</button>
>>>>>>> f7e74c0bf68c6d7461384e5a79ab1cd944d307c5

    </form>
    <textarea id="csvOutput"></textarea>
</div>