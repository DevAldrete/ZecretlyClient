// HeroSection for the app of the API Client Zecretly!

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { AuroraText } from "./magicui/aurora-text";
import { Button } from "./ui/button";
import { SparklesText } from "./magicui/sparkles-text"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const floatingElementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial visible states immediately to prevent content disappearing
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 1, y: 0, visibility: 'visible' })
    }
    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, { opacity: 1, y: 0, visibility: 'visible' })
    }
    if (buttonRef.current) {
      gsap.set(buttonRef.current, { opacity: 1, y: 0, visibility: 'visible' })
    }

    // Delayed subtle animation that doesn't interfere with content
    const timer = setTimeout(() => {
      if (titleRef.current && subtitleRef.current && buttonRef.current) {
        // Very gentle animation from slightly hidden state
        gsap.fromTo(titleRef.current,
          { opacity: 0.7, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        )

        gsap.fromTo(subtitleRef.current,
          { opacity: 0.7, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 }
        )

        gsap.fromTo(buttonRef.current,
          { opacity: 0.7, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.2 }
        )
      }
    }, 300) // Give components time to mount

    // Floating elements with safer animation
    if (floatingElementsRef.current) {
      const elements = floatingElementsRef.current.children

      // Set initial state
      gsap.set(elements, { opacity: 0.3, scale: 1 })

      // Gentle fade in
      gsap.to(elements, {
        opacity: 0.4,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5
      })

      // Very subtle floating animation
      gsap.to(elements, {
        y: "random(-8, 8)",
        x: "random(-5, 5)",
        rotation: "random(-3, 3)",
        duration: "random(6, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.1
      })
    }

    // Optimized parallax with throttling
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          if (heroRef.current && scrollY < window.innerHeight * 1.5) {
            gsap.set(heroRef.current, {
              y: scrollY * 0.2 // Very subtle parallax
            })
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleGetStarted = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Floating background elements */}
      <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-[#5046e6]/25 to-[#7c3aed]/25 rounded-full blur-xl" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-[#7c3aed]/25 to-[#ec4899]/25 rounded-full blur-xl" />
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-[#06b6d4]/25 to-[#3b82f6]/25 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-[#10b981]/25 to-[#06b6d4]/25 rounded-full blur-xl" />
      </div>

      <div ref={heroRef} className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold leading-tight"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            Build and Test APIs with{' '}
            <AuroraText className="text-6xl md:text-8xl">
              Zecretly
            </AuroraText>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            The most secure and powerful API client for developers. Test, debug, and document your APIs with{' '}
            <SparklesText className="inline text-lg">enterprise-grade security</SparklesText>
          </p>

          <div
            ref={buttonRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] transform transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl"
              onClick={handleGetStarted}
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-2 hover:bg-accent/50 transform transition-all duration-200 hover:scale-105"
            >
              View Documentation
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-sm">
            <div className="flex flex-col items-center space-y-2 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card/95 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-foreground">Enterprise Security</h3>
              <p className="text-muted-foreground text-center">End-to-end encryption for all your API data</p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card/95 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground text-center">Optimized for speed and performance</p>
            </div>

            <div className="flex flex-col items-center space-y-2 p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card/95 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <span className="text-white text-2xl">🛠️</span>
              </div>
              <h3 className="font-semibold text-foreground">Developer First</h3>
              <p className="text-muted-foreground text-center">Built by developers, for developers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground/80 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
