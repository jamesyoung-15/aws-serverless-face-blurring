
const uploadElement = document.getElementById("image-upload");


uploadElement.addEventListener("cancel", () => {
        console.log("Cancelled.");
    });
    uploadElement.addEventListener("change", () => {
        const imageFileName = document.getElementById("image-file-name");
        let blurButton = document.getElementById("blur-button");
        if (uploadElement.files.length == 1) {
            console.log("File selected: ", uploadElement.files[0]);
            let fileSize = returnFileSize(uploadElement.files[0].size);
            console.log("File size: ", fileSize);
            if (uploadElement.files[0].size > 20*10**6) {
                console.log("File too large: ", uploadElement.files[0].size);
                return;
            }
            imageFileName.textContent = uploadElement.files[0].name;
            blurButton.classList.remove("is-hidden");
        }
});


let returnFileSize = (size) => {
    if(size == 0) return "0 Bytes";
    let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return Math.round(size / Math.pow(1024, i), 2) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}
