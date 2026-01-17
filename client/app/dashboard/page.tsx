"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { OverviewDashboard } from "@/components/dashboard/overview-dashboard"
// import { ProfileCard } from "@/components/dashboard/profile-scan/profile-card"
import { ShopperJourney } from "@/components/dashboard/shopper-journey"
import { IncentiveEngine } from "@/components/dashboard/incentive-engine"
import { FeedbackLoop } from "@/components/dashboard/feedback-loop"
import ChartCard from "@/components/dashboard/chart-card"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const charts = [
    { title: "Sessions and time on site", chartId: "a8pfh6bs" },
    { title: "Page views and navigation", chartId: "ngymo109" },
    { title: "Clicks and UI interactions", chartId: "i07trv5p" },
    { title: "Funnels and conversion", chartId: "y2ymbsz4" },
    { title: "Pricing tier at time of event", chartId: "diiav9zr" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <OverviewDashboard />

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Pulled from your saved Amplitude charts.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {charts.map((c) => (
                  <ChartCard key={c.chartId} chartId={c.chartId} title={c.title} />
                ))}
              </div>
            </div>
          )}

          {/* {activeTab === "profile" && (
            <div className="w-full h-full flex items-center justify-center">
              <ProfileCard />
            </div>
          )} */}

          {activeTab === "journey" && <ShopperJourney />}
          {activeTab === "incentives" && <IncentiveEngine />}
          {activeTab === "feedback" && <FeedbackLoop />}
        </main>
      </div>
    </div>
  )
}
