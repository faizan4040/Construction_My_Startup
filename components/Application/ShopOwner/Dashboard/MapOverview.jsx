"use client"

import { useLayoutEffect, useRef } from "react"
import { useShopDashboard } from "@/contexts/ShopDashboardContext"

let am4core, am4maps, am4themes_animated, am4geodata_indiaLow

const MapOverview = () => {
  const chartRef = useRef(null)
  const { data } = useShopDashboard()

  useLayoutEffect(() => {
    let chart

    const loadChart = async () => {
      am4core = await import("@amcharts/amcharts4/core")
      am4maps = await import("@amcharts/amcharts4/maps")
      am4themes_animated = (await import("@amcharts/amcharts4/themes/animated")).default
      am4geodata_indiaLow = (await import("@amcharts/amcharts4-geodata/indiaLow")).default

      am4core.useTheme(am4themes_animated)

      chart = am4core.create(chartRef.current, am4maps.MapChart)
      chart.geodata = am4geodata_indiaLow
      chart.projection = new am4maps.projections.Miller()
      chart.homeZoomLevel = 1.2
      chart.homeGeoPoint = { latitude: 22.97, longitude: 78.65 }

      const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries())
      polygonSeries.useGeodata = true

      const polygonTemplate = polygonSeries.mapPolygons.template
      polygonTemplate.tooltipText = "{name}\nYour Orders: {value}"
      polygonTemplate.stroke = am4core.color("#ffffff")

      const hoverState = polygonTemplate.states.create("hover")
      hoverState.properties.fill = am4core.color("#f97316")

      const stateMap = {
        "Andhra Pradesh": "IN-AP", "Arunachal Pradesh": "IN-AR", Assam: "IN-AS", Bihar: "IN-BR",
        Chhattisgarh: "IN-CT", Goa: "IN-GA", Gujarat: "IN-GJ", Haryana: "IN-HR",
        "Himachal Pradesh": "IN-HP", Jharkhand: "IN-JH", Karnataka: "IN-KA", Kerala: "IN-KL",
        "Madhya Pradesh": "IN-MP", Maharashtra: "IN-MH", Manipur: "IN-MN", Meghalaya: "IN-ML",
        Mizoram: "IN-MZ", Nagaland: "IN-NL", Odisha: "IN-OR", Punjab: "IN-PB",
        Rajasthan: "IN-RJ", Sikkim: "IN-SK", "Tamil Nadu": "IN-TN", Telangana: "IN-TG",
        Tripura: "IN-TR", "Uttar Pradesh": "IN-UP", Uttarakhand: "IN-UT", "West Bengal": "IN-WB",
        Delhi: "IN-DL", Chandigarh: "IN-CH",
      }

      polygonSeries.data =
        data?.orderStatus && data?.mapByState
          ? data.mapByState.map((item) => ({
              id: stateMap[item._id],
              value: item.count,
              fill: am4core.color("#fb923c"),
            }))
          : []

      polygonTemplate.propertyFields.fill = "fill"
    }

    loadChart()

    return () => {
      if (chart) chart.dispose()
    }
  }, [data])

  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="px-5 pt-5">
        <p className="text-xs text-gray-400 font-medium">Reach</p>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Where Your Orders Come From</h2>
      </div>
      <div ref={chartRef} className="w-full h-72 mt-2" />
    </div>
  )
}

export default MapOverview


