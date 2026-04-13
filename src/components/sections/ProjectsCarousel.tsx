'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Project {
  id: string
  slug: string
  title: string
  imgSrc: string
  imgAlt: string
}

interface Props {
  projects: Project[]
  locale: string
}

const SLIDE_INTERVAL = 4000 // ms between auto-advances
const VISIBLE = { desktop: 4, tablet: 2, mobile: 1 }

export default function ProjectsCarousel({ projects, locale }: Props) {
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragDelta, setDragDelta] = useState(0)
  const draggingRef = useRef(false)
  const dragStartRef = useRef(0)
  const dragDeltaRef = useRef(0)
  const didDragRef = useRef(false)
  const [perView, setPerView] = useState(VISIBLE.desktop)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Responsive perView
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setPerView(VISIBLE.mobile)
      else if (window.innerWidth < 1024) setPerView(VISIBLE.tablet)
      else setPerView(VISIBLE.desktop)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, projects.length - perView)

  const advance = useCallback((dir: 1 | -1) => {
    setIndex(prev => {
      const next = prev + dir
      if (next < 0) return maxIndex
      if (next > maxIndex) return 0
      return next
    })
  }, [maxIndex])

  // Auto-play
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => advance(1), SLIDE_INTERVAL)
  }, [advance])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Clamp index when perView changes
  useEffect(() => {
    setIndex(prev => Math.min(prev, maxIndex))
  }, [maxIndex])

  // Pointer drag (mouse + touch)
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    didDragRef.current = false
    dragStartRef.current = e.clientX
    dragDeltaRef.current = 0
    setDragging(true)
    setDragDelta(0)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const delta = e.clientX - dragStartRef.current
    dragDeltaRef.current = delta
    if (Math.abs(delta) > 5) didDragRef.current = true
    setDragDelta(delta)
  }

  const onPointerUp = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    setDragDelta(0)
    const delta = dragDeltaRef.current
    dragDeltaRef.current = 0
    if (delta < -60) { advance(1); resetTimer() }
    else if (delta > 60) { advance(-1); resetTimer() }
  }

  const handleArrow = (dir: 1 | -1) => {
    advance(dir)
    resetTimer()
  }

  // Translate: each card is 100% / perView wide
  const cardWidth = 100 / perView
  const translateX = -(index * cardWidth) + (dragging ? (dragDelta / (trackRef.current?.offsetWidth || 1)) * 100 : 0)

  if (!projects.length) return null

  return (
    <div className="relative select-none">
      {/* Track */}
      <div className="overflow-hidden" ref={trackRef}>
        <div
          className="flex"
          style={{
            transform: `translateX(${translateX}%)`,
            transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {projects.map((p) => (
            <div
              key={p.id}
              className="shrink-0 px-2"
              style={{ width: `${cardWidth}%` }}
            >
              <Link
                href={p.slug !== '#' ? (`/projects/${p.slug}` as any) : ('/projects' as any)}
                className="group block bg-white overflow-hidden shadow-sm  transition-shadow"
                // hover:shadow-md
                draggable={false}
                onClick={(e) => { if (didDragRef.current) { didDragRef.current = false; e.preventDefault() } }}
              >
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  <Image
                    src={p.imgSrc}
                    alt={p.imgAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                    sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
                    draggable={false}
                  />
                </div>
                <div className="px-3 py-2 border-t border-gray-100">
                  <h3 className="section-title text-base uppercase text-center text-[#10242b] font-normal group-hover:text-[#034F98] transition-colors leading-snug">
                    {p.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow buttons */}
      <button
        onClick={() => handleArrow(-1)}
        aria-label="Previous"
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center
                   bg-white border border-gray-200 shadow-md rounded-full
                   hover:bg-[#3a648c] hover:text-white hover:border-[#3a648c]
                   text-[#10242b] transition-colors duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a648c]"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => handleArrow(1)}
        aria-label="Next"
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center
                   bg-white border border-gray-200 shadow-md rounded-full
                   hover:bg-[#3a648c] hover:text-white hover:border-[#3a648c]
                   text-[#10242b] transition-colors duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a648c]"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      {projects.length > perView && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); resetTimer() }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c97eb]
                ${i === index
                  ? 'w-5 h-2 bg-[#3c97eb]'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
