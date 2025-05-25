import HeroSection from '../components/HeroSection';
import { FeatureSection } from '../components/FeatureSection';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: function IndexApp() {
    return (
      <div>
        <HeroSection />
        <FeatureSection />
      </div>
    );
  },
})
