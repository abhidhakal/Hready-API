const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Debug: Check if environment variables are loaded
console.log('Cloudinary Config Check:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

try {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  console.log('Cloudinary configured successfully');

  // Configure Cloudinary storage for multer
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'hready-profiles',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    }
  });

  console.log('CloudinaryStorage created successfully');

  // File filter
  const fileFilter = (req, file, cb) => {
    console.log('File filter called with:', file.mimetype, file.originalname);
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, and .jpeg formats are allowed.'), false);
    }
  };

  // Create multer instance with Cloudinary storage
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 2 * 1024 * 1024 // 2 MB limit
    }
  });

  console.log('Multer upload instance created successfully');

  module.exports = { cloudinary, upload };
} catch (error) {
  console.error('Error setting up Cloudinary:', error);
  console.error('Error stack:', error.stack);
  throw error;
} 