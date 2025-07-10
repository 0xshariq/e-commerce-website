import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { NextApiRequest, NextApiResponse } from 'next';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create upload directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, uniqueFilename);
  },
});

// File filter function to accept only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Interface for file upload response
export interface FileUploadResponse {
  success: boolean;
  message: string;
  localPath?: string;
  cloudinaryUrl?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Upload file to both local storage and Cloudinary
 * @param file Express.Multer.File object
 * @returns Promise with upload details
 */
export async function uploadProfileImage(file: Express.Multer.File): Promise<FileUploadResponse> {
  try {
    // File is already saved locally by multer
    const localFilePath = file.path;
    
    // Generate a public URL for the file (relative to public directory)
    const publicPath = `/uploads/${path.basename(file.path)}`;
    
    // Upload to Cloudinary as backup
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'profile-images',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      // Continue with local file if Cloudinary fails
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      localPath: localFilePath,
      publicUrl: publicPath,
      cloudinaryUrl: cloudinaryResult?.secure_url,
    };
  } catch (error: any) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: 'File upload failed',
      error: error.message,
    };
  }
}

/**
 * Delete a previously uploaded profile image
 * @param filePath Local file path to delete
 * @param cloudinaryId Cloudinary public ID (optional)
 */
export async function deleteProfileImage(filePath: string, cloudinaryId?: string): Promise<boolean> {
  try {
    // Delete local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from Cloudinary if ID is provided
    if (cloudinaryId) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Process uploaded profile image in Next.js API routes
 * For use with API routes in app directory
 * @param formData FormData object containing the file
 */
export async function processProfileImageUpload(formData: FormData): Promise<FileUploadResponse> {
  try {
    // Get file from formData
    const file = formData.get('profileImage') as File;
    
    if (!file) {
      return { 
        success: false, 
        message: 'No file provided' 
      };
    }
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return { 
        success: false, 
        message: 'Only image files are allowed' 
      };
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { 
        success: false, 
        message: 'File size should be less than 5MB' 
      };
    }
    
    // Create a unique filename
    const uniqueFilename = `${uuidv4()}_${file.name.replace(/\s+/g, '_')}`;
    const localFilePath = path.join(uploadDir, uniqueFilename);
    
    // Convert File to Buffer and save locally
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(localFilePath, buffer);
    
    // Generate a public URL for the file (relative to public directory)
    const publicPath = `/uploads/${uniqueFilename}`;
    
    // Upload to Cloudinary as backup
    let cloudinaryResult;
    try {
      cloudinaryResult = await cloudinary.uploader.upload(localFilePath, {
        folder: 'profile-images',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      // Continue with local file if Cloudinary fails
    }
    
    return {
      success: true,
      message: 'File uploaded successfully',
      localPath: localFilePath,
      publicUrl: publicPath,
      cloudinaryUrl: cloudinaryResult?.secure_url,
    };
  } catch (error: any) {
    console.error('File upload processing error:', error);
    return {
      success: false,
      message: 'File upload processing failed',
      error: error.message,
    };
  }
}
