const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_detail.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- 1. All elements with class "static-html" ---');
$('.static-html').each((i, el) => {
  console.log(`Index ${i}:`);
  console.log('Classes:', $(el).attr('class'));
  console.log('Parent tag/class:', $(el).parent().prop('tagName'), '/', $(el).parent().attr('class') || $(el).parent().attr('id'));
  console.log('Text snippet:', $(el).text().trim().substring(0, 100));
  console.log('--------------------------------------------------');
});

console.log('--- 2. Elements with header tags (h1, h2, h3) ---');
$('h1, h2, h3').each((i, el) => {
  console.log($(el).prop('tagName'), ':', $(el).text().trim(), 'Class:', $(el).attr('class'));
});
