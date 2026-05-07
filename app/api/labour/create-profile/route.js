import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import LabourProfile from "@/models/LabourProfile.model"
import { getCurrentUser } from "@/lib/getCurrentUser"
import { uploadToCloudinary } from "@/lib/cloudinary"

// POST /api/labour/create-profile  — create or update profile
export async function POST(request) {
  try {
    await connectDB()

    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const formData = await request.formData()

    // ── Parse all fields ──────────────────────────────────────────
    const firstName      = formData.get("firstName")?.trim()
    const lastName       = formData.get("lastName")?.trim()
    const phone          = formData.get("phone")?.trim()
    const bio            = formData.get("bio")?.trim() || ""
    const address        = formData.get("address")?.trim()
    const city           = formData.get("city")?.trim()
    const state          = formData.get("state")?.trim()
    const pincode        = formData.get("pincode")?.trim()
    const latitude       = parseFloat(formData.get("latitude")) || null
    const longitude      = parseFloat(formData.get("longitude")) || null
    const documentType   = formData.get("documentType")
    const documentNumber = formData.get("documentNumber")?.trim()
    const profession     = formData.get("profession")?.trim()
    const professionType = formData.get("professionType")?.trim() || ""
    const skillsRaw      = formData.get("skills") || ""
    const skills         = skillsRaw
      ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : []
    const experienceYears = parseInt(formData.get("experienceYears")) || 0
    const hourlyRate      = parseInt(formData.get("hourlyRate")) || 0
    const availability    = formData.get("availability") || "full_time"
    const workingHours    = formData.get("workingHours") || "9 AM - 6 PM"

    // ── Validate required fields ──────────────────────────────────
    if (!firstName || !lastName || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json(
        { message: "Missing required personal / address fields" },
        { status: 400 }
      )
    }
    if (!documentType || !documentNumber) {
      return NextResponse.json(
        { message: "Document type and number are required" },
        { status: 400 }
      )
    }
    if (!profession) {
      return NextResponse.json(
        { message: "Profession is required" },
        { status: 400 }
      )
    }

    // ── Upload document image if provided ────────────────────────
    let documentImageUrl = ""
    let documentPublicId = ""
    const documentFile = formData.get("documentImage")
    if (documentFile && documentFile.size > 0) {
      const buffer = Buffer.from(await documentFile.arrayBuffer())
      const result = await uploadToCloudinary(
        buffer,
        "labour_documents"
      )
      documentImageUrl = result.url
      documentPublicId = result.public_id
    }

    // ── Upload profile image if provided ────────────────────────
    let profileImageUrl = ""
    let profilePublicId = ""
    const profileFile = formData.get("profileImage")
    if (profileFile && profileFile.size > 0) {
      const buffer = Buffer.from(await profileFile.arrayBuffer())
      const result = await uploadToCloudinary(
        buffer,
        "labour_profiles"
      )
      profileImageUrl = result.url
      profilePublicId = result.public_id
    }

    // ── Upsert LabourProfile ──────────────────────────────────────
    const profileData = {
      user: currentUser.id,
      firstName,
      lastName,
      phone,
      bio,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      documentType,
      documentNumber,
      profession,
      professionType,
      skills,
      experienceYears,
      hourlyRate,
      availability,
      workingHours,
      isProfileComplete: true,
    }

    // Only overwrite images if new ones were uploaded
    if (documentImageUrl) {
      profileData.documentImageUrl = documentImageUrl
      profileData.documentPublicId = documentPublicId
    }
    if (profileImageUrl) {
      profileData.profileImageUrl = profileImageUrl
      profileData.profilePublicId = profilePublicId
    }

    const profile = await LabourProfile.findOneAndUpdate(
      { user: currentUser.id },
      { $set: profileData },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json(
      { message: "Profile saved successfully", profile },
      { status: 200 }
    )
  } catch (error) {
    console.error("CREATE PROFILE ERROR:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}