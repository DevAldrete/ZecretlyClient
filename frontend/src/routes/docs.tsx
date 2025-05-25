import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AuroraText } from '@/components/magicui/aurora-text'
import { BoxReveal } from '@/components/magicui/box-reveal'

gsap.registerPlugin(ScrollTrigger)

export const Route = createFileRoute('/docs')({
  component: Docs,
})

function Docs() {
  const heroRef = useRef<HTMLElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.docs-hero > *', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2
      })

      // Sidebar animation
      if (sidebarRef.current) {
        gsap.from(sidebarRef.current.children, {
          x: -50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.5
        })
      }

      // Content sections animation
      if (contentRef.current) {
        gsap.from(contentRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const docSections = [
    {
      title: "Getting Started",
      items: [
        { name: "Quick Start", href: "#quick-start" },
        { name: "Installation", href: "#installation" },
        { name: "Authentication", href: "#authentication" },
        { name: "First Request", href: "#first-request" }
      ]
    },
    {
      title: "API Reference",
      items: [
        { name: "Collections", href: "#collections" },
        { name: "Environments", href: "#environments" },
        { name: "Requests", href: "#requests" },
        { name: "Variables", href: "#variables" }
      ]
    },
    {
      title: "Advanced",
      items: [
        { name: "Scripting", href: "#scripting" },
        { name: "Testing", href: "#testing" },
        { name: "CI/CD Integration", href: "#cicd" },
        { name: "Webhooks", href: "#webhooks" }
      ]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="py-16 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center docs-hero">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <AuroraText>Zecretly</AuroraText> Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Everything you need to know to get started with Zecretly and master API testing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-lg px-8 py-4"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-[#5046e6] text-[#5046e6] hover:bg-[#5046e6]/10"
              >
                API Reference
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div ref={sidebarRef} className="sticky top-24 space-y-8">
              {docSections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <a
                          href={item.href}
                          className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200 text-sm"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div ref={contentRef} className="prose prose-lg max-w-none space-y-16">

              {/* Quick Start Section */}
              <section id="quick-start">
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">Quick Start</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Get up and running with Zecretly in just a few minutes. This guide will walk you through
                    creating your first API collection and making your first request.
                  </p>
                </BoxReveal>
                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-semibold mb-4 text-foreground">Step 1: Create an Account</h4>
                  <p className="text-muted-foreground mb-4">
                    Sign up for a free Zecretly account to get started. No credit card required.
                  </p>
                  <Button className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed]">
                    Sign Up Free
                  </Button>
                </div>
              </section>

              {/* Installation Section */}
              <section id="installation">
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">Installation</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Zecretly is available as a web application, desktop app, and CLI tool. Choose the option
                    that best fits your workflow.
                  </p>
                </BoxReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-card rounded-xl p-6 border border-border hover:border-[#5046e6]/50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl">🌐</span>
                    </div>
                    <h4 className="font-semibold mb-2 text-foreground">Web App</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Access Zecretly directly from your browser. No installation required.
                    </p>
                    <Button variant="outline" size="sm">Launch Web App</Button>
                  </div>

                  <div className="bg-card rounded-xl p-6 border border-border hover:border-[#5046e6]/50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#ec4899] rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl">💻</span>
                    </div>
                    <h4 className="font-semibold mb-2 text-foreground">Desktop App</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Native desktop application for Windows, macOS, and Linux.
                    </p>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>

                  <div className="bg-card rounded-xl p-6 border border-border hover:border-[#5046e6]/50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#06b6d4] rounded-lg flex items-center justify-center mb-4">
                      <span className="text-white text-xl">⚡</span>
                    </div>
                    <h4 className="font-semibold mb-2 text-foreground">CLI Tool</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Command-line interface for automation and CI/CD integration.
                    </p>
                    <Button variant="outline" size="sm">Install CLI</Button>
                  </div>
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication">
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">Authentication</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Zecretly supports multiple authentication methods to work with any API. Configure
                    authentication once and reuse it across your entire collection.
                  </p>
                </BoxReveal>

                <div className="space-y-6">
                  <div className="bg-card rounded-xl p-6 border border-border">
                    <h4 className="font-semibold mb-3 text-foreground">Supported Authentication Types</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#5046e6] rounded-full"></span>
                        <span>API Key</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#7c3aed] rounded-full"></span>
                        <span>Bearer Token</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#ec4899] rounded-full"></span>
                        <span>OAuth 2.0</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#06b6d4] rounded-full"></span>
                        <span>Basic Auth</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#10b981] rounded-full"></span>
                        <span>Custom Headers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-3 text-foreground">Security Note</h4>
                    <p className="text-muted-foreground text-sm">
                      All authentication credentials are encrypted end-to-end and never stored in plain text.
                      Zecretly uses zero-knowledge architecture to ensure your sensitive data remains private.
                    </p>
                  </div>
                </div>
              </section>

              {/* First Request Section */}
              <section id="first-request">
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <h2 className="text-3xl font-bold mb-6 text-foreground">Making Your First Request</h2>
                </BoxReveal>
                <BoxReveal boxColor={"#5046e6"} duration={0.5}>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Learn how to create and execute your first API request with Zecretly. We'll start with
                    a simple GET request to a public API.
                  </p>
                </BoxReveal>

                <div className="bg-card rounded-xl p-6 border border-border">
                  <h4 className="font-semibold mb-4 text-foreground">Example: GET Request</h4>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4 font-mono text-sm">
                    <span className="text-[#5046e6]">GET</span> https://jsonplaceholder.typicode.com/posts/1
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    This example fetches a single post from the JSONPlaceholder API. Try it in Zecretly
                    to see the response data, headers, and performance metrics.
                  </p>
                  <Button className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed]">
                    Try This Request
                  </Button>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
