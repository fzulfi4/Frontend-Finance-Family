import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0c] text-gray-100">
      <Sidebar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
