const https = require('https');
const fs = require('fs');

const manifestUrl = 'https://stud.whoim.space/manifest.json';
const apiUrl = 'https://pwabuilder-android-rest.azurewebsites.net/api/generate';

const payload = JSON.stringify({
    manifestUrl: manifestUrl,
    manifest: {
        name: "X-Booster",
        short_name: "X-Booster",
        start_url: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        description: "A Web3 social engagement platform",
        icons: [
            { src: "/icon.png", sizes: "192x192", type: "image/png" },
            { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
    },
    url: "https://stud.whoim.space"
});

const req = https.request(apiUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
}, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Request Failed. Status Code: ${res.statusCode}`);
        return;
    }
    const file = fs.createWriteStream('aibat-android-pwa.zip');
    res.pipe(file);
    file.on('finish', () => {
        console.log('Successfully downloaded aibat-android-pwa.zip!');
        file.close();
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
