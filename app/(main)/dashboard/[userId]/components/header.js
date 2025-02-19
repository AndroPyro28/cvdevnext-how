"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { signOut } from "next-auth/react";

// styles
import compstyle from '@/app/components.module.css';
              
export default function DashboardHeader(props) {
    const { userSession } = props;
    const { profile_photo, username } = userSession.user;
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
      setDropdownOpen(!isDropdownOpen);
    };
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isDropdownOpen && !event.target.closest(`.${compstyle.header_user_div}`)) {
          setDropdownOpen(false);
        }
      };
  
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    return (
        <header className={compstyle.main_header_container}>
            <h4 className={compstyle.header_title}>Dashboard</h4>

            <div className={compstyle.header_user_div}>
                <button className={compstyle.header_user_btn} type="button" onClick={toggleDropdown}>
                    <div className={compstyle.user_btn_content}>
                        <p className={compstyle.user_name}>{username}</p>
                        <div className={"overflow-hidden"}>
                            <Image src={profile_photo} alt="User Photo" className="size-10 object-contain rounded-full" height={25} width={38} />
                        </div>
                    </div>
                </button>
            </div>

            {isDropdownOpen && (
                <div className={compstyle.header_dropdown_div}>
                    <div className={compstyle.header_dropdown_content}>
                        <ul className={compstyle.dropdown_items}>
                        <li>
                                <Link href="/profile">Profile</Link>
                            </li>
                            <li>
                                <Link href="/settings">Settings</Link>
                            </li>
                            <li>
                                <button onClick={() => signOut({ callbackUrl: "/" })}>
                                Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </header>
    )
}