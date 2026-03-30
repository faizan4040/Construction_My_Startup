'use client'

import ChatButton from '@/components/Chat/ChatButton'
import ChatWidget from '@/components/Chat/ChatWidget'
import { ChatProvider } from '@/components/Chat/ChatProvider'
import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'

const Layout = ({ children }) => {
  return (
    <ChatProvider>
       <Header />

          <main>
           {children}
          </main>

       <Footer />


      <ChatButton />
      <ChatWidget />
    </ChatProvider>
  )
}

export default Layout



