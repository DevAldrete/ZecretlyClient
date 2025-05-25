// FeatureSection for the app of the API Client Zecretly!
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { BoxReveal } from "@/components/magicui/box-reveal"

gsap.registerPlugin(ScrollTrigger)

export function FeatureSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial visible states to prevent disappearing content
    if (headerRef.current) {
      gsap.set(headerRef.current, { opacity: 1, visibility: 'visible' })
    }
    if (featuresRef.current) {
      gsap.set(featuresRef.current.children, { opacity: 1, visibility: 'visible' })
    }
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 1, visibility: 'visible' })
    }

    const ctx = gsap.context(() => {
      // Gentle scroll-triggered animations that don't hide content
      if (featuresRef.current) {
        const cards = featuresRef.current.children

        gsap.fromTo(cards, {
          opacity: 0.6,
          y: 30
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
            toggleActions: "play none none none" // Only play once, don't reverse
          }
        })
      }

      // Header animation
      if (headerRef.current) {
        gsap.fromTo(headerRef.current, {
          opacity: 0.6,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        })
      }

      // CTA animation
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current, {
          opacity: 0.6,
          y: 20
        }, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div ref={headerRef} className="text-center mb-16" style={{ opacity: 1, visibility: 'visible' }}>
            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Why Choose <span className="text-[#5046e6]">Zecretly</span>?
              </h2>
            </BoxReveal>

            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Built for modern development teams who demand security, speed, and simplicity.
                Experience the next generation of API testing.
              </p>
            </BoxReveal>
          </div>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">End-to-End Encryption</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your API keys, requests, and responses are encrypted with military-grade security.
                Zero-knowledge architecture ensures your data stays private.
              </p>
            </div>

            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Performance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Optimized from the ground up for speed. Execute thousands of requests per minute
                with minimal latency and maximum reliability.
              </p>
            </div>

            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Smart Collections</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize your APIs intelligently with auto-generated documentation,
                environment variables, and workflow automation.
              </p>
            </div>

            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#10b981] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">CI/CD Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seamlessly integrate with your existing DevOps pipeline.
                Automated testing, monitoring, and deployment workflows.
              </p>
            </div>

            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Advanced Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Deep insights into API performance, error rates, and usage patterns.
                Real-time monitoring and alerting capabilities.
              </p>
            </div>

            <div
              className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#84cc16] to-[#5046e6] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Team Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Share collections, environments, and test results securely with your team.
                Role-based permissions and audit logs included.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div ref={ctaRef} className="text-center" style={{ opacity: 1, visibility: 'visible' }}>
            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <div className="bg-gradient-to-r from-[#5046e6]/10 to-[#7c3aed]/10 rounded-3xl p-12 border border-[#5046e6]/20 hover:border-[#5046e6]/30 transition-colors duration-300">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  Ready to revolutionize your API workflow?
                </h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Join thousands of developers who trust Zecretly for their API testing needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-6 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 border-[#5046e6] text-[#5046e6] hover:bg-[#5046e6]/10 transition-all duration-200 hover:scale-105"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </BoxReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
