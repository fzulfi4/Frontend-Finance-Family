import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0c] text-gray-100">
      <Sidebar />
      {/* pb-24 gives breathing room above the mobile bottom nav (~96px) */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto pb-28 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
