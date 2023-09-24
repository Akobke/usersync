<?php
// SPDX-FileCopyrightText: Hunter Sanchez <hsanc053@fiu.edu>
// SPDX-License-Identifier: AGPL-3.0-or-later
declare(strict_types=1);
script('myapp', 'script');
?>

<form id="csvUploadForm">
    <label for="csvFile">Upload CSV:</label>
    <input type="file" name="csvFile" id="csvFile" accept=".csv">
    <button type="button" id="uploadButton">Upload and Display</button>
</form>
<textarea id="csvOutput" rows="10" cols="50"></textarea>