"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import Sidebar from "../../../components/sidebar.js";
import { useRouter } from "next/navigation";

// Modal Component
const Modal = ({ isOpen, onClose, summary }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlayStyled}>
      <div className={styles.modalContentStyled}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <h2 className={styles.modalTitle}>Wallet Balance Breakdown</h2>
        <div className={styles.modalSummaryStyled}>
          <div className={styles.summaryRowStyled}>
            <strong>Advanced Payment for HOA Maintenance Fee:</strong> PHP {summary.wall_adv_hoa_pay}
          </div>
          <div className={styles.summaryRowStyled}>
            <strong>Advanced Payment for Water Bill:</strong> PHP {summary.wall_adv_water_pay}
          </div>
          <div className={styles.summaryRowStyled}>
            <strong>Advanced Payment for Garbage:</strong> PHP {summary.wall_adv_garb_pay}
          </div>
          <div className={styles.summaryRowStyled}>
            <strong>Total Wallet Balance:</strong> PHP {summary.wall_bal}
          </div>
        </div>
        <div className={styles.modalButtonsStyled}>
          <button onClick={onClose} className={styles.cancelButtonStyled}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({ params }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const router = useRouter();
  const userId = params.userId; // Extract user ID from URL params

  // Authentication Check

  const {status, data} = useSession()

  useEffect(() => {
      if(status === "authenticated" && data?.user.usr_id ) {
          router.push(`/dashboard/${data.user.usr_id}`);
      }
  }, [status])

  // Dropdown Toggle Functionality
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/home-owner/dashboard/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();
        console.log("Fetched dashboard data:", data);

        setUserData(data);
        setUserFirstName(data.userFirstName);
        setUserLastName(data.userLastName);
        setWalletBalance(data.walletBalance);
        setProperties(data.properties || []);

        // Wallet Breakdown
        setSummary({
          wall_adv_hoa_pay: data.wall_adv_hoa_pay || 0,
          wall_adv_water_pay: data.wall_adv_water_pay || 0,
          wall_adv_garb_pay: data.wall_adv_garb_pay || 0,
          wall_bal: data.walletBalance || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  // Logout Functionality
  const handleLogout = () => {
    // Clear user session data
    // Redirect to login page
    signOut()
    router.push('/');
};

  // Date and Time Information
  const day = new Date().toLocaleString("en-US", { weekday: "long" });
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  if (error) return <div>{error}</div>;
  if (!userData) return <div>Loading...</div>;

  return (
    <div className={styles.dashboard_container}>
      <Sidebar userId={userId}>
        <main className={styles.main_content}>
          <header className={styles.dashboard_header}>
            <h2>Dashboard</h2>
            <div
              className={styles.profile}
              onClick={toggleDropdown}
              ref={dropdownRef}
            >
              <div className={styles.profile_pic}>
              <Image
                src={data.user?.profile_photo || "/cvprofile_default.jpg"}
                alt="Profile"
                width={40}
                height={40}
              />
              </div>
              <div className={styles.profile_name}>
                {userFirstName} {userLastName}
              </div>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <ul>
                    <li>
                      <Link href={`/profile/${userId}`}>Profile</Link>
                    </li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </header>

          <div className={styles.header}>
            <div className={styles.greeting}>
              <h1>Good Day, {userFirstName}!</h1>
              <p>{`${day}, ${date} | ${time}`}</p>
            </div>
          </div>

          <div className={styles.statement_balance}>
            <div className={styles.latest_billing_statement}>
              <h1>Latest Billing Status</h1>
              <div className={styles.latest_billing_statement_content}>
                {properties.length > 0 ? (
                  properties.map((property, index) => (
                    <div key={index} className={styles.list_properties}>
                      <div className={styles.property_info}>
                        <h2>Property Number: {property.propLotNum}</h2>
                      </div>
                      <div className={styles.property_info}>
                        <h2>Total Dues: PHP {property.totalDues}</h2>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No properties found.</p>
                )}
              </div>
            </div>

            <div className={styles.wallet_balance}>
              <h1>Wallet Balance</h1>
              <div className={styles.wallet_balance_content}>
                    {walletBalance !== null && !isNaN(walletBalance) ? (
                        <h2>PHP {Number(walletBalance).toFixed(2)}</h2>
                    ) : (
                        <p>Loading balance...</p>
                    )}
                </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={styles.submitButton}
              >
                Show Breakdown
              </button>
            </div>
          </div>

          <div className={styles.announcements}>
            <h2>Announcements</h2>
            <div className={styles.announcement_list}>
              {userData.announcements && userData.announcements.length > 0 ? (
                userData.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={styles.announcement}
                  >
                    {announcement.title}
                  </div>
                ))
              ) : (
                <p>No announcements available</p>
              )}
            </div>
          </div>

          {/* Wallet Breakdown Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            summary={summary}
          />
        </main>
      </Sidebar>
    </div>
  );
}
