'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import CategoryForm from '@/components/Application/Admin/CategoryForm'
import useFetch from '@/hooks/useFetch'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import React from 'react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' },
]

const AddCategory = () => {
  const { data: getCategory } = useFetch('/api/category/get-category')
  const allCategories = getCategory?.success ? getCategory.data : []

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="py-4">
        <CategoryForm mode="add" allCategories={allCategories} />
      </div>
    </div>
  )
}

export default AddCategory

