const storage = firebase.storage();
const db = firebase.firestore();

const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const authModal = document.getElementById('authModal');
const authInput = document.getElementById('authInput');
const authButton = document.getElementById('authButton');
const errorMessage = document.getElementById('errorMessage');

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

// Upload file
uploadButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const storageRef = storage.ref(`files/${file.name}`);
        storageRef.put(file).then(() => {
            console.log('File uploaded!');
            saveFileData(file.name);
        });
    } else {
        alert('Please select a file.');
    }
});

function saveFileData(fileName) {
    db.collection('files').add({
        name: fileName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        displayFiles();
    });
}

// Fetch and display files
function displayFiles() {
    fileList.innerHTML = ''; // Clear the file list first
    db.collection('files').orderBy('createdAt', 'desc').get().then(snapshot => {
        if (snapshot.empty) {
            console.log('No files found');
        }
        snapshot.forEach(doc => {
            const fileData = doc.data();
            console.log('Displaying file:', fileData.name); // Add logging

            const li = document.createElement('li');
            li.textContent = fileData.name;

            // Create a download/view link
            const viewLink = document.createElement('a');
            viewLink.href = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/files%2F${encodeURIComponent(fileData.name)}?alt=media`;
            viewLink.textContent = 'View/Download';
            viewLink.target = '_blank';  // Open in a new tab

            // Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteFile(doc.id, fileData.name);

            // Add elements to the list item
            li.appendChild(viewLink);
            li.appendChild(deleteButton);
            fileList.appendChild(li);
        });
    }).catch(error => {
        console.error('Error retrieving files:', error);
    });
}

function deleteFile(docId, fileName) {
    const storageRef = storage.ref(`files/${fileName}`);
    storageRef.delete().then(() => {
        db.collection('files').doc(docId).delete().then(() => {
            console.log('File deleted!');
            displayFiles();
        });
    }).catch(error => {
        console.error('Error deleting file:', error);
    });
}
