import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import SearchModel from './SearchModel'
import { Search } from "lucide-react"
const AdminSearch = () => {
    const [open, setOpen] = useState(false)
   const [showSearch, setShowSearch] = useState(false)
  return (
    <div className="relative flex-1 max-w-md">
        <div
          className={`
            flex items-center gap-2 rounded-md border
            bg-white dark:bg-background
            px-3 py-1.5
            transition-all duration-300
          `}
        >
          <Search
            size={18}
            className="cursor-pointer text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search orders, users, products..."
            className={`
              w-full bg-transparent text-sm outline-none
              placeholder:text-muted-foreground
              ${showSearch ? "block" : "hidden md:block"}
            `}
            onClick={() => setOpen(true)}
          />
        </div>

      <SearchModel open={open} setOpen={setOpen}/>
    </div>
  )
}

export default AdminSearch