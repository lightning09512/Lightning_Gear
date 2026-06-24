const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Brand, Product, ProductImage, ProductSpec } = require('../models');

async function seedComponentsAndMonitors() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('⚡ Kết nối database thành công!\n');

    // === Tìm categories ===
    const gpu = await Category.findOne({ where: { slug: 'gpu' } });
    const ram = await Category.findOne({ where: { slug: 'ram' } });
    const ssd = await Category.findOne({ where: { slug: 'ssd-o-cung' } });
    const cpu = await Category.findOne({ where: { slug: 'cpu' } });
    const mainboard = await Category.findOne({ where: { slug: 'mainboard' } });
    const manHinh = await Category.findOne({ where: { slug: 'man-hinh' } });
    const linhKien = await Category.findOne({ where: { slug: 'linh-kien' } });

    // === Tìm brands ===
    const asus = await Brand.findOne({ where: { name: 'ASUS' } });
    const msi = await Brand.findOne({ where: { name: 'MSI' } });
    const gigabyte = await Brand.findOne({ where: { name: 'Gigabyte' } });
    const corsair = await Brand.findOne({ where: { name: 'Corsair' } });
    const kingston = await Brand.findOne({ where: { name: 'Kingston' } });
    const samsung = await Brand.findOne({ where: { name: 'Samsung' } });
    const intel = await Brand.findOne({ where: { name: 'Intel' } });
    const amd = await Brand.findOne({ where: { name: 'AMD' } });
    const dell = await Brand.findOne({ where: { name: 'Dell' } });
    const lenovo = await Brand.findOne({ where: { name: 'Lenovo' } });

    // Tạo thêm brands nếu chưa có
    let [wd] = await Brand.findOrCreate({ where: { name: 'Western Digital' }, defaults: { name: 'Western Digital' } });
    let [lg] = await Brand.findOrCreate({ where: { name: 'LG' }, defaults: { name: 'LG' } });
    let [aoc] = await Brand.findOrCreate({ where: { name: 'AOC' }, defaults: { name: 'AOC' } });
    let [viewsonic] = await Brand.findOrCreate({ where: { name: 'ViewSonic' }, defaults: { name: 'ViewSonic' } });
    let [gskill] = await Brand.findOrCreate({ where: { name: 'G.Skill' }, defaults: { name: 'G.Skill' } });

    const productsData = [
      // ============================================
      // GPU - CARD ĐỒ HỌA
      // ============================================
      {
        name: 'MSI GeForce RTX 4070 VENTUS 2X 12G OC',
        slug: 'msi-rtx-4070-ventus-2x-12g-oc-' + Date.now(),
        description: 'Card đồ họa MSI GeForce RTX 4070 VENTUS 2X 12G OC, kiến trúc Ada Lovelace, hiệu năng tuyệt vời cho gaming 1440p và ray tracing. Hệ thống tản nhiệt kép quạt TORX Fan 4.0 giữ nhiệt độ luôn ổn định.',
        price: 16490000,
        salePrice: 15290000,
        stock: 20,
        categoryId: gpu?.id,
        brandId: msi?.id,
        specs: [
          { specKey: 'GPU', specValue: 'NVIDIA GeForce RTX 4070' },
          { specKey: 'VRAM', specValue: '12GB GDDR6X' },
          { specKey: 'Boost Clock', specValue: '2490 MHz (OC)' },
          { specKey: 'Memory Bus', specValue: '192-bit' },
          { specKey: 'TDP', specValue: '200W' },
          { specKey: 'Interface', specValue: 'PCIe 4.0 x16' },
          { specKey: 'Ngõ ra', specValue: '3x DisplayPort 1.4a, 1x HDMI 2.1' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00d4ff?text=RTX+4070+VENTUS',
      },
      {
        name: 'Gigabyte GeForce RTX 4060 Ti GAMING OC 8G',
        slug: 'gigabyte-rtx-4060-ti-gaming-oc-8g-' + Date.now(),
        description: 'Card đồ họa Gigabyte GeForce RTX 4060 Ti GAMING OC, tối ưu cho gaming Full HD và 1440p. Hệ thống tản nhiệt WINDFORCE 3X với 3 quạt, hiệu năng ray tracing và DLSS 3 mạnh mẽ.',
        price: 12490000,
        salePrice: 11590000,
        stock: 30,
        categoryId: gpu?.id,
        brandId: gigabyte?.id,
        specs: [
          { specKey: 'GPU', specValue: 'NVIDIA GeForce RTX 4060 Ti' },
          { specKey: 'VRAM', specValue: '8GB GDDR6' },
          { specKey: 'Boost Clock', specValue: '2550 MHz (OC)' },
          { specKey: 'Memory Bus', specValue: '128-bit' },
          { specKey: 'TDP', specValue: '160W' },
          { specKey: 'Interface', specValue: 'PCIe 4.0 x16' },
          { specKey: 'Ngõ ra', specValue: '2x DisplayPort 1.4a, 2x HDMI 2.1' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00d4ff?text=RTX+4060+Ti',
      },
      {
        name: 'ASUS TUF Gaming GeForce RTX 4080 SUPER OC 16GB',
        slug: 'asus-tuf-rtx-4080-super-oc-16gb-' + Date.now(),
        description: 'Card đồ họa ASUS TUF Gaming RTX 4080 SUPER, hiệu năng đỉnh cao cho gaming 4K. Thiết kế quân sự bền bỉ, tản nhiệt Axial-tech, Auto-Extreme Technology.',
        price: 32990000,
        salePrice: 30990000,
        stock: 12,
        categoryId: gpu?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'GPU', specValue: 'NVIDIA GeForce RTX 4080 SUPER' },
          { specKey: 'VRAM', specValue: '16GB GDDR6X' },
          { specKey: 'Boost Clock', specValue: '2565 MHz (OC)' },
          { specKey: 'Memory Bus', specValue: '256-bit' },
          { specKey: 'TDP', specValue: '320W' },
          { specKey: 'Interface', specValue: 'PCIe 4.0 x16' },
          { specKey: 'Ngõ ra', specValue: '3x DisplayPort 1.4a, 1x HDMI 2.1' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00d4ff?text=RTX+4080+SUPER',
      },
      {
        name: 'AMD Radeon RX 7900 XTX GAMING OC 24G',
        slug: 'amd-rx-7900-xtx-gaming-oc-24g-' + Date.now(),
        description: 'Card đồ họa AMD Radeon RX 7900 XTX hàng đầu, kiến trúc RDNA 3 với 24GB GDDR6. Lựa chọn hoàn hảo cho gaming 4K và xử lý nội dung nặng.',
        price: 28990000,
        salePrice: 26490000,
        stock: 10,
        categoryId: gpu?.id,
        brandId: amd?.id,
        specs: [
          { specKey: 'GPU', specValue: 'AMD Radeon RX 7900 XTX' },
          { specKey: 'VRAM', specValue: '24GB GDDR6' },
          { specKey: 'Boost Clock', specValue: '2500 MHz' },
          { specKey: 'Memory Bus', specValue: '384-bit' },
          { specKey: 'TDP', specValue: '355W' },
          { specKey: 'Interface', specValue: 'PCIe 4.0 x16' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff4444?text=RX+7900+XTX',
      },

      // ============================================
      // RAM
      // ============================================
      {
        name: 'G.Skill Trident Z5 RGB DDR5 32GB (2x16GB) 6400MHz',
        slug: 'gskill-trident-z5-rgb-ddr5-32gb-6400-' + Date.now(),
        description: 'Bộ nhớ RAM DDR5 G.Skill Trident Z5 RGB, tốc độ 6400MHz, đèn RGB rực rỡ. Hỗ trợ Intel XMP 3.0 để ép xung dễ dàng. Thiết kế tản nhiệt nhôm cao cấp.',
        price: 4290000,
        salePrice: 3890000,
        stock: 45,
        categoryId: ram?.id,
        brandId: gskill?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '32GB (2x16GB)' },
          { specKey: 'Tốc độ', specValue: '6400 MHz' },
          { specKey: 'Loại', specValue: 'DDR5' },
          { specKey: 'CAS Latency', specValue: 'CL32' },
          { specKey: 'Điện áp', specValue: '1.40V' },
          { specKey: 'RGB', specValue: 'Có (Trident Z5 RGB)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff00ff?text=Trident+Z5+RGB',
      },
      {
        name: 'Corsair Dominator Platinum RGB DDR5 64GB (2x32GB) 5600MHz',
        slug: 'corsair-dominator-platinum-ddr5-64gb-5600-' + Date.now(),
        description: 'RAM Corsair Dominator Platinum RGB DDR5, dung lượng 64GB cho workstation và gaming cao cấp. 12 đèn LED Capellix RGB siêu sáng, tản nhiệt DHX patented.',
        price: 7490000,
        salePrice: 6890000,
        stock: 20,
        categoryId: ram?.id,
        brandId: corsair?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '64GB (2x32GB)' },
          { specKey: 'Tốc độ', specValue: '5600 MHz' },
          { specKey: 'Loại', specValue: 'DDR5' },
          { specKey: 'CAS Latency', specValue: 'CL36' },
          { specKey: 'Điện áp', specValue: '1.25V' },
          { specKey: 'RGB', specValue: 'Capellix RGB (12 LED)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ffcc00?text=Dominator+64GB',
      },
      {
        name: 'Kingston FURY Renegade DDR5 16GB 6000MHz',
        slug: 'kingston-fury-renegade-ddr5-16gb-6000-' + Date.now(),
        description: 'RAM Kingston FURY Renegade DDR5, tốc độ cực nhanh 6000MHz. Tản nhiệt nhôm cao cấp, hỗ trợ Intel XMP 3.0 và AMD EXPO. Lý tưởng cho gaming và đa nhiệm.',
        price: 1790000,
        salePrice: 1590000,
        stock: 60,
        categoryId: ram?.id,
        brandId: kingston?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '16GB' },
          { specKey: 'Tốc độ', specValue: '6000 MHz' },
          { specKey: 'Loại', specValue: 'DDR5' },
          { specKey: 'CAS Latency', specValue: 'CL30' },
          { specKey: 'Điện áp', specValue: '1.35V' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00ff88?text=FURY+Renegade',
      },

      // ============================================
      // SSD / Ổ CỨNG
      // ============================================
      {
        name: 'Samsung 990 EVO Plus 1TB NVMe M.2 SSD',
        slug: 'samsung-990-evo-plus-1tb-' + Date.now(),
        description: 'Ổ cứng SSD Samsung 990 EVO Plus, giao diện PCIe Gen 5.0 x4, tốc độ đọc lên đến 10,000 MB/s. Công nghệ V-NAND thế hệ 8 và bộ điều khiển tối ưu AI.',
        price: 3490000,
        salePrice: 3090000,
        stock: 55,
        categoryId: ssd?.id,
        brandId: samsung?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '1TB' },
          { specKey: 'Interface', specValue: 'NVMe PCIe Gen 5.0 x4' },
          { specKey: 'Đọc tuần tự', specValue: '10,000 MB/s' },
          { specKey: 'Ghi tuần tự', specValue: '8,000 MB/s' },
          { specKey: 'Form Factor', specValue: 'M.2 2280' },
          { specKey: 'NAND', specValue: 'V-NAND TLC Gen 8' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00aaff?text=990+EVO+Plus',
      },
      {
        name: 'WD Black SN850X 2TB NVMe M.2 SSD',
        slug: 'wd-black-sn850x-2tb-' + Date.now(),
        description: 'SSD WD Black SN850X, hiệu năng PCIe Gen 4 hàng đầu với tốc độ đọc 7,300 MB/s. Tối ưu hóa cho gaming với Game Mode 2.0, dự đoán load game nhanh hơn.',
        price: 4990000,
        salePrice: 4490000,
        stock: 35,
        categoryId: ssd?.id,
        brandId: wd?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '2TB' },
          { specKey: 'Interface', specValue: 'NVMe PCIe Gen 4.0 x4' },
          { specKey: 'Đọc tuần tự', specValue: '7,300 MB/s' },
          { specKey: 'Ghi tuần tự', specValue: '6,600 MB/s' },
          { specKey: 'Form Factor', specValue: 'M.2 2280' },
          { specKey: 'NAND', specValue: 'BiCS5 TLC' },
          { specKey: 'Game Mode', specValue: 'Game Mode 2.0' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/333333?text=WD+Black+SN850X',
      },
      {
        name: 'Kingston NV2 500GB NVMe M.2 SSD',
        slug: 'kingston-nv2-500gb-' + Date.now(),
        description: 'SSD Kingston NV2 giá rẻ hiệu năng tốt, PCIe Gen 4.0. Lựa chọn tuyệt vời để nâng cấp từ HDD hoặc SSD SATA cũ.',
        price: 890000,
        salePrice: 750000,
        stock: 100,
        categoryId: ssd?.id,
        brandId: kingston?.id,
        specs: [
          { specKey: 'Dung lượng', specValue: '500GB' },
          { specKey: 'Interface', specValue: 'NVMe PCIe Gen 4.0 x4' },
          { specKey: 'Đọc tuần tự', specValue: '3,500 MB/s' },
          { specKey: 'Ghi tuần tự', specValue: '2,100 MB/s' },
          { specKey: 'Form Factor', specValue: 'M.2 2280' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/44cc44?text=NV2+500GB',
      },

      // ============================================
      // CPU - BỘ VI XỬ LÝ
      // ============================================
      {
        name: 'Intel Core i9-14900K — 24 Nhân 32 Luồng',
        slug: 'intel-core-i9-14900k-' + Date.now(),
        description: 'Bộ vi xử lý Intel Core i9-14900K thế hệ 14 Raptor Lake Refresh, 24 nhân (8P+16E) 32 luồng. Hiệu năng đỉnh cao cho gaming và sáng tạo nội dung, xung boost lên đến 6.0 GHz.',
        price: 14990000,
        salePrice: 13490000,
        stock: 15,
        categoryId: cpu?.id,
        brandId: intel?.id,
        specs: [
          { specKey: 'Số nhân / Luồng', specValue: '24 nhân (8P+16E) / 32 luồng' },
          { specKey: 'Xung cơ bản', specValue: '3.2 GHz (P-core)' },
          { specKey: 'Xung Boost tối đa', specValue: '6.0 GHz (Turbo Boost Max 3.0)' },
          { specKey: 'Cache', specValue: '36MB Intel Smart Cache' },
          { specKey: 'TDP', specValue: '125W (PBP), 253W (MTP)' },
          { specKey: 'Socket', specValue: 'LGA 1700' },
          { specKey: 'Tiến trình', specValue: 'Intel 7 (10nm ESF)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/0071c5?text=i9-14900K',
      },
      {
        name: 'Intel Core i7-14700K — 20 Nhân 28 Luồng',
        slug: 'intel-core-i7-14700k-' + Date.now(),
        description: 'CPU Intel Core i7-14700K, 20 nhân 28 luồng, xung boost 5.6 GHz. Cân bằng hoàn hảo giữa hiệu năng gaming và đa nhiệm, hỗ trợ DDR5 và PCIe 5.0.',
        price: 10490000,
        salePrice: 9490000,
        stock: 25,
        categoryId: cpu?.id,
        brandId: intel?.id,
        specs: [
          { specKey: 'Số nhân / Luồng', specValue: '20 nhân (8P+12E) / 28 luồng' },
          { specKey: 'Xung cơ bản', specValue: '3.4 GHz (P-core)' },
          { specKey: 'Xung Boost tối đa', specValue: '5.6 GHz' },
          { specKey: 'Cache', specValue: '33MB Intel Smart Cache' },
          { specKey: 'TDP', specValue: '125W (PBP), 253W (MTP)' },
          { specKey: 'Socket', specValue: 'LGA 1700' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/0071c5?text=i7-14700K',
      },
      {
        name: 'AMD Ryzen 9 7950X — 16 Nhân 32 Luồng',
        slug: 'amd-ryzen-9-7950x-' + Date.now(),
        description: 'CPU AMD Ryzen 9 7950X, kiến trúc Zen 4, 16 nhân 32 luồng, xung boost 5.7 GHz. Hiệu năng đa luồng mạnh nhất phân khúc, hỗ trợ DDR5 và PCIe 5.0.',
        price: 13990000,
        salePrice: 12490000,
        stock: 12,
        categoryId: cpu?.id,
        brandId: amd?.id,
        specs: [
          { specKey: 'Số nhân / Luồng', specValue: '16 nhân / 32 luồng' },
          { specKey: 'Xung cơ bản', specValue: '4.5 GHz' },
          { specKey: 'Xung Boost tối đa', specValue: '5.7 GHz' },
          { specKey: 'Cache', specValue: '64MB L3 + 16MB L2' },
          { specKey: 'TDP', specValue: '170W' },
          { specKey: 'Socket', specValue: 'AM5' },
          { specKey: 'Tiến trình', specValue: 'TSMC 5nm' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ed1c24?text=Ryzen+9+7950X',
      },
      {
        name: 'AMD Ryzen 7 7800X3D — 8 Nhân 16 Luồng',
        slug: 'amd-ryzen-7-7800x3d-' + Date.now(),
        description: 'CPU AMD Ryzen 7 7800X3D với công nghệ 3D V-Cache 96MB, CPU gaming tốt nhất hiện tại. Hiệu năng gaming vượt trội nhờ bộ nhớ cache cực lớn.',
        price: 10990000,
        salePrice: 9690000,
        stock: 18,
        categoryId: cpu?.id,
        brandId: amd?.id,
        specs: [
          { specKey: 'Số nhân / Luồng', specValue: '8 nhân / 16 luồng' },
          { specKey: 'Xung cơ bản', specValue: '4.2 GHz' },
          { specKey: 'Xung Boost tối đa', specValue: '5.0 GHz' },
          { specKey: 'Cache', specValue: '96MB 3D V-Cache L3 + 8MB L2' },
          { specKey: 'TDP', specValue: '120W' },
          { specKey: 'Socket', specValue: 'AM5' },
          { specKey: '3D V-Cache', specValue: 'Có' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ed1c24?text=7800X3D',
      },
      {
        name: 'Intel Core i5-14600K — 14 Nhân 20 Luồng',
        slug: 'intel-core-i5-14600k-' + Date.now(),
        description: 'CPU Intel Core i5-14600K, 14 nhân 20 luồng, xung boost 5.3 GHz. Lựa chọn tầm trung tốt nhất cho gaming, giá tốt hiệu năng cao.',
        price: 7490000,
        salePrice: 6790000,
        stock: 30,
        categoryId: cpu?.id,
        brandId: intel?.id,
        specs: [
          { specKey: 'Số nhân / Luồng', specValue: '14 nhân (6P+8E) / 20 luồng' },
          { specKey: 'Xung cơ bản', specValue: '3.5 GHz (P-core)' },
          { specKey: 'Xung Boost tối đa', specValue: '5.3 GHz' },
          { specKey: 'Cache', specValue: '24MB Intel Smart Cache' },
          { specKey: 'TDP', specValue: '125W (PBP), 181W (MTP)' },
          { specKey: 'Socket', specValue: 'LGA 1700' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/0071c5?text=i5-14600K',
      },

      // ============================================
      // MAINBOARD
      // ============================================
      {
        name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
        slug: 'asus-rog-strix-z790-e-gaming-wifi-ii-' + Date.now(),
        description: 'Mainboard ASUS ROG STRIX Z790-E Gaming WIFI II, chipset Z790 hỗ trợ Intel Gen 12/13/14. 18+1 VRM, DDR5, WiFi 7, Thunderbolt 4. Thiết kế gaming cao cấp.',
        price: 11990000,
        salePrice: 10990000,
        stock: 10,
        categoryId: mainboard?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'Socket', specValue: 'LGA 1700' },
          { specKey: 'Chipset', specValue: 'Intel Z790' },
          { specKey: 'Form Factor', specValue: 'ATX' },
          { specKey: 'RAM', specValue: '4 x DDR5 (max 192GB, 7800MHz+)' },
          { specKey: 'VRM', specValue: '18+1 Phase' },
          { specKey: 'WiFi', specValue: 'WiFi 7 (802.11be)' },
          { specKey: 'M.2', specValue: '4 x M.2 NVMe (1 PCIe 5.0)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff0000?text=ROG+Z790-E',
      },
      {
        name: 'Gigabyte B650 AORUS ELITE AX V2',
        slug: 'gigabyte-b650-aorus-elite-ax-v2-' + Date.now(),
        description: 'Mainboard Gigabyte B650 AORUS ELITE AX V2, hỗ trợ AMD Ryzen 7000 series. 12+2+2 VRM Digital, DDR5, WiFi 6E, 2.5G LAN. Lựa chọn giá tốt cho nền tảng AM5.',
        price: 5990000,
        salePrice: 5490000,
        stock: 22,
        categoryId: mainboard?.id,
        brandId: gigabyte?.id,
        specs: [
          { specKey: 'Socket', specValue: 'AM5' },
          { specKey: 'Chipset', specValue: 'AMD B650' },
          { specKey: 'Form Factor', specValue: 'ATX' },
          { specKey: 'RAM', specValue: '4 x DDR5 (max 192GB, 7600MHz+)' },
          { specKey: 'VRM', specValue: '12+2+2 Phase' },
          { specKey: 'WiFi', specValue: 'WiFi 6E' },
          { specKey: 'M.2', specValue: '2 x M.2 NVMe (PCIe 4.0)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff8800?text=B650+AORUS',
      },
      {
        name: 'MSI MAG X670E TOMAHAWK WIFI',
        slug: 'msi-mag-x670e-tomahawk-wifi-' + Date.now(),
        description: 'Mainboard MSI MAG X670E TOMAHAWK WIFI, chipset X670E cao cấp cho AMD Ryzen 7000. 14+2+1 VRM kép, PCIe 5.0 cho cả GPU và SSD, WiFi 6E.',
        price: 8490000,
        salePrice: 7690000,
        stock: 15,
        categoryId: mainboard?.id,
        brandId: msi?.id,
        specs: [
          { specKey: 'Socket', specValue: 'AM5' },
          { specKey: 'Chipset', specValue: 'AMD X670E' },
          { specKey: 'Form Factor', specValue: 'ATX' },
          { specKey: 'RAM', specValue: '4 x DDR5 (max 128GB, 6600MHz+)' },
          { specKey: 'VRM', specValue: '14+2+1 Phase' },
          { specKey: 'PCIe 5.0', specValue: '1 x PCIe 5.0 x16 GPU + 1 x M.2 PCIe 5.0' },
          { specKey: 'WiFi', specValue: 'WiFi 6E' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/cc0000?text=X670E+TOMAHAWK',
      },
      {
        name: 'ASUS PRIME B760M-A WIFI DDR5',
        slug: 'asus-prime-b760m-a-wifi-ddr5-' + Date.now(),
        description: 'Mainboard ASUS PRIME B760M-A WIFI DDR5, form factor Micro-ATX nhỏ gọn. Hỗ trợ Intel Gen 12/13/14, WiFi 6, LAN 2.5G. Giải pháp tiết kiệm cho build PC tầm trung.',
        price: 3690000,
        salePrice: 3290000,
        stock: 35,
        categoryId: mainboard?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'Socket', specValue: 'LGA 1700' },
          { specKey: 'Chipset', specValue: 'Intel B760' },
          { specKey: 'Form Factor', specValue: 'Micro-ATX' },
          { specKey: 'RAM', specValue: '2 x DDR5 (max 96GB, 6400MHz)' },
          { specKey: 'WiFi', specValue: 'WiFi 6 (802.11ax)' },
          { specKey: 'M.2', specValue: '2 x M.2 NVMe (PCIe 4.0)' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/555555?text=PRIME+B760M',
      },

      // ============================================
      // MÀN HÌNH GAMING
      // ============================================
      {
        name: 'LG 27GP850-B UltraGear — 27" QHD 165Hz Nano IPS',
        slug: 'lg-27gp850-b-ultragear-27-qhd-165hz-' + Date.now(),
        description: 'Màn hình gaming LG UltraGear 27 inch QHD, tấm nền Nano IPS 1ms, 165Hz (OC 180Hz). Hỗ trợ G-SYNC Compatible và FreeSync Premium, HDR400. Dải màu DCI-P3 98%.',
        price: 9990000,
        salePrice: 8490000,
        stock: 20,
        categoryId: manHinh?.id,
        brandId: lg?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '27 inch' },
          { specKey: 'Độ phân giải', specValue: '2560 x 1440 (QHD)' },
          { specKey: 'Tần số quét', specValue: '165Hz (OC 180Hz)' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms GtG' },
          { specKey: 'Tấm nền', specValue: 'Nano IPS' },
          { specKey: 'HDR', specValue: 'VESA DisplayHDR 400' },
          { specKey: 'Dải màu', specValue: 'DCI-P3 98%' },
          { specKey: 'Adaptive Sync', specValue: 'G-SYNC Compatible, FreeSync Premium' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff4488?text=LG+27GP850',
      },
      {
        name: 'Samsung Odyssey G7 S28BG702 — 28" 4K 144Hz IPS',
        slug: 'samsung-odyssey-g7-s28bg702-28-4k-144hz-' + Date.now(),
        description: 'Màn hình gaming Samsung Odyssey G7 28 inch 4K UHD, 144Hz, tấm nền IPS. Hỗ trợ HDMI 2.1 cho console, G-SYNC Compatible, FreeSync Premium Pro. Smart TV tích hợp.',
        price: 10990000,
        salePrice: 9490000,
        stock: 15,
        categoryId: manHinh?.id,
        brandId: samsung?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '28 inch' },
          { specKey: 'Độ phân giải', specValue: '3840 x 2160 (4K UHD)' },
          { specKey: 'Tần số quét', specValue: '144Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms GtG' },
          { specKey: 'Tấm nền', specValue: 'IPS' },
          { specKey: 'HDR', specValue: 'HDR400' },
          { specKey: 'HDMI 2.1', specValue: 'Có (2 cổng)' },
          { specKey: 'Smart TV', specValue: 'Tizen OS tích hợp' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/0044ff?text=Odyssey+G7+4K',
      },
      {
        name: 'Dell Alienware AW3225QF — 32" 4K QD-OLED 240Hz',
        slug: 'dell-alienware-aw3225qf-32-4k-qdoled-240hz-' + Date.now(),
        description: 'Màn hình gaming Dell Alienware AW3225QF, 32 inch 4K QD-OLED, 240Hz, 0.03ms. Đỉnh cao công nghệ hiển thị với Dolby Vision, Infinite Contrast Ratio. True Black 400.',
        price: 28990000,
        salePrice: 26490000,
        stock: 6,
        categoryId: manHinh?.id,
        brandId: dell?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '31.6 inch' },
          { specKey: 'Độ phân giải', specValue: '3840 x 2160 (4K UHD)' },
          { specKey: 'Tần số quét', specValue: '240Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '0.03ms GtG' },
          { specKey: 'Tấm nền', specValue: 'QD-OLED (Samsung Display)' },
          { specKey: 'HDR', specValue: 'VESA DisplayHDR True Black 400' },
          { specKey: 'Dolby Vision', specValue: 'Có' },
          { specKey: 'Dải màu', specValue: 'DCI-P3 99.3%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/00ffcc?text=Alienware+OLED',
      },
      {
        name: 'ASUS ROG Swift PG34WCDM — 34" UWQHD OLED 240Hz',
        slug: 'asus-rog-swift-pg34wcdm-34-uwqhd-oled-' + Date.now(),
        description: 'Màn hình gaming ASUS ROG Swift PG34WCDM, 34 inch UltraWide QHD OLED, 240Hz, 0.03ms. Tỷ lệ 21:9 cho trải nghiệm immersive, Anti-Glare tráng mờ giảm phản chiếu.',
        price: 32990000,
        salePrice: 29990000,
        stock: 5,
        categoryId: manHinh?.id,
        brandId: asus?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '34 inch' },
          { specKey: 'Độ phân giải', specValue: '3440 x 1440 (UWQHD)' },
          { specKey: 'Tần số quét', specValue: '240Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '0.03ms GtG' },
          { specKey: 'Tấm nền', specValue: 'WOLED (LG Display)' },
          { specKey: 'Tỷ lệ', specValue: '21:9 UltraWide' },
          { specKey: 'HDR', specValue: 'VESA DisplayHDR True Black 400' },
          { specKey: 'Dải màu', specValue: 'DCI-P3 99%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff0066?text=ROG+34+OLED',
      },
      {
        name: 'MSI MAG 274UPF — 27" 4K 144Hz Rapid IPS',
        slug: 'msi-mag-274upf-27-4k-144hz-' + Date.now(),
        description: 'Màn hình gaming MSI MAG 274UPF, 27 inch 4K UHD, 144Hz, tấm nền Rapid IPS 1ms. HDMI 2.1 hỗ trợ console, USB-C 15W. Giá tốt nhất phân khúc 4K gaming.',
        price: 8990000,
        salePrice: 7990000,
        stock: 25,
        categoryId: manHinh?.id,
        brandId: msi?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '27 inch' },
          { specKey: 'Độ phân giải', specValue: '3840 x 2160 (4K UHD)' },
          { specKey: 'Tần số quét', specValue: '144Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms GtG' },
          { specKey: 'Tấm nền', specValue: 'Rapid IPS' },
          { specKey: 'HDR', specValue: 'HDR 600' },
          { specKey: 'USB-C', specValue: 'Có (15W Power Delivery)' },
          { specKey: 'HDMI 2.1', specValue: 'Có' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff2200?text=MSI+274UPF',
      },
      {
        name: 'Gigabyte M27Q X — 27" QHD 240Hz KVM IPS',
        slug: 'gigabyte-m27q-x-27-qhd-240hz-' + Date.now(),
        description: 'Màn hình gaming Gigabyte M27Q X, 27 inch QHD, 240Hz, tấm nền SS IPS 1ms. Tích hợp KVM Switch, USB-C, dải màu sRGB 100%. Lựa chọn tuyệt vời cho cả gaming và công việc.',
        price: 8490000,
        salePrice: 7490000,
        stock: 18,
        categoryId: manHinh?.id,
        brandId: gigabyte?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '27 inch' },
          { specKey: 'Độ phân giải', specValue: '2560 x 1440 (QHD)' },
          { specKey: 'Tần số quét', specValue: '240Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms MPRT' },
          { specKey: 'Tấm nền', specValue: 'SS IPS' },
          { specKey: 'KVM Switch', specValue: 'Có (tích hợp)' },
          { specKey: 'USB-C', specValue: 'Có (18W Power Delivery)' },
          { specKey: 'Dải màu', specValue: 'sRGB 100%, DCI-P3 92%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff8800?text=M27Q+X',
      },
      {
        name: 'AOC 24G2SP — 24" Full HD 165Hz IPS',
        slug: 'aoc-24g2sp-24-fhd-165hz-' + Date.now(),
        description: 'Màn hình gaming AOC 24G2SP, 24 inch Full HD, 165Hz, IPS 1ms. Giá rẻ nhất phân khúc, phù hợp cho người mới bắt đầu gaming. FreeSync Premium.',
        price: 3490000,
        salePrice: 2990000,
        stock: 40,
        categoryId: manHinh?.id,
        brandId: aoc?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '23.8 inch' },
          { specKey: 'Độ phân giải', specValue: '1920 x 1080 (FHD)' },
          { specKey: 'Tần số quét', specValue: '165Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms MPRT' },
          { specKey: 'Tấm nền', specValue: 'IPS' },
          { specKey: 'Adaptive Sync', specValue: 'FreeSync Premium' },
          { specKey: 'Dải màu', specValue: 'sRGB 120%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/33cc33?text=AOC+24G2SP',
      },
      {
        name: 'ViewSonic VX2758A-2K-PRO — 27" QHD 185Hz IPS',
        slug: 'viewsonic-vx2758a-2k-pro-27-qhd-185hz-' + Date.now(),
        description: 'Màn hình gaming ViewSonic VX2758A-2K-PRO, 27 inch QHD, 185Hz, IPS. Giá cực kỳ hấp dẫn cho màn hình 2K gaming, SuperClear IPS, AMD FreeSync.',
        price: 4990000,
        salePrice: 4290000,
        stock: 30,
        categoryId: manHinh?.id,
        brandId: viewsonic?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '27 inch' },
          { specKey: 'Độ phân giải', specValue: '2560 x 1440 (QHD)' },
          { specKey: 'Tần số quét', specValue: '185Hz' },
          { specKey: 'Thời gian phản hồi', specValue: '1ms MPRT' },
          { specKey: 'Tấm nền', specValue: 'SuperClear IPS' },
          { specKey: 'Adaptive Sync', specValue: 'AMD FreeSync' },
          { specKey: 'Dải màu', specValue: 'sRGB 100%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/884dff?text=ViewSonic+2K',
      },
      {
        name: 'LG 32GS95UE UltraGear — 32" 4K OLED 240Hz Dual Mode',
        slug: 'lg-32gs95ue-ultragear-32-4k-oled-240hz-' + Date.now(),
        description: 'Màn hình gaming LG UltraGear 32GS95UE, 32 inch 4K OLED 240Hz. Tính năng Dual Mode độc quyền: chuyển đổi 4K/240Hz hoặc FHD/480Hz. Anti-Glare & Low Reflection OLED.',
        price: 29990000,
        salePrice: 27990000,
        stock: 4,
        categoryId: manHinh?.id,
        brandId: lg?.id,
        specs: [
          { specKey: 'Kích thước', specValue: '31.5 inch' },
          { specKey: 'Độ phân giải', specValue: '3840 x 2160 (4K UHD)' },
          { specKey: 'Tần số quét', specValue: '240Hz (4K) / 480Hz (FHD Dual Mode)' },
          { specKey: 'Thời gian phản hồi', specValue: '0.03ms GtG' },
          { specKey: 'Tấm nền', specValue: 'WOLED (Anti-Glare Low Reflection)' },
          { specKey: 'HDR', specValue: 'VESA DisplayHDR True Black 400' },
          { specKey: 'Dual Mode', specValue: '4K/240Hz ↔ FHD/480Hz' },
          { specKey: 'Dải màu', specValue: 'DCI-P3 98.5%' },
        ],
        image: 'https://placehold.co/600x400/1a1a2e/ff00ff?text=LG+4K+OLED',
      },
    ];

    // === TẠO SẢN PHẨM ===
    let created = 0;
    let skipped = 0;

    for (const productData of productsData) {
      const { specs, image, ...data } = productData;

      // Kiểm tra trùng lặp
      const existing = await Product.findOne({ where: { name: data.name } });
      if (existing) {
        console.log(`⏭️  Bỏ qua (đã tồn tại): ${data.name}`);
        skipped++;
        continue;
      }

      const product = await Product.create(data);

      // Tạo specs
      if (specs && specs.length > 0) {
        await ProductSpec.bulkCreate(specs.map(s => ({ productId: product.id, ...s })));
      }

      // Tạo ảnh placeholder
      await ProductImage.create({
        productId: product.id,
        imageUrl: image || `https://placehold.co/600x400/1a1a2e/00d4ff?text=${encodeURIComponent(data.name.substring(0, 20))}`,
        isPrimary: true,
      });

      created++;
      console.log(`✅ Tạo thành công: ${data.name}`);
    }

    console.log(`\n🎉 Hoàn tất! Đã tạo ${created} sản phẩm mới, bỏ qua ${skipped} sản phẩm trùng.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi seeder:', error);
    process.exit(1);
  }
}

seedComponentsAndMonitors();
