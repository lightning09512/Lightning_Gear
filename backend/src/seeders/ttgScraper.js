const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const axios = require('axios');
const cheerio = require('cheerio');
const slugify = require('slugify');

const sequelize = require('../config/database');
const { Category, Brand, Product, ProductImage } = require('../models');

async function scrapeTTGShop() {
  try {
    console.log('⚡ Đang kết nối database...');
    await sequelize.authenticate();
    
    // Tìm hoặc tạo category PC Gaming
    let pcCategory = await Category.findOne({ where: { name: 'PC Gaming' } });
    if (!pcCategory) {
      pcCategory = await Category.create({
        name: 'PC Gaming',
        slug: 'pc-gaming',
        icon: '🖥️'
      });
      console.log('✅ Đã tạo Category PC Gaming');
    }

    // Tìm hoặc tạo brand TTG (mặc định)
    let ttgBrand = await Brand.findOne({ where: { name: 'TTG Shop' } });
    if (!ttgBrand) {
      ttgBrand = await Brand.create({
        name: 'TTG Shop',
        slug: 'ttg-shop'
      });
      console.log('✅ Đã tạo Brand TTG Shop');
    }

    // Clear old TTG Shop products to avoid duplicates and fix broken ones
    if (ttgBrand) {
      await Product.destroy({ where: { brandId: ttgBrand.id } });
      console.log('🗑️ Đã xóa các sản phẩm TTG cũ.');
    }

    console.log('🌐 Đang lấy dữ liệu từ https://ttgshop.vn/pc...');
    const { data } = await axios.get('https://ttgshop.vn/pc');
    const $ = cheerio.load(data);
    
    const products = [];
    $('.p-item').each((i, el) => {
      const $el = $(el);
      const rawTitle = $el.find('.p-name, .title').text().trim();
      let title = rawTitle;
      let description = '';
      if (rawTitle.includes('Mô tả tóm tắt:')) {
        let parts = rawTitle.split('Mô tả tóm tắt:');
        title = parts[0].trim();
        description = parts[1].trim();
      }

      const priceText = $el.find('.p-price, .price').first().text().trim();
      let productUrl = $el.find('.p-name a, a').first().attr('href');
      if (productUrl && !productUrl.startsWith('http')) {
        productUrl = 'https://ttgshop.vn' + productUrl;
      }
      
      // Tìm ảnh sản phẩm
      let imgUrl = $el.find('.p-img img, .img img, .picture img').attr('src') || $el.find('img').attr('data-src') || $el.find('img').attr('src');
      if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = 'https://ttgshop.vn' + imgUrl;
      }

      // Xử lý giá tiền chính xác hơn
      let price = 0;
      let salePrice = null;
      if (priceText) {
        let priceList = priceText.match(/[\d\.]+/g) || [];
        let validPrices = priceList
          .map(p => parseInt(p.replace(/\./g, ''), 10))
          .filter(p => !isNaN(p) && p > 100000); // Lọc các số lớn hơn 100k
        
        if (validPrices.length > 0) {
          salePrice = Math.min(...validPrices);
          price = Math.max(...validPrices);
          if (price === salePrice) {
            salePrice = null;
          }
        }
      }

      if (title && price > 0 && productUrl) {
        products.push({
          name: title,
          description: description || `Bộ máy tính cấu hình mạnh mẽ: ${title}`,
          price: price,
          salePrice: salePrice,
          imgUrl: imgUrl,
          url: productUrl
        });
      }
    });

    console.log(`📦 Đã xóa các sản phẩm cũ của thương hiệu TTG Shop.`);
    await Product.destroy({ where: { brandId: ttgBrand.id } });

    console.log(`📦 Tìm thấy ${products.length} sản phẩm hợp lệ.`);
    if (products.length === 0) {
      console.log('❌ Không tìm thấy sản phẩm nào. Vui lòng kiểm tra lại cấu trúc HTML.');
      process.exit(1);
    }

    console.log('🔄 Đang lấy chi tiết và lưu vào cơ sở dữ liệu...');
    let count = 0;

    for (const p of products) {
      const baseSlug = slugify(p.name, { lower: true, strict: true, locale: 'vi' });
      const slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

      // Fetch detail page
      let detailDescHtml = p.description; // fallback
      try {
        console.log(`Đang cào chi tiết: ${p.url}`);
        const detailRes = await axios.get(p.url);
        const $d = cheerio.load(detailRes.data);
        
        // Cố gắng tìm phần mô tả chi tiết của TTG Shop sạch sẽ, không trùng lặp
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
        
        if (combinedDesc) {
          detailDescHtml = combinedDesc.trim();
        }
        
        // Cố gắng tìm ảnh nét căng từ og:image
        const detailImg = $d('meta[property="og:image"]').attr('content') || $d('meta[name="twitter:image"]').attr('content');
        if (detailImg && detailImg.startsWith('http')) {
          p.imgUrl = detailImg;
        } else if (detailImg) {
          p.imgUrl = 'https://ttgshop.vn' + detailImg;
        }
      } catch (err) {
        console.log(`Lỗi khi cào ${p.url}: ${err.message}`);
      }

      // Tạo product
      const newProduct = await Product.create({
        name: p.name,
        slug: slug,
        price: p.price,
        salePrice: p.salePrice,
        description: detailDescHtml,
        stock: 10,
        isActive: true,
        categoryId: pcCategory.id,
        brandId: ttgBrand.id,
      });

      // Tạo product image
      // Tạo product image
      if (p.imgUrl) {
        await ProductImage.create({
          productId: newProduct.id,
          imageUrl: p.imgUrl,
          isPrimary: true,
          order: 0
        });
      }
      count++;
    }

    console.log(`✅ Đã cào và lưu thành công ${count} sản phẩm!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

scrapeTTGShop();
