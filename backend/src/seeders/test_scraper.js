const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const { data } = await axios.get('https://ttgshop.vn/pc');
    const $ = cheerio.load(data);
    
    console.log('Total products found:', $('.p-item').length);
    if ($('.p-item').length === 0) {
      console.log('Trying other selectors...');
      console.log('product-item:', $('.product-item').length);
      console.log('item:', $('.item').length);
      console.log('Product card titles:', $('.p-name, .product-name, .title').slice(0,3).map((i, el) => $(el).text().trim()).get());
    } else {
      const first = $('.p-item').first();
      console.log('First product title:', first.find('.p-name, .title').text().trim());
      console.log('First product price:', first.find('.p-price, .price').text().trim());
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();
