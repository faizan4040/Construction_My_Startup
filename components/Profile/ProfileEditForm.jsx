'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, User, Mail, Phone, Save } from 'lucide-react'
import { showToast } from '@/lib/showToast'

const ProfileEditForm = ({ apiEndpoint, redirectRoute, initialUser }) => {
  const router = useRouter()
  const [name, setName] = useState(initialUser?.name || '')
  const [phone, setPhone] = useState(initialUser?.phone || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      showToast('error', 'Name is required.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await axios.put(apiEndpoint, { name: name.trim(), phone: phone.trim() })

      if (data.success) {
        showToast('success', data.message || 'Profile updated successfully.')
        if (redirectRoute) router.push(redirectRoute)
      } else {
        showToast('error', data.message || 'Could not update profile.')
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white border rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <User size={14} /> Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Mail size={14} /> Email
          </label>
          <input
            value={initialUser?.email || ''}
            disabled
            className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Phone size={14} /> Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="10-digit phone number"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default ProfileEditForm