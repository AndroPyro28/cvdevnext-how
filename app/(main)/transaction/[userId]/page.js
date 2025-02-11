'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../../../components/sidebar.js';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { signOut } from 'next-auth/react';

export default function TransactionsPage({ params }) {
    const userId = params.userId; // Get the userId from params
    const [userData, setUserData] = useState(null);
    const [userFirstName, setUserFirstName] = useState('');
    const [userLastName, setUserLastName] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const router = useRouter();


    useEffect(() => {
        console.log('Transactions State:', transactions);
    }, [transactions]);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                
                const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/header/${userId}`)
                setUserData(response.data);
                setUserFirstName(response.data.userFirstName || '');
                setUserLastName(response.data.userLastName || '');
                console.log('User data fetched successfully:', response);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to fetch user data');
            }
        };

        const fetchTransactions = async () => {
            try {

                const response = await axios.get(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/transaction/${userId}`);

                console.log(response)
                console.log('Data received in frontend:', response); // Debug log

                if (response.data === 0) {
                    console.error('Unexpected response format:', response);
                    setError('Invalid response format.');
                } else {
                    setTransactions(response.data);
                    setError(null);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setError('Failed to fetch transactions.');
            } finally {
                setLoading(false);
            }
        }

        const validateAndFetchData = async () => {
            try {
                await fetchUserData();
                await fetchTransactions();
            } catch (error) {
                console.error('Error during data fetching:', error);
            }
        };

        if (userId) {
            setLoading(true);
            validateAndFetchData();
        }
    }, [userId, router]);
    // Added router dependency to ensure it updates properly


    // Before rendering the table
    console.log('Transactions State:', transactions);


    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Logout function to handle session clearance and redirect
    const handleLogout = () => {
        // Clear user session data
        // Redirect to login page
        signOut()
        router.push('/');
    };

    const openModal = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedTransaction(null);
    };

    // Helper function to format dates
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString); // Convert string to Date object
        return date.toLocaleDateString('en-US', options); // Format date
    };


    return (
        <div className={styles.transaction_container}>
            <Sidebar userId={userId}>
                <main className={styles.main_content}>
                    <header className={styles.transaction_header}>
                        <h2>Transaction History</h2>
                        <div className={styles.profile} onClick={toggleDropdown}>
                            <div className={styles.profile_pic}>
                                <Image src="/cvprofile_default.jpg" alt="Profile" width={40} height={40} />
                            </div>
                            <div className={styles.profile_name}>{userFirstName} {userLastName}</div>
                            {dropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <ul>
                                        <li><Link href={`/profile/${userId}`}>Profile</Link></li>
                                        <li onClick={handleLogout}>Logout</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className={styles.content}>
                        {loading ? (
                            <p>Loading transactions...</p>
                        ) : error ? (
                            <p className={styles.error}>{error}</p>
                        ) : (
                            <>
                                {console.log('Transactions in render:', transactions)}
                                <table className={styles.transaction_table}>
                                    <thead>
                                        <tr>
                                            <th>TRANSACTION ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length > 0 ? (
                                            transactions.map((transaction, index) => (
                                                <tr key={index}>
                                                    {/* Display the formatted transaction ID */}
                                                    <td>{transaction.transactionId || 'N/A'}</td>
                                                    <td>{formatDate(transaction.date) || 'Unknown Date'}</td>
                                                    <td>
                                                        <span
                                                            className={`${styles.status} ${
                                                                styles[transaction.status?.toLowerCase()] || 'unknown'
                                                            }`}
                                                        >
                                                            {transaction.status || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={styles.view_button}
                                                            onClick={() => openModal(transaction)}
                                                        >
                                                            View Transaction
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No transactions available</td>
                                            </tr>
                                        )}
                                    </tbody>



                                </table>


                            </>
                        )}
                    </div>

                    {modalOpen && selectedTransaction && (
                        <div className={styles.modal}>
                            <div className={styles.modal_content}>
                                <span className={styles.close_button} onClick={closeModal}>&times;</span>
                                <h2>Transaction: {selectedTransaction.transactionId}</h2>
                                <p>
                                    <strong>Transaction Date:</strong>{' '}
                                    {formatDate(selectedTransaction.date) || 'Unknown Date'}
                                </p>
                                <p><strong>Status:</strong> {selectedTransaction.status}</p>
                                <p><strong>Purpose:</strong> {selectedTransaction.purpose}</p>
                                <p><strong>Payment Method:</strong> {selectedTransaction.paymentMethod}</p>
                                <p><strong>Payment Amount:</strong> {selectedTransaction.paymentAmount}</p>
                            </div>
                        </div>
                    )}


                </main>
            </Sidebar>
        </div>
    );
}
