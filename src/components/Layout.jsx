import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Navbar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
