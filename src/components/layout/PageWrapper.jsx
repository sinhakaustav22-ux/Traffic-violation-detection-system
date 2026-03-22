import React from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const PageWrapper = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageWrapper;
