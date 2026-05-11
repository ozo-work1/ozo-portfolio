const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1NQIGjGNwUMKmTKTQyt8QwOVQStYckb02YaUIphgsYCM/pub?output=csv';

async function loadGallery() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const gallery = document.getElementById('gallery');
                if (!gallery) return;
                gallery.innerHTML = '';
                
                results.data.forEach(item => {
                    if (!item.Title || !item.ImageLink) return;
                    
                    const card = document.createElement('div');
                    card.className = 'card photography';
                    card.innerHTML = \`
                        <div class="card-content">
                            <div class="icon">📸</div>
                            <h2>\${item.Title}</h2>
                            <p>\${item.Description || ''}</p>
                            <button class="action-btn">View Capture</button>
                        </div>
                        <div class="glow"></div>
                    \`;
                    
                    card.onclick = () => openViewer(item.ImageLink, item.Type);
                    gallery.appendChild(card);
                });
            }
        });
    } catch (err) {
        console.error("Error loading gallery data:", err);
    }
}

function openViewer(url, type) {
    const container = document.getElementById('viewer-container');
    const pano = document.getElementById('panorama');
    if (!container || !pano) return;

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
    
    pano.innerHTML = '';

    if (type && type.toLowerCase().includes('360')) {
        pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": url,
            "autoLoad": true
        });
    } else {
        pano.innerHTML = \`<img src="\${url}" style="width: 100%; height: 100%; object-fit: contain;">\`;
    }
}

function closeViewer() {
    const container = document.getElementById('viewer-container');
    if (container) container.style.display = 'none';
    const pano = document.getElementById('panorama');
    if (pano) pano.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', loadGallery);
