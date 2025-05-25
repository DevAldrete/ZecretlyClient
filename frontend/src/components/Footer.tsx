import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (footerRef.current) {
        gsap.from(footerRef.current.children, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        })
      }
    }, footerRef)

    return () => ctx.revert()
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <footer ref={footerRef} className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">Z</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#5046e6] to-[#7c3aed] bg-clip-text text-transparent">
                Zecretly
              </span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed max-w-md">
              The most secure and powerful API testing platform for modern development teams.
              Built with security, speed, and developer experience in mind.
            </p>
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9]"
              >
                Get Started Free
              </Button>
              <div className="flex items-center space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-muted hover:bg-[#5046e6] hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <span className="text-sm">𝕏</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-muted hover:bg-[#5046e6] hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <span className="text-sm">⚡</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-muted hover:bg-[#5046e6] hover:text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <span className="text-sm">💼</span>
                </a>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/features/api-testing"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  API Testing
                </Link>
              </li>
              <li>
                <Link
                  to="/features/environments"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Environments
                </Link>
              </li>
              <li>
                <Link
                  to="/features/collections"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/features/auth"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Authentication
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Monitoring
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/docs"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © {currentYear} Zecretly. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
              >
                Status
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
              >
                Security
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5046e6] transition-colors duration-200"
              >
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
