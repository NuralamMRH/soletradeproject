const mongoose = require('mongoose');
const { Category } = require('../models/category');
const { Brand } = require('../models/brand');
const { Product } = require('../models/product');
const { Indicator } = require('../models/indicator');

// Function to seed demo data
const seedDemoData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    
    // Create indicators first
    const indicators = await createIndicators();
    
    // Create categories
    const categories = await createCategories();
    
    // Create brands
    const brands = await createBrands();
    
    // Create products
    await createProducts(categories, brands, indicators);
    
    console.log('Demo data seeded successfully');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};

// Create demo indicators
const createIndicators = async () => {
  const indicators = [
    {
      name: 'Just Dropped',
      color: '#333333',
      textColor: '#FFFFFF',
      isActive: true
    },
    {
      name: 'Express Out',
      color: '#E0E0E0',
      textColor: '#000000',
      isActive: true
    },
    {
      name: 'Hot Deal',
      color: '#FF0000',
      textColor: '#FFFFFF',
      isActive: true
    }
  ];
  
  const createdIndicators = [];
  
  for (const indicator of indicators) {
    const newIndicator = new Indicator(indicator);
    await newIndicator.save();
    createdIndicators.push(newIndicator);
  }
  
  return createdIndicators;
};

// Create demo categories
const createCategories = async () => {
  const categories = [
    {
      name: 'Sneakers',
      icon: 'shoe-icon.png',
      color: '#FF5733',
      isActive: true
    },
    {
      name: 'Apparel',
      icon: 'apparel-icon.png',
      color: '#33FF57',
      isActive: true
    },
    {
      name: 'Accessories',
      icon: 'accessories-icon.png',
      color: '#3357FF',
      isActive: true
    },
    {
      name: 'Collectibles',
      icon: 'collectibles-icon.png',
      color: '#F033FF',
      isActive: true
    },
    {
      name: 'Electronics',
      icon: 'electronics-icon.png',
      color: '#33FFF0',
      isActive: true
    }
  ];
  
  const createdCategories = [];
  
  for (const category of categories) {
    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories.push(newCategory);
  }
  
  return createdCategories;
};

// Create demo brands
const createBrands = async () => {
  const brands = [
    {
      name: 'Jordan',
      image: 'jordan-logo.png',
      isActive: true
    },
    {
      name: 'Nike',
      image: 'nike-logo.png',
      isActive: true
    },
    {
      name: 'Adidas',
      image: 'adidas-logo.png',
      isActive: true
    },
    {
      name: 'New Balance',
      image: 'new-balance-logo.png',
      isActive: true
    },
    {
      name: 'Supreme',
      image: 'supreme-logo.png',
      isActive: true
    },
    {
      name: 'Off-White',
      image: 'off-white-logo.png',
      isActive: true
    },
    {
      name: 'Travis Scott',
      image: 'travis-scott-logo.png',
      isActive: true
    },
    {
      name: 'Yeezy',
      image: 'yeezy-logo.png',
      isActive: true
    }
  ];
  
  const createdBrands = [];
  
  for (const brand of brands) {
    const newBrand = new Brand(brand);
    await newBrand.save();
    createdBrands.push(newBrand);
  }
  
  return createdBrands;
};

// Create demo products
const createProducts = async (categories, brands, indicators) => {
  // Helper function to get random item from array
  const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
  
  const products = [
    {
      product_type: 'deal',
      name: 'Jordan 1 Retro High OG Chicago Lost and Found',
      description: 'The Air Jordan 1 Retro High OG "Chicago Lost and Found" is a recreation of the iconic original colorway.',
      richDescription: '<p>The Air Jordan 1 Retro High OG "Chicago Lost and Found" is a recreation of the iconic original colorway that Michael Jordan made famous in 1985. This release celebrates the legacy of the Chicago colorway by adding subtle details that tell a story of what it would be like to find a forgotten pair of the originals.</p>',
      image: 'jordan1-chicago.jpg',
      image_full_url: 'https://example.com/images/jordan1-chicago.jpg',
      images: ['jordan1-chicago-1.jpg', 'jordan1-chicago-2.jpg', 'jordan1-chicago-3.jpg'],
      indicator: indicators[0]._id, // Just Dropped
      isIndicatorActive: true,
      brand: brands[0]._id, // Jordan
      model: 'Air Jordan 1',
      category: categories[0]._id, // Sneakers
      sku: 'DZ5485-612',
      colorway: 'Varsity Red/Black-White',
      mainColor: 'Red',
      retailPrice: 180,
      rating: 4.9,
      numViews: 15000,
      isFeatured: true,
      isCalenderActive: false,
      sellerFee: 10,
      buyerFee: 5,
      publishDate: new Date('2022-11-19'),
      duration: 7,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'deal',
      name: 'Nike Dunk Low Retro White Black Panda',
      description: 'The Nike Dunk Low Retro White Black brings back the classic basketball shoe with its iconic color blocking.',
      richDescription: '<p>The Nike Dunk Low Retro White Black, also known as "Panda," brings back the classic basketball shoe with its iconic color blocking. The clean white leather base with black overlays creates a versatile look that goes with everything.</p>',
      image: 'nike-dunk-panda.jpg',
      image_full_url: 'https://example.com/images/nike-dunk-panda.jpg',
      images: ['nike-dunk-panda-1.jpg', 'nike-dunk-panda-2.jpg'],
      indicator: indicators[1]._id, // Express Out
      isIndicatorActive: true,
      brand: brands[1]._id, // Nike
      model: 'Dunk Low',
      category: categories[0]._id, // Sneakers
      sku: 'DD1391-100',
      colorway: 'White/Black',
      mainColor: 'White',
      retailPrice: 110,
      rating: 4.7,
      numViews: 25000,
      isFeatured: true,
      isCalenderActive: false,
      sellerFee: 8,
      buyerFee: 5,
      publishDate: new Date('2021-03-10'),
      duration: 5,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'auction',
      name: 'Travis Scott x Air Jordan 1 Low OG Olive',
      description: 'The Travis Scott x Air Jordan 1 Low OG "Olive" features a unique color scheme with Travis Scott\'s signature reverse Swoosh.',
      richDescription: '<p>The Travis Scott x Air Jordan 1 Low OG "Olive" features a unique color scheme with Travis Scott\'s signature reverse Swoosh. This collaboration continues the successful partnership between the Houston rapper and Jordan Brand.</p>',
      image: 'travis-aj1-olive.jpg',
      image_full_url: 'https://example.com/images/travis-aj1-olive.jpg',
      images: ['travis-aj1-olive-1.jpg', 'travis-aj1-olive-2.jpg', 'travis-aj1-olive-3.jpg'],
      indicator: indicators[0]._id, // Just Dropped
      isIndicatorActive: true,
      brand: brands[0]._id, // Jordan
      model: 'Air Jordan 1 Low',
      category: categories[0]._id, // Sneakers
      sku: 'DZ4137-106',
      colorway: 'Sail/University Red/Black/Medium Olive',
      mainColor: 'Olive',
      retailPrice: 150,
      rating: 4.8,
      numViews: 18000,
      isFeatured: true,
      isCalenderActive: true,
      sellerFee: 12,
      buyerFee: 8,
      publishDate: new Date('2023-07-21'),
      duration: 10,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'deal',
      name: 'Adidas Yeezy Boost 350 V2 Zebra',
      description: 'The adidas Yeezy Boost 350 V2 "Zebra" features a white and black Primeknit pattern reminiscent of zebra stripes.',
      richDescription: '<p>The adidas Yeezy Boost 350 V2 "Zebra" features a white and black Primeknit pattern reminiscent of zebra stripes. The shoe is accented with a red "SPLY-350" text on the side and has a full-length Boost midsole for comfort.</p>',
      image: 'yeezy-350-zebra.jpg',
      image_full_url: 'https://example.com/images/yeezy-350-zebra.jpg',
      images: ['yeezy-350-zebra-1.jpg', 'yeezy-350-zebra-2.jpg'],
      indicator: indicators[1]._id, // Express Out
      isIndicatorActive: true,
      brand: brands[2]._id, // Adidas
      model: 'Yeezy Boost 350 V2',
      category: categories[0]._id, // Sneakers
      sku: 'CP9654',
      colorway: 'White/Core Black/Red',
      mainColor: 'White',
      retailPrice: 220,
      rating: 4.6,
      numViews: 12000,
      isFeatured: true,
      isCalenderActive: false,
      sellerFee: 10,
      buyerFee: 5,
      publishDate: new Date('2017-02-25'),
      duration: 7,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'essential',
      name: 'Supreme Box Logo Hooded Sweatshirt Black',
      description: 'The Supreme Box Logo Hooded Sweatshirt in Black is one of the brand\'s most iconic pieces.',
      richDescription: '<p>The Supreme Box Logo Hooded Sweatshirt in Black is one of the brand\'s most iconic pieces. Made from heavyweight cotton fleece with a kangaroo pocket and the famous box logo embroidered on the chest.</p>',
      image: 'supreme-bogo-black.jpg',
      image_full_url: 'https://example.com/images/supreme-bogo-black.jpg',
      images: ['supreme-bogo-black-1.jpg', 'supreme-bogo-black-2.jpg'],
      indicator: indicators[2]._id, // Hot Deal
      isIndicatorActive: true,
      brand: brands[4]._id, // Supreme
      model: 'Box Logo Hooded Sweatshirt',
      category: categories[1]._id, // Apparel
      sku: 'SUP-FW17-BLK',
      colorway: 'Black',
      mainColor: 'Black',
      retailPrice: 168,
      rating: 4.9,
      numViews: 9000,
      isFeatured: true,
      isCalenderActive: false,
      sellerFee: 15,
      buyerFee: 10,
      publishDate: new Date('2017-12-14'),
      duration: 14,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'deal',
      name: 'Off-White Industrial Belt Yellow',
      description: 'The Off-White Industrial Belt in Yellow is a signature accessory from Virgil Abloh\'s label.',
      richDescription: '<p>The Off-White Industrial Belt in Yellow is a signature accessory from Virgil Abloh\'s label. Made from industrial webbing with metal buckle and featuring the brand\'s distinctive quotation marks and diagonal stripe branding.</p>',
      image: 'off-white-belt-yellow.jpg',
      image_full_url: 'https://example.com/images/off-white-belt-yellow.jpg',
      images: ['off-white-belt-yellow-1.jpg', 'off-white-belt-yellow-2.jpg'],
      indicator: indicators[1]._id, // Express Out
      isIndicatorActive: true,
      brand: brands[5]._id, // Off-White
      model: 'Industrial Belt',
      category: categories[2]._id, // Accessories
      sku: 'OWRB009R21FAB001',
      colorway: 'Yellow/Black',
      mainColor: 'Yellow',
      retailPrice: 220,
      rating: 4.5,
      numViews: 7500,
      isFeatured: false,
      isCalenderActive: false,
      sellerFee: 10,
      buyerFee: 5,
      publishDate: new Date('2018-06-15'),
      duration: 7,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'deal',
      name: 'New Balance 550 White Green',
      description: 'The New Balance 550 in White and Green is a retro basketball silhouette brought back from the archives.',
      richDescription: '<p>The New Balance 550 in White and Green is a retro basketball silhouette brought back from the archives. This clean colorway features a white leather upper with green accents and a vintage-inspired design.</p>',
      image: 'nb-550-white-green.jpg',
      image_full_url: 'https://example.com/images/nb-550-white-green.jpg',
      images: ['nb-550-white-green-1.jpg', 'nb-550-white-green-2.jpg'],
      indicator: indicators[1]._id, // Express Out
      isIndicatorActive: true,
      brand: brands[3]._id, // New Balance
      model: '550',
      category: categories[0]._id, // Sneakers
      sku: 'BB550WT1',
      colorway: 'White/Green',
      mainColor: 'White',
      retailPrice: 110,
      rating: 4.6,
      numViews: 8500,
      isFeatured: false,
      isCalenderActive: false,
      sellerFee: 8,
      buyerFee: 5,
      publishDate: new Date('2021-05-15'),
      duration: 5,
      duration_icon: 'clock.png'
    },
    {
      product_type: 'deal',
      name: 'Travis Scott Cactus Jack T-Shirt Brown',
      description: 'The Travis Scott Cactus Jack T-Shirt in Brown features the artist\'s signature branding.',
      richDescription: '<p>The Travis Scott Cactus Jack T-Shirt in Brown features the artist\'s signature branding. Made from premium cotton with a comfortable fit and unique graphics associated with Travis Scott\'s merchandise line.</p>',
      image: 'travis-shirt-brown.jpg',
      image_full_url: 'https://example.com/images/travis-shirt-brown.jpg',
      images: ['travis-shirt-brown-1.jpg', 'travis-shirt-brown-2.jpg'],
      indicator: indicators[0]._id, // Just Dropped
      isIndicatorActive: true,
      brand: brands[6]._id, // Travis Scott
      model: 'Cactus Jack T-Shirt',
      category: categories[1]._id, // Apparel
      sku: 'CJ-TS-BRN-001',
      colorway: 'Brown',
      mainColor: 'Brown',
      retailPrice: 45,
      rating: 4.7,
      numViews: 6500,
      isFeatured: false,
      isCalenderActive: false,
      sellerFee: 10,
      buyerFee: 5,
      publishDate: new Date('2022-08-10'),
      duration: 7,
      duration_icon: 'clock.png'
    }
  ];
  
  for (const product of products) {
    const newProduct = new Product(product);
    await newProduct.save();
  }
};

// Export the seed function
module.exports = {
  seedDemoData
};