"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {  z } from "zod";
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


import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { zSchema } from "@/lib/zodSchema";
import ButtonLoading from "@/components/Application/ButtonLoading";
import { showToast } from "@/lib/showToast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";


/* --------------------
   Zod Schema
-------------------- */


  const UpdatePassword = ({ email }) => {
  const router = useRouter()  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

const formSchema = zSchema.pick({
     email: true, password: true
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
      email: email,
      password: "",
      confirmPassword: "",
    },
  });

  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true);
      const { data: passwordUpdate } = await axios.put("/api/auth/reset-password/update-password", values);
      if (!passwordUpdate.success) {
        throw new Error(passwordUpdate.message);
      }

      form.reset();
      showToast('success', passwordUpdate.message);
      router.push(WEBSITE_LOGIN)
      
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔹 Background Blur */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 Center Modal */}
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

            {/* Heading */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold">Update Password</h1>
              <p className="text-sm text-muted-foreground">
               Create new password by filling below form.
              </p>
            </div>

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handlePasswordUpdate)}
                className="space-y-6"
              >

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
                  text="Update Password"
                  className="w-full bg-black text-white"
                />

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UpdatePassword;
