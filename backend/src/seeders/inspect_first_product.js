const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://ttgshop.vn/pc-ttg-ultra-gaming-i5-14600kf-16gb-ddr4-rtx-5050-8gb';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    $('.static-html').each((i, el) => {
      console.log(`Index ${i}:`);
      console.log('Classes:', $(el).attr('class'));
      console.log('Parent:', $(el).parent().prop('tagName'), '/', $(el).parent().attr('class'));
      console.log('Text snippet:', $(el).text().trim().substring(0, 150));
      console.log('Has table:', $(el).find('table').length > 0);
      console.log('-------------------------');
    });
  } catch (err) {
    console.error(err.message);
  }
}

test();
