const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Brand, Product, ProductImage, ProductSpec } = require('../models');

async function seedData() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    // === CATEGORIES ===
    const categories = await Category.bulkCreate([
      { name: 'PC Gaming', slug: 'pc-gaming', icon: '🖥️' },
      { name: 'Laptop', slug: 'laptop', icon: '💻' },
      { name: 'Linh kiện', slug: 'linh-kien', icon: '🔧' },
      { name: 'Phụ kiện', slug: 'phu-kien', icon: '🎮' },
      { name: 'Màn hình', slug: 'man-hinh', icon: '🖥️' },
    ], { ignoreDuplicates: true });

    // Sub-categories for Linh kiện
    const linhKien = await Category.findOne({ where: { slug: 'linh-kien' } });
    if (linhKien) {
      await Category.bulkCreate([
        { name: 'Card đồ họa (GPU)', slug: 'gpu', icon: '🎴', parentId: linhKien.id },
        { name: 'RAM', slug: 'ram', icon: '📟', parentId: linhKien.id },
        { name: 'SSD / Ổ cứng', slug: 'ssd-o-cung', icon: '💾', parentId: linhKien.id },
        { name: 'CPU', slug: 'cpu', icon: '⚙️', parentId: linhKien.id },
        { name: 'Mainboard', slug: 'mainboard', icon: '📋', parentId: linhKien.id },
      ], { ignoreDuplicates: true });
    }

    // Sub-categories for Phụ kiện
    const phuKien = await Category.findOne({ where: { slug: 'phu-kien' } });
    if (phuKien) {
      await Category.bulkCreate([
        { name: 'Bàn phím cơ', slug: 'ban-phim-co', icon: '⌨️', parentId: phuKien.id },
        { name: 'Chuột gaming', slug: 'chuot-gaming', icon: '🖱️', parentId: phuKien.id },
        { name: 'Tai nghe', slug: 'tai-nghe', icon: '🎧', parentId: phuKien.id },
      ], { ignoreDuplicates: true });
    }

    // === BRANDS ===
    await Brand.bulkCreate([
      { name: 'NVIDIA' },
      { name: 'AMD' },
      { name: 'Intel' },
      { name: 'ASUS' },
      { name: 'MSI' },
      { name: 'Gigabyte' },
      { name: 'Corsair' },
      { name: 'Logitech' },
      { name: 'Razer' },
      { name: 'Samsung' },
      { name: 'Kingston' },
      { name: 'Western Digital' },
      { name: 'Dell' },
      { name: 'Lenovo' },
      { name: 'HP' },
    ], { ignoreDuplicates: true });

    // === PRODUCTS ===
    const gpu = await Category.findOne({ where: { slug: 'gpu' } });
    const ram = await Category.findOne({ where: { slug: 'ram' } });
    const ssd = await Category.findOne({ where: { slug: 'ssd-o-cung' } });
    const banPhim = await Category.findOne({ where: { slug: 'ban-phim-co' } });
    const chuot = await Category.findOne({ where: { slug: 'chuot-gaming' } });
    const taiNghe = await Category.findOne({ where: { slug: 'tai-nghe' } });
    const manHinh = await Category.findOne({ where: { slug: 'man-hinh' } });
    const laptopCat = await Category.findOne({ where: { slug: 'laptop' } });

    const nvidia = await Brand.findOne({ where: { name: 'NVIDIA' } });
    const asus = await Brand.findOne({ where: { name: 'ASUS' } });
    const msi = await Brand.findOne({ where: { name: 'MSI' } });
    const corsair = await Brand.findOne({ where: { name: 'Corsair' } });
    const logitech = await Brand.findOne({ where: { name: 'Logitech' } });
    const razer = await Brand.findOne({ where: { name: 'Razer' } });
    const samsung = await Brand.findOne({ where: { name: 'Samsung' } });
    const kingston = await Brand.findOne({ where: { name: 'Kingston' } });

    const productsData = [
      {
        name: 'ASUS ROG STRIX RTX 4090 OC 24GB',
        slug: 'asus-rog-strix-rtx-4090-oc-24gb-' + Date.now(),
        description: 'Card đồ họa cao cấp nhất dòng RTX 40 series, hiệu năng đỉnh cao cho gaming 4K và sáng tạo nội dung.',
        price: 52990000,
        salePrice: 49990000,
        stock: 15,
        categoryId: gpu?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'GPU', specValue: 'NVIDIA GeForce RTX 4090' },
          { specKey: 'VRAM', specValue: '24GB GDDR6X' },
          { specKey: 'Boost Clock', specValue: '2610 MHz' },
          { specKey: 'TDP', specValue: '450W' },
          { specKey: 'Interface', specValue: 'PCIe 4.0 x16' },
        ],
      },
      {
        name: 'MSI GeForce RTX 4070 Ti SUPER GAMING X SLIM',
        slug: 'msi-rtx-4070-ti-super-gaming-x-slim-' + (Date.now() + 1),
        description: 'Card đồ họa hiệu năng cao cho gaming 1440p, thiết kế mỏng gọn.',
        price: 22990000,
        salePrice: 21490000,
        stock: 25,
        categoryId: gpu?.id,
        brandId: msi?.id,
        specs: [
          { specKey: 'GPU', specValue: 'NVIDIA GeForce RTX 4070 Ti SUPER' },
          { specKey: 'VRAM', specValue: '16GB GDDR6X' },
          { specKey: 'Boost Clock', specValue: '2640 MHz' },
          { specKey: 'TDP', specValue: '285W' },
        ],
      },
      {
        name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz',
        slug: 'corsair-vengeance-ddr5-32gb-6000mhz-' + (Date.now() + 2),
        description: 'RAM DDR5 hiệu năng cao, tối ưu cho Intel và AMD Ryzen 7000.',
        price: 3290000,
        salePrice: 2990000,
        stock: 50,
        categoryId: ram?.id,
        brandId: corsair?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '32GB (2x16GB)' },
          { specKey: 'Tốc độ', specValue: '6000 MHz' },
          { specKey: 'Loại', specValue: 'DDR5' },
          { specKey: 'CAS Latency', specValue: 'CL36' },
          { specKey: 'Điện áp', specValue: '1.35V' },
        ],
      },
      {
        name: 'Samsung 990 PRO 2TB NVMe M.2 SSD',
        slug: 'samsung-990-pro-2tb-nvme-' + (Date.now() + 3),
        description: 'SSD NVMe Gen 4 tốc độ đọc lên đến 7450 MB/s, lý tưởng cho game và công việc chuyên nghiệp.',
        price: 5490000,
        salePrice: 4990000,
        stock: 40,
        categoryId: ssd?.id,
        brandId: samsung?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '2TB' },
          { specKey: 'Interface', specValue: 'NVMe PCIe Gen 4.0 x4' },
          { specKey: 'Đọc tuần tự', specValue: '7,450 MB/s' },
          { specKey: 'Ghi tuần tự', specValue: '6,900 MB/s' },
          { specKey: 'Form Factor', specValue: 'M.2 2280' },
        ],
      },
      {
        name: 'Razer BlackWidow V4 Pro — Bàn phím cơ Gaming',
        slug: 'razer-blackwidow-v4-pro-' + (Date.now() + 4),
        description: 'Bàn phím cơ cao cấp với switch Razer Green, RGB Chroma, command dial và media keys.',
        price: 5990000,
        salePrice: null,
        stock: 30,
        categoryId: banPhim?.id,
        brandId: razer?.id,
        specs: [
          { specKey: 'Switch', specValue: 'Razer Green Mechanical' },
          { specKey: 'Layout', specValue: 'Full-size' },
          { specKey: 'Kết nối', specValue: 'USB-C, có dây' },
          { specKey: 'RGB', specValue: 'Razer Chroma RGB' },
          { specKey: 'Keycap', specValue: 'Doubleshot ABS' },
        ],
      },
      {
        name: 'Logitech G PRO X SUPERLIGHT 2 — Chuột Gaming',
        slug: 'logitech-g-pro-x-superlight-2-' + (Date.now() + 5),
        description: 'Chuột gaming không dây siêu nhẹ 60g, cảm biến HERO 2 25K DPI.',
        price: 3590000,
        salePrice: 3290000,
        stock: 35,
        categoryId: chuot?.id,
        brandId: logitech?.id,
        specs: [
          { specKey: 'Cảm biến', specValue: 'HERO 2 Sensor' },
          { specKey: 'DPI', specValue: 'Lên đến 32,000' },
          { specKey: 'Trọng lượng', specValue: '60g' },
          { specKey: 'Kết nối', specValue: 'LIGHTSPEED Wireless' },
          { specKey: 'Pin', specValue: '95 giờ' },
        ],
      },
      {
        name: 'ASUS ROG Swift OLED PG27AQDM — 27" 1440p 240Hz',
        slug: 'asus-rog-swift-oled-pg27aqdm-' + (Date.now() + 6),
        description: 'Màn hình gaming OLED 27 inch, 1440p, 240Hz, 0.03ms, HDR True Black 400.',
        price: 22990000,
        salePrice: 20990000,
        stock: 10,
        categoryId: manHinh?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '26.5 inch' },
          { specKey: 'Độ phân giải', specValue: '2560 x 1440 (QHD)' },
          { specKey: 'Tần số quét', specValue: '240Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '0.03ms GtG' },
          { specKey: 'Tấm nền', specValue: 'OLED' },
          { specKey: 'HDR', specValue: 'HDR True Black 400' },
        ],
      },
      {
        name: 'ASUS ROG Zephyrus G16 (2024) — RTX 4070, i9-14900HX',
        slug: 'asus-rog-zephyrus-g16-2024-' + (Date.now() + 7),
        description: 'Laptop gaming siêu mỏng nhẹ, màn hình OLED 16", hiệu năng mạnh mẽ cho gaming và sáng tạo.',
        price: 52990000,
        salePrice: 48990000,
        stock: 8,
        categoryId: laptopCat?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'CPU', specValue: 'Intel Core i9-14900HX' },
          { specKey: 'GPU', specValue: 'NVIDIA RTX 4070 8GB' },
          { specKey: 'RAM', specValue: '32GB DDR5 5600MHz' },
          { specKey: 'Ổ cứng', specValue: '1TB NVMe PCIe 4.0' },
          { specKey: 'Màn hình', specValue: '16" 2560x1600 OLED 240Hz' },
          { specKey: 'Pin', specValue: '90Wh' },
          { specKey: 'Trọng lượng', specValue: '1.85 kg' },
        ],
      },
      {
        name: 'Kingston FURY Beast DDR5 16GB 5600MHz',
        slug: 'kingston-fury-beast-ddr5-16gb-' + (Date.now() + 8),
        description: 'RAM DDR5 gaming với tản nhiệt hiệu quả, hỗ trợ Intel XMP 3.0.',
        price: 1290000,
        salePrice: 1090000,
        stock: 80,
        categoryId: ram?.id,
        brandId: kingston?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '16GB' },
          { specKey: 'Tốc độ', specValue: '5600 MHz' },
          { specKey: 'Loại', specValue: 'DDR5' },
          { specKey: 'CAS Latency', specValue: 'CL36' },
        ],
      },
      {
        name: 'Corsair HS80 MAX Wireless — Tai nghe Gaming',
        slug: 'corsair-hs80-max-wireless-' + (Date.now() + 9),
        description: 'Tai nghe gaming không dây cao cấp, âm thanh Dolby Atmos, micro khử ồn.',
        price: 4290000,
        salePrice: 3790000,
        stock: 20,
        categoryId: taiNghe?.id,
        brandId: corsair?.id,
        specs: [
          { specKey: 'Driver', specValue: '50mm' },
          { specKey: 'Kết nối', specValue: 'Wireless 2.4GHz + Bluetooth' },
          { specKey: 'Âm thanh', specValue: 'Dolby Atmos' },
          { specKey: 'Pin', specValue: '65 giờ' },
          { specKey: 'Micro', specValue: 'Omnidirectional, khử ồn' },
        ],
      },
      {
        name: 'MSI MAG B760 TOMAHAWK WIFI DDR5',
        slug: 'msi-mag-b760-tomahawk-wifi-' + (Date.now() + 10),
        description: 'Mainboard ATX hỗ trợ Intel Gen 12/13/14, DDR5, WiFi 6E tích hợp.',
        price: 5690000,
        salePrice: 5190000,
        stock: 18,
        categoryId: linhKien?.id,
        brandId: msi?.id,
        specs: [
          { specKey: 'Socket', specValue: 'LGA 1700' },
          { specKey: 'Chipset', specValue: 'Intel B760' },
          { specKey: 'Form Factor', specValue: 'ATX' },
          { specKey: 'RAM', specValue: '4 x DDR5 (max 192GB)' },
          { specKey: 'WiFi', specValue: 'WiFi 6E' },
        ],
      },
      {
        name: 'Razer DeathAdder V3 HyperSpeed — Chuột Gaming',
        slug: 'razer-deathadder-v3-hyperspeed-' + (Date.now() + 11),
        description: 'Chuột gaming không dây ergonomic, 63g, cảm biến Focus Pro 26K.',
        price: 2490000,
        salePrice: null,
        stock: 45,
        categoryId: chuot?.id,
        brandId: razer?.id,
        specs: [
          { specKey: 'Cảm biến', specValue: 'Razer Focus Pro 26K' },
          { specKey: 'DPI', specValue: 'Lên đến 26,000' },
          { specKey: 'Trọng lượng', specValue: '63g' },
          { specKey: 'Kết nối', specValue: 'HyperSpeed Wireless + Bluetooth' },
          { specKey: 'Pin', specValue: '235 giờ (HyperSpeed)' },
        ],
      },
    ];

    for (const productData of productsData) {
      const { specs, ...data } = productData;
      const existing = await Product.findOne({ where: { name: data.name } });
      if (existing) continue;

      const product = await Product.create(data);

      // Create specs
      if (specs && specs.length > 0) {
        await ProductSpec.bulkCreate(specs.map(s => ({ productId: product.id, ...s })));
      }

      // Create placeholder image
      await ProductImage.create({
        productId: product.id,
        imageUrl: `https://placehold.co/600x400/1a1a2e/00d4ff?text=${encodeURIComponent(data.name.substring(0, 20))}`,
        isPrimary: true,
      });

      console.log(`✅ Created: ${data.name}`);
    }

    console.log('\n🎉 Data seeding completed!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeder error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
