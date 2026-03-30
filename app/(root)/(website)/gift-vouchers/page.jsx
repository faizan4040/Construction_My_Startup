'use client'

import ProductSlider from '@/components/Website/ProductSlider'
import { IMAGES } from '@/routes/AllImages'
import React, { useState } from 'react'

const cardDesigns = [
  { id: 1, name: 'Generic', image: '/giftcards/generic.jpg' },
  { id: 2, name: 'Sports', image: '/giftcards/sports.jpg' },
  { id: 3, name: 'Premium', image: '/giftcards/premium.jpg' },
]

const GiftVouchers = () => {
  const [activeSection, setActiveSection] = useState('shop')

  // Gift card states
  const [selectedCard, setSelectedCard] = useState(cardDesigns[0])
  const [cardValue, setCardValue] = useState(45)

  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [message, setMessage] = useState('')

  // Preview modal
  const [showPreview, setShowPreview] = useState(false)

  // Balance checker
  const [giftCode, setGiftCode] = useState('')
  const [balanceResult, setBalanceResult] = useState(null)

  const incrementValue = () => cardValue < 250 && setCardValue(cardValue + 5)
  const decrementValue = () => cardValue > 5 && setCardValue(cardValue - 5)

  const handleCheckBalance = () => {
    setBalanceResult(`£${Math.floor(Math.random() * 200 + 20)} remaining`)
  }

  return (
    <div className="w-full">

      {/* ================= Banner ================= */}
      <section className="relative h-[70vh] lg:h-[50vh] flex items-center justify-center text-center">
      <img
        src={IMAGES.  gift_card_banner}
        alt="Gift Card Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60" />

      {/* Content */}
      <div className="relative z-10 px-4 text-white max-w-3xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">
          Give the gift of choice
        </h1>

        <p className="text-lg lg:text-xl mb-8">
          The perfect gift for sports-lovers, loved ones, or that fussy relative!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setActiveSection('shop')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === 'shop'
                ? 'bg-white text-black cursor-pointer'
                : 'bg-white/90 text-gray-800 hover:bg-orange-500 hover:text-white cursor-pointer'
            }`}
          >
            Shop Gift Card
          </button>

          <button
            onClick={() => setActiveSection('balance')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeSection === 'balance'
                ? ' border-2 border-orange-500 bg- text-orange-500 cursor-pointer'
                : 'bg-orange-500 text-white hover:bg-orange-500 hover:text-white cursor-pointer'
            }`}
          >
            Check Your Balance
          </button>
        </div>
      </div>
    </section>


      {/* ================= SHOP SECTION ================= */}
      {activeSection === 'shop' && (
        <section className="py-16 px-4 lg:px-24 space-y-16">

          {/* Card Design */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">
              Choose Your Card Design
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {cardDesigns.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`cursor-pointer rounded-xl overflow-hidden border-4 transition
                    ${selectedCard.id === card.id ? 'border-black' : 'border-transparent'}
                  `}
                >
                  <img src={IMAGES. giftcard} alt={card.name} className="h-48 w-full object-cover" />
                  <p className="text-center font-semibold py-2">{card.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Value Selector */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Choose Your Gift Card Value</h2>
            <p className="text-gray-600 mb-4">Maximum gift card value £250.00</p>

            <div className="flex justify-center items-center gap-6">
              <button onClick={decrementValue} className="px-4 py-2 bg-gray-200 rounded">−</button>
              <span className="text-3xl font-bold">£{cardValue}.00</span>
              <button onClick={incrementValue} className="px-4 py-2 bg-gray-200 rounded">+</button>
            </div>
          </div>

          {/* Form */}
          <form className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">

            {/* To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="Recipient’s name"
                className="border p-3 rounded"
                onChange={e => setRecipientName(e.target.value)}
              />
              <input
                placeholder="Recipient’s email"
                className="border p-3 rounded"
                onChange={e => setRecipientEmail(e.target.value)}
              />
            </div>

            {/* From */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                placeholder="Your name"
                className="border p-3 rounded"
                onChange={e => setFromName(e.target.value)}
              />
              <input
                placeholder="Your email"
                className="border p-3 rounded"
                onChange={e => setFromEmail(e.target.value)}
              />
            </div>

            {/* Message */}
            <div>
              <textarea
                placeholder="Optional message"
                maxLength={170}
                className="border p-3 rounded w-full"
                onChange={e => setMessage(e.target.value)}
              />
              <p className="text-sm text-gray-500 text-right">
                Characters remaining: {170 - message.length}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button className="bg-black hover:bg-orange-500 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold">
                Add Gift Card to Bag
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="hover:bg-orange-500  border-2 border-orange-500 cursor-pointer text-orange-500 hover:text-white px-6 py-3 rounded-lg font-semibold"
              >
                Preview
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ================= BALANCE SECTION ================= */}
      {activeSection === 'balance' && (
        <section className="py-16 px-4">
          {/* CENTERED CONTENT */}
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Check your Gift Card balance
            </h2>

            <input
              placeholder="Gift Card code"
              className="border p-3 rounded w-full mb-4"
              onChange={e => setGiftCode(e.target.value)}
            />

            <button
              onClick={handleCheckBalance}
              className="bg-black hover:bg-orange-500 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold w-full"
            >
              Check Balance
            </button>

            {balanceResult && (
              <p className="mt-4 font-semibold">{balanceResult}</p>
            )}
          </div>

          {/* FULL WIDTH SLIDER */}
          <div className="mt-16 w-full">
            <ProductSlider />
          </div>
        </section>

      )}

        <section className="bg-gray-50 py-16 px-4 lg:px-24">
        <h2 className="text-3xl font-bold mb-4">Your Digital Gift Card</h2>
        <p className="mb-4 text-gray-700">
          Your gift card will be emailed to the recipient within 24 hours after placing your order. Please check the emails in your spam folder.
        </p>
        <h3 className="text-2xl font-semibold mb-2">Terms and Conditions</h3>
        <p className="text-gray-700 space-y-2">
          Gift card will be sent to your given email address. Our gift cards carry a 12 month expiry date. Please ensure that they are used within this period. The gift certificates cannot be refunded or exchanged for any cash alternative. No promotional discounts may be used to purchase or redeem gift card. Any remaining amount from a purchase will remain on the gift card to be used against future orders. Please make sure that your personalised message is no more than 170 characters long. Please check your personalised message carefully as mistakes cannot be rectified later.
        </p>
      </section>

      {/* ================= PREVIEW MODAL ================= */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-xl w-100 relative overflow-hidden">
      
      {/* Close Button */}
      <button
        onClick={() => setShowPreview(false)}
        className="absolute top-2 right-3 text-xl font-bold z-10 cursor-pointer"
      >
        ×
      </button>

      {/* Header */}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-3 text-center">
          Your Gift Card Preview
        </h3>

        {/* Gift Card Image */}
        <img
          src={IMAGES.giftcard}
          alt="Gift Card"
          className="rounded-4xl mb-4 w-full"
        />

        {/* Card Content */}
        <p className="text-center text-sm text-gray-500">Generic.html</p>
        <p className="text-center font-semibold text-lg">Gift Card</p>

        <p className="font-extrabold text-center text-2xl my-2">
          £{cardValue}.00
        </p>

        <p className="text-sm mt-2">
          <span className="font-semibold">To:</span>{' '}
          {recipientName || 'Recipient'}
        </p>
        <p className="text-sm">
          <span className="font-semibold">From:</span>{' '}
          {fromName || 'You'}
        </p>
      </div>

      {/* 🔥 Black Footer */}
      <div className="bg-black text-white text-center px-4 py-4">
        <p className="text-sm mb-1">
          Expires on: <span className="font-semibold">05/02/2027</span>
        </p>

        <p className="text-xs opacity-80">Redeem your gift card at</p>

        <p className="font-bold text-lg tracking-wide">
          AllSpikes
        </p>
      </div>
    </div>
  </div>
      )}
    </div>
  )
}

export default GiftVouchers
