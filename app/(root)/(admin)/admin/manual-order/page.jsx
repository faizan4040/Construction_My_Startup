'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'

import BreadCrumb     from '@/components/Application/Admin/BreadCrumb'
import Select         from '@/components/Application/Select'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import useFetch       from '@/hooks/useFetch'
import { showToast }  from '@/lib/showToast'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import MediaModal     from '@/components/Application/Admin/MediaModal'

// ── React Icons ──────────────────────────────────────────────────
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag,
         FiTag, FiDollarSign, FiUploadCloud, FiX, FiPlus,
         FiCheckCircle, FiArrowRight, FiPackage } from 'react-icons/fi'
import { MdOutlineInventory2 }  from 'react-icons/md'
import { BsBoxSeam, BsReceipt, BsCashCoin } from 'react-icons/bs'
import { HiSparkles }           from 'react-icons/hi'
import { TbFileInvoice }        from 'react-icons/tb'
import { RiShoppingBag3Line }   from 'react-icons/ri'

/* ═══════════════════════════════════════════════════════════════════
   ZOD SCHEMA
═══════════════════════════════════════════════════════════════════ */
const manualOrderSchema = z.object({
  name:        z.string().min(1, 'Name is required'),
  email:       z.string().email('Invalid email').optional().or(z.literal('')),
  phone:       z.string().min(10, 'Enter at least 10 digits'),
  address:     z.string().min(1, 'Address is required'),
  productName: z.string().min(1, 'Product name is required'),
  category:    z.string().min(1, 'Category is required'),
  qty:         z.coerce.number().min(1, 'Min qty is 1'),
  price:       z.coerce.number().min(0, 'Price must be ≥ 0'),
  media:       z.string().optional(),
})

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Manual Order' },
]

/* ═══════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

  :root {
    --ora:   #f97316;
    --ora2:  #fb923c;
    --amb:   #f59e0b;
    --red:   #ef4444;
    --ink:   #1c1917;
    --slate: #64748b;
    --mute:  #94a3b8;
    --bdr:   #e7e3de;
    --bg:    #faf8f5;
    --card:  #ffffff;
    --ora-t: rgba(249,115,22,.12);
  }

  .mf * { box-sizing: border-box; margin: 0; padding: 0; }
  .mf { font-family: 'DM Sans', sans-serif; background: var(--bg); min-height: 100vh; }
  .mf-mono { font-family: 'JetBrains Mono', monospace; }

  /* ── keyframes ── */
  @keyframes mf-rise  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mf-bar   { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes mf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  @keyframes mf-spin  { to{transform:rotate(360deg)} }
  @keyframes mf-pulse {
    0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.3)}
    50%    {box-shadow:0 0 0 10px rgba(249,115,22,0)}
  }
  @keyframes mf-shimmer {
    0%   {background-position:-400px 0}
    100% {background-position: 400px 0}
  }
  @keyframes mf-pop { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }

  .mf-a1 { animation: mf-rise .5s ease both .04s; }
  .mf-a2 { animation: mf-rise .5s ease both .10s; }
  .mf-a3 { animation: mf-rise .5s ease both .17s; }
  .mf-a4 { animation: mf-rise .5s ease both .24s; }
  .mf-a5 { animation: mf-rise .5s ease both .31s; }

  /* ── top accent bar ── */
  .mf-topbar {
    height: 4px;
    background: linear-gradient(90deg, var(--ora), var(--amb), var(--red), var(--ora));
    background-size: 200% 100%;
    animation: mf-bar 3.5s ease infinite;
  }

  /* ── page header ── */
  .mf-hero {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 28px 0 20px;
  }
  .mf-hero-icon {
    width: 58px; height: 58px; border-radius: 18px;
    background: linear-gradient(135deg,var(--ora),var(--amb));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 24px rgba(249,115,22,.35);
    flex-shrink: 0;
    animation: mf-float 3s ease-in-out infinite;
  }

  /* ── section card ── */
  .mf-sec {
    background: var(--card);
    border: 1.5px solid var(--bdr);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(0,0,0,.04);
    transition: box-shadow .2s;
  }
  .mf-sec:hover { box-shadow: 0 6px 28px rgba(249,115,22,.08); }

  .mf-sec-hd {
    padding: 15px 22px;
    border-bottom: 1.5px solid #fde8d4;
    background: linear-gradient(90deg,#fff8f3,#fffcf9);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .mf-sec-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: var(--ora-t);
    color: var(--ora);
    flex-shrink: 0;
  }
  .mf-sec-num {
    width: 22px; height: 22px; border-radius: 50%;
    background: linear-gradient(135deg,var(--ora),var(--amb));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #fff;
    box-shadow: 0 2px 8px rgba(249,115,22,.4);
    flex-shrink: 0;
  }
  .mf-sec-title {
    font-size: 14px; font-weight: 700; color: var(--ink); letter-spacing: .01em;
  }
  .mf-sec-body { padding: 22px; }

  /* ── label ── */
  .mf-lbl {
    font-size: 11.5px; font-weight: 700; color: var(--slate);
    text-transform: uppercase; letter-spacing: .07em;
    display: flex; align-items: center; gap: 5px;
    margin-bottom: 7px;
  }
  .mf-lbl .req { color: var(--red); }

  /* ── input wrapper ── */
  .mf-inp-wrap { position: relative; }
  .mf-inp-ic {
    position: absolute;
    left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--mute); pointer-events: none;
    display: flex; align-items: center;
    transition: color .2s;
  }
  .mf-inp-wrap:focus-within .mf-inp-ic { color: var(--ora); }

  .mf-inp {
    width: 100%;
    padding: 10.5px 14px 10.5px 38px;
    border-radius: 11px;
    border: 1.5px solid var(--bdr);
    background: #fafaf9;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; color: var(--ink);
    outline: none; transition: all .2s;
  }
  .mf-inp::placeholder { color: #c4bcb4; font-weight: 400; }
  .mf-inp:focus {
    border-color: var(--ora);
    background: #fff8f3;
    box-shadow: 0 0 0 3px rgba(249,115,22,.1);
  }

  .mf-inp-ta {
    width: 100%;
    padding: 10.5px 14px 10.5px 38px;
    border-radius: 11px;
    border: 1.5px solid var(--bdr);
    background: #fafaf9;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500; color: var(--ink);
    outline: none; transition: all .2s;
    resize: vertical; min-height: 86px; line-height: 1.65;
  }
  .mf-inp-ta::placeholder { color: #c4bcb4; font-weight: 400; }
  .mf-inp-ta:focus {
    border-color: var(--ora);
    background: #fff8f3;
    box-shadow: 0 0 0 3px rgba(249,115,22,.1);
  }

  /* error */
  .mf-err {
    font-size: 12px; font-weight: 600; color: var(--red);
    display: flex; align-items: center; gap: 4px; margin-top: 4px;
  }

  /* ── select override ── */
  .mf-select-wrap {
    border-radius: 11px;
    border: 1.5px solid var(--bdr);
    background: #fafaf9;
    overflow: hidden;
    transition: all .2s;
  }
  .mf-select-wrap:focus-within {
    border-color: var(--ora);
    background: #fff8f3;
    box-shadow: 0 0 0 3px rgba(249,115,22,.1);
  }

  /* ── number input with stepper ── */
  .mf-num-wrap { position: relative; }
  .mf-num-ic {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--mute); pointer-events: none; display: flex;
    transition: color .2s;
  }
  .mf-num-wrap:focus-within .mf-num-ic { color: var(--ora); }
  .mf-num {
    width: 100%;
    padding: 10.5px 14px 10.5px 38px;
    border-radius: 11px;
    border: 1.5px solid var(--bdr);
    background: #fafaf9;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 600; color: var(--ink);
    outline: none; transition: all .2s;
  }
  .mf-num:focus {
    border-color: var(--ora);
    background: #fff8f3;
    box-shadow: 0 0 0 3px rgba(249,115,22,.1);
  }
  .mf-num::-webkit-inner-spin-button { opacity: 1; cursor: pointer; }

  /* ── total badge ── */
  .mf-total-badge {
    display: flex; align-items: center; justify-content: center;
    height: 44px; border-radius: 11px;
    background: linear-gradient(135deg,#fff8f3,#fef3c7);
    border: 1.5px solid #fcd9a4;
    font-family: 'JetBrains Mono', monospace;
    font-size: 17px; font-weight: 700; color: var(--ora);
    letter-spacing: .02em;
  }

  /* ── grid ── */
  .mf-g2 { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: 18px; }
  .mf-g3 { display: grid; grid-template-columns: repeat(auto-fit,minmax(145px,1fr)); gap: 16px; }

  /* ── upload zone ── */
  .mf-upload {
    border: 2px dashed #fcd9a4;
    border-radius: 16px;
    background: #fff8f3;
    padding: 30px 20px;
    text-align: center;
    cursor: pointer;
    transition: all .25s;
    position: relative;
    overflow: hidden;
  }
  .mf-upload::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg,rgba(249,115,22,.04),rgba(245,158,11,.04));
    opacity: 0; transition: opacity .25s;
  }
  .mf-upload:hover { border-color: var(--ora); border-style: solid; }
  .mf-upload:hover::before { opacity: 1; }
  .mf-upload-orb {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg,var(--ora),var(--amb));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    box-shadow: 0 6px 18px rgba(249,115,22,.38);
    animation: mf-float 3s ease-in-out infinite;
  }
  .mf-upload-chip {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 14px; padding: 7px 20px; border-radius: 999px;
    background: linear-gradient(135deg,var(--ora),var(--amb));
    color: #fff; font-size: 13px; font-weight: 700;
    box-shadow: 0 4px 14px rgba(249,115,22,.38);
    transition: all .2s;
  }
  .mf-upload:hover .mf-upload-chip { box-shadow: 0 6px 20px rgba(249,115,22,.5); }

  /* ── image preview ── */
  .mf-img-panel {
    border: 1.5px solid #fcd9a4; border-radius: 16px;
    background: #fff8f3; padding: 16px;
  }
  .mf-img-ph {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
  }
  .mf-img-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 999px;
    background: rgba(249,115,22,.12); color: var(--ora);
    font-size: 12px; font-weight: 700;
  }
  .mf-add-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 14px; border-radius: 999px;
    border: 1.5px solid #fcd9a4; background: #fff;
    font-size: 12px; font-weight: 700; color: var(--ora);
    cursor: pointer; transition: all .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .mf-add-btn:hover { border-color: var(--ora); background: #fff8f3; }

  .mf-img-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(88px,1fr)); gap: 10px; }
  .mf-img-item {
    position: relative; aspect-ratio: 1;
    border-radius: 13px; overflow: hidden;
    border: 1.5px solid #fcd9a4; background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
    transition: transform .2s, box-shadow .2s;
  }
  .mf-img-item:hover { transform: scale(1.04); box-shadow: 0 6px 18px rgba(249,115,22,.15); }
  .mf-img-del {
    position: absolute; top: 5px; right: 5px;
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(0,0,0,.58);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .2s;
    cursor: pointer; border: none;
  }
  .mf-img-item:hover .mf-img-del { opacity: 1; }

  /* ── summary strip ── */
  .mf-summary {
    background: linear-gradient(135deg,#fff8f3,#fefce8);
    border: 1.5px solid #fcd9a4;
    border-radius: 16px; padding: 18px 20px;
  }
  .mf-sum-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(110px,1fr)); gap: 12px; margin-top: 14px; }
  .mf-sum-tile {
    padding: 11px 14px; border-radius: 11px;
    background: #fff; border: 1.5px solid #fde8d4;
  }
  .mf-sum-tile.highlight {
    background: linear-gradient(135deg,var(--ora),var(--amb));
    border-color: transparent;
  }

  /* ── footer bar ── */
  .mf-footer {
    background: var(--card);
    border: 1.5px solid var(--bdr);
    border-radius: 18px; padding: 18px 24px;
    display: flex; flex-wrap: wrap;
    justify-content: space-between; align-items: center; gap: 14px;
    box-shadow: 0 4px 24px rgba(249,115,22,.06);
  }

  /* ── submit button ── */
  .mf-btn {
    display: inline-flex; align-items: center; gap: 9px;
    padding: 13px 32px; border-radius: 13px; border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: .02em;
    background: linear-gradient(135deg,var(--ora) 0%,var(--red) 100%);
    color: #fff;
    box-shadow: 0 6px 22px rgba(249,115,22,.38);
    transition: all .2s;
    animation: mf-pulse 2.5s ease-in-out infinite;
  }
  .mf-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(249,115,22,.48);
    animation: none;
  }
  .mf-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; animation: none; }
`

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

/** Labelled field wrapper */
const Field = ({ label, required, icon: Icon, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label className="mf-lbl">
      {Icon && <Icon size={12} />}
      {label}
      {required && <span className="req"> *</span>}
    </label>
    {children}
    {error && (
      <p className="mf-err"><FiX size={11} />{error}</p>
    )}
  </div>
)

/** Text input with left icon */
const Inp = React.forwardRef(({ icon: Icon, ...props }, ref) => (
  <div className="mf-inp-wrap">
    <input ref={ref} className="mf-inp" {...props} />
    {Icon && <span className="mf-inp-ic"><Icon size={15} /></span>}
  </div>
))
Inp.displayName = 'Inp'

/** Textarea with left icon */
const Txa = React.forwardRef(({ icon: Icon, ...props }, ref) => (
  <div className="mf-inp-wrap" style={{ alignItems: 'flex-start' }}>
    <textarea ref={ref} className="mf-inp-ta" {...props} />
    {Icon && <span className="mf-inp-ic" style={{ top: 13, transform: 'none' }}><Icon size={15} /></span>}
  </div>
))
Txa.displayName = 'Txa'

/** Number input */
const Num = React.forwardRef(({ icon: Icon, ...props }, ref) => (
  <div className="mf-num-wrap">
    <input ref={ref} type="number" className="mf-num" {...props} />
    {Icon && <span className="mf-num-ic"><Icon size={15} /></span>}
  </div>
))
Num.displayName = 'Num'

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const ManualOrder = () => {
  const [submitting,     setSubmitting]     = useState(false)
  const [categoryOption, setCategoryOption] = useState([])
  const [mediaOpen,      setMediaOpen]      = useState(false)
  const [selectedMedia,  setSelectedMedia]  = useState([])

  /* fetch categories */
  const { data: getCategory } = useFetch('/api/category?deleteType=SD&&size=10000')
  useEffect(() => {
    if (getCategory?.success) {
      setCategoryOption(getCategory.data.map(c => ({ label: c.name, value: c._id })))
    }
  }, [getCategory])

  /* form */
  const form = useForm({
    resolver: zodResolver(manualOrderSchema),
    defaultValues: { name:'', email:'', phone:'', address:'', productName:'', category:'', qty:1, price:0, media:'' },
  })
  const { watch, formState: { errors } } = form
  const watchQty   = Number(watch('qty')   || 0)
  const watchPrice = Number(watch('price') || 0)
  const lineTotal  = watchQty * watchPrice

  /* submit */
  const onSubmit = async (values) => {
    if (!selectedMedia.length) { showToast('error', 'Please select a product image'); return }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/manual-order', { ...values, media: selectedMedia[0].url })
      if (!data.success) throw new Error(data.message)
      showToast('success', 'Manual order created successfully!')
      form.reset()
      setSelectedMedia([])
    } catch (err) {
      showToast('error', err?.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  /* live summary values */
  const sumItems = [
    { label: 'Customer',  value: watch('name')        || '—',  Icon: FiUser,       hi: false },
    { label: 'Product',   value: watch('productName') || '—',  Icon: FiShoppingBag,hi: false },
    { label: 'Qty × Price', value: `${watchQty} × ₹${watchPrice.toLocaleString('en-IN')}`, Icon: MdOutlineInventory2, hi: false },
    { label: 'Total',     value: `₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, Icon: BsCashCoin, hi: true },
  ]

  return (
    <div className="mf">
      <style>{STYLES}</style>
      <div className="mf-topbar" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 70px' }}>
        <BreadCrumb breadcrumbData={breadcrumbData} />

        {/* ── Page hero ── */}
        <div className="mf-hero mf-a1">
          <div className="mf-hero-icon">
            <TbFileInvoice size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <HiSparkles size={12} color="#f97316" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em' }}>Admin Panel</span>
            </div>
            <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1c1917', lineHeight: 1.1 }}>Create Manual Order</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 5 }}>Fill in customer and product details to place an order manually.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* ══════════════════════════════════════
                  SECTION 1 — CUSTOMER INFORMATION
              ══════════════════════════════════════ */}
              <div className="mf-sec mf-a2">
                {/* header */}
                <div className="mf-sec-hd">
                  <div className="mf-sec-icon"><FiUser size={15} /></div>
                  <div className="mf-sec-num">1</div>
                  <span className="mf-sec-title">Customer Information</span>
                </div>

                <div className="mf-sec-body">
                  {/* Name · Email · Phone */}
                  <div className="mf-g2" style={{ marginBottom: 18 }}>

                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <Field label="Full Name" required icon={FiUser} error={errors.name?.message}>
                          <Inp icon={FiUser} placeholder="e.g. Rahul Sharma" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <Field label="Email Address" icon={FiMail} error={errors.email?.message}>
                          <Inp icon={FiMail} type="email" placeholder="email@example.com" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <Field label="Phone Number" required icon={FiPhone} error={errors.phone?.message}>
                          <Inp icon={FiPhone} placeholder="9876543210" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                  </div>

                  {/* Address — full width */}
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <Field label="Delivery Address" required icon={FiMapPin} error={errors.address?.message}>
                        <Txa icon={FiMapPin} placeholder="House No., Street, Area, City, State, PIN code…" rows={3} {...field} />
                      </Field>
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* ══════════════════════════════════════
                  SECTION 2 — PRODUCT DETAILS
              ══════════════════════════════════════ */}
              <div className="mf-sec mf-a3">
                {/* header */}
                <div className="mf-sec-hd">
                  <div className="mf-sec-icon"><BsBoxSeam size={15} /></div>
                  <div className="mf-sec-num">2</div>
                  <span className="mf-sec-title">Product Details</span>
                </div>

                <div className="mf-sec-body">

                  {/* Product Name · Category */}
                  <div className="mf-g2" style={{ marginBottom: 18 }}>

                    <FormField control={form.control} name="productName" render={({ field }) => (
                      <FormItem>
                        <Field label="Product Name" required icon={FiShoppingBag} error={errors.productName?.message}>
                          <Inp icon={FiShoppingBag} placeholder="e.g. Nike Air Max 270" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <Field label="Category" required icon={FiTag} error={errors.category?.message}>
                          <div className="mf-select-wrap">
                            <Select
                              options={categoryOption}
                              selected={field.value}
                              setSelected={field.onChange}
                              isMulti={false}
                            />
                          </div>
                        </Field>
                      </FormItem>
                    )} />

                  </div>

                  {/* Qty · Price · Total — 3 cols */}
                  <div className="mf-g3" style={{ marginBottom: 22 }}>

                    <FormField control={form.control} name="qty" render={({ field }) => (
                      <FormItem>
                        <Field label="Quantity" required icon={MdOutlineInventory2} error={errors.qty?.message}>
                          <Num icon={MdOutlineInventory2} min="1" placeholder="1" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <Field label="Unit Price (₹)" required icon={FiDollarSign} error={errors.price?.message}>
                          <Num icon={FiDollarSign} min="0" step="0.01" placeholder="0.00" {...field} />
                        </Field>
                      </FormItem>
                    )} />

                    {/* Live total */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label className="mf-lbl"><BsCashCoin size={12} />Line Total</label>
                      <div className="mf-total-badge">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                  </div>

                  {/* ── Media upload ── */}
                  <div>
                    <label className="mf-lbl">
                      <FiUploadCloud size={12} />Product Image<span className="req"> *</span>
                    </label>

                    <MediaModal
                      open={mediaOpen}
                      setOpen={setMediaOpen}
                      selectedMedia={selectedMedia}
                      setSelectedMedia={setSelectedMedia}
                      isMultiple={true}
                    />

                    {/* Empty state — upload zone */}
                    {selectedMedia.length === 0 && (
                      <div className="mf-upload" onClick={() => setMediaOpen(true)}>
                        <div className="mf-upload-orb">
                          <FiUploadCloud size={25} color="white" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>
                          Click to upload or select media
                        </p>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>
                          JPG, PNG, WEBP · Recommended 1:1 ratio
                        </p>
                        <div className="mf-upload-chip">
                          <FiPlus size={13} />Browse Media Library
                        </div>
                      </div>
                    )}

                    {/* Filled state — image grid */}
                    {selectedMedia.length > 0 && (
                      <div className="mf-img-panel">
                        <div className="mf-img-ph">
                          <div className="mf-img-badge">
                            <FiCheckCircle size={13} />
                            {selectedMedia.length} image{selectedMedia.length > 1 ? 's' : ''} selected
                          </div>
                          <button type="button" className="mf-add-btn" onClick={() => setMediaOpen(true)}>
                            <FiPlus size={12} />Add More
                          </button>
                        </div>
                        <div className="mf-img-grid">
                          {selectedMedia.map(m => (
                            <div key={m._id} className="mf-img-item">
                              <Image src={m.url} alt="" fill style={{ objectFit: 'cover' }} />
                              <button
                                type="button"
                                className="mf-img-del"
                                onClick={e => {
                                  e.stopPropagation()
                                  setSelectedMedia(prev => prev.filter(i => i._id !== m._id))
                                }}
                              >
                                <FiX size={11} color="white" />
                              </button>
                            </div>
                          ))}
                          {/* Add-more tile */}
                          <div
                            onClick={() => setMediaOpen(true)}
                            style={{
                              aspectRatio: '1', borderRadius: 13,
                              border: '2px dashed #fcd9a4', background: '#fff8f3',
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              gap: 4, cursor: 'pointer', transition: 'all .2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#fcd9a4'; e.currentTarget.style.background = '#fff8f3' }}
                          >
                            <FiPlus size={20} color="#f97316" />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316' }}>Add</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════
                  SECTION 3 — ORDER SUMMARY + SUBMIT
              ══════════════════════════════════════ */}
              <div className="mf-a4">

                {/* Summary */}
                <div className="mf-summary" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <FiPackage size={15} color="#f97316" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      Order Preview
                    </span>
                  </div>
                  <div className="mf-sum-grid">
                    {sumItems.map(({ label, value, Icon, hi }) => (
                      <div key={label} className={`mf-sum-tile${hi ? ' highlight' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                          <Icon size={11} color={hi ? 'rgba(255,255,255,.75)' : '#94a3b8'} />
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: hi ? 'rgba(255,255,255,.75)' : '#94a3b8' }}>{label}</span>
                        </div>
                        <p style={{
                          fontSize: 13, fontWeight: 700,
                          color: hi ? '#fff' : '#1c1917',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: hi ? "'JetBrains Mono',monospace" : 'inherit',
                        }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer submit row */}
                <div className="mf-footer mf-a5">
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>Ready to submit?</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                      Double-check the details above before creating the order.
                    </p>
                  </div>

                  <button type="submit" disabled={submitting} className="mf-btn">
                    {submitting ? (
                      <>
                        <RiShoppingBag3Line size={17} style={{ animation: 'mf-spin .8s linear infinite' }} />
                        Creating…
                      </>
                    ) : (
                      <>
                        <BsReceipt size={17} />
                        Create Order
                        <FiArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ManualOrder