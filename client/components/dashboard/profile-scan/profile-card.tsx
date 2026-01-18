"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { RadarChart } from "./radar-chart"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ShopperType {
  id: string
  name: string
  description: string
  traits: number[]
  confidence: number
  signals: string[]
  incentive: string
}

const SHOPPER_TYPES: Record<string, ShopperType> = {
  researcher: {
    id: "researcher",
    name: "Researcher",
    description: "Thorough investigator who values detailed product information",
    traits: [35, 40, 85, 50, 75],
    confidence: 84,
    signals: ["High review views", "FAQ page engagement", "Spec sheet downloads"],
    incentive: "Offer detailed product comparison guides",
  },
  priceSensitive: {
    id: "priceSensitive",
    name: "Price-Sensitive",
    description: "Budget-conscious shopper looking for the best deal",
    traits: [50, 85, 60, 55, 65],
    confidence: 78,
    signals: ["Price sorting attempts", "Coupon searches", "Competitor comparisons"],
    incentive: "Offer bundle discounts or price lock guarantees",
  },
  hesitant: {
    id: "hesitant",
    name: "Hesitant",
    description: "Cautious buyer who needs confidence before committing",
    traits: [88, 55, 65, 30, 40],
    confidence: 91,
    signals: ["Long checkout idle time", "Cart abandonment", "Repeated page revisits"],
    incentive: "Offer extended returns or satisfaction guarantees",
  },
  decisive: {
    id: "decisive",
    name: "Decisive",
    description: "Quick decision-maker who values efficiency and speed",
    traits: [20, 35, 30, 95, 80],
    confidence: 86,
    signals: ["Fast cart addition", "Minimal page dwell", "One-click purchase"],
    incentive: "Offer express checkout or instant delivery",
  },
  browser: {
    id: "browser",
    name: "Browser",
    description: "Explorer who enjoys discovering new products",
    traits: [40, 45, 50, 45, 92],
    confidence: 79,
    signals: ["High page views", "Category exploration", "Discovery clicks"],
    incentive: "Recommend complementary products or new arrivals",
  },
}

const TRAIT_LABELS = ["Hesitancy", "Price Sense", "Research", "Decision Speed", "Engagement"]

export function ProfileCard() {
  const [selectedType, setSelectedType] = useState<string>("hesitant")
  const [isAnimating, setIsAnimating] = useState(true)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isAnimating && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setHasAnimated(true)
      }, 2700)
      return () => clearTimeout(timer)
    }
  }, [isAnimating, hasAnimated])

  const currentShopper = SHOPPER_TYPES[selectedType]

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/50 backdrop-blur p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Shopper Profile Scan</h2>
          <p className="text-muted-foreground text-sm">
            {isAnimating ? "Analyzing behavior signals…" : "Scan complete"}
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Radar chart - takes up 2 cols on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2 flex items-center justify-center"
          >
            <div className="w-full aspect-square max-w-md">
              <RadarChart data={currentShopper.traits} isAnimating={isAnimating} labels={TRAIT_LABELS} />
            </div>
          </motion.div>

          {/* Right panel - Profile info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col justify-center space-y-6"
          >
            {/* Type selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Demo Types</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-input border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SHOPPER_TYPES).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shopper type info - appears after animation */}
            {hasAnimated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 pt-4 border-t border-border/30"
              >
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="text-lg font-semibold text-foreground">{currentShopper.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">{currentShopper.description}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-accent via-purple-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${currentShopper.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{currentShopper.confidence}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Key Signals</p>
                  <ul className="space-y-1">
                    {currentShopper.signals.map((signal, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">Recommended Action</p>
                  <p className="text-sm text-foreground font-medium">{currentShopper.incentive}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </Card>
    </div>
  )
}
