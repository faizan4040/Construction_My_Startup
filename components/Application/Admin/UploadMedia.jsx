'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { CldUploadWidget } from 'next-cloudinary'
import { FaPlus } from 'react-icons/fa6'
import { showToast } from '@/lib/showToast'
import axios from 'axios'

const UploadMedia = ({ isMultiple, queryClient }) => {

  const handleOnError = (error) => {
    console.log('error:', error?.message || 'Upload failed')
  }

  const handleOnQueueEnd = async (results) => {
    const files = results.info.files
    const uploadeFiles = files.filter(file => file.uploadInfo).map(file => ({
       asset_id: file.uploadInfo.asset_id,
       public_id: file.uploadInfo.public_id,
       secure_url: file.uploadInfo.secure_url,
       path: file.uploadInfo.path,
       thumbnail_url: file.uploadInfo.thumbnail_url,
    }))

    if (uploadeFiles.length > 0) {
         try{
             const {data: mediaUploadResponse} = await axios.post('/api/media/create', uploadeFiles)
             if(!mediaUploadResponse.success){
               throw new Error(mediaUploadResponse.message)
             }

               queryClient.invalidateQueries(['media-data'])
                showToast('success', mediaUploadResponse.message)

             } catch(error) {
                showToast('error', error.message)
         }
    }

  }

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary-signature"
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onError={handleOnError}
      onQueuesEnd={handleOnQueueEnd}
      config={{
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apikey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      }}
      options={{
        multiple: isMultiple,
        sources: ['local', 'url', 'unsplash', 'google_drive'],
      }}
    >
      {({ open }) => {
      return (
        <Button
          type="button"
          onClick={() => open()}
        >
          <FaPlus className="mr-2" />
          Upload Media
        </Button>
      )
    }}

    </CldUploadWidget>
  )
}

export default UploadMedia
