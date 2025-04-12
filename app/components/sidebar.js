"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './sidebar.module.css';
import { BookCopy, Home, LayoutDashboard, Paperclip, ReceiptPoundSterling } from 'lucide-react';

export default function Sidebar({ children, userId }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isResponsive, setIsResponsive] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsResponsive(true);
                setIsSidebarOpen(false);
            } else {
                setIsResponsive(false);
                setIsSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={styles.layout_container}>
            {isResponsive && (
                <button className={styles.toggle_button} onClick={toggleSidebar}>
                    {isSidebarOpen ? '<' : '>'} 
                </button>
            )}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
                <div className={styles.logo}>
                    <Image src="/logo.png" alt="CV Connect Logo" width={40} height={40} />
                    <span>CV CONNECT</span>
                </div>
                <nav className={styles.nav}>
                    <ul>
                        <li>
                            <Link href={`/dashboard/${userId}`} legacyBehavior>
                                <a className={styles.link}>
                                    {/* <Image src="/dashboard.svg" alt="Dashboard Icon" width={20} height={20} /> */}
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </a>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/properties/${userId}`} legacyBehavior>
                                <a className={styles.link}>
                                    {/* <Image src="/properties.svg" alt="Properties Icon" width={20} height={20} /> */}
                                    <Home />
                                    <span>Properties</span>
                                </a>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/transaction/${userId}`} legacyBehavior>
                                <a className={styles.link}>
                                    {/* <Image src="/transaction-icon.svg" alt="Transaction Icon" width={20} height={20} /> */}
                                    <BookCopy />
                                    <span>Transaction</span>
                                </a>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/report/${userId}`} legacyBehavior>
                                <a className={styles.link}>
                                    {/* <Image src="/report.svg" alt="Report Icon" width={20} height={20} /> */}
                                    <ReceiptPoundSterling />
                                    <span>Report</span>
                                </a>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className={styles.footer}>HOMEOWNER PORTAL v1.0.0</div>
            </aside>
            <main className={styles.main_content}>
                {children}
            </main>
        </div>
    );
}
