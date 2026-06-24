const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const axios = require('axios');
const cheerio = require('cheerio');
const slugify = require('slugify');

const sequelize = require('../config/database');
const { Category, Brand, Product, ProductImage } = require('../models');

// Brand detection mapping
const BRAND_KEYWORDS = [
  { name: 'ASUS', keywords: ['asus', 'rog', 'tuf'] },
  { name: 'MSI', keywords: ['msi'] },
  { name: 'Gigabyte', keywords: ['gigabyte', 'aorus'] },
  { name: 'Samsung', keywords: ['samsung'] },
  { name: 'Kingston', keywords: ['kingston', 'fury'] },
  { name: 'Corsair', keywords: ['corsair'] },
  { name: 'Intel', keywords: ['intel'] },
  { name: 'AMD', keywords: ['amd', 'ryzen'] },
  { name: 'NVIDIA', keywords: ['nvidia', 'geforce', 'rtx', 'gtx'] },
  { name: 'Dell', keywords: ['dell'] },
  { name: 'HP', keywords: ['hp'] },
  { name: 'Lenovo', keywords: ['lenovo'] },
  { name: 'Logitech', keywords: ['logitech'] },
  { name: 'Razer', keywords: ['razer'] }
];

async function runScraper() {
  try {
    console.log('⚡ Đang kết nối cơ sở dữ liệu...');
    await sequelize.authenticate();

    // 1. Find or create categories
    let categoryLinhKien = await Category.findOne({ where: { slug: 'linh-kien' } });
    if (!categoryLinhKien) {
      categoryLinhKien = await Category.create({ name: 'Linh kiện', slug: 'linh-kien', icon: '🔧' });
    }
    
    let categoryManHinh = await Category.findOne({ where: { slug: 'man-hinh' } });
    if (!categoryManHinh) {
      categoryManHinh = await Category.create({ name: 'Màn hình', slug: 'man-hinh', icon: '🖥️' });
    }

    // Find subcategories for Linh kiện
    const gpuCat = await Category.findOne({ where: { slug: 'gpu' } });
    const ramCat = await Category.findOne({ where: { slug: 'ram' } });
    const ssdCat = await Category.findOne({ where: { slug: 'ssd-o-cung' } });
    const cpuCat = await Category.findOne({ where: { slug: 'cpu' } });
    const mainboardCat = await Category.findOne({ where: { slug: 'mainboard' } });

    // Default Brand
    let defaultBrand = await Brand.findOne({ where: { name: 'TTG Shop' } });
    if (!defaultBrand) {
      defaultBrand = await Brand.create({ name: 'TTG Shop', slug: 'ttg-shop' });
    }

    // Get all current brands to match
    const dbBrands = await Brand.findAll();

    const targets = [
      { url: 'https://ttgshop.vn/linh-kien-may-tinh', category: categoryLinhKien, limit: 12 },
      { url: 'https://ttgshop.vn/man-hinh-may-tinh', category: categoryManHinh, limit: 12 }
    ];

    for (const target of targets) {
      console.log(`\n🌐 Đang cào danh mục: ${target.category.name} từ ${target.url}...`);
      const { data } = await axios.get(target.url);
      const $ = cheerio.load(data);
      
      const productList = [];
      $('.p-item').each((i, el) => {
        if (productList.length >= target.limit) return;

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
        
        let imgUrl = $el.find('.p-img img, .img img, .picture img').attr('src') || $el.find('img').attr('data-src') || $el.find('img').attr('src');
        if (imgUrl && !imgUrl.startsWith('http')) {
          imgUrl = 'https://ttgshop.vn' + imgUrl;
        }

        let price = 0;
        let salePrice = null;
        if (priceText) {
          let priceList = priceText.match(/[\d\.]+/g) || [];
          let validPrices = priceList
            .map(p => parseInt(p.replace(/\./g, ''), 10))
            .filter(p => !isNaN(p) && p > 50000); // Lọc các giá trị lớn hơn 50k
          
          if (validPrices.length > 0) {
            salePrice = Math.min(...validPrices);
            price = Math.max(...validPrices);
            if (price === salePrice) {
              salePrice = null;
            }
          }
        }

        if (title && price > 0 && productUrl) {
          productList.push({
            name: title,
            description: description || `Sản phẩm ${title} chính hãng, chất lượng cao.`,
            price: price,
            salePrice: salePrice,
            imgUrl: imgUrl,
            url: productUrl
          });
        }
      });

      console.log(`📦 Tìm thấy ${productList.length} sản phẩm sơ bộ. Bắt đầu lấy chi tiết...`);

      for (const p of productList) {
        // Detect brand
        let matchedBrand = defaultBrand;
        const titleLower = p.name.toLowerCase();
        
        for (const brandConfig of BRAND_KEYWORDS) {
          if (brandConfig.keywords.some(kw => titleLower.includes(kw))) {
            // Find existing in db
            let dbBrand = dbBrands.find(b => b.name.toLowerCase() === brandConfig.name.toLowerCase());
            if (!dbBrand) {
              dbBrand = await Brand.findOne({ where: { name: brandConfig.name } });
            }
            if (!dbBrand) {
              dbBrand = await Brand.create({ name: brandConfig.name, slug: slugify(brandConfig.name, { lower: true }) });
            }
            matchedBrand = dbBrand;
            break;
          }
        }

        // Generate clean unique slug
        const baseSlug = slugify(p.name, { lower: true, strict: true, locale: 'vi' });
        const slug = `${baseSlug}-${Math.floor(Math.random() * 100000)}`;

        // Resolve subcategory for Linh kien
        let resolvedCategoryId = target.category.id;
        if (target.category.slug === 'linh-kien') {
          if (titleLower.includes('vga') || titleLower.includes('rtx') || titleLower.includes('gtx') || titleLower.includes('rx ') || titleLower.includes('radeon') || titleLower.includes('card màn hình') || titleLower.includes('card đồ họa') || titleLower.includes('graphics card')) {
            if (gpuCat) resolvedCategoryId = gpuCat.id;
          } else if (titleLower.includes('ram') || titleLower.includes('ddr4') || titleLower.includes('ddr5') || titleLower.includes('bộ nhớ trong') || titleLower.includes('g.skill') || titleLower.includes('vengeance') || titleLower.includes('trident')) {
            if (ramCat) resolvedCategoryId = ramCat.id;
          } else if (titleLower.includes('ssd') || titleLower.includes('hdd') || titleLower.includes('ổ cứng') || titleLower.includes('nvme') || titleLower.includes('990 pro') || titleLower.includes('kingston nv2') || titleLower.includes('sn850x')) {
            if (ssdCat) resolvedCategoryId = ssdCat.id;
          } else if (titleLower.includes('cpu') || titleLower.includes('intel core') || titleLower.includes('ryzen') || titleLower.includes('bộ vi xử lý') || titleLower.includes('14900k') || titleLower.includes('7800x3d') || titleLower.includes('14700k')) {
            if (cpuCat) resolvedCategoryId = cpuCat.id;
          } else if (titleLower.includes('mainboard') || titleLower.includes('bo mạch chủ') || titleLower.includes('z790') || titleLower.includes('b760') || titleLower.includes('x670') || titleLower.includes('b650') || titleLower.includes('h610') || titleLower.includes('bo mach chu') || titleLower.includes('tomahawk') || titleLower.includes('aorus')) {
            if (mainboardCat) resolvedCategoryId = mainboardCat.id;
          }
        }

        // Check if product with this name already exists
        const existingProduct = await Product.findOne({ where: { name: p.name } });
        let isPlaceholder = false;
        if (existingProduct) {
          const primaryImage = await ProductImage.findOne({ where: { productId: existingProduct.id, isPrimary: true } });
          if (!primaryImage || primaryImage.imageUrl.includes('placehold.co') || primaryImage.imageUrl.includes('placeholder')) {
            isPlaceholder = true;
          }
        }

        if (existingProduct && !isPlaceholder) {
          console.log(`⏭️ Đã tồn tại sản phẩm với ảnh thật: ${p.name}. Bỏ qua.`);
          continue;
        }

        // Fetch detail content
        let detailDescHtml = p.description;
        try {
          console.log(`   -> Đang tải chi tiết: ${p.name}`);
          const detailRes = await axios.get(p.url);
          const $d = cheerio.load(detailRes.data);
          
          let combinedDesc = '';
          const summaryHtml = $d('.product-summary').html();
          if (summaryHtml) {
            combinedDesc += `<div class="product-summary-scraped mb-6">${summaryHtml}</div>`;
          }

          let descriptionHtmls = [];
          $d('.static-html').each((i, el) => {
            const $el = $d(el);
            if ($el.parent().hasClass('hidden') || $el.parent().attr('id') === 'js-detail-spec-all') {
              return;
            }
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

          let specHtml = $d('.detail-spec .static-html').first().html();
          if (!specHtml) {
            $d('.static-html').each((i, el) => {
              const $el = $d(el);
              if ($el.find('table').length > 0 && !$el.parent().hasClass('hidden')) {
                specHtml = $el.html();
                return false;
              }
            });
          }

          if (specHtml) {
            combinedDesc += `<div class="product-spec-scraped"><h3 class="text-xl font-bold mb-4">THÔNG SỐ KỸ THUẬT</h3>${specHtml}</div>`;
          }

          if (combinedDesc) {
            detailDescHtml = combinedDesc.trim();
          }

          const detailImg = $d('meta[property="og:image"]').attr('content') || $d('meta[name="twitter:image"]').attr('content');
          if (detailImg && detailImg.startsWith('http')) {
            p.imgUrl = detailImg;
          } else if (detailImg) {
            p.imgUrl = 'https://ttgshop.vn' + detailImg;
          }
        } catch (err) {
          console.log(`   ⚠️ Lỗi cào chi tiết cho ${p.name}: ${err.message}`);
        }

        if (existingProduct) {
          console.log(`🔄 Cập nhật thông tin và ảnh thật cho: ${p.name}`);
          await existingProduct.update({
            price: p.price,
            salePrice: p.salePrice,
            description: detailDescHtml,
            categoryId: resolvedCategoryId,
            brandId: matchedBrand.id
          });
          
          await ProductImage.destroy({ where: { productId: existingProduct.id } });
          if (p.imgUrl) {
            await ProductImage.create({
              productId: existingProduct.id,
              imageUrl: p.imgUrl,
              isPrimary: true,
              order: 0
            });
          }
        } else {
          // Create product record
          const newProduct = await Product.create({
            name: p.name,
            slug: slug,
            price: p.price,
            salePrice: p.salePrice,
            description: detailDescHtml,
            stock: Math.floor(Math.random() * 20) + 5, // Random stock 5-25
            isActive: true,
            categoryId: resolvedCategoryId,
            brandId: matchedBrand.id,
          });

          if (p.imgUrl) {
            await ProductImage.create({
              productId: newProduct.id,
              imageUrl: p.imgUrl,
              isPrimary: true,
              order: 0
            });
          }
          console.log(`✅ Đã tạo mới sản phẩm: ${p.name}`);
        }
      }
    }

    console.log('\n🎉 Hoàn thành cào và nạp dữ liệu Linh kiện & Màn hình!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Thất bại:', error);
    process.exit(1);
  }
}

runScraper();
