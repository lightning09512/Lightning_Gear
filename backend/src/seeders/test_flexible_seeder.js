const fs = require('fs');
const cheerio = require('cheerio');

function testFlexibleLogic(filename) {
  console.log(`=== Testing flexible logic for ${filename} ===`);
  const html = fs.readFileSync(filename, 'utf8');
  const $d = cheerio.load(html);
  
  let combinedDesc = '';
  
  // 1. Scrape product summary (bullet points list)
  const summaryHtml = $d('.product-summary').html();
  if (summaryHtml) {
    combinedDesc += `<div class="product-summary-scraped mb-6">${summaryHtml}</div>`;
  }
  
  // 2. Scrape detailed descriptions (any .static-html without a table)
  let descriptionHtmls = [];
  $d('.static-html').each((i, el) => {
    const $el = $d(el);
    // Ignore hidden containers
    if ($el.parent().hasClass('hidden') || $el.parent().attr('id') === 'js-detail-spec-all') {
      return;
    }
    // If it has NO table, it is a detailed description text paragraph
    if ($el.find('table').length === 0) {
      const htmlContent = $el.html();
      if (htmlContent && htmlContent.trim().length > 20) {
        descriptionHtmls.push(htmlContent.trim());
      }
    }
  });
  
  if (descriptionHtmls.length > 0) {
    combinedDesc += `<div class="product-description-scraped mb-6">`;
    descriptionHtmls.forEach(desc => {
      combinedDesc += `<div class="desc-block mb-4">${desc}</div>`;
    });
    combinedDesc += `</div>`;
  }
  
  // 3. Scrape specifications table (the .static-html inside .detail-spec or containing a table)
  let specHtml = $d('.detail-spec .static-html').first().html();
  if (!specHtml) {
    // Fallback: first static-html containing a table
    $d('.static-html').each((i, el) => {
      const $el = $d(el);
      if ($el.find('table').length > 0 && !$el.parent().hasClass('hidden')) {
        specHtml = $el.html();
        return false; // break loop
      }
    });
  }
  
  if (specHtml) {
    combinedDesc += `<div class="product-spec-scraped"><h3 class="text-xl font-bold mb-4">THÔNG SỐ KỸ THUẬT</h3>${specHtml}</div>`;
  }
  
  console.log('Result HTML length:', combinedDesc.length);
  // Count how many times table tag appears
  const tablesCount = (combinedDesc.match(/<table/g) || []).length;
  console.log('Number of tables:', tablesCount);
  console.log('Has summary:', !!summaryHtml);
  console.log('Has detailed description blocks:', descriptionHtmls.length);
  console.log('Has specs:', !!specHtml);
  console.log('--------------------------------------------\n');
}

testFlexibleLogic('test_detail.html');
testFlexibleLogic('test_detail_2.html');
// If we want to simulate the first product page:
// We can use inspect_first_product.js logic to fetch and verify or just write another simulation.
