const axios = require('axios');
const cheerio = require('cheerio');

async function testDetailScraping() {
  try {
    console.log('Fetching list to get a product URL...');
    const listRes = await axios.get('https://ttgshop.vn/pc');
    let $ = cheerio.load(listRes.data);
    
    // Find the first product link
    let productUrl = $('.p-item .p-name a, .p-item a').first().attr('href');
    if (!productUrl) {
      console.log('Could not find a product URL');
      return;
    }
    if (!productUrl.startsWith('http')) {
      productUrl = 'https://ttgshop.vn' + productUrl;
    }
    
    console.log('Testing detail scraping for:', productUrl);
    const detailRes = await axios.get(productUrl);
    $ = cheerio.load(detailRes.data);
    
    // Save HTML to a file to inspect
    const fs = require('fs');
    fs.writeFileSync('test_detail.html', detailRes.data);
    console.log('Saved to test_detail.html');

  } catch (error) {
    console.error('Error:', error);
  }
}

testDetailScraping();
