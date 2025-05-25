// NavHeader for the app of the API Client Zecretly!
import React, { useEffect, useRef, useState } from "react"
import { Link, useLocation } from '@tanstack/react-router'
import { gsap } from 'gsap'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const features: { title: string; href: string; description: string }[] = [
  {
    title: "API Testing",
    href: "/features/api-testing",
    description: "Test your APIs with our powerful and secure testing environment.",
  },
  {
    title: "Environment Management",
    href: "/features/environments",
    description: "Manage multiple environments securely with encrypted variables.",
  },
  {
    title: "Collections",
    href: "/features/collections",
    description: "Organize your API requests into collections for better workflow.",
  },
  {
    title: "Authentication",
    href: "/features/auth",
    description: "Handle complex authentication flows with ease and security.",
  },
]

export function NavHeader() {
  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Ensure immediate visibility and prevent layout shift
    if (headerRef.current && logoRef.current) {
      // Set initial state to fully visible immediately
      headerRef.current.style.opacity = '1'
      headerRef.current.style.transform = 'translateY(0)'
      logoRef.current.style.opacity = '1'
      logoRef.current.style.transform = 'scale(1)'
      setIsLoaded(true)
    }

    // Only add subtle animation after component is stable
    const timer = setTimeout(() => {
      if (headerRef.current && logoRef.current && isLoaded) {
        // Very gentle hover animations for logo only
        const logo = logoRef.current

        const handleMouseEnter = () => {
          gsap.to(logo, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out"
          })
        }

        const handleMouseLeave = () => {
          gsap.to(logo, {
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          })
        }

        logo.addEventListener('mouseenter', handleMouseEnter)
        logo.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          logo.removeEventListener('mouseenter', handleMouseEnter)
          logo.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-b border-border/50",
        "supports-[backdrop-filter]:bg-background/80"
      )}
      style={{
        opacity: 1,
        transform: 'translateY(0)',
        visibility: 'visible'
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 z-10">
          <div
            ref={logoRef}
            className="flex items-center space-x-2"
            style={{
              opacity: 1,
              transform: 'scale(1)',
              visibility: 'visible'
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#5046e6] to-[#7c3aed] rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#5046e6] to-[#7c3aed] bg-clip-text text-transparent">
              Zecretly
            </span>
          </div>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className="group">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors duration-200",
                    location.pathname === '/' && "bg-accent text-accent-foreground"
                  )}
                >
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="transition-colors duration-200">
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                  {features.map((feature) => (
                    <ListItem
                      key={feature.title}
                      title={feature.title}
                      href={feature.href}
                    >
                      {feature.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/about" className="group">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors duration-200",
                    location.pathname === '/about' && "bg-accent text-accent-foreground"
                  )}
                >
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="/docs" className="group">
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "transition-colors duration-200",
                    location.pathname === '/docs' && "bg-accent text-accent-foreground"
                  )}
                >
                  Documentation
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  to="/features"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                >
                  API Client
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex transition-colors duration-200 hover:bg-accent"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#5046e6] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
