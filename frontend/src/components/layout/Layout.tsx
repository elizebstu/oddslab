import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

interface LayoutProps {
    children: ReactNode;
    showNavbar?: boolean;
    showFooter?: boolean;
}

export default function Layout({ children, showNavbar = true, showFooter = true }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-neon-cyan selection:text-midnight-950 transition-colors">
            {/* Background Ambience Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/5 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
            </div>

            {showNavbar && <Navbar />}
            <main className="flex-1 flex flex-col relative z-10 pb-16 lg:pb-0">
                {children}
            </main>
            {showFooter && <Footer />}
            <MobileBottomNav />

            {/* Global Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[100] scanline-overlay opacity-30" />
        </div>
    );
}
