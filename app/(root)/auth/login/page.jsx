"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

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
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { zSchema } from "@/lib/zodSchema";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { IMAGES } from "@/routes/AllImages";
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Application/OTPVerification";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

const Loginpage = () => {
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpVerificationLoading, setotpVerificationLoading] = useState(false);

  const [isTypePassword, setIsTypePassword] = useState(true);
  const [otpEmail, setOtpEmail] = useState()
    const formSchema = zSchema.pick({
      email: true
    }).extend({
      password: z.string().min('3', 'password field is required.')
    })

 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (values) => {
   try {
         setLoading(true)
         const { data: loginResponse } = await axios.post("/api/auth/login", values);
         if (!loginResponse.success) {
          throw new Error(loginResponse.message);
         }
   
         setOtpEmail(values.email)
         form.reset();
         showToast('success',loginResponse.message);
       } catch (error) {
          showToast('error', error.message || "Registration failed. Please try again.");
       } finally {
         setLoading(false);
       }
     };

     //otp verification
     const handleOtpVerification = async (values) =>{
      try {
         setotpVerificationLoading(true);
         const { data: otpResponse } = await axios.post("/api/auth/verify-otp", values);
         if (!otpResponse.success) {
          throw new Error(otpResponse.message);
         }
   
         setOtpEmail('')
         showToast('success', otpResponse.message);

         dispatch(login(otpResponse.data))

         if(searchParams.has('callback')){
          router.push(searchParams.get('callback'))
         }else{
          otpResponse.data.role === 'admin' ? router.push(ADMIN_DASHBOARD) : router.push(USER_DASHBOARD)
         }

       } catch (error) {
          showToast('error', error.message || "Registration failed. Please try again.");
       } finally {
          setotpVerificationLoading(false);
       }
     };

  return (
    <>
      {/* 🔹 Background Blur Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 Center Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Card className="relative w-112.5 shadow-2xl">

         
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute cursor-pointer right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>

          <CardContent className="space-y-6 py-8">
            {/* Logo */}
            <div className="flex justify-center">
              <img src={IMAGES.logos} alt="logo" width={150} height={70} />
            </div>

            {!otpEmail
                ?
                <>
                   {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold">Login Into Account</h1>
              <p className="text-sm text-muted-foreground">
                Login into your account by filling out the form below.
              </p>
            </div>
            {/* Form */}
            <div className="mt-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleLoginSubmit)}
                className="space-y-6"
              >
                {/* Email */}
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

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={isTypePassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setIsTypePassword(!isTypePassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {isTypePassword ? (
                              <FaRegEye />
                            ) : (
                              <FaRegEyeSlash />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <ButtonLoading
                  loading={loading}
                  type="submit"
                  text="Login"
                  className="w-full bg-black text-white"
                />

                {/* Links */}
                <div className="text-center space-y-2">
                  <p>
                    Don't have an account?{" "}
                    <Link
                      href={WEBSITE_REGISTER}
                      className="text-blue-500 hover:underline"
                    >
                      create account!
                    </Link>
                  </p>

                  <Link
                    href={WEBSITE_RESETPASSWORD}
                    className="text-blue-500 hover:underline"
                  >
                    Forget Password?
                  </Link>
                </div>
              </form>
            </Form>
            </div>
                </>
                :
                <OTPVerification email={otpEmail} onSubmit={handleOtpVerification} loading={otpVerificationLoading}/>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Loginpage;
