import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BoxReveal } from '@/components/magicui/box-reveal'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-content > *', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.3
      })

      // Stats counter animation
      if (statsRef.current) {
        const counters = statsRef.current.querySelectorAll('.counter')
        counters.forEach((counter) => {
          const target = parseInt(counter.getAttribute('data-target') || '0')
          gsap.fromTo(counter,
            { textContent: 0 },
            {
              textContent: target,
              duration: 2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: counter,
                start: "top 80%",
                toggleActions: "play none none reverse"
              },
              onUpdate: function() {
                const value = Math.ceil(this.targets()[0].textContent)
                counter.textContent = value.toLocaleString()
              }
            }
          )
        })
      }

      // Team cards animation
      if (teamRef.current) {
        gsap.from(teamRef.current.children, {
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: teamRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        })
      }

      // Timeline animation
      if (timelineRef.current) {
        gsap.from(timelineRef.current.children, {
          x: -100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="py-24 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center hero-content">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              About <AuroraText>Zecretly</AuroraText>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              We're on a mission to revolutionize API development with security-first tools
              that empower developers to build faster and safer.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-6"
            >
              Join Our Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="counter text-4xl md:text-5xl font-bold text-[#5046e6] mb-2" data-target="10000">0</div>
              <p className="text-muted-foreground">Developers</p>
            </div>
            <div className="text-center">
              <div className="counter text-4xl md:text-5xl font-bold text-[#7c3aed] mb-2" data-target="1000000">0</div>
              <p className="text-muted-foreground">API Requests</p>
            </div>
            <div className="text-center">
              <div className="counter text-4xl md:text-5xl font-bold text-[#ec4899] mb-2" data-target="99">0</div>
              <p className="text-muted-foreground">Uptime %</p>
            </div>
            <div className="text-center">
              <div className="counter text-4xl md:text-5xl font-bold text-[#06b6d4] mb-2" data-target="50">0</div>
              <p className="text-muted-foreground">Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    At Zecretly, we believe that security shouldn't be an afterthought.
                    Every API request, every piece of data, and every development workflow
                    deserves enterprise-grade protection without compromising on speed or simplicity.
                  </p>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We're building the tools that we wished existed when we were struggling
                    with complex API testing workflows, security concerns, and team collaboration challenges.
                  </p>
                </BoxReveal>
              </div>
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-[#5046e6]/20 to-[#7c3aed]/20 rounded-3xl flex items-center justify-center">
                  <div className="text-6xl">🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground">
                Passionate developers and security experts working to make your API journey seamless
              </p>
            </div>

            <div ref={teamRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card">
                <div className="w-24 h-24 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl">👨‍💻</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Alex Chen</h3>
                <p className="text-[#5046e6] font-medium mb-3">CEO & Co-founder</p>
                <p className="text-muted-foreground text-sm">
                  Former security engineer at major tech companies. Passionate about making security accessible.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-card">
                <div className="w-24 h-24 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl">👩‍💻</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sarah Johnson</h3>
                <p className="text-[#7c3aed] font-medium mb-3">CTO & Co-founder</p>
                <p className="text-muted-foreground text-sm">
                  Full-stack architect with expertise in distributed systems and developer tools.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-card">
                <div className="w-24 h-24 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mike Rodriguez</h3>
                <p className="text-[#ec4899] font-medium mb-3">Head of Design</p>
                <p className="text-muted-foreground text-sm">
                  UX designer focused on creating intuitive experiences for complex technical workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Journey</h2>

            <div ref={timelineRef} className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The Problem</h3>
                  <p className="text-muted-foreground">
                    We experienced firsthand the frustrations of insecure API testing tools and complex workflows.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The Vision</h3>
                  <p className="text-muted-foreground">
                    We envisioned a world where API testing is both secure and simple, where developers don't have to choose.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The Solution</h3>
                  <p className="text-muted-foreground">
                    Zecretly was born - a platform that puts security first without sacrificing developer experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#06b6d4] to-[#10b981] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">The Future</h3>
                  <p className="text-muted-foreground">
                    We're just getting started. Join us as we continue to innovate and redefine API development tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
