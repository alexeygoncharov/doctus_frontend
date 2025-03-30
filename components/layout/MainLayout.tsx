import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <main className="flex flex-col text-[#363748] bg-slate-50 min-h-screen">
      <Header />
      <div className="wrapper grow">
        {children}
      </div>
      <Footer />
    </main>
  );
};

export default MainLayout;