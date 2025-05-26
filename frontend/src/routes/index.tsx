import { createFileRoute } from '@tanstack/react-router';
import MainApp from '../pages/MainApp';

export const Route = createFileRoute('/')({
  component: function IndexApp() {
    return <MainApp />;
  },
})
