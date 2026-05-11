import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCgXFj1PI-8n4sBzlKHs3r7qEZpgotZWs8",
    authDomain: "ozo123-96693.firebaseapp.com",
    projectId: "ozo123-96693",
    storageBucket: "ozo123-96693.firebasestorage.app",
    messagingSenderId: "366798479849",
    appId: "1:366798479849:web:15eaa2b32987c00b9b6b78",
    measurementId: "G-Z18NQMG8L8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const btnPhotography = document.getElementById('btn-photography');
const btnData = document.getElementById('btn-data');
const photoOverlay = document.getElementById('photography-overlay');
const dataOverlay = document.getElementById('data-overlay');
const closeBtns = document.querySelectorAll('.close-btn');

btnPhotography.addEventListener('click', () => { photoOverlay.classList.remove('hidden'); initPanorama(); });
btnData.addEventListener('click', () => { dataOverlay.classList.remove('hidden'); });
closeBtns.forEach(btn => { btn.addEventListener('click', () => { photoOverlay.classList.add('hidden'); dataOverlay.classList.add('hidden'); }); });

function initPanorama(imageSrc = "https://pannellum.org/images/alma.jpg") {
    pannellum.viewer('panorama-container', { "type": "equirectangular", "panorama": imageSrc, "autoLoad": true });
}

const photoUpload = document.getElementById('photo-upload');
const submitPhoto = document.getElementById('submit-photo');
const photoList = document.getElementById('photo-list');

submitPhoto.addEventListener('click', async () => {
    const file = photoUpload.files[0];
    if (!file) return alert("Please select a file first");
    try {
        const storageRef = ref(storage, '360_captures/' + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        await addDoc(collection(db, "captures"), { url: url, name: file.name, timestamp: new Date() });
        alert("360 Capture Uploaded!");
        initPanorama(url);
    } catch (e) { console.error("Error uploading photo:", e); alert("Error occurred. Check console."); }
});

onSnapshot(query(collection(db, "captures"), orderBy("timestamp", "desc")), (snapshot) => {
    photoList.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<h4>${data.name}</h4><p>Uploaded: ${new Date(data.timestamp.seconds * 1000).toLocaleDateString()}</p><button onclick="window.view360('${data.url}')" class="submit-btn" style="margin-top: 10px; padding: 5px 10px; font-size: 0.8rem;">View in 360</button>`;
        photoList.appendChild(card);
    });
});

window.view360 = (url) => { initPanorama(url); };

const submitProject = document.getElementById('submit-project');
const projectList = document.getElementById('project-list');

submitProject.addEventListener('click', async () => {
    const title = document.getElementById('project-title').value;
    const desc = document.getElementById('project-desc').value;
    const link = document.getElementById('project-link').value;
    if (!title) return alert("Title is required");
    try {
        await addDoc(collection(db, "projects"), { title, desc, link, timestamp: new Date() });
        alert("Project added!");
        document.getElementById('project-title').value = '';
        document.getElementById('project-desc').value = '';
        document.getElementById('project-link').value = '';
    } catch (e) { console.error("Error adding project:", e); alert("Error occurred."); }
});

onSnapshot(query(collection(db, "projects"), orderBy("timestamp", "desc")), (snapshot) => {
    projectList.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<h4>${data.title}</h4><p>${data.desc}</p>${data.link ? `<a href="${data.link}" target="_blank" style="color: var(--primary); font-size: 0.8rem; text-decoration: none;">View Project →</a>` : ''}`;
        projectList.appendChild(card);
    });
});
