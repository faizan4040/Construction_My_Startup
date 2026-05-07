import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,   
   api_key:  process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_SECRET_KEY,  
})



export async function uploadToCloudinary(buffer, folder, publicId = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      folder,
      resource_type: "auto",
    }
    if (publicId) opts.public_id = publicId
 
    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error)
      resolve({ url: result.secure_url, public_id: result.public_id })
    })
    stream.end(buffer)
  })
}
 
/**
 * Delete a file from Cloudinary by public_id
 * @param {string} publicId
 */
export async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error("Cloudinary delete error:", err)
  }
}


export default cloudinary

