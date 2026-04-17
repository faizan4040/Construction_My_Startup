// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import Link from "next/link";
// import axios from "axios";
// import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCheck, FiArrowRight } from "react-icons/fi";
// import { HiOutlineShoppingCart, HiOutlineOfficeBuilding, HiOutlineTruck } from "react-icons/hi";
// import { MdOutlineEngineering, MdOutlineAdminPanelSettings } from "react-icons/md";
// import { zSchema } from "@/lib/zodSchema";
// import ButtonLoading from "@/components/Application/ButtonLoading";
// import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
// import { showToast } from "@/lib/showToast";
// import { IMAGES } from "@/routes/AllImages";

// /* ─── Role Config ─────────────────────────────────────────────── */
// const PUBLIC_ROLES = [
//   {
//     value: "user",
//     label: "Buyer",
//     icon: HiOutlineShoppingCart,
//     description: "Browse & buy materials",
//     accent: "text-blue-600",
//     activeBg: "bg-blue-50 border-blue-500",
//     activeRing: "ring-2 ring-blue-400/40",
//     dot: "bg-blue-500",
//   },
//   {
//     value: "shop_owner",
//     label: "Shop Owner",
//     icon: HiOutlineOfficeBuilding,
//     description: "List & sell products",
//     accent: "text-emerald-600",
//     activeBg: "bg-emerald-50 border-emerald-500",
//     activeRing: "ring-2 ring-emerald-400/40",
//     dot: "bg-emerald-500",
//   },
//   {
//     value: "delivery_boy",
//     label: "Delivery",
//     icon: HiOutlineTruck,
//     description: "Deliver to customers",
//     accent: "text-amber-600",
//     activeBg: "bg-amber-50 border-amber-500",
//     activeRing: "ring-2 ring-amber-400/40",
//     dot: "bg-amber-500",
//   },
//   {
//     value: "labour",
//     label: "Labour",
//     icon: MdOutlineEngineering,
//     description: "Get hired for work",
//     accent: "text-rose-600",
//     activeBg: "bg-rose-50 border-rose-500",
//     activeRing: "ring-2 ring-rose-400/40",
//     dot: "bg-rose-500",
//   },
// ];

// const ADMIN_ROLE = {
//   value: "admin",
//   label: "Admin",
//   icon: MdOutlineAdminPanelSettings,
//   description: "Platform management",
//   accent: "text-violet-600",
//   activeBg: "bg-violet-50 border-violet-500",
//   activeRing: "ring-2 ring-violet-400/40",
//   dot: "bg-violet-500",
// };

// const ROLE_VISUALS = {
//   user:         { headline: "Find Everything You Build With", sub: "Browse thousands of construction materials from trusted shops.", emoji: "🧱" },
//   shop_owner:   { headline: "Grow Your Construction Business", sub: "List your products and reach thousands of buyers near you.", emoji: "🏗️" },
//   delivery_boy: { headline: "Earn on Every Delivery", sub: "Flexible delivery work in your area with instant payouts.", emoji: "📦" },
//   labour:       { headline: "Get Hired for Construction Work", sub: "Connect with contractors and builders looking for skilled workers.", emoji: "⚒️" },
//   admin:        { headline: "Manage the Entire Platform", sub: "Full administrative access to users, orders, and system settings.", emoji: "🛡️" },
//   default:      { headline: "Build. Buy. Deliver.", sub: "Your all-in-one construction marketplace platform.", emoji: "🏠" },
// };

// const ADMIN_SECRET = "ADMIN2025";

// const FEATURES = [
//   { emoji: "✅", text: "Verified Sellers" },
//   { emoji: "🔐", text: "Secure Payments" },
//   { emoji: "⚡", text: "Fast Delivery" },
//   { emoji: "🤝", text: "24/7 Support" },
// ];

// const RegisterPage = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [selectedRole, setSelectedRole] = useState("");
//   const [adminUnlocked, setAdminUnlocked] = useState(false);

//   const visibleRoles = adminUnlocked ? [...PUBLIC_ROLES, ADMIN_ROLE] : PUBLIC_ROLES;
//   const visual = selectedRole ? ROLE_VISUALS[selectedRole] || ROLE_VISUALS.default : ROLE_VISUALS.default;

//   const formSchema = zSchema
//     .pick({ name: true, email: true, password: true })
//     .extend({
//       role: z.enum(["user", "shop_owner", "delivery_boy", "labour", "admin"], {
//         required_error: "Please select your role.",
//       }),
//       confirmPassword: z.string().min(1, "Confirm password is required."),
//     })
//     .refine((data) => data.password === data.confirmPassword, {
//       message: "Passwords do not match.",
//       path: ["confirmPassword"],
//     });

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "" },
//   });

//   const handleNameChange = (e, fieldOnChange) => {
//     const val = e.target.value;
//     fieldOnChange(e);
//     if (val.trim() === ADMIN_SECRET) setAdminUnlocked(true);
//   };

//   const handleRegisterSubmit = async (values) => {
//     try {
//       setLoading(true);
//       const submitValues = { ...values };
//       delete submitValues.confirmPassword;
//       const { data: res } = await axios.post("/api/auth/register", submitValues);
//       if (!res.success) throw new Error(res.message);
//       form.reset();
//       setSelectedRole("");
//       showToast("success", res.message);
//     } catch (error) {
//       showToast("error", error.message || "Registration failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-slate-50 font-sans">

//       {/* ── Left Panel ── */}
//       <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col items-center justify-center px-10 py-12 overflow-hidden">
//         {/* Background geometric accents */}
//         <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 -translate-y-1/2 translate-x-1/2" />
//         <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-blue-400/8 translate-y-1/2 -translate-x-1/2" />
//         <div className="absolute top-1/2 left-1/2 w-96 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent -translate-x-1/2" />

//         <div className="relative z-10 text-center max-w-sm w-full">
//           {/* Logo */}
//           <img src={IMAGES.logos} alt="logo" className="w-32 mx-auto mb-10 brightness-[10]" />

//           {/* Dynamic emoji */}
//           <div className="text-7xl mb-5 leading-none select-none transition-all duration-500">
//             {visual.emoji}
//           </div>

//           {/* Dynamic headline */}
//           <h2 className="text-2xl font-bold text-white leading-snug mb-3 transition-all duration-300">
//             {visual.headline}
//           </h2>
//           <p className="text-sm text-slate-400 leading-relaxed mb-10 transition-all duration-300">
//             {visual.sub}
//           </p>

//           {/* Feature list */}
//           <div className="grid grid-cols-2 gap-3 text-left">
//             {FEATURES.map((f) => (
//               <div
//                 key={f.text}
//                 className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 backdrop-blur-sm"
//               >
//                 <span className="text-base">{f.emoji}</span>
//                 <span className="text-xs text-slate-300 font-medium">{f.text}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── Right Panel ── */}
//       <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 overflow-y-auto">
//         <div className="w-full max-w-lg">

//           {/* Mobile logo */}
//           <div className="flex justify-center mb-6 lg:hidden">
//             <img src={IMAGES.logos} alt="logo" className="h-9" />
//           </div>

//           {/* Card */}
//           <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 px-6 sm:px-9 py-8">

//             {/* Header */}
//             <div className="mb-7">
//               <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
//                 Create Account
//               </h1>
//               <p className="text-sm text-slate-500">
//                 Fill in the details below to get started — it's free.
//               </p>
//             </div>

//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-5">

//                 {/* ── Role Selector ── */}
//                 <FormField
//                   control={form.control}
//                   name="role"
//                   render={({ field, fieldState }) => (
//                     <FormItem>
//                       <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                         I am a…
//                       </FormLabel>
//                       <div className={`grid gap-2.5 mt-2 ${visibleRoles.length === 5 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
//                         {visibleRoles.map((r) => {
//                           const active = field.value === r.value;
//                           const Icon = r.icon;
//                           return (
//                             <button
//                               key={r.value}
//                               type="button"
//                               onClick={() => {
//                                 field.onChange(r.value);
//                                 setSelectedRole(r.value);
//                               }}
//                               className={`
//                                 relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3
//                                 transition-all duration-200 cursor-pointer text-center focus:outline-none
//                                 ${active
//                                   ? `${r.activeBg} ${r.activeRing}`
//                                   : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
//                                 }
//                               `}
//                             >
//                               {active && (
//                                 <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${r.dot}`} />
//                               )}
//                               <Icon className={`text-xl ${active ? r.accent : "text-slate-400"}`} />
//                               <span className={`text-xs font-semibold leading-tight ${active ? r.accent : "text-slate-600"}`}>
//                                 {r.label}
//                               </span>
//                               <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">
//                                 {r.description}
//                               </span>
//                             </button>
//                           );
//                         })}
//                       </div>
//                       {fieldState.error && (
//                         <p className="text-xs text-red-500 mt-1.5">{fieldState.error.message}</p>
//                       )}
//                     </FormItem>
//                   )}
//                 />

//                 {/* ── Name ── */}
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-sm font-semibold text-slate-700">Full Name</FormLabel>
//                       <FormControl>
//                         <div className="relative mt-1.5">
//                           <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
//                           <Input
//                             type="text"
//                             placeholder="John Doe"
//                             {...field}
//                             onChange={(e) => handleNameChange(e, field.onChange)}
//                             className="pl-10 h-11 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-xs" />
//                     </FormItem>
//                   )}
//                 />

//                 {/* ── Email ── */}
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-sm font-semibold text-slate-700">Email Address</FormLabel>
//                       <FormControl>
//                         <div className="relative mt-1.5">
//                           <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
//                           <Input
//                             type="email"
//                             placeholder="you@example.com"
//                             {...field}
//                             className="pl-10 h-11 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                           />
//                         </div>
//                       </FormControl>
//                       <FormMessage className="text-xs" />
//                     </FormItem>
//                   )}
//                 />

//                 {/* ── Password & Confirm ── */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-slate-700">Password</FormLabel>
//                         <FormControl>
//                           <div className="relative mt-1.5">
//                             <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
//                             <Input
//                               type={showPassword ? "text" : "password"}
//                               placeholder="••••••••"
//                               {...field}
//                               className="pl-10 pr-10 h-11 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setShowPassword(!showPassword)}
//                               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//                             >
//                               {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
//                             </button>
//                           </div>
//                         </FormControl>
//                         <FormMessage className="text-xs" />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="confirmPassword"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-sm font-semibold text-slate-700">Confirm Password</FormLabel>
//                         <FormControl>
//                           <div className="relative mt-1.5">
//                             <FiCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
//                             <Input
//                               type={showConfirmPassword ? "text" : "password"}
//                               placeholder="••••••••"
//                               {...field}
//                               className="pl-10 pr-10 h-11 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                               className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//                             >
//                               {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
//                             </button>
//                           </div>
//                         </FormControl>
//                         <FormMessage className="text-xs" />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 {/* ── Submit ── */}
//                 <div className="pt-1">
//                   <ButtonLoading
//                     loading={loading}
//                     type="submit"
//                     text={
//                       <span className="flex items-center justify-center gap-2">
//                         Create Account <FiArrowRight className="text-base" />
//                       </span>
//                     }
//                     className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30"
//                   />
//                 </div>

//                 {/* ── Footer ── */}
//                 <p className="text-center text-sm text-slate-500 pt-0.5">
//                   Already have an account?{" "}
//                   <Link
//                     href={WEBSITE_LOGIN}
//                     className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
//                   >
//                     Sign in
//                   </Link>
//                 </p>

//               </form>
//             </Form>
//           </div>

//           {/* Bottom trust note */}
//           <p className="text-center text-xs text-slate-400 mt-5">
//             🔒 Your data is protected by 256-bit SSL encryption
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;

















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
