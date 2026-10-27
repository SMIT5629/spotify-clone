const app = require('./src/app');
const http = require('http');

const PORT = 3098;
const server = http.createServer(app);

server.listen(PORT, async () => {
    try {
        const fetch = (url, opt) => globalThis.fetch(`http://localhost:${PORT}` + url, opt);

        // Health
        const hRes = await fetch('/api/health');
        if (hRes.status !== 200) throw new Error('Health check failed: ' + hRes.status);

        // Public music list
        const mRes = await fetch('/api/music');
        if (mRes.status !== 200) throw new Error('Music list failed: ' + mRes.status);
        const mData = await mRes.json();

        // Search
        const sRes = await fetch('/api/music?q=night');
        if (sRes.status !== 200) throw new Error('Search failed: ' + sRes.status);

        // Albums
        const aRes = await fetch('/api/music/albums');
        if (aRes.status !== 200) throw new Error('Albums failed: ' + aRes.status);

        // Artists
        const artRes = await fetch('/api/music/artists');
        if (artRes.status !== 200) throw new Error('Artists failed: ' + artRes.status);

        // Playlists
        const pRes = await fetch('/api/playlists');
        if (pRes.status !== 200) throw new Error('Playlists failed: ' + pRes.status);

        console.log('Backend test suite passed successfully!');
        server.close();
        process.exit(0);
    } catch (err) {
        console.error('Backend test failure:', err.message);
        server.close();
        process.exit(1);
    }
});
