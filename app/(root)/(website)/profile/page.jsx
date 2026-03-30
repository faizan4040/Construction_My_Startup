'use client'
import React, { useEffect, useState } from 'react'
import UserPanelLayout from '@/components/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { zSchema } from '@/lib/zodSchema'
import { useForm } from 'react-hook-form'
import useFetch from '@/hooks/useFetch'
import Dropzone from 'react-dropzone'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { IMAGES } from '@/routes/AllImages'
import { FaCamera } from 'react-icons/fa'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { useDispatch } from 'react-redux'
import { login } from '@/store/reducer/authReducer'

const breadCrumbData = {
  title: 'Profile',
  links: [{ label: 'Profile' }]
}

const Profile = () => {
  const dispatch = useDispatch()
  const { data: user } = useFetch('/api/profile/get')

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  const formSchema = zSchema.pick({
    name: true,
    phone: true,
    address: true
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: ''
    }
  })

  // Load user data
  useEffect(() => {
    if (user && user.success) {
        const userData = user.data
        form.reset({
          name: userData?.name,
          phone: userData?.phone,
          address: userData?.address,
        })

      setPreview(userData?.avatar?.url || IMAGES.profile)
    }
  }, [user])


  const handleFileSelection = (files) => {
    const file = files[0]
    const preview = URL.createObjectURL(file)
    setPreview(preview)
    setFile(file)
  }


  const updateProfile = async (values) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("phone", values.phone);
    formData.append("address", values.address);

    if (file) {
      formData.append("file", file); 
    }

    const { data: response } = await axios.put('/api/profile/update', formData);

    if (!response.success) throw new Error(response.message);

    showToast("success", response.message);

    // Update redux state
    dispatch(login(response.data));

    // Update preview immediately
    if (response.data.avatar?.url) {
      setPreview(response.data.avatar.url);
    }

  } catch (error) {
    showToast("error", error.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <WebsiteBreadcrumb props={breadCrumbData} />

      <UserPanelLayout>
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">

          <div className="flex justify-center mb-8">
            <Dropzone onDrop={handleFileSelection} accept={{ 'image/*': [] }}>
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className="relative cursor-pointer group">
                  <input {...getInputProps()} />

                  <Avatar className="w-32 h-32 border-4 border-gray-100">
                    <AvatarImage src={preview ? preview : IMAGES.profile} />
                  </Avatar>

                  <div className="absolute inset-0 bg-black/40 rounded-full hidden group-hover:flex items-center justify-center">
                    <FaCamera className="text-white text-2xl" />
                  </div>
                </div>
              )}
            </Dropzone>
          </div>

 
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateProfile)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Save Changes"
                  className="w-full bg-black text-white hover:bg-gray-900"
                />
              </div>
            </form>
          </Form>
        </div>
      </UserPanelLayout>
    </div>
  )
}

export default Profile
