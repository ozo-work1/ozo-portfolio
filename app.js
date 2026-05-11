// --- Configuration ---
// Your Google Sheet "Publish to Web" CSV Link
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1NQIGjGNwUMKmTKTQyt8QwOVQStYckb02YaUIphgsYCM/pub?output=csv";

// DOM Elements
const photoOverlay = document.getElementById('photography-overlay');
const dataOverlay = document.getElementById('data-overlay');
const btnPhotography = document.getElementById('btn-photography');
const btnData = document.getElementById('btn-data');
const closeBtns = document.querySelectorAll('.close-btn');

const photoList = document.getElementById('photo-list');
const projectList = document.getElementById('project-list');

// --- Navigation Logic ---

btnPhotography.addEventListener('click', () => {
    photoOverlay.classList.remove('hidden');
    initPanorama(); // Load default first
});

btnData.addEventListener('click', () => {
    dataOverlay.classList.remove('hidden');
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        photoOverlay.classList.add('hidden');
        dataOverlay.classList.add('hidden');
    });
});

// --- Data Fetching Logic ---

async function fetchPortfolioData() {
    if (SHEET_CSV_URL === "YOUR_GOOGLE_SHEET_CSV_LINK_HERE") {
        console.warn("Please provide a valid Google Sheet CSV URL.");
        return;
    }

    try {
        const response = await fetch(SHEET_CSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Skip header

        // Clear existing
        photoList.innerHTML = '';
        projectList.innerHTML = '';

        rows.forEach(row => {
            const columns = parseCSVRow(row);
            if (columns.length < 3) return;

            const [type, title, description, link] = columns;

            if (type.trim().toLowerCase() === 'photo') {
                renderPhotoCard(title, link);
            } else if (type.trim().toLowerCase() === 'data') {
                renderProjectCard(title, description, link);
            }
        });
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Simple CSV parser for basic rows
function parseCSVRow(row) {
    return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());
}

function renderPhotoCard(title, driveLink) {
    const directLink = convertDriveLink(driveLink);
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <h4>${title}</h4>
        <button onclick="window.view360('${directLink}')" class="submit-btn" style="margin-top: 10px; width: 100%;">View 360°</button>
    `;
    photoList.appendChild(card);
}

function renderProjectCard(title, desc, link) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
        <h4>${title}</h4>
        <p>${desc}</p>
        ${link ? `<a href="${link}" target="_blank" style="color: var(--primary); font-size: 0.8rem; text-decoration: none; display: block; margin-top: 10px;">View Project →</a>` : ''}
    `;
    projectList.appendChild(card);
}

// Converts a standard Google Drive share link to a direct image link for the viewer
function convertDriveLink(url) {
    if (url.includes('drive.google.com')) {
        const id = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return url;
}

// --- 360 Viewer Logic ---

function initPanorama(imageSrc = "https://pannellum.org/images/alma.jpg") {
    pannellum.viewer('panorama-container', {
        "type": "equirectangular",
        "panorama": imageSrc,
        "autoLoad": true
    });
}

window.view360 = (url) => {
    initPanorama(url);
};

// Start fetching on load
fetchPortfolioData();
