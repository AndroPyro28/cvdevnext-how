'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';  // Import useRouter for redirection
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Sidebar from "../../../../../../components/sidebar";
import { useParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Statements({ params, userId }) {
    const [statements, setStatements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatement, setSelectedStatement] = useState(null); // State for the selected statement
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
    const [userData, setUserData] = useState(null);

    const {data: session} = useSession()
    const router = useRouter()
    useEffect(() => {
        const fetchStatements = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/statements?userId=${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch statements: ${await response.text()}`);
                }

                const data = await response.json();
                console.log('Data received in frontend:', data); // Debug log

                if (!data.statements || !Array.isArray(data.statements)) {
                    console.error('Unexpected response format:', data);
                    setError('Invalid response format.');
                } else {
                    setStatements(data.statements);
                    setError(null);
                }

            } catch (error) {
                console.error('Error fetching statements:', error);
                setError('Failed to fetch statements.');
            } finally {
                setLoading(false);
            }
        }

        
  
    

        const fetchUserData = async (userId) => {
            try {
                const authToken = localStorage.getItem("authToken");
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/header/${userId}`, {
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
        fetchUserData(userId);
        fetchStatements();
    }, [userId]);// Only run effect when userId is available

    const openModal = (statement) => {
        setSelectedStatement(statement); // Set the clicked statement as the selected one
        setIsModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleLogout = () => {
        signOut()
        router.push("/")
    };


    if (loading) return <p className={styles.loading}>Loading...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!statements.length) return <p className={styles.no_data}>No billing statements found.</p>;

    return (
        <div className={styles.page_container}>
                <main className={styles.main_content}>
                    <header className={styles.billing_header}>
                        <h2>Billing Statement</h2>
                        {userData && (
                            <div className={styles.profile} >
                                <div className={styles.profile_pic}>
                                <Image
                src={session?.user?.profile_photo || "/cvprofile_default.jpg"}
                alt="Profile"
                width={40}
                height={40}
              />
                                </div>
                                <div className={styles.profile_name}>
                                    {userData.userFirstName} {userData.userLastName}
                                </div>
                               
                            </div>
                        )}
                    </header>

                    <div className={styles.top_section}>
                        <button className={styles.back_button} onClick={() => window.history.back()}>
                            &larr; Back
                        </button>
                        <h1 className={styles.header_title}>Lot 1 - Statements</h1>
                    </div>

                    <section className={styles.statements_section}>
                        <table className={styles.statements_table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Billing ID</th>
                                    <th>Payment Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statements.map((statement, index) => (
                                    <tr key={index} className={styles.table_row}>
                                        <td>{formatDate(statement.bll_created_at)}</td>
                                        <td>{statement.bll_id}</td>
                                        <td>
                                            <span
                                                className={`${styles.status} ${
                                                    statement.bll_pay_stat.trim().toLowerCase() === 'paid' && statement.transactions_status === "completed"
                                                        ? styles.paid
                                                        // : statement.bll_pay_stat.trim().toLowerCase() === 'partially paid'
                                                        // ? styles.partially_paid
                                                        : styles.unpaid
                                                }`}
                                            >
                                                {statement.bll_pay_stat.trim().toLowerCase() === 'paid' && statement.transactions_status === "completed" ? "paid" : "pending"}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={styles.view_button}
                                                onClick={() => openModal(statement)}
                                            >
                                                View Statement
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <div className={styles.pagination}>
                        <div className={styles.page_info}>Showing {statements.length} of {statements.length} results</div>
                        <div className={styles.paginationControls}>
                            <button className={styles.paginationButton}>&lt;</button>
                            <button className={styles.paginationButton}>&gt;</button>
                        </div>
                    </div>
                </main>

                {/* Modal Component */}
                {isModalOpen && (
                    <div className={styles.modal_overlay}>
                        <div className={styles.modal_content_three_column}>
                            <h2 className={styles.modal_header}>View Statement</h2>
                            <div className={styles.modal_body_three_column}>
                                <div className={styles.modal_column_three}>
                                    <p><strong>Billing Coverage Period:</strong> {selectedStatement.bll_bill_cov_period}</p>
                                    <p><strong>Water Consumption:</strong> {selectedStatement.bll_water_consump?.$numberDecimal || selectedStatement.bll_water_consump} m<sup>3</sup></p>
                                    <p><strong>Water Charges:</strong> PHP {selectedStatement.bll_water_charges?.$numberDecimal || selectedStatement.bll_water_charges}</p>
                                    <p><strong>Water Reading:</strong> {selectedStatement.bll_water_read?.$numberDecimal || selectedStatement.bll_water_read}</p>
                                </div>
                                <div className={styles.modal_column_three}>
                                    <p><strong>Garbage Charges:</strong> PHP {selectedStatement.bll_garb_charges?.$numberDecimal || selectedStatement.bll_garb_charges}</p>
                                    <p><strong>Homeowner Fee:</strong> PHP {selectedStatement.bll_hoamaint_fee?.$numberDecimal || selectedStatement.bll_hoamaint_fee}</p>
                                    <p><strong>Total Amount Due:</strong> PHP {selectedStatement.bll_total_amt_due?.$numberDecimal || selectedStatement.bll_total_amt_due}</p>
                                    <p><strong>Payment Status:</strong> {selectedStatement.bll_pay_stat}</p>
                                </div>
                                <div className={styles.modal_column_three}>
                                    <p><strong>Proof of Water Billing:</strong></p>
                                    {selectedStatement.bll_water_cons_img && (
                                        <img src={selectedStatement.bll_water_cons_img} alt="Proof of Deposit" className={styles.proof_image} />
                                    )}
                                </div>
                            </div>
                            <button className={styles.modal_action_button} onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}
