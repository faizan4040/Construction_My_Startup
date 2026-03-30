'use client'

import { zSchema } from '@/lib/zodSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ButtonLoading from "@/components/Application/ButtonLoading";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import axios from 'axios';
import { showToast } from "@/lib/showToast";

const OTPVerification = ({email, onSubmit, loading}) => {
    const [isResendingOtp, setIsResendingOtp] = useState(false)

    const formSchema = zSchema.pick({
        otp: true, email: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            otp: "",
            email: email
        }
    })

    const handleOtpVarification = async  (values) => {
      onSubmit(values)
    }

    const resendOTP = async () =>{
     try {
              setIsResendingOtp(true);
              const { data: resendOtpResponse } = await axios.post("/api/auth/resend-otp", 
                {email}
            );
              if (!resendOtpResponse.success) {
               throw new Error(resendOtpResponse.message);
              }
        
              showToast('success', resendOtpResponse.message);
            } catch (error) {
               showToast('error', error.message || "Registration failed. Please try again.");
            } finally {
              setIsResendingOtp(false);
            }
    }

  return (
    <div>

    <Form {...form}>
        <form
        onSubmit={form.handleSubmit(handleOtpVarification)}
        className="space-y-6"
        >
        <div className='text-center'>
         <h1 className='text-2xl font-bold mb-2'>Please complete verification</h1>
         <p className='text-md'>We have send an One-time Password (OTP) to your registered 
            email address. The OTP is valid for 10 minutes  only.</p>
        </div>

       <div className="mb-5 mt-5 flex justify-center">
        <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
            <FormItem>
                <FormLabel className='font-semibold'>One-time Password (OTP)</FormLabel>
                <FormControl>
                <InputOTP maxLength={6} {...field}>
                <InputOTPGroup>
                    <InputOTPSlot className='text-xl size-10' index={0} />
                    <InputOTPSlot className='text-xl size-10' index={1} />
                    <InputOTPSlot className='text-xl size-10' index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                    <InputOTPSlot className='text-xl size-10' index={3} />
                    <InputOTPSlot className='text-xl size-10' index={4} />
                    <InputOTPSlot className='text-xl size-10' index={5} />
                </InputOTPGroup>
                </InputOTP>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        </div>
        {/* Submit */}
        <div className="mb-3">
            <ButtonLoading
            loading={loading}
            type="submit"
            text="Verify"
            className="w-full cursor-pointer bg-black text-white"
        />
        </div>
        <div className='text-center mt-5'>
            {!isResendingOtp ?
             <button onClick={resendOTP} type='button' 
             className="text-blue-500 cursor-pointer hover:underline">
            Resend OTP</button>
            :
            <span className='text-md'>Resending...</span>
            }
        </div>
        </form>
    </Form>
    </div>
  )
}

export default OTPVerification