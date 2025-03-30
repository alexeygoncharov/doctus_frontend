import React, { ReactNode } from 'react';
import Header from './Header';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="flex flex-col text-[#363748] bg-slate-50 min-h-screen">
      <Header />
      <div className="wrapper grow flex justify-center items-center">
        {children}
      </div>
      {/* Без футера */}
    </main>
  );
};

export default AuthLayout;