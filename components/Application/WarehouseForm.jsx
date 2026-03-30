'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showToast } from '@/lib/showToast'


const WarehouseForm = ({ initialData = null }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    manager: initialData?.manager || '',
    capacity: initialData?.capacity || '',
    status: initialData?.status || 'active',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData 
        ? '/api/warehouse/update' 
        : '/api/warehouse'

      const method = initialData ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        ...(initialData && { _id: initialData._id })
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        showToast.success(result.message)
        setTimeout(() => {
          router.push('/admin/warehouse')
        }, 1000)
      } else {
        showToast.error(result.message || 'Something went wrong')
      }
    } catch (error) {
      showToast.error('Failed to submit form')
      // console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="border-b pb-3 px-3 pt-3">
        <h4 className='text-xl font-semibold'>
          {initialData ? 'Edit Warehouse' : 'Add New Warehouse'}
        </h4>
      </CardHeader>
      <CardContent className='p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Row 1 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Warehouse Name *</label>
              <Input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                placeholder='Enter warehouse name'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Location *</label>
              <Input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleChange}
                placeholder='Enter location'
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Address *</label>
              <Input
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Enter address'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>City *</label>
              <Input
                type='text'
                name='city'
                value={formData.city}
                onChange={handleChange}
                placeholder='Enter city'
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>State *</label>
              <Input
                type='text'
                name='state'
                value={formData.state}
                onChange={handleChange}
                placeholder='Enter state'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Zip Code *</label>
              <Input
                type='text'
                name='zipCode'
                value={formData.zipCode}
                onChange={handleChange}
                placeholder='Enter zip code'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Country *</label>
              <Input
                type='text'
                name='country'
                value={formData.country}
                onChange={handleChange}
                placeholder='Enter country'
                required
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Phone *</label>
              <Input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                placeholder='Enter phone number'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Email *</label>
              <Input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter email'
                required
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Manager Name *</label>
              <Input
                type='text'
                name='manager'
                value={formData.manager}
                onChange={handleChange}
                placeholder='Enter manager name'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Capacity (units) *</label>
              <Input
                type='number'
                name='capacity'
                value={formData.capacity}
                onChange={handleChange}
                placeholder='Enter storage capacity'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>Status *</label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 justify-end pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/warehouse')}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='bg-orange-500 hover:bg-orange-600'
            >
              {loading ? 'Saving...' : initialData ? 'Update Warehouse' : 'Add Warehouse'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default WarehouseForm