const storage = firebase.storage();
const db = firebase.firestore();

const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const authModal = document.getElementById('authModal');
const authInput = document.getElementById('authInput');
const authButton = document.getElementById('authButton');
const errorMessage = document.getElementById('errorMessage');
const dropZone = document.getElementById('dropZone');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');

// Passwords and PINs
const validCredentials = ['uwan is reyn', 'reynn', '1232', '54321', '7894'];
console.log('uwan is reyn', 'reynn', '1232', '54321', '7894');

// Show the authentication modal on load
window.onload = () => {
    authModal.style.display = 'block';
};

// Authentication logic
authButton.addEventListener('click', () => {
    const input = authInput.value;
    if (validCredentials.includes(input)) {
        authModal.style.display = 'none'; // Hide modal
        displayFiles(); // Load files after successful authentication
    } else {
        errorMessage.textContent = 'Invalid password or PIN. Please try again.';
    }
});

// Drag and Drop functionality
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Allow multiple files
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

// Handle multiple file uploads
function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
}

function uploadFile(file) {
    const storageRef = storage.ref(`files/${file.name}`);
    const uploadTask = storageRef.put(file);
    
    // Show progress
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = progress + '%'; // Update the progress bar width
    }, (error) => {
        console.error('Upload error:', error);
    }, () => {
        console.log('File uploaded!');
        
        // After upload, get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            // Save file info to Firestore
            db.collection('files').add({
                name: file.name,
                url: downloadURL,
                type: file.type, // Save file type
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                displayFiles(); // Refresh file list after saving to Firestore
            }).catch((error) => {
                console.error('Error saving file to Firestore:', error);
            });
        });
    });
}

// Display files in the file list
function displayFiles() {
    db.collection('files').orderBy('createdAt', 'desc').get().then((querySnapshot) => {
        fileList.innerHTML = ''; // Clear the list
        querySnapshot.forEach((doc) => {
            const fileData = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${fileData.name}</span>
                ${generateFileOptions(fileData)}
                <button onclick="deleteFile('${doc.id}', '${fileData.name}')">Delete</button>
            `;
            fileList.appendChild(li);
        });
    }).catch((error) => {
        console.error('Error retrieving files:', error);
    });
}

// Generate appropriate file options based on file type
// Generate appropriate file options based on file type
function generateFileOptions(fileData) {
    let options = '';

    // Check if fileData.type exists before proceeding
    if (fileData.type) {
        // Generate options based on file type
        if (fileData.type.startsWith('image/')) {
            options = `<a href="${fileData.url}" target="_blank">View Image</a> `;
        } else if (fileData.type.startsWith('text/')) {
            options = `<a href="${fileData.url}" target="_blank">Open/Edit Text</a> `;
        } else if (fileData.type.startsWith('video/')) {
            options = `<a href="${fileData.url}" target="_blank">Play Video</a> `;
        } else if (fileData.type.startsWith('audio/')) {
            options = `<a href="${fileData.url}" target="_blank">Play Audio</a> `;
        } else {
            options = `<span>Unsupported file type</span> `;
        }
    } else {
        options = `<span>No type available</span>`; // Fallback if type is missing
    }

    // Add download link for all file types
    options += `<a href="${fileData.url}" download>Download</a>`;

    return options;
}


// Delete file from Firestore and Storage
function deleteFile(docId, fileName) {
    const fileRef = storage.ref(`files/${fileName}`);
    fileRef.delete().then(() => {
        console.log(`${fileName} deleted successfully.`);
        db.collection('files').doc(docId).delete().then(() => {
            displayFiles(); // Refresh file list after deletion
        }).catch((error) => {
            console.error('Error deleting document:', error);
        });
    }).catch((error) => {
        console.error('Error deleting file:', error);
    });
}



/*

const collectionRef = db.collection('files');

collectionRef.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        collectionRef.doc(doc.id).delete().then(() => {
            console.log(`Deleted document: ${doc.id}`);
        }).catch((error) => {
            console.error(`Error deleting document: ${doc.id}`, error);
        });
    });
}).catch((error) => {
    console.error("Error retrieving documents:", error);
});

*/