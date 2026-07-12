import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex">
      {/* Sidebar navigation */}
      <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

      {/* Main content viewport */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 bg-brand-dark overflow-y-auto">
          {/* React children route injection */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
