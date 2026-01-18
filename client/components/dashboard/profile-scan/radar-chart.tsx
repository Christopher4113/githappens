"use client"

import { useEffect, useRef, useState } from "react"

interface RadarChartProps {
  data: number[]
  isAnimating: boolean
  labels: string[]
}

export function RadarChart({ data, isAnimating, labels }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    if (!isAnimating) {
      setAnimationProgress(1)
      return
    }

    let animationFrame: number
    const startTime = Date.now()
    const duration = 2500

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setAnimationProgress(progress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isAnimating])

  const size = 400
  const center = size / 2
  const maxRadius = 140
  const levels = 5

  // Generate polygon points
  const angleSlice = (Math.PI * 2) / data.length
  const getCoordinates = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2
    const radius = (value / 100) * maxRadius * animationProgress
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  const polygonPoints = data
    .map((_, i) => getCoordinates(data[i], i))
    .map((point) => `${point.x},${point.y}`)
    .join(" ")

  // Grid lines and labels
  const gridLines = Array.from({ length: levels }).map((_, level) => {
    const radius = ((level + 1) / levels) * maxRadius
    const points = data
      .map((_, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        }
      })
      .map((p) => `${p.x},${p.y}`)
      .join(" ")
    return points
  })

  // Axis lines and labels
  const axisEnds = data.map((_, i) => {
    const angle = angleSlice * i - Math.PI / 2
    const labelRadius = maxRadius + 40
    return {
      endX: center + maxRadius * Math.cos(angle),
      endY: center + maxRadius * Math.sin(angle),
      labelX: center + labelRadius * Math.cos(angle),
      labelY: center + labelRadius * Math.sin(angle),
    }
  })

  return (
    <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
      {/* Grid lines */}
      {gridLines.map((points, i) => (
        <polygon
          key={`grid-${i}`}
          points={points}
          fill="none"
          stroke="rgba(147, 112, 219, 0.2)"
          strokeWidth="1"
          opacity={animationProgress > 0.2 ? 1 : 0}
        />
      ))}

      {/* Axis lines */}
      {axisEnds.map((axis, i) => (
        <line
          key={`axis-${i}`}
          x1={center}
          y1={center}
          x2={axis.endX}
          y2={axis.endY}
          stroke="rgba(147, 112, 219, 0.3)"
          strokeWidth="1"
          opacity={animationProgress > 0.2 ? 1 : 0}
        />
      ))}

      {/* Data polygon */}
      {animationProgress > 0.3 && (
        <polygon
          points={polygonPoints}
          fill="rgba(147, 112, 219, 0.15)"
          stroke="rgba(147, 112, 219, 0.8)"
          strokeWidth="2"
          filter="url(#glow)"
        />
      )}

      {/* Scanning point animation */}
      {isAnimating && animationProgress < 1 && (
        <circle
          cx={center + maxRadius * Math.cos(angleSlice * animationProgress * data.length - Math.PI / 2)}
          cy={center + maxRadius * Math.sin(angleSlice * animationProgress * data.length - Math.PI / 2)}
          r="5"
          fill="rgb(0, 255, 255)"
          opacity={0.8}
          filter="url(#glow)"
        />
      )}

      {/* Axis labels */}
      {axisEnds.map((axis, i) => (
        <text
          key={`label-${i}`}
          x={axis.labelX}
          y={axis.labelY}
          textAnchor="middle"
          dy="0.3em"
          className="text-xs fill-muted-foreground"
          opacity={animationProgress > 0.4 ? 1 : 0}
          style={{
            maxWidth: "60px",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            fontSize: "11px",
          }}
        >
          {labels[i]}
        </text>
      ))}

      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
