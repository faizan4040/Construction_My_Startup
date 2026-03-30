"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


import Link from "next/link";
import { zSchema } from "@/lib/zodSchema";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { WEBSITE_LOGIN} from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Application/OTPVerification";
import UpdatePassword from "@/components/Application/UpdatePassword";
import { IMAGES } from "@/routes/AllImages";

const ResetPassword = () => {

 const [emailVerificationLoading, setEmailVerificationLoading] = useState(false)
 const [otpVerificationLoading, setotpVerificationLoading] = useState(false)
 const [otpEmail, setOtpEmail] = useState() 
 const [isOtpVerified, setIsOtpVerified] = useState(false)

 const formSchema = zSchema.pick({
    email: true
 })


 const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
        email: ""
    }
 })

 const handleEmailVerification = async (values) => {
   try {
         setEmailVerificationLoading(true);
         const { data: sendOtpResponse } = await axios.post("/api/auth/reset-password/send-otp", values);
         if (!sendOtpResponse.success) {
          throw new Error(sendOtpResponse.message);
         }
   
         setOtpEmail(values.email)
         showToast('success', sendOtpResponse.message);

       } catch (error) {
          showToast('error', error.message || "Registration failed. Please try again.");
       } finally {
          setEmailVerificationLoading(false);
       }
 }

// otp verifcation
  const handleOtpVerification = async (values) => {
   try {
         setotpVerificationLoading(true);
         const { data: otpResponse } = await axios.post("/api/auth/reset-password/verify-otp", values);
         if (!otpResponse.success) {
          throw new Error(otpResponse.message);
         }

         showToast('success', otpResponse.message);
         setIsOtpVerified(true)

       } catch (error) {
          showToast('error', error.message || "Registration failed. Please try again.");
       } finally {
          setotpVerificationLoading(false);
       }
 }

  return (
     <Card className="relative w-112.5 shadow-2xl">
    
              <CardContent className="space-y-6 py-8">
                {/* Logo */}
                <div className="flex justify-center">
                  <img src={IMAGES.logo} alt="logo" width={50} height={50} />
                </div>
    
                {!otpEmail
                    ?
                    <>
                <div className="text-center space-y-1">
                  <h1 className="text-3xl font-bold">Reset Password</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email for password reset.
                  </p>
                </div>
                <div className="mt-5">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit
                    (handleEmailVerification)}
                    className="space-y-6"
                  >
                    <div className="mb-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
    
                    {/* Submit */}
                    <ButtonLoading
                      loading={emailVerificationLoading}
                      type="submit"
                      text="Send OTP"
                      className="w-full bg-black text-white"
                    />
    
                    <div className="text-center space-y-2">
                      <p>
                        Don't have an account?{" "}
                        <Link
                          href={WEBSITE_LOGIN}
                          className="text-blue-500 hover:underline"
                        >
                          Back To Login
                        </Link>
                      </p>

                    </div>
                  </form>
                </Form>
                </div>
                    </>
                    :
                    <>
                    {isOtpVerified ?

                        <OTPVerification email={otpEmail} onSubmit={handleOtpVerification} 
                        loading={otpVerificationLoading}/>
                    :

                    <UpdatePassword email={otpEmail}/>
                    
                    }
                    </>
                    
                }
              </CardContent>
            </Card>
  )
}
 
export default ResetPassword