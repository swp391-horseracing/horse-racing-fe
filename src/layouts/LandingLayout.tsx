import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="relative min-h-screen">
      <Outlet />
    </div>
  );
}
