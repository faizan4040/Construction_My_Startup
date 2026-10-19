"use client";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  HardHat,
  Users,
  Video,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Kpi from "@/components/Application/Labour/Kpi";
import TabButton from "@/components/Application/Labour/TabButton";
import { AnimatePresence, motion } from "framer-motion";
import ContentList from "@/components/Application/Labour/ContentList";
import AdminEarning from "@/components/Application/Labour/AdminEarning";
import AdminAnalytics from "@/components/Application/Labour/AdminAnalytics";
import AdminBookings from "@/components/Application/Labour/AdminBookings";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("partner");
  const [partnerReviews, setPartnerReviews] = useState();
  const [pendingkyc, setPendingkyc] = useState();
  const [labourReviews, setLabourReviews] = useState();

  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/labour-dashboard");
      setStats(data.stats);
      setPartnerReviews(data.pendingPartnersReviews);
      setLabourReviews(data.pendingLabours);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetPendingKYC = async () => {
    try {
      const { data } = await axios.get("/api/admin/labour/video-kyc/pending");
      setPendingkyc(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetPendingKYC();
    handleGetData();
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full py-6 sm:py-8 space-y-6 sm:space-y-8 *:min-w-0 *:max-w-full">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Labour Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Partners, bookings, earnings and pending reviews
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 *:min-w-0">
        <Kpi
          label="Total Partners"
          value={stats?.totalPartners}
          icon={<Users />}
          variant={"totalPartners"}
        />
        <Kpi
          label="Approved Partners"
          value={stats?.totalApprovedPartners}
          icon={<CheckCircle2 />}
          variant={"approved"}
        />
        <Kpi
          label="Pending Partners"
          value={stats?.totalPendingPartners}
          icon={<Clock />}
          variant={"pending"}
        />
        <Kpi
          label="Rejected Partners"
          value={stats?.totalRejectedPartners}
          icon={<XCircle />}
          variant={"rejected"}
        />
      </div>

      <AdminAnalytics />

      <AdminBookings />

      <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "partner"}
          count={partnerReviews?.length ?? 0}
          icon={<Users size={15} />}
          onClick={() => setActiveTab("partner")}
        >
          Pending Partner Reviews
        </TabButton>

        <TabButton
          active={activeTab === "kyc"}
          count={pendingkyc?.length ?? 0}
          icon={<Video size={15} />}
          onClick={() => setActiveTab("kyc")}
        >
          Pending Video KYC
        </TabButton>

        <TabButton
          active={activeTab === "labour"}
          count={labourReviews?.length ?? 0}
          icon={<HardHat size={15} />}
          onClick={() => setActiveTab("labour")}
        >
          Pending Labour Reviews
        </TabButton>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-3 min-w-0 max-w-full"
        >
          {activeTab === "partner" && (
            <ContentList data={partnerReviews ?? []} type={"partner"} />
          )}
          {activeTab === "kyc" && (
            <ContentList data={pendingkyc ?? []} type={"kyc"} />
          )}
          {activeTab === "labour" && (
            <ContentList data={labourReviews ?? []} type={"labour"} />
          )}
        </motion.div>
      </AnimatePresence>

      <AdminEarning />
    </div>
  );
}

export default AdminDashboard;





































