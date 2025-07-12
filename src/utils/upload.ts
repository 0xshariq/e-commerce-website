import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create upload directories if they don't exist
const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
const profileUploadDir = path.join(baseUploadDir, 'profile');
const productUploadDir = path.join(baseUploadDir, 'product');

[baseUploadDir, profileUploadDir, productUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter function to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Interface for file upload response
export interface FileUploadResponse {
  success: boolean;
  message: string;
  localPath?: string;
  cloudinaryUrl?: string;
  publicUrl?: string;
  error?: string;
}

// Image upload types
export type ImageType = 'profile' | 'product';
export type UserRole = 'customer' | 'vendor' | 'admin';

/**
 * Generate filename based on type and user info
 */
function generateFilename(type: ImageType, role: UserRole, id: string, extension: string): string {
  switch (type) {
    case 'profile':
      return `${role}_${id}.${extension}`;
    case 'product':
      return `vendor_${id}.${extension}`;
    default:
      return `${Date.now()}_${id}.${extension}`;
  }
}

/**
 * Get upload directory based on image type
 */
function getUploadDirectory(type: ImageType): string {
  switch (type) {
    case 'profile':
      return profileUploadDir;
    case 'product':
      return productUploadDir;
    default:
      return baseUploadDir;
  }
}

/**
 * Get Cloudinary folder based on image type and role
 */
function getCloudinaryFolder(type: ImageType, role?: UserRole): string {
  switch (type) {
    case 'profile':
      return `profile/${role || 'user'}`;
    case 'product':
      return 'products';
    default:
      return 'uploads';
  }
}

/**
 * Check if image exists in Cloudinary
 */
async function checkCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Upload profile image with specific naming convention
 */
export async function uploadProfileImage(
  file: File | Express.Multer.File, 
  role: UserRole, 
  userId: string
): Promise<FileUploadResponse> {
  try {
    let buffer: Buffer;
    let originalName: string;
    let mimeType: string;

    // Handle different file types
    if ('arrayBuffer' in file) {
      // File object from FormData
      buffer = Buffer.from(await file.arrayBuffer());
      originalName = file.name;
      mimeType = file.type;
    } else {
      // Express.Multer.File
      buffer = fs.readFileSync(file.path);
      originalName = file.originalname;
      mimeType = file.mimetype;
    }

    // Check if it's an image
    if (!mimeType.startsWith('image/')) {
      return { 
        success: false, 
        message: 'Only image files are allowed' 
      };
    }

    // Get file extension
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = generateFilename('profile', role, userId, ext);
    const localFilePath = path.join(getUploadDirectory('profile'), filename);
    
    // Save locally
    fs.writeFileSync(localFilePath, buffer);
    
    // Generate public URL
    const publicPath = `/uploads/profile/${filename}`;
    
    // Upload to Cloudinary
    let cloudinaryResult;
    const cloudinaryFolder = getCloudinaryFolder('profile', role);
    const cloudinaryPublicId = `${cloudinaryFolder}/${role}_${userId}`;
    
    try {
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: cloudinaryFolder,
        public_id: cloudinaryPublicId,
        overwrite: true,
        format: ext,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
    }

    return {
      success: true,
      message: 'Profile image uploaded successfully',
      localPath: localFilePath,
      publicUrl: publicPath,
      cloudinaryUrl: cloudinaryResult?.secure_url,
    };
  } catch (error: any) {
    console.error('Profile image upload error:', error);
    return {
      success: false,
      message: 'Profile image upload failed',
      error: error.message,
    };
  }
}

/**
 * Upload product image with specific naming convention
 */
export async function uploadProductImage(
  file: File | Express.Multer.File, 
  productId: string
): Promise<FileUploadResponse> {
  try {
    let buffer: Buffer;
    let originalName: string;
    let mimeType: string;

    // Handle different file types
    if ('arrayBuffer' in file) {
      // File object from FormData
      buffer = Buffer.from(await file.arrayBuffer());
      originalName = file.name;
      mimeType = file.type;
    } else {
      // Express.Multer.File
      buffer = fs.readFileSync(file.path);
      originalName = file.originalname;
      mimeType = file.mimetype;
    }

    // Check if it's an image
    if (!mimeType.startsWith('image/')) {
      return { 
        success: false, 
        message: 'Only image files are allowed' 
      };
    }

    // Get file extension
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = generateFilename('product', 'vendor', productId, ext);
    const localFilePath = path.join(getUploadDirectory('product'), filename);
    
    // Save locally
    fs.writeFileSync(localFilePath, buffer);
    
    // Generate public URL
    const publicPath = `/uploads/product/${filename}`;
    
    // Upload to Cloudinary
    let cloudinaryResult;
    const cloudinaryFolder = getCloudinaryFolder('product');
    const cloudinaryPublicId = `${cloudinaryFolder}/vendor_${productId}`;
    
    try {
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: cloudinaryFolder,
        public_id: cloudinaryPublicId,
        overwrite: true,
        format: ext,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
    }

    return {
      success: true,
      message: 'Product image uploaded successfully',
      localPath: localFilePath,
      publicUrl: publicPath,
      cloudinaryUrl: cloudinaryResult?.secure_url,
    };
  } catch (error: any) {
    console.error('Product image upload error:', error);
    return {
      success: false,
      message: 'Product image upload failed',
      error: error.message,
    };
  }
}

/**
 * Get image URL with fallback logic (Cloudinary first, then local)
 */
export async function getImageUrl(
  type: ImageType, 
  id: string, 
  role?: UserRole
): Promise<string | null> {
  try {
    // Construct Cloudinary URL
    let cloudinaryPublicId: string;
    if (type === 'profile' && role) {
      cloudinaryPublicId = `${getCloudinaryFolder(type, role)}/${role}_${id}`;
    } else if (type === 'product') {
      cloudinaryPublicId = `${getCloudinaryFolder(type)}/vendor_${id}`;
    } else {
      return null;
    }

    // Check if image exists in Cloudinary
    const cloudinaryExists = await checkCloudinaryImage(cloudinaryPublicId);
    if (cloudinaryExists) {
      return cloudinary.url(cloudinaryPublicId, { 
        secure: true,
        quality: 'auto',
        fetch_format: 'auto' 
      });
    }

    // Fallback to local file
    let localPath: string;
    if (type === 'profile' && role) {
      // Try different extensions
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of extensions) {
        const filename = generateFilename(type, role, id, ext);
        localPath = path.join(getUploadDirectory(type), filename);
        if (fs.existsSync(localPath)) {
          return `/uploads/${type}/${filename}`;
        }
      }
    } else if (type === 'product') {
      // Try different extensions
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of extensions) {
        const filename = generateFilename(type, 'vendor', id, ext);
        localPath = path.join(getUploadDirectory(type), filename);
        if (fs.existsSync(localPath)) {
          return `/uploads/${type}/${filename}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
}

/**
 * Delete image from both Cloudinary and local storage
 */
export async function deleteImage(
  type: ImageType, 
  id: string, 
  role?: UserRole
): Promise<boolean> {
  try {
    let deleted = false;

    // Delete from Cloudinary
    let cloudinaryPublicId: string;
    if (type === 'profile' && role) {
      cloudinaryPublicId = `${getCloudinaryFolder(type, role)}/${role}_${id}`;
    } else if (type === 'product') {
      cloudinaryPublicId = `${getCloudinaryFolder(type)}/vendor_${id}`;
    } else {
      return false;
    }

    try {
      await cloudinary.uploader.destroy(cloudinaryPublicId);
      deleted = true;
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion failed:', cloudinaryError);
    }

    // Delete local files (try all extensions)
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    for (const ext of extensions) {
      let filename: string;
      if (type === 'profile' && role) {
        filename = generateFilename(type, role, id, ext);
      } else if (type === 'product') {
        filename = generateFilename(type, 'vendor', id, ext);
      } else {
        continue;
      }

      const localPath = path.join(getUploadDirectory(type), filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        deleted = true;
      }
    }

    return deleted;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
