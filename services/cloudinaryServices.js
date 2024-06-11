const { getPublicIdFromUrl } = require('../utils/formatUtils');

const cloudinary = require('../config/config').cloudinary;

module.exports.DeleteOldImageFromCloudinary = async function DeleteOldImageFromCloudinary(oldImageLink) {
  const deflink = "https://res.cloudinary.com/dgidrmdqz/image/upload/v1713376923/defaultprofile_kwree3.jpg";
  if (oldImageLink === deflink) {
    return;
  }
  if(!oldImageLink.includes("cloudinary")){
     return;
  }
  const publicId = getPublicIdFromUrl(oldImageLink);
  if (!publicId) {
    console.error("PublicId not found in url", oldImageLink);
    return;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted:", result);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

module.exports.uploadImageCloudinary = async function uploadImageCloudinary(buffer_content) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        console.log(error);
        return reject(error);
      }
      resolve(result.secure_url);
    });
    uploadStream.end(buffer_content);
  });
};

module.exports.downloadImageFromCloudinary = async function downloadImageFromCloudinary(url, localFilePath) {
  try {
    const publicId = await getPublicIdFromUrl(url);
    const result = await cloudinary.uploader.download(publicId);
    fs.writeFileSync(localFilePath, result);
  } catch (error) {
    console.error('Error downloading image from Cloudinary:', error);
  }
}

