const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://ttgshop.vn/pc-ttg-amd-gaming-ryzen-7-9800x3d-rtx-5070-ti-16gb-oc').then(res => {
  const doc = cheerio.load(res.data);
  doc('.static-html, .product-summary, .detail-info, .content').each((i, el) => {
    const html = doc(el).html() || '';
    if (html.length > 50) {
      console.log('MATCH:', doc(el).attr('class') || el.tagName, 'LEN:', html.length);
      console.log('FIRST 50:', html.substring(0, 50).replace(/\n/g, ' '));
    }
  });
});
