'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import CategoryForm from '@/components/Application/Admin/CategoryForm'
import useFetch from '@/hooks/useFetch'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import React, { use } from 'react'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Edit Category' },
]

const EditCategory = ({ params }) => {
  const { id } = use(params)
  const { data: categoryData } = useFetch(`/api/category/get/${id}`)
  const { data: getCategory } = useFetch('/api/category/get-category')

  const ready = categoryData?.success && getCategory?.success

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <div className="py-4">
        {ready ? (
          <CategoryForm
            key={id}
            mode="edit"
            id={id}
            initialData={categoryData.data}
            allCategories={getCategory.data}
          />
        ) : categoryData && !categoryData.success ? (
          <p className="text-sm text-red-500">{categoryData.message || 'Category not found.'}</p>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>
    </div>
  )
}

export default EditCategory

