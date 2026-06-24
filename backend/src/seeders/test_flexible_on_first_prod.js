const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://ttgshop.vn/pc-ttg-ultra-gaming-i5-14600kf-16gb-ddr4-rtx-5050-8gb';
  try {
    console.log('Fetching', url);
    const { data } = await axios.get(url);
    const $d = cheerio.load(data);
    
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
    const tablesCount = (combinedDesc.match(/<table/g) || []).length;
    console.log('Number of tables:', tablesCount);
    console.log('Has summary:', !!summaryHtml);
    console.log('Has detailed description blocks:', descriptionHtmls.length);
    console.log('Has specs:', !!specHtml);
    console.log('Snippet of description:', descriptionHtmls[0] ? descriptionHtmls[0].substring(0, 150) + '...' : 'none');
  } catch (err) {
    console.error(err.message);
  }
}

test();
