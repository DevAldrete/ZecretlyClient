import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BoxReveal } from '@/components/magicui/box-reveal'
import { SparklesText } from '@/components/magicui/sparkles-text'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/features/api-testing')({
  component: ApiTesting,
})

function ApiTesting() {
  const heroRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.feature-hero > *', {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.3
      })

      // Features animation
      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })
      }

      // Demo section animation
      if (demoRef.current) {
        gsap.from(demoRef.current.children, {
          x: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: demoRef.current,
            start: "top 75%",
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
          <div className="max-w-5xl mx-auto text-center feature-hero">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <AuroraText>API Testing</AuroraText> Redefined
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Experience the most powerful and secure API testing platform. Built for developers who demand{' '}
              <SparklesText className="inline">performance and security</SparklesText>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-6"
              >
                Start Testing APIs
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-[#5046e6] text-[#5046e6] hover:bg-[#5046e6]/10"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Everything You Need for API Testing
                </h2>
              </BoxReveal>
              <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  From simple GET requests to complex testing workflows, Zecretly provides all the tools
                  you need in one secure platform.
                </p>
              </BoxReveal>
            </div>

            <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#5046e6]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Lightning Fast Execution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Execute thousands of API requests per minute with our optimized infrastructure.
                  See real-time response times and performance metrics.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#7c3aed]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Enterprise Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All requests are encrypted end-to-end. Zero-knowledge architecture ensures
                  your API keys and sensitive data never leave your control.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#ec4899]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Smart Assertions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built-in test assertions with AI-powered suggestions. Validate response data,
                  status codes, headers, and more with intelligent recommendations.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#06b6d4]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#10b981] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Comprehensive reporting with response time analysis, error tracking,
                  and performance trends. Export data in multiple formats.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#10b981]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] to-[#84cc16] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Automated Testing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Schedule tests, set up monitoring, and integrate with CI/CD pipelines.
                  Get notified when APIs break or performance degrades.
                </p>
              </div>

              <div className="group p-8 rounded-2xl bg-card border border-border hover:border-[#84cc16]/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#84cc16] to-[#5046e6] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share collections securely with your team. Real-time collaboration,
                  comments, and role-based permissions for better teamwork.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    See It in Action
                  </h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Watch how easy it is to create, execute, and analyze API tests with Zecretly.
                    From simple requests to complex testing scenarios.
                  </p>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-[#5046e6] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-muted-foreground">Create requests in seconds</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-[#7c3aed] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-muted-foreground">Real-time response visualization</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-[#ec4899] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-muted-foreground">Automated test generation</span>
                    </div>
                  </div>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <div className="pt-6">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-4"
                    >
                      Try It Yourself
                    </Button>
                  </div>
                </BoxReveal>
              </div>

              <div ref={demoRef} className="relative">
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
                  {/* Mock API Testing Interface */}
                  <div className="bg-muted/50 p-4 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground ml-4">Zecretly API Client</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#5046e6] text-white px-3 py-1 rounded text-sm font-medium">GET</div>
                      <div className="flex-1 bg-muted/50 rounded px-4 py-2 text-sm font-mono">
                        https://api.example.com/users
                      </div>
                      <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]">Send</Button>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Response</div>
                      <div className="bg-muted/30 rounded p-3 font-mono text-sm">
                        <div className="text-[#10b981]">Status: 200 OK</div>
                        <div className="text-muted-foreground">Response Time: 127ms</div>
                        <div className="mt-2 text-xs">
                          {`{
  "users": [...],
  "total": 1247,
  "page": 1
}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tests: 5 passed</span>
                      <span className="text-[#10b981]">✓ All assertions passed</span>
                    </div>
                  </div>
                </div>

                {/* Floating metrics */}
                <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 border border-border shadow-lg">
                  <div className="text-2xl font-bold text-[#5046e6]">127ms</div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 border border-border shadow-lg">
                  <div className="text-2xl font-bold text-[#10b981]">100%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your API Testing?
              </h2>
            </BoxReveal>
            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of developers who have already made the switch to secure,
                fast, and reliable API testing with Zecretly.
              </p>
            </BoxReveal>
            <BoxReveal boxColor={"#5046e6"} duration={0.5}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-6"
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-[#5046e6] text-[#5046e6] hover:bg-[#5046e6]/10"
                >
                  Contact Sales
                </Button>
              </div>
            </BoxReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
