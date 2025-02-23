"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Sidebar from "../../../components/sidebar.js";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";

export default function Properties({ params }) {
  const [properties, setProperties] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const userId = params?.userId;
  const { data: session } = useSession();
  // Fetch properties and user data
  useEffect(() => {
    const fetchPropertiesAndUserData = async () => {
      setLoading(true);
      try {
        const [propertiesResponse, userResponse] = await Promise.all([
          await axios.get(
            `${process.env.NEXT_BACKEND_URL}/api/home-owner/properties/${userId}`,
            {}
          ),
          await axios.get(
            `${process.env.NEXT_BACKEND_URL}/api/home-owner/header/${userId}`,
            {}
          ),
        ]);

        if (propertiesResponse.status != 200 || userResponse.status != 200) {
          throw new Error("Failed to fetch data.");
        }
        const propertiesData = propertiesResponse.data;
        const userData = userResponse.data;

        setProperties(propertiesData.properties || []);
        setUserData(userData);

        console.log(propertiesData, userData);
      } catch (error) {
        console.error("Error:", error.message);
        setError("Failed to load properties or user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertiesAndUserData();
  }, [userId]);

  const handleLogout = () => {
    // Clear user session data
    // Redirect to login page
    signOut();
    router.push("/");
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  if (loading) {
    return <p className={styles.loading}>Loading...</p>;
  }

  return (
    <div className={styles.properties_container}>
      <Sidebar userId={userId}>
        <main className={styles.main_content}>
          <header className={styles.properties_header}>
            <h2>Properties</h2>
            {userData && (
              <div className={styles.profile} onClick={toggleDropdown}>
                <div className={styles.profile_pic}>
                  <Image
                    src={
                      session.user?.profile_photo || "/cvprofile_default.jpg"
                    }
                    alt="Profile"
                    width={40}
                    height={40}
                  />
                </div>
                <div className={styles.profile_name}>
                  {userData.userFirstName} {userData.userLastName}
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
            )}
          </header>

          {error && <div className={styles.error_message}>{error}</div>}

          <div className={styles.properties}>
            {properties.length > 0 ? (
              properties.map((property) => (
                <div key={property._id} className={styles.property_card}>
                  <Image
                    src={property.prop_image_url || "/cvhouse_default.jpg"}
                    alt={property.prop_type}
                    width={300}
                    height={200}
                  />
                  <div className={styles.property_details}>
                    <h3>Property {property.prop_lot_num}</h3>
                    <p className={styles.address}>
                      <span className={styles.address_label}>Address:</span>{" "}
                      {property.prop_street}
                    </p>
                    <div className={styles.billing_label}>Billing Status</div>
                    <div
                      className={`${styles.billing_status} ${
                        styles[
                          property.prop_payment_status === "Fully Paid"
                            ? "billing_full"
                            : "billing_partial"
                        ]
                      }`}
                    >
                      {property.prop_payment_status}
                    </div>
                    <Link href={`/properties/viewproperties/${property._id}`}>
                      <button className={styles.button_primary}>
                        View Property
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p>No properties found for this user.</p>
            )}
          </div>
        </main>
      </Sidebar>
    </div>
  );
}
