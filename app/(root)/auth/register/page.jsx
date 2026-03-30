"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { zSchema } from "@/lib/zodSchema";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { showToast } from "@/lib/showToast";
import { IMAGES } from "@/routes/AllImages";


/* --------------------
   Zod Schema
-------------------- */


  const RegisterPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

const formSchema = zSchema.pick({
   name: true, email: true, password: true
  }).extend({
      confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegisterSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: registerResponse } = await axios.post("/api/auth/register", values);
      if (!registerResponse.success) {
        throw new Error(registerResponse.message);
      }

      form.reset();
      showToast('success', registerResponse.message);
      
    } catch (error) {
      showToast('error', error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Background Blur */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />


      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Card className="relative w-120 shadow-2xl">

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

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold">Create Account</h1>
              <p className="text-sm text-muted-foreground">
                Register into your account by filling out the form below.
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleRegisterSubmit)}
                className="space-y-6"
              >
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            type={showPassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "password" : "text"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
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
                  text="Create Account"
                  className="w-full bg-black text-white"
                />

                {/* Footer */}
                <div className="text-center">
                  <p>
                    Already have an account?{" "}
                    <Link
                      href={WEBSITE_LOGIN}
                      className="text-blue-500 hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;
