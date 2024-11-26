
const uploadElement = document.getElementById("image-upload");
// upload modal
const modalElement = document.getElementById("modal");
const blurButton = document.getElementById("blur-button");
const closeModal = document.getElementById("close-modal");
const modalMessage = document.getElementById("modal-message");

// error modal
const errorModal = document.getElementById("error-modal");
const errorModalMessage = document.getElementById("error-modal-message");
const closeErrorModal = document.getElementById("close-error-modal");

// helper function to return file size in human readable format
let returnFileSize = (size) => {
    if(size == 0) return "0 Bytes";
    let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return Math.round(size / Math.pow(1024, i), 2) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

// helper to convert image to base64
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

// helper to add modal messages
const addModalMessage = (message, classList=null) => {
    let newMessage = document.createElement("p");
    newMessage.textContent = message;
    modalMessage.appendChild(newMessage);
    if (classList) {
        newMessage.classList.add(classList);
    }
}

// max file size
const MAX_FILE_SIZE = 6*10**6; // 15MB
const MAX_FILE_SIZE_FORMATTED = returnFileSize(MAX_FILE_SIZE);

// upload image
uploadElement.addEventListener("change", () => {
    let imageFileName = document.getElementById("image-file-name");
    const image_file = uploadElement.files[0];
    if (uploadElement.files.length == 1) {
        console.log("File selected: ", image_file);

        // check if file size is greater than 15MB
        let fileSize = image_file.size
        let fileSizeFormatted = returnFileSize(image_file.size);
        // console.log("File size: ", fileSize);
        if (fileSize > MAX_FILE_SIZE) {
            console.log("File too large: ", image_file.size);
            errorModal.classList.add("is-active");
            errorModalMessage.textContent = `File size too large: ${fileSizeFormatted}. Max size is ${MAX_FILE_SIZE_FORMATTED}.`;
            return;
        }
        
        // show button and file name
        imageFileName.textContent = image_file.name;
        blurButton.classList.remove("is-hidden");
    }
});

// upload image to server
const uploadImage = async (image_file) => {
    // convert image to base64
    let image_base64 = await getBase64(image_file);
    // let newTextArea = document.createElement("textarea");
    // newTextArea.innerText = image_base64;
    // newTextArea.classList.add("textarea", "is-info");
    // modalMessage.appendChild(newTextArea);

    // send image to server
    // let response = await fetch("/upload", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         image_base64: image_base64
    //     })
    // });

    // let data = await response.json();
    // console.log("Response: ", data);
    data = "200 OK";
    return data;
}


// button to activate blur image
blurButton.addEventListener("click", () => {
    // show modal for progress
    modalElement.classList.add("is-active");
    // image file should exist since button only appears when file is selected
    const image_file = uploadElement.files[0];
    if (image_file) {
        console.log("Image file: ", image_file);
        uploadImage(image_file).then((uploadResponse) => {
            console.log("Upload response: ", uploadResponse);
            if (uploadResponse.includes("200") ){
                addModalMessage("Image uploaded successfully to server!", "has-text-success");
                addModalMessage("Processing your image...");
            }
        }).catch((error) => {
            console.log("Error uploading image: ", error);
            addModalMessage("Error uploading image! Either your file has issues or the server ran into problem. Sorry!", "has-text-danger");
        });
    }
});

closeModal.addEventListener("click", () => {
    modalElement.classList.remove("is-active");
});

closeErrorModal.addEventListener("click", () => {
    errorModal.classList.remove("is-active");
});
