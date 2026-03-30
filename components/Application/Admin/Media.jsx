"use client"

import React from "react"
import Image from "next/image"
import * as Checkbox from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { IoEllipsisVertical } from "react-icons/io5"
import { ADMIN_MEDIA_EDIT } from "@/routes/AdminPanelRoute"
import { MdModeEdit } from "react-icons/md";
import Link from "next/link"
import { IoCopyOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { showToast } from "@/lib/showToast"



const Media = ({
  media,
  handleDelete,
  deleteType,
  selectedMedia,
  setSelectedMedia,
}) => {
  const isChecked = selectedMedia.includes(media._id)

  const handleCheck = () => {
     let newSelectedMedia = []
     if(selectedMedia.includes(media._id)) {
       newSelectedMedia = selectedMedia.filter(m => m !== media._id)
     } else {
        newSelectedMedia = [...selectedMedia, media._id]
     }

     setSelectedMedia(newSelectedMedia)
  }

  const handleCopyLink = async (url) => {
    await navigator.clipboard.writeText(url)
    showToast('success', 'Link copied.')
  }

  return (
    <div className="relative rounded overflow-hidden border border-gray-200 dark:border-gray-800 group">

      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-20">
        <Checkbox.Root
          checked={isChecked}
          onCheckedChange={handleCheck}
          className="h-5 w-5 rounded border border-primary bg-white flex items-center justify-center"
        >
          <Checkbox.Indicator>
            <Check className="h-4 w-4 text-primary" />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </div>

      {/* Dropdown */}
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
              <IoEllipsisVertical size={16} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
             {deleteType === 'SD' && 
               <>
                   <DropdownMenuItem asChild className='cursor-pointer' onClick={()=>handleCheck()}>
                         <Link href={ADMIN_MEDIA_EDIT(media._id)}>
                         <MdModeEdit/>
                           Edit
                         </Link>
                   </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer' onClick={()=>handleCopyLink(media.secure_url)}>
                        <IoCopyOutline />
                          Copy Link
                   </DropdownMenuItem>
               </>
             }
                  <DropdownMenuItem className='cursor-pointer' onClick={() => handleDelete([media._id], deleteType)}>
                          <MdDelete />
                          {deleteType === 'SD' ? 'Move Info Trash' : 'Delete Permenently'}
                   </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square">
        <Image
          src={media.secure_url}
          alt={media?.alt || "Image"}
          fill
          className="object-cover"
        />
      </div>
    </div>
  )
}

export default Media
