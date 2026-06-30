import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TourOverlay from './TourOverlay';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-bg text-gray-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      {/* pb-24 on mobile gives space above bottom nav */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto pb-28 md:pb-8">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <TourOverlay />
    </div>
  );
};

export default Layout;
