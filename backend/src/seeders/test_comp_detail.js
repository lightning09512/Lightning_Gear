const axios = require('axios');
const cheerio = require('cheerio');

async function testComponent() {
  try {
    console.log('Fetching CPU category list...');
    const listRes = await axios.get('https://ttgshop.vn/cpu');
    const $ = cheerio.load(listRes.data);
    
    // Find first product link
    let productUrl = $('.p-item .p-name a, .p-item a').first().attr('href');
    if (!productUrl) {
      console.log('Could not find CPU product link');
      return;
    }
    if (!productUrl.startsWith('http')) {
      productUrl = 'https://ttgshop.vn' + productUrl;
    }
    
    console.log('Fetching detail for CPU:', productUrl);
    const detailRes = await axios.get(productUrl);
    const $d = cheerio.load(detailRes.data);
    
    console.log('--- All elements with class "static-html" ---');
    $d('.static-html').each((i, el) => {
      console.log(`Index ${i}:`);
      console.log('Classes:', $d(el).attr('class'));
      console.log('Parent tag/class:', $d(el).parent().prop('tagName'), '/', $d(el).parent().attr('class') || $d(el).parent().attr('id'));
      console.log('Text snippet:', $d(el).text().trim().substring(0, 150));
      console.log('--------------------------------------------------');
    });
    
    console.log('--- Descriptions & details ---');
    console.log('.detail-description length:', $d('.detail-description').length);
    console.log('.product-description length:', $d('.product-description').length);
    console.log('.description length:', $d('.description').length);
    console.log('.static-html length:', $d('.static-html').length);
    console.log('.product-summary length:', $d('.product-summary').length);
  } catch (e) {
    console.error(e.message);
  }
}

testComponent();
