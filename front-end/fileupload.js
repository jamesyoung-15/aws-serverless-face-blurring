
const uploadElement = document.getElementById("image-upload");
const modalElement = document.getElementById("modal");
const blurButton = document.getElementById("blur-button");
let closeModal = document.getElementById("close-modal");
const modalMessage = document.getElementById("modal-message");

// upload image
uploadElement.addEventListener("change", () => {
    let imageFileName = document.getElementById("image-file-name");
    if (uploadElement.files.length == 1) {
        console.log("File selected: ", uploadElement.files[0]);

        // check if file size is greater than 15MB
        let fileSize = returnFileSize(uploadElement.files[0].size);
        // console.log("File size: ", fileSize);
        if (fileSize > 15*10**6) {
            console.log("File too large: ", uploadElement.files[0].size);
            return;
        }
        

        imageFileName.textContent = uploadElement.files[0].name;
        blurButton.classList.remove("is-hidden");
    }
});

blurButton.addEventListener("click", () => {
    modalElement.classList.add("is-active");
});

closeModal.addEventListener("click", () => {
    modalElement.classList.remove("is-active");
});

let returnFileSize = (size) => {
    if(size == 0) return "0 Bytes";
    let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return Math.round(size / Math.pow(1024, i), 2) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}
