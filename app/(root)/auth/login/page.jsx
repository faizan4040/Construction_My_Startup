"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import { zSchema } from "@/lib/zodSchema";
import { WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/WebsiteRoute";
import axios from "axios";
import { showToast } from "@/lib/showToast";
import OTPVerification from "@/components/Application/OTPVerification";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";
import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

/* ─── Role → dashboard map (keep in sync with middleware) ─── */
const ROLE_DASHBOARDS = {
  admin:          ADMIN_DASHBOARD,
  customer:       "/my-account/dashboard",
  "shop owner":   "/shop/dashboard",
  laber:          "/labour/dashboard",
  "delivery boy": "/delivery/dashboard",
};

/* ─── Left-panel SVG illustration ─── */
const PanelIllustration = () => (
  <svg viewBox="0 0 420 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
    {/* Glow blob */}
    <ellipse cx="210" cy="220" rx="170" ry="180" fill="white" opacity="0.07" />
    {/* Phone frame */}
    <rect x="130" y="80" width="160" height="280" rx="24" fill="white" opacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"/>
    <rect x="142" y="96" width="136" height="248" rx="16" fill="white" opacity="0.12"/>
    {/* Screen content */}
    <rect x="154" y="116" width="112" height="14" rx="5" fill="white" opacity="0.5"/>
    <rect x="154" y="138" width="80" height="8" rx="4" fill="white" opacity="0.3"/>
    {/* OTP boxes */}
    <rect x="154" y="160" width="22" height="26" rx="6" fill="white" opacity="0.25" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
    <rect x="182" y="160" width="22" height="26" rx="6" fill="white" opacity="0.45" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>
    <rect x="210" y="160" width="22" height="26" rx="6" fill="white" opacity="0.25" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
    <rect x="238" y="160" width="22" height="26" rx="6" fill="white" opacity="0.25" stroke="white" strokeWidth="1" strokeOpacity="0.5"/>
    <rect x="154" y="202" width="112" height="10" rx="4" fill="white" opacity="0.2"/>
    <rect x="154" y="220" width="112" height="10" rx="4" fill="white" opacity="0.2"/>
    {/* Button */}
    <rect x="154" y="248" width="112" height="30" rx="10" fill="white" opacity="0.3"/>
    <rect x="178" y="258" width="64" height="10" rx="4" fill="white" opacity="0.6"/>
    {/* Lock icon */}
    <circle cx="210" cy="330" r="22" fill="white" opacity="0.15" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"/>
    <rect x="201" y="328" width="18" height="14" rx="4" fill="white" opacity="0.6"/>
    <path d="M204 328v-5a6 6 0 0 1 12 0v5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8"/>
    <circle cx="210" cy="335" r="2.5" fill="white" opacity="0.4"/>
    {/* Floating dots */}
    <circle cx="100" cy="140" r="5" fill="white" opacity="0.2"/>
    <circle cx="330" cy="180" r="4" fill="white" opacity="0.2"/>
    <circle cx="95" cy="300" r="3" fill="white" opacity="0.15"/>
    <circle cx="335" cy="320" r="6" fill="white" opacity="0.15"/>
    <circle cx="160" cy="60" r="4" fill="white" opacity="0.2"/>
    <circle cx="270" cy="55" r="3" fill="white" opacity="0.15"/>
  </svg>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const LoginPage = () => {
  const dispatch    = useDispatch();
  const searchParams = useSearchParams();
  const router      = useRouter();

  const [loading, setLoading]                       = useState(false);
  const [otpLoading, setOtpLoading]                 = useState(false);
  const [showPassword, setShowPassword]             = useState(true);
  const [otpEmail, setOtpEmail]                     = useState("");
  const [mounted, setMounted]                       = useState(false);

  useEffect(() => setMounted(true), []);

  /* ── Form schema ── */
  const formSchema = zSchema.pick({ email: true }).extend({
    password: z.string().min(1, "Password is required."),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  /* ── Step 1: Login → triggers OTP send ── */
  const handleLoginSubmit = async (values) => {
    try {
      setLoading(true);
      const { data: res } = await axios.post("/api/auth/login", values);
      if (!res.success) throw new Error(res.message);
      setOtpEmail(values.email);
      form.reset();
      showToast("success", res.message);
    } catch (error) {
      showToast("error", error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: OTP verification → dispatch + redirect ── */
  const handleOtpVerification = async (values) => {
    try {
      setOtpLoading(true);
      const { data: res } = await axios.post("/api/auth/verify-otp", values);
      if (!res.success) throw new Error(res.message);

      setOtpEmail("");
      showToast("success", res.message);
      dispatch(login(res.data));

      const callback = searchParams.get("callback");
      const dashboard = ROLE_DASHBOARDS[res.data.role] ?? "/";
      router.push(callback || dashboard);
    } catch (error) {
      showToast("error", error.message || "OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 py-10"
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
    >
      <div
        className={`w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ boxShadow: "0 24px 80px rgba(99,102,241,0.13), 0 2px 12px rgba(0,0,0,0.07)" }}
      >
        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-b from-indigo-600 via-violet-600 to-purple-700 px-10 py-12 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10" />

          {/* Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow">
                <span className="text-indigo-600 font-black text-lg">B</span>
              </div>
              <span className="text-white font-bold text-xl tracking-wide">BrandName</span>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex-1 flex items-center justify-center py-8">
            <PanelIllustration />
          </div>

          {/* Copy */}
          <div className="relative z-10 text-white">
            <h2 className="text-2xl font-bold leading-snug mb-2">
              Secure two-step<br />verification
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              We send a one-time code to your email every time you sign in — keeping your account safe.
            </p>
            <div className="flex gap-2 mt-5">
              <span className="w-6 h-2 rounded-full bg-white" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 px-8 sm:px-12 py-10 flex flex-col justify-center">

          {!otpEmail ? (
            /* ════ LOGIN FORM ════ */
            <>
              <div className="mb-8">
                <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
                <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">Sign in to your account</h1>
                <p className="text-slate-500 text-sm mt-1">Enter your credentials to continue.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-5">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 text-sm font-semibold">Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@email.com"
                            className="rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50 h-11"
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
                        <div className="flex items-center justify-between mb-1">
                          <FormLabel className="text-slate-700 text-sm font-semibold">Password</FormLabel>
                          <Link
                            href={WEBSITE_RESETPASSWORD}
                            className="text-xs text-indigo-600 font-medium hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "password" : "text"}
                              placeholder="••••••••"
                              className="pr-10 rounded-xl border-slate-200 focus:border-indigo-400 focus:ring-indigo-200 bg-slate-50 h-11"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                            >
                              {showPassword ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Verifying…
                      </span>
                    ) : (
                      "Sign In →"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-slate-400 text-xs">or</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <p className="text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link href={WEBSITE_REGISTER} className="text-indigo-600 font-semibold hover:underline">
                      Create one
                    </Link>
                  </p>
                </form>
              </Form>
            </>
          ) : (
            /* ════ OTP STEP ════ */
            <div className="space-y-6">
              <div className="mb-2">
                <p className="text-indigo-600 text-xs font-semibold uppercase tracking-widest mb-1">Step 2 of 2</p>
                <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">Check your email</h1>
                <p className="text-slate-500 text-sm mt-1">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-slate-700">{otpEmail}</span>.
                  Enter it below to sign in.
                </p>
              </div>

              {/* Email badge */}
              <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-none mb-0.5">Code sent to</p>
                  <p className="text-sm font-semibold text-slate-800">{otpEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpEmail("")}
                  className="ml-auto text-xs text-indigo-600 font-medium hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Existing OTPVerification component — unchanged */}
              <OTPVerification
                email={otpEmail}
                onSubmit={handleOtpVerification}
                loading={otpLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;




















// "use client";

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter, useSearchParams } from "next/navigation";

// import { Card, CardContent } from "@/components/ui/card";
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
// import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import { IoClose } from "react-icons/io5";
// import { zSchema } from "@/lib/zodSchema";
// import ButtonLoading from "@/components/Application/ButtonLoading";
// import { IMAGES } from "@/routes/AllImages";
// import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/WebsiteRoute";
// import axios from "axios";
// import { showToast } from "@/lib/showToast";
// import OTPVerification from "@/components/Application/OTPVerification";
// import { useDispatch } from "react-redux";
// import { login } from "@/store/reducer/authReducer";
// import { ADMIN_DASHBOARD } from "@/routes/AdminPanelRoute";

// const Loginpage = () => {
//   const dispatch = useDispatch()
//   const searchParams = useSearchParams()
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [otpVerificationLoading, setotpVerificationLoading] = useState(false);

//   const [isTypePassword, setIsTypePassword] = useState(true);
//   const [otpEmail, setOtpEmail] = useState()
//     const formSchema = zSchema.pick({
//       email: true
//     }).extend({
//       password: z.string().min('3', 'password field is required.')
//     })

 
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const handleLoginSubmit = async (values) => {
//    try {
//          setLoading(true)
//          const { data: loginResponse } = await axios.post("/api/auth/login", values);
//          if (!loginResponse.success) {
//           throw new Error(loginResponse.message);
//          }
   
//          setOtpEmail(values.email)
//          form.reset();
//          showToast('success',loginResponse.message);
//        } catch (error) {
//           showToast('error', error.message || "Registration failed. Please try again.");
//        } finally {
//          setLoading(false);
//        }
//      };

//      //otp verification
//      const handleOtpVerification = async (values) =>{
//       try {
//          setotpVerificationLoading(true);
//          const { data: otpResponse } = await axios.post("/api/auth/verify-otp", values);
//          if (!otpResponse.success) {
//           throw new Error(otpResponse.message);
//          }
   
//          setOtpEmail('')
//          showToast('success', otpResponse.message);

//          dispatch(login(otpResponse.data))

//          if(searchParams.has('callback')){
//           router.push(searchParams.get('callback'))
//          }else{
//           otpResponse.data.role === 'admin' ? router.push(ADMIN_DASHBOARD) : router.push(USER_DASHBOARD)
//          }

//        } catch (error) {
//           showToast('error', error.message || "Registration failed. Please try again.");
//        } finally {
//           setotpVerificationLoading(false);
//        }
//      };

//   return (
//     <>
//       {/* 🔹 Background Blur Overlay */}
//       <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />

//       {/* 🔹 Center Popup */}
//       <div className="fixed inset-0 z-50 flex items-center justify-center">
//         <Card className="relative w-112.5 shadow-2xl">

         
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="absolute cursor-pointer right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"
//             aria-label="Close"
//           >
//             <IoClose size={22} />
//           </button>

//           <CardContent className="space-y-6 py-8">
//             {/* Logo */}
//             <div className="flex justify-center">
//               <img src={IMAGES.login_logo} alt="logo" width={150} height={70} />
//             </div>

//             {!otpEmail
//                 ?
//                 <>
//                    {/* Heading */}
//             <div className="text-center space-y-1">
//               <h1 className="text-3xl font-bold">Login Into Account</h1>
//               <p className="text-sm text-muted-foreground">
//                 Login into your account by filling out the form below.
//               </p>
//             </div>
//             {/* Form */}
//             <div className="mt-5">
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(handleLoginSubmit)}
//                 className="space-y-6"
//               >
//                 {/* Email */}
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="email"
//                           placeholder="example@gmail.com"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Password */}
//                 <FormField
//                   control={form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Password</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <Input
//                             type={isTypePassword ? "password" : "text"}
//                             placeholder="••••••••"
//                             className="pr-10"
//                             {...field}
//                           />
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setIsTypePassword(!isTypePassword)
//                             }
//                             className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                           >
//                             {isTypePassword ? (
//                               <FaRegEye />
//                             ) : (
//                               <FaRegEyeSlash />
//                             )}
//                           </button>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Submit */}
//                 <ButtonLoading
//                   loading={loading}
//                   type="submit"
//                   text="Login"
//                   className="w-full bg-black text-white"
//                 />

//                 {/* Links */}
//                 <div className="text-center space-y-2">
//                   <p>
//                     Don't have an account?{" "}
//                     <Link
//                       href={WEBSITE_REGISTER}
//                       className="text-blue-500 hover:underline"
//                     >
//                       create account!
//                     </Link>
//                   </p>

//                   <Link
//                     href={WEBSITE_RESETPASSWORD}
//                     className="text-blue-500 hover:underline"
//                   >
//                     Forget Password?
//                   </Link>
//                 </div>
//               </form>
//             </Form>
//             </div>
//                 </>
//                 :
//                 <OTPVerification email={otpEmail} onSubmit={handleOtpVerification} loading={otpVerificationLoading}/>
//             }
//           </CardContent>
//         </Card>
//       </div>
//     </>
//   );
// };

// export default Loginpage;
