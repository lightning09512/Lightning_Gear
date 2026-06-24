const axios = require('axios');
const cheerio = require('cheerio');

async function testUrls() {
  const urls = [
    'https://ttgshop.vn/linh-kien-may-tinh',
    'https://ttgshop.vn/man-hinh-may-tinh',
    'https://ttgshop.vn/man-hinh',
    'https://ttgshop.vn/may-tinh-choi-game'
  ];

  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(res.data);
      const title = $('title').text();
      const pItemsCount = $('.p-item').length;
      const productLoopCount = $('.pro-loop').length;
      console.log(`  -> Status: ${res.status}, Title: "${title.trim()}"`);
      console.log(`  -> p-item class count: ${pItemsCount}, pro-loop class count: ${productLoopCount}`);
    } catch (err) {
      console.log(`  -> Failed: ${err.message}`);
    }
  }
}

testUrls();
