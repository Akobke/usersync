<?php
// SPDX-License-Identifier: AGPL-3.0-or-later
declare(strict_types=1);
script('usersync', 'script');
?>
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

    
    #uploadButton {
        width: 100%;
        padding: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #uploadButton:hover {
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
</style>

<div class="container">
    <form id="csvUploadForm">
        <label for="csvFile">Upload CSV:</label>
        <input type="file" name="csvFile" id="csvFile" accept=".csv">
        <button type="button" id="uploadButton">Upload and Display</button>
    </form>
    <textarea id="csvOutput"></textarea>
</div>