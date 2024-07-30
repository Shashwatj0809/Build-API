const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');

const PORT = 9002;

const app = express();

const cryptonews=[
    {
        name:'cryptonews',
        address:'https://cryptonews.net/',
        base:'https://cryptonews.net/'
    },

    {
        name:'coindesk',
        address:'https://www.coindesk.com/',
        base:'https://www.coindesk.com/'
    }
]

const articles = [];

cryptonews.forEach(cryptonews=>{
    axios.get(cryptonews.address)
    .then(response =>{
        const html=response.data
        const $ = cheerio.load(html)

        $('a', html).each(function () {
            const title = $(this).text();
            let url = $(this).attr('href');
            if (url && !url.startsWith('http')) {
                url = cryptonews.base + url;
            }
            articles.push({
                title,
                url: url,
                source: cryptonews.name
            });
        });
    })
})

app.get('/', (req, res) => {
    res.json('Welcome to the API building platform');
});

app.get('/news', async (req, res) => {
    res.json(articles);
});

app.get('/news/:cryptonewsId',async(req,res)=>{
    const cryptonewsId = req.params.cryptonewsId;
    const newsSite = cryptonews.find(news => news.name === cryptonewsId);

    if (!newsSite) {
        return res.status(404).json({ message: 'News site not found' });
    }

    try {
        const response = await axios.get(newsSite.address, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const particularArticles = [];

        $('a', html).each(function () {
            const title = $(this).text();
            const url = $(this).attr('href');
            particularArticles.push({
                title,
                url: newsSite.base + url,
                source: newsSite.name
            });
        });

        res.json(particularArticles);
    } catch (error) {
        console.error(`Error fetching articles from ${newsSite.name}:`, error);
        res.status(500).json({ message: 'Error fetching the news' });
    }
})

app.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));
