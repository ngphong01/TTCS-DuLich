
import { useLocation } from 'react-router-dom';
import { useMemo } from "react";
import SimpleNavBar from "./SimpleNavBar";
import Footer from "./Footer";
import LiveChat from "./LiveChat";
import ClientOnly from "./ClientOnly";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = useLocation().pathname;
  // Feature toggles (build-time via NEXT_PUBLIC_*)
  const enableNavbar = process.env.NEXT_PUBLIC_ENABLE_NAVBAR !== 'false';
  const enableChat = process.env.NEXT_PUBLIC_ENABLE_CHAT !== 'false';
  
  // Memoize the layout conditions to prevent unnecessary re-renders
  const shouldShowLayout = useMemo(() => {
    const current = pathname || '/';
    const isAdminPage = current.startsWith('/admin');
    const isAuthPage = current.startsWith('/signin') || 
                      current.startsWith('/signup') || 
                      current.startsWith('/forgot-password') || 
                      current.startsWith('/reset-password');
    return !isAdminPage && !isAuthPage;
  }, [pathname]);
  
  return (
    <>
      {shouldShowLayout && enableNavbar && (
        <ClientOnly>
          <SimpleNavBar />
        </ClientOnly>
      )}
      {children}
      {shouldShowLayout && <Footer />}
      {shouldShowLayout && enableChat && (
        <ClientOnly>
          <LiveChat />
        </ClientOnly>
      )}
    </>
  );
}
