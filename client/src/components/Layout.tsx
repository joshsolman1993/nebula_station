import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-transparent text-white flex">
            {/* Sidebar (Left, Fixed/Sticky) */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10">
                {/* Top Header (Sticky) */}
                <TopHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
