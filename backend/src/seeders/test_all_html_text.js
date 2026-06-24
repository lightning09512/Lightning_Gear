const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test_detail_2.html', 'utf8');
const $ = cheerio.load(html);

// Remove scripts, styles, header, footer, combo popup, navigation, etc. to focus on the main product body
$('script, style, header, footer, .global-header, .global-support, .header-top, .header-middle, .header-bottom, .pd-combo-popup, .navbar-list, .navbar-item, .sub-menu').remove();

console.log('--- Checking large text blocks ---');
$('*').each((i, el) => {
  const $el = $(el);
  const text = $el.clone().children().remove().end().text().trim();
  if (text.length > 100) {
    console.log(`Tag: ${el.tagName}, Class: ${$el.attr('class') || 'none'}, Parent: ${$el.parent().prop('tagName')}/${$el.parent().attr('class')}`);
    console.log(`Text snippet (${text.length} chars): ${text.substring(0, 150)}`);
    console.log('---');
  }
});
