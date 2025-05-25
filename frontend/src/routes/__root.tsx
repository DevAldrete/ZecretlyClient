import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { NavHeader } from '../components/NavHeader'
import { Footer } from '../components/Footer'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background antialiased">
      <NavHeader />
      <main className="relative">
        <div className="pt-16">
          <Outlet />
        </div>
      </main>
      <Footer />
      <TanStackRouterDevtools />
    </div>
  ),
})
