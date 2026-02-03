import { v2 as cloudinary } from 'cloudinary';

const cloudName: string = process.env.CLOUDINARY_CLOUD_NAME!
const apiKey: string = process.env.CLOUDINARY_API_KEY!
const apiSecret: string = process.env.CLOUDINARY_API_SECRET!
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
