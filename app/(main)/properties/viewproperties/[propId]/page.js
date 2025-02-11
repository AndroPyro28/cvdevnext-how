"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Sidebar from "../../../../components/sidebar";
import axios from "axios";

export default function ViewProperty() {
    const router = useRouter();
    const { propId,userId } = useParams(); // Get the property ID from the route params
    const [property, setProperty] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    // Utility function to convert Decimal128 to float
    const convertDecimal = (value) => {
        return value && value.$numberDecimal ? parseFloat(value.$numberDecimal) : value;
    };

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/properties-by-propId/${propId}`);
                
                if (response.status != 200) {
                    throw new Error("Failed to fetch property details");
                }
                
                const data = response.data;
                console.log(data)
                // Convert Decimal128 fields to numbers
                const processedProperty = {
                    ...data,
                    prop_curr_water_charges: convertDecimal(data.prop_curr_water_charges),
                    prop_curr_hoamaint_fee: convertDecimal(data.prop_curr_hoamaint_fee),
                    prop_curr_garb_fee: convertDecimal(data.prop_curr_garb_fee),
                    prop_curr_amt_due: convertDecimal(data.prop_curr_amt_due),
                };
    
                console.log(processedProperty)
                setProperty(processedProperty);
                
                // Fetch user data after property details are successfully fetched
                fetchUserData(processedProperty.prop_owner_id);
            } catch (error) {
                console.error("Error fetching property details:", error);
            } finally {
                setLoading(false);
            }
        };
    
        const fetchUserData = async (userId) => {
            try {
                const authToken = localStorage.getItem("authToken");
                const response = await fetch(`/api/home-owner/header/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
    
                if (!response.ok) throw new Error("Failed to fetch user data");
    
                const userData = await response.json();
                setUserData(userData);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
    
        fetchPropertyDetails();
    }, [propId]);
    

    const handleLogout = () => {
        // Clear user session data
        // Redirect to login page
        signOut()
        router.push('/');
    };

    if (loading) {
        return <p>Loading property details...</p>;
    }

    if (!property) {
        return <p>Property not found.</p>;
    }

    return (
        <div className={styles.properties_container}>
                <main className={styles.main_content}>
                    <header className={styles.properties_header}>
                        <h2>Property Details</h2>
                        {userData && (
                            <div className={styles.profile} onClick={toggleDropdown}>
                                <div className={styles.profile_pic}>
                                    <Image src="/cvprofile_default.jpg" alt="Profile" width={40} height={40} />
                                </div>
                                <div className={styles.profile_name}>
                                    {userData.userFirstName} {userData.userLastName}
                                </div>
                                {dropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <ul>
                                            <li><Link href={`/profile/${propId}`}>Profile</Link></li>
                                            <li onClick={handleLogout}>Logout</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </header>

                    <div className={styles.property_card}>
                        <div className={styles.top_section}>
                            <button className={styles.back_button} onClick={() => window.history.back()}>
                                &larr; Back
                            </button>
                            <h3 className={styles.lot_label}>Lot {property.prop_lot_num}</h3>
                        </div>
                        <div className={styles.image_container}>
                            <Image
                                src={property.prop_image_url || "https://cdn.cvconnect.app/cvhouse_default.jpg"}
                                alt={`Property ${property.prop_lot_num}`}
                                width={900}
                                height={450}
                                className={styles.property_image}
                            />
                        </div>

                        <div className={styles.property_details}>
                            <h3>Current Charges</h3>
                            <div className={styles.collectibles_section}>
                                <div className={styles.collectibles_row}>
                                    <span>Water Charges:</span>
                                    <span>PHP {property.prop_curr_water_charges}</span>
                                </div>
                                <div className={styles.collectibles_row}>
                                    <span>HOA Maintenance Fee:</span>
                                    <span>PHP {property.prop_curr_hoamaint_fee}</span>
                                </div>
                                <div className={styles.collectibles_row}>
                                    <span>Garbage Fee:</span>
                                    <span>PHP {property.prop_curr_garb_fee}</span>
                                </div>
                                <div className={styles.collectibles_row}>
                                    <span>Total Charges:</span>
                                    <span>PHP {property.prop_curr_amt_due}</span>
                                </div>
                            <div className={styles.collectibles_row}>
                                <span>Advanced Payments</span>
                                <span>PHP 0.00</span>
                            </div>
                            <div className={styles.collectibles_row}>
                                <span>Total Amount Due</span>
                                <span>PHP {property.prop_curr_amt_due}</span>
                            </div>
                            <div className={styles.collectibles_row}>
                                <span>Wallet Balance</span>
                                <span>PHP 0.00</span>
                            </div>
                        </div>
                            <div className={styles.button_group}>
                                <button
                                    className={styles.button_secondary}
                                onClick={() => router.push(`/properties/viewproperties/${propId}/billing_statements/${userId}`)}
                                >
                                    View Billing Statements
                                </button>
                                <button
                                    className={styles.button_primary}
                                    onClick={() => router.push(`/properties/viewproperties/${propId}/create_transaction/${propId}`)}
                                    
                                >
                                    Pay Billing Statement
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
        </div>
    );
}