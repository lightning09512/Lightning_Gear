const fs = require('fs');
const cheerio = require('cheerio');

function testLogic(filename) {
  console.log(`=== Testing logic for ${filename} ===`);
  const html = fs.readFileSync(filename, 'utf8');
  const $d = cheerio.load(html);
  
  let detailDescHtml = '';
  const summaryHtml = $d('.product-summary').html();
  // Get first .static-html or .js-vm-content
  const specHtml = $d('.static-html').first().html();
  
  if (summaryHtml) {
    detailDescHtml += `<div class="product-summary-scraped mb-6">${summaryHtml}</div>`;
  }
  if (specHtml) {
    detailDescHtml += `<div class="product-spec-scraped"><h3 class="text-xl font-bold mb-4">THÔNG SỐ KỸ THUẬT</h3>${specHtml}</div>`;
  }
  
  console.log('Result HTML length:', detailDescHtml.length);
  // Count how many times table tag appears
  const tablesCount = (detailDescHtml.match(/<table/g) || []).length;
  console.log('Number of tables:', tablesCount);
  
  // Print a small sample of the summary and specs
  console.log('Has summary:', !!summaryHtml);
  console.log('Has specs:', !!specHtml);
  console.log('--------------------------------------------\n');
}

testLogic('test_detail.html');
testLogic('test_detail_2.html');
