'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from "react";
import Sidebar from '../../../components/sidebar.js';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ReportPage({ params }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userFirstName, setUserFirstName] = useState("");
    const [userLastName, setUserLastName] = useState("");
    const [reportType, setReportType] = useState("system");
    const [reportTitle, setReportTitle] = useState("");
    const [reportDesc, setReportDesc] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const userId = params.userId;
    const router = useRouter();
    const [proofOfDepositError, setProofOfDepositError] = useState('');
    const [proofOfDeposit, setProofOfDeposit] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    // Fetch user data with authentication
    useEffect(() => {
        const fetchUserData = async () => {
            const authToken = localStorage.getItem('authToken');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/header/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserFirstName(data.userFirstName);
                setUserLastName(data.userLastName);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    // Logout function to handle session clearance and redirect
    const handleLogout = () => {
        // Clear user session data
        // Redirect to login page
        signOut()
        router.push('/');
    };

    // Function to upload image and get the image URL
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/upload-image`, formData);

            if (response.status != 200) {
                throw new Error('Failed to upload image');
            }

            return data.imageUrl; // Assuming your API returns the image URL
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Image upload failed. Please try again.');
        }
    };

    // Submit report function with image upload
    const submitReport = async () => {
        setIsLoading(true);
        const authToken = localStorage.getItem('authToken');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        try {
            // If an image is selected, upload it first and get the URL
            let uploadedImageURL = imageURL;
            if (proofOfDeposit) {
                uploadedImageURL = await uploadImage(proofOfDeposit);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_URL_DEV}/api/home-owner/report?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    rpt_user: userId,
                    rpt_title: reportTitle,
                    rpt_desc: reportDesc,
                    rpt_image_url: uploadedImageURL, // Use the uploaded image URL
                    rpt_type: reportType,
                }),
                signal: controller.signal,
            });

            if (response.ok) {
                alert('Report submitted successfully');
                setReportTitle("");
                setReportDesc("");
                setImageURL("");
                setProofOfDeposit(null);
                setImagePreview(null); // Clear the image preview
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                alert('Request timed out. Please try again.');
            } else {
                console.error('Error submitting report:', error);
                alert('An error occurred while submitting the report.');
            }
        } finally {
            setIsLoading(false);
            clearTimeout(timeoutId);
        }
    };

    // File upload handler with validation
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            setProofOfDeposit(file);
            setProofOfDepositError(''); // Clear error if valid
        } else {
            setError("Invalid file type or file is too large");
            setImagePreview(null);
            setProofOfDeposit(null);
            setProofOfDepositError('Proof of Deposit is required.'); // Show error
        }
    };


    return (
        <div className={styles.report_container}>
            <Sidebar userId={userId}>
                <main className={styles.main_content}>
                    <header className={styles.report_header}>
                        <h2>Report</h2>
                        <div className={styles.profile} onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
                            <div className={styles.profile_pic}>
                                <Image src="/cvprofile_default.jpg" alt="Profile" width={40} height={40} />
                            </div>
                            <div className={styles.profile_name}>{userFirstName} {userLastName}</div>
                            {dropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <ul>
                                        <li><a href={`/profile/${userId}`}>Profile</a></li>
                                        <li onClick={handleLogout}>Logout</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className={styles.report_content}>
                        <div className={styles.button_row}>
                            <label>
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="system"
                                    checked={reportType === "system"}
                                    onChange={() => setReportType("system")}
                                    className={styles.classify_button}
                                />
                                System Report
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="village"
                                    checked={reportType === "village"}
                                    onChange={() => setReportType("village")}
                                    className={styles.classify_button}
                                />
                                Village Report
                            </label>
                        </div>
                        <h1>Found a problem?</h1>
                        <h2>Main Problem</h2>
                        <textarea
                            className={styles.report_textbox_title}
                            placeholder="Enter the report title here..."
                            rows="2"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                        />
                        <h2>Describe the problem</h2>
                        <textarea
                            className={styles.report_textbox_problem}
                            placeholder="Describe the problem in detail..."
                            rows="5"
                            value={reportDesc}
                            onChange={(e) => setReportDesc(e.target.value)}
                        />
                        <div className={styles.proof_of_deposit}>
                            <label>Upload Proof:</label>
                            <input type="file" onChange={handleFileUpload} />
                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="Proof of Deposit Preview" />
                                </div>
                            )}
                            {proofOfDepositError && <p className={styles.errorMessage}>{proofOfDepositError}</p>}
                        </div>
                    </div>
                    <div className={styles.button_container}>
                        <button
                            className={styles.send_report_button}
                            onClick={submitReport}
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Report"}
                        </button>
                    </div>
                </main>
            </Sidebar>
        </div>
    );
}
