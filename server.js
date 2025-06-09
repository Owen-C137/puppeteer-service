const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/crawl', async (req, res) => {
    const url = req.query.url;

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Missing or invalid ?url=' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const links = await page.evaluate(() => {
            const base = location.origin;
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(href => href.startsWith(base));
        });

        await browser.close();
        res.json({
            url,
            count: links.length,
            links: [...new Set(links)]
        });
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
});

app.get('/', (req, res) => {
    res.send('🕷️ Puppeteer Crawler is running. Use /crawl?url=https://example.com');
});

app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
