"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import ProfileSetup from "../../components/ProfileSetup"
import LabourDashboardHome from "../../components/LabourDashboardHome"

export default function LabourDashboardPage() {
  const [profile, setProfile] = useState(undefined) // undefined = loading, null = no profile
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      // ✅ Correct URL — relative path, same Next.js app
      const { data } = await axios.get("/api/labour/my-profile", {
        withCredentials: true,
      })
      setProfile(data?.profile || null)
    } catch (err) {
      console.error("fetchProfile error:", err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-medium tracking-widest text-sm uppercase">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // No profile → show multi-step profile creator
  if (!profile) {
    return (
      <ProfileSetup
        onComplete={(newProfile) => {
          setProfile(newProfile)
        }}
      />
    )
  }

  // Has profile → show dashboard
  return <LabourDashboardHome profile={profile} onProfileUpdate={setProfile} />
}






// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"
// import ProfileSetup from "../../components/ProfileSetup"
// import LabourDashboardHome from "../../components/LabourDashboardHome"

// export default function LabourDashboardPage() {
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   const fetchProfile = async () => {
//     try {
//       const { data } = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/labour/my-profile`,
//         { withCredentials: true }
//       )
//       if (data?.data?.profile) {
//         setProfile(data.data.profile)
//       } else {
//         setProfile(null)
//       }
//     } catch {
//       setProfile(null)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProfile()
//   }, [])

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
//           <p className="text-white/60 font-medium tracking-widest text-sm uppercase">
//             Loading...
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // No profile yet → show multi-step profile creator
//   if (!profile) {
//     return <ProfileSetup onComplete={(p) => setProfile(p)} />
//   }

//   // Has profile → show dashboard
//   return <LabourDashboardHome profile={profile} />
// }