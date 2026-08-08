'use client'

import { useSelector } from 'react-redux'
import ChatButton from '@/components/Chat/ChatButton'
import ChatWidget from '@/components/Chat/ChatWidget'
import { ChatProvider } from '@/components/Chat/ChatProvider'
import Footer from '@/components/Website/Footer'
import Header from '@/components/Website/Header'
import LabourHeader from '@/components/Website/LabourHeader'
import GeoUpdater from '@/components/Application/Labour/GeoUpdater'

const Layout = ({ children }) => {
  const auth = useSelector(store => store.authStore.auth)
  const isLabour = auth?.role === "laber"

  return (
    <ChatProvider>
       {isLabour ? <LabourHeader /> : <Header />}

       {/* keeps this labour's live GPS location flowing to the server
           on every page they visit, not just the public homepage */}
       {isLabour && <GeoUpdater userId={auth?._id ?? auth?.id} />}

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



// 'use client'

// import { useSelector } from 'react-redux'
// import ChatButton from '@/components/Chat/ChatButton'
// import ChatWidget from '@/components/Chat/ChatWidget'
// import { ChatProvider } from '@/components/Chat/ChatProvider'
// import Footer from '@/components/Website/Footer'
// import Header from '@/components/Website/Header'
// import LabourHeader from '@/components/Website/LabourHeader'

// const Layout = ({ children }) => {
//   const auth = useSelector(store => store.authStore.auth)
//   const isLabour = auth?.role === "laber"

//   return (
//     <ChatProvider>
//        {isLabour ? <LabourHeader /> : <Header />}

//           <main>
//            {children}
//           </main>

//        <Footer />


//       <ChatButton />
//       <ChatWidget />
//     </ChatProvider>
//   )
// }

// export default Layout







// 'use client'

// import ChatButton from '@/components/Chat/ChatButton'
// import ChatWidget from '@/components/Chat/ChatWidget'
// import { ChatProvider } from '@/components/Chat/ChatProvider'
// import Footer from '@/components/Website/Footer'
// import Header from '@/components/Website/Header'

// const Layout = ({ children }) => {
//   return (
//     <ChatProvider>
//        <Header />

//           <main>
//            {children}
//           </main>

//        <Footer />


//       <ChatButton />
//       <ChatWidget />
//     </ChatProvider>
//   )
// }

// export default Layout



