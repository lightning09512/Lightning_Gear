const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://ttgshop.vn/pc-ttg-ultra-gaming-i5-14600kf-16gb-ddr4-rtx-5050-8gb';
  try {
    console.log('Fetching', url);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    console.log('static-html length:', $('.static-html').length);
    console.log('product-summary length:', $('.product-summary').length);
    console.log('detail-spec length:', $('.detail-spec').length);
    
    if ($('.static-html').length > 0) {
      console.log('First static-html snippet:', $('.static-html').first().text().trim().substring(0, 100));
    } else {
      console.log('NO static-html element found!');
    }
  } catch (err) {
    console.error(err.message);
  }
}

test();
