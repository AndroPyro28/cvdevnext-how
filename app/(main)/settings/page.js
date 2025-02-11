'use client'

import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import {useEffect, useRef, useState} from "react";

export default function Properties() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Close dropdown if clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className={styles.properties_container}>
            <main className={styles.main_content}>
                <header className={styles.settings_header}>
                    <h2>Settings</h2>
                    <div className={styles.profile} onClick={toggleDropdown} ref={dropdownRef}>
                        <div className={styles.profile_pic}>
                            <Image src="/cvprofile_default.jpg" alt="Profile" width={40} height={40}/>
                        </div>
                        <div className={styles.profile_name}>Homeowner</div>
                        {dropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <ul>
                                    <li><Link href="/profile">Profile</Link></li>
                                    <li><Link href="/settings">Settings</Link></li>
                                    <li><Link href="/logout">Logout</Link></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </header>
            </main>
        </div>
    );
}
