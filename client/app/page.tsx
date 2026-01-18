"use client"

import { AmplifyParticles } from "@/components/intro/amplify-particles"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true)
  const router = useRouter()

  const handleAnimationComplete = () => {
    setShowIntro(false)
    // Navigate to dashboard after animation completes
    router.push("/dashboard")
  }

  return <>{showIntro && <AmplifyParticles onComplete={handleAnimationComplete} />}</>
}
