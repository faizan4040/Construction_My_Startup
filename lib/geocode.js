import axios from "axios"

export async function geocodeAddress(addressString) {
  const { data } = await axios.get("https://api.geoapify.com/v1/geocode/search", {
    params: {
      text: addressString,
      apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY,
      limit: 1,
    },
  })

  const feature = data?.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  return { lat, lng }
}


