const radioButtons = document.getElementsByName('fileFormat');
console.log('File Format Selection:', fileFormatSelection);

radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.checked) {
            fileFormatSelection = this.value;
            console.log('New File Format Selection:', fileFormatSelection);
        }
    });
});
