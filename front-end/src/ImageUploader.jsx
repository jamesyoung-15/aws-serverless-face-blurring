import { useState } from 'react';
import Compressor from 'compressorjs'; // Ensure you install this library if you're using it
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import imageExample from './assets/image-blur-demo.png'

const ImageUploader = () => {
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('No Image Uploaded Yet');
  const [modalActive, setModalActive] = useState(false);
  const [confidenceModalActive, setConfidenceModalActive] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [modalMessage, setModalMessage] = useState([]);
  const [blurProgress, setBlurProgress] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [presignedURL, setpresignedURL] = useState('');
  const maxFileSize = 35 * 1024 * 1024; // 35MB

  const api = "https://1u7bfjqswl.execute-api.us-east-1.amazonaws.com/prod";
  const uploadApi = `${api}/upload`;
  const jobsApi = `${api}/jobs`;

  // helper function to return file size in human readable format
  let returnFileSize = (size) => {
    if (size == 0) return "0 Bytes";
    let i = parseInt(Math.floor(Math.log(size) / Math.log(1024)));
    return (
      Math.round(size / Math.pow(1024, i), 2) +
      " " +
      ["Bytes", "KB", "MB", "GB", "TB"][i]
    );
  };

  // helper to add modal messages
  const addModalMessage = (text, className = '') => {
    setModalMessage(prev => [...prev, { text, className }]);
  };

  const closeModal = () => {
    setModalMessage([]);
    setUploadComplete(false);
    setConfidenceThreshold(50);
    setConfidenceModalActive(false);
    setModalActive(false);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > maxFileSize) {
        setFileSizeError(`The file you uploaded is too large! Please choose a smaller file.`);
        return;
      }
      setImageFile(file);
      setFileName(file.name);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    let fileSize = imageFile.size;

    // Compress the image if needed
    let compressQuality = 0.9;
    if (imageFile.size >= 20 * 1024 * 1024) {
      compressQuality = 0.4;
    } else if (imageFile.size >= 10 * 1024 * 1024) {
      compressQuality = 0.6;
    } else if (imageFile.size >= 1.5 * 1024 * 1024) {
      compressQuality = 0.8;
    }
    console.log(compressQuality);
    addModalMessage('Compressing image...');
    
    const compressedImage = await new Promise((resolve, reject) => {
      new Compressor(imageFile, {
        quality: compressQuality,
        success(result) {
          addModalMessage("Image compressed successfully!", "has-text-success")
          addModalMessage(`Compressed from ${returnFileSize(fileSize)} to ${returnFileSize(result.size)}.`);
          resolve(result);
        },
        error(error) {
          reject(error);
        },
      });
    });

    const imageBase64 = await getBase64(compressedImage);
    const response = await fetch(uploadApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: imageBase64.split(',')[1],
        confidenceThreshold,
      }),
    });

    const data = await response.json();
    return data;
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleBlurButtonClick = async () => {
    setConfidenceModalActive(true);
  };

  const handleConfidenceSubmit = async () => {
    if (confidenceThreshold < 20 || confidenceThreshold > 95) {
      setErrorMessage("Please enter a valid number between 20 - 95.");
      return;
    }
    // console.log("Confidence: ", confidenceThreshold)

    setConfidenceModalActive(false);
    setModalActive(true);
    setModalMessage([]);
    setBlurProgress(undefined); // Reset progress
    setpresignedURL('');
  
    addModalMessage("Uploading image...");

    uploadImage().then(uploadResponse => {
        if (uploadResponse.message.includes("success")) {
            addModalMessage(
                "Image uploaded successfully to server!",
                "has-text-success",
            );
            addModalMessage(
                `Your image is queued with JobID: ${uploadResponse.JobID}...`,
            );
            return uploadResponse.JobID;
        }
        else {
            throw new Error("Error uploading image");
        }
    })
    .then((jobID) => {
        return checkJobStatus(jobID)
    })
    .then((getJobResponse) => {
        if (getJobResponse.status.includes("COMPLETED")){
            // console.log(getJobResponse);
            setpresignedURL(getJobResponse.content)
            setBlurProgress(100);
            addModalMessage("Image processed successfully!", "has-text-success");
            addModalMessage("");
            setUploadComplete(true);
        }
        else {
            throw new Error("Error processing image");
        }
    })
    .catch((error) => {
        console.log(error);
        addModalMessage("Error uploading image! Either your file has issues or the server ran into problem. Check console for more info.", "has-text-danger")
    });
      
    };

    // retrieve job status from server
    const checkJobStatus = (jobId) => {
        const apiUrl = `${jobsApi}/${jobId}`;
    
        return new Promise((resolve, reject) => {
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
        }, 4000); // Poll every 4 seconds
    
        // Set a timeout to reject after 60 seconds
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            reject("Polling timed out after 60 seconds.");
        }, 60000);
        });
    };

  return (
    <main className="container">
      <section className="section">
        <div className="blur-about has-text-centered">
          <h1 className="title">Image Face Blurring</h1>
          <h2 className="subtitle pt-4">
            Upload an image with human faces and the faces in the image will be blurred automatically for anonymity.
          </h2>
          <h2 className="subtitle">
            Files are compressed client-side. Accepts images up to 35 MB.
          </h2>
          <h2 className="subtitle">
            Uploaded images are auto-deleted after 24 hours.
          </h2>
        </div>
        <div className="container is-centered has-text-centered mt-6">
          <div className="file is-centered is-danger has-name is-boxed">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <FontAwesomeIcon icon={faCloudUploadAlt} />
                </span>
                <span className="file-label"> Upload Image </span>
              </span>
              <span className="file-name">
                {fileName}
              </span>
            </label>
          </div>
          <button
            className={`button is-warning ${!imageFile ? 'is-hidden' : ''}`}
            onClick={handleBlurButtonClick}
          >
            Detect and Blur Faces!
          </button>
        </div>
      </section>

      {/* Modals */}
      {modalActive && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <div className="modal-card-title">
                <h1 className="title">Blurring Progress</h1>
                <h2 className="modal-card-title has-text-danger">
                  Please do not refresh the page!
                </h2>
              </div>
              <button className="delete" aria-label="close" onClick={() => closeModal()}></button>
            </header>
            <section className="modal-card-body">
              {modalMessage.map((msg, index) => (
                <p key={index} className={msg.className}>{msg.text}</p>
              ))}
              {fileSizeError && <p className="has-text-danger">{fileSizeError}</p>}

              {uploadComplete && (
                <>
                    <div className='is-centered has-text-centered mx-auto my-3'>
                        <p>Here is a mini-preview of your image. Scroll to the button below to see full resolution!</p>
                        <figure className="image is-128x128 mx-auto my-3">
                            <img className="min-preview" src={presignedURL} alt="Your Image" />
                        </figure>
                    </div>
                    <div className='buttons is-centered mt-2'>
                        <a className="button is-success mt-4 mb-1" href={presignedURL} target="_blank" rel="noopener noreferrer">See Your Image!</a>
                    </div>
                </>
              )}
            </section>
            <footer className="modal-card-foot">
              <progress className="progress is-small is-primary" value={blurProgress} max="100"></progress>
            </footer>
          </div>
        </div>
      )}

      {confidenceModalActive && (
        <div className="modal is-active">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <div className="modal-card-title">
                <h1 className="title">Set Face Detection Confidence</h1>
              </div>
              <button className="delete" aria-label="close" onClick={() => {closeModal();}}></button>
            </header>
            <section className="modal-card-body">
              <h3 className="subtitle">Set a confidence threshold (between 10 - 95) for face detection.</h3>
              <input
                className="input is-primary mb-3"
                type="number"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                placeholder="50"
                min="20"
                max="95"
              />
              {errorMessage && <p className="has-text-danger">{errorMessage}</p>}
            </section>
            <footer className="modal-card-foot has-text-centered">
              <button className="button is-success" onClick={handleConfidenceSubmit}>
                Set Confidence and Blur Your Photo!
              </button>
            </footer>
          </div>
        </div>
      )}
      
      <section className="container my-auto mx-auto">
        <figure className="image my-auto mx-auto is-2by1 mx-2 blur-example">
          <img src={imageExample} alt="Blur Example" />
        </figure>
      </section>
    </main>
  );
};

export default ImageUploader;