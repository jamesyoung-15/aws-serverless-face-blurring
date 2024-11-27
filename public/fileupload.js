
const uploadElement = document.getElementById("image-upload");
// upload modal
const modalElement = document.getElementById("modal");
const blurButton = document.getElementById("blur-button");
const closeModal = document.getElementById("close-modal");
const modalMessage = document.getElementById("modal-message");
const modalFooter = document.getElementById("modal-card-foot");
const blurProgress = document.getElementById("blur-progress");

// download button
const downloadButton = document.createElement("div");
downloadButton.classList.add("buttons", "is-centered");

// set confidence threshold elements
const confidenceModal = document.getElementById("confidence-modal");
const confidenceButton = document.getElementById("confidence-button");
const closeConfidenceModal = document.getElementById("close-confidence-modal");

// URLs
const api = "https://1u7bfjqswl.execute-api.us-east-1.amazonaws.com" + "/prod";
const uploadApi = api+"/upload";
const jobsApi = api+"/jobs";

const maxFileSize = 35 * 1024 * 1024; // 35MB


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

// helper to show download button
const showDownloadButton = () => {
    modalMessage.appendChild(downloadButton);
}


// helper function to show error message
const showErrorModal = (message) => {
    addModalMessage("Error uploading image! Either your file has issues or the server ran into problem. Sorry!", "has-text-danger");
    // show close button
    closeModal.classList.remove("is-hidden");
    // end progress
    blurProgress.value = 100;
    blurProgress.classList.add("is-danger");
}

// helper to convert base64 to blob
const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
      
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

// file too large error message
const fileTooLargeError = (fileSize) => {
    document.getElementById("size-error").classList.add("is-active");
    document.getElementById("file-size").textContent = returnFileSize(fileSize);
    document.getElementById("close-too-large").addEventListener("click", () => {
        document.getElementById("size-error").classList.remove("is-active");
    });
    return;
}

// upload image
uploadElement.addEventListener("change", () => {
    let imageFileName = document.getElementById("image-file-name");
    const imageFile = uploadElement.files[0];

    if (uploadElement.files.length == 1) {
        // check file size 
        let fileSize = imageFile.size
        // console.log("File size: ", fileSize);
        if (fileSize > maxFileSize) {
            fileTooLargeError(fileSize);
            return;
        }
            
        // show button and file name
        imageFileName.textContent = imageFile.name;
        blurButton.classList.remove("is-hidden");
    }
});

// button to activate blur image, goes to confidence modal
blurButton.addEventListener("click", () => {
    confidenceModal.classList.add("is-active");
});

// upload image to server
const uploadImage = async (imageFile, confidenceThreshold) => {
    // check if image needs to be compressed
    let needCompress = false;
    let compressQuality = 0.9;
    let checkOrientation = true;

    let imageToSend = imageFile;

    // check file size 
    let fileSize = imageFile.size
    // console.log("File size: ", fileSize);
    if (fileSize > maxFileSize) {
        fileTooLargeError(fileSize);
    }
    else if (fileSize >= 20 * 1024 * 1024) {
        needCompress = true;
        compressQuality = 0.4;
        checkOrientation = false;
    }
    else if (fileSize >= 10 * 1024 * 1024) {
        needCompress = true;
        compressQuality = 0.6;
        checkOrientation = false;
    }
    else if (fileSize >= 1.5 * 1024 * 1024) {
        needCompress = true;
        compressQuality = 0.8;
    }

    console.log("Compress quality: ", compressQuality);

    if (needCompress) {
        addModalMessage("Compressing image...");
    }

    const result = await new Promise((resolve, reject) => {
        // compress image
        new Compressor(imageFile, {
            quality : compressQuality,
            checkOrientation : checkOrientation,
            success(result) {
                imageToSend = result;
                addModalMessage(`Image compressed successfully!`, "has-text-success");
                addModalMessage(`Compressed from ${returnFileSize(fileSize)} to ${returnFileSize(result.size)}.`);
                resolve("Image compressed successfully");
            },
            error(error) {
                console.log("Error compressing image: ", error);
                addModalMessage("Error compressing image!", "has-text-danger");
                reject("Error compressing image");
            }
        });
    });

    // convert image to base64
    let imageBase64 = await getBase64(imageToSend);
    // let newTextArea = document.createElement("textarea");
    // newTextArea.innerText = imageBase64;
    // newTextArea.classList.add("textarea", "is-info");
    // modalMessage.appendChild(newTextArea);
    // console.log("Image base64: ", imageBase64);
    
    // strip off the data:image/jpeg;base64, part
    imageBase64 = imageBase64.split(",")[1];

    // send image to server
    let response = await fetch(uploadApi, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: imageBase64,
            confidenceThreshold: confidenceThreshold
        })
    });

    let data = await response.json();
    console.log("Response: ", data);
    // data = {message: "success"}


    // show close button
    closeModal.classList.remove("is-hidden");
    return data;
}

// retrieve job status from server
const checkJobStatus = (jobId) => {
    const apiUrl = `${jobsApi}/${jobId}`; // Update with your API endpoint

    return new Promise((resolve, reject) => {
        // let isCompleted = false;
        const intervalId = setInterval(async () => {
            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                console.log(`Polling response: ${data.status}`);

                if (data.status.includes("COMPLETED")) {
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    console.log("Job completed!");
                    resolve(data);
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(`Error fetching job status: ${error}`);
            }
        }, 4000); // Poll every x seconds

        // Set a timeout to reject after 60 seconds
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            reject('Polling timed out after 60 seconds.');
        }, 60000);
    });
};




// button to activate blur image
confidenceButton.addEventListener("click", () => {
    // check if confidence threshold is valid
    confidenceThreshold = document.getElementById("confidence-threshold").value;
    if (confidenceThreshold == "" || confidenceThreshold <= 20 || confidenceThreshold >= 95) {
        document.getElementById("confidence-threshold-error").classList.remove("is-hidden");
        return;
    }
    document.getElementById("confidence-threshold-error").classList.add("is-hidden");
    

    // close confidence modal
    confidenceModal.classList.remove("is-active");
    // show modal for progress
    modalElement.classList.add("is-active");
    

    // image file should exist since button only appears when file is selected
    const imageFile = uploadElement.files[0];
    if (imageFile) {
        addModalMessage("Uploading image...");
        console.log("Image file: ", imageFile);
        uploadImage(imageFile, confidenceThreshold).then((uploadResponse) => {
            console.log("Upload response: ", uploadResponse);
            if (uploadResponse.message.includes("success") ){
                addModalMessage("Image uploaded successfully to server!", "has-text-success");
                addModalMessage(`Your image is queued with JobID: ${uploadResponse.JobID  }...`);
                return uploadResponse.JobID;
            }
            else {
                throw new Error("Error uploading image");
            }
        })
        .then((jobID) => {
            return checkJobStatus(jobID);
        })
        .then((getResponse) => {
            if (getResponse.status.includes("COMPLETED")) {
                console.log(getResponse)
                blurProgress.value = 100;
                addModalMessage("Image processed successfully!", "has-text-success");
                addModalMessage("");
                downloadButton.innerHTML = `<a class="button is-success mt-4 mb-1" href="${getResponse.content}" target="_blank">See Your Image!</a>`;
                //                                             <a class="button is-success mt-4 mb-1" href="${getResponse.content}" download="${getResponse.jobID}.jpg">Download Your New Image</button>
                downloadButton.classList.add("mt-2");
                let picturePreview = document.createElement("div");
                picturePreview.classList.add("is-centered", "has-text-centered", "mx-auto", "my-3");
                picturePreview.innerHTML = `
                        <p>Here is a mini-preview of your image. Scroll to the button below to see full resolution!</p>
                        <figure class="image is-128x128 mx-auto my-3">
                            <img class="min-preview" src="${getResponse.content}" alt="Blurred Faces Image" />
                        </figure>`;
                modalMessage.appendChild(picturePreview);
                showDownloadButton();
            }
            else {
                throw new Error("Error processing image");
            }
        })
        .catch((error) => {
            console.log("Error uploading image: ", error);
            showErrorModal();
        });
    }
});


// close modal, remove messages
closeModal.addEventListener("click", () => {
    modalElement.classList.remove("is-active");
    // remove children elements
    while (modalMessage.firstChild) {
        modalMessage.removeChild(modalMessage.firstChild);
    }
    closeModal.classList.add("is-hidden");
    // reset progress bar
    blurProgress.removeAttribute("value");
});

// button clicked to close confidence modal
closeConfidenceModal.addEventListener("click", () => {
    confidenceModal.classList.remove("is-active");
});