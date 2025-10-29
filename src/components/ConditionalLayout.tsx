"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import SimpleNavBar from "./SimpleNavBar";
import Footer from "./Footer";
import LiveChat from "./LiveChat";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Memoize the layout conditions to prevent unnecessary re-renders
  const shouldShowLayout = useMemo(() => {
    const isAdminPage = pathname?.startsWith('/admin');
    const isAuthPage = pathname?.startsWith('/signin') || 
                      pathname?.startsWith('/signup') || 
                      pathname?.startsWith('/forgot-password') || 
                      pathname?.startsWith('/reset-password');
    
    return !isAdminPage && !isAuthPage;
  }, [pathname]);
  
  return (
    <>
      {shouldShowLayout && <SimpleNavBar />}
      {children}
      {shouldShowLayout && <Footer />}
      {shouldShowLayout && <LiveChat />}
    </>
  );
}
