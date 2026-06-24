const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function checkUrl(url) {
  try {
    console.log('Fetching', url);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    fs.writeFileSync('test_detail_2.html', data);
    console.log('Saved to test_detail_2.html');
    
    console.log('--- All elements with class "static-html" ---');
    $('.static-html').each((i, el) => {
      console.log(`Index ${i}:`);
      console.log('Classes:', $(el).attr('class'));
      console.log('Parent tag/class:', $(el).parent().prop('tagName'), '/', $(el).parent().attr('class') || $(el).parent().attr('id'));
      console.log('Text snippet:', $(el).text().trim().substring(0, 150));
      console.log('--------------------------------------------------');
    });
    
    console.log('--- Other potential description containers ---');
    console.log('.detail-description length:', $('.detail-description').length);
    console.log('.product-description length:', $('.product-description').length);
    console.log('.description length:', $('.description').length);
    console.log('article length:', $('article').length);
    console.log('.detail-content length:', $('.detail-content').length);
    console.log('.detail-summary length:', $('.detail-summary').length);
    console.log('.detail-post length:', $('.detail-post').length);
    console.log('.static-html length:', $('.static-html').length);
  } catch (err) {
    console.error(err.message);
  }
}

checkUrl('https://ttgshop.vn/pc-ttg-amd-gaming-ryzen-7-9800x3d-rtx-5070-ti-16gb-oc');
