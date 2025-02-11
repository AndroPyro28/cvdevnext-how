'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import Sidebar from "../../../../../../components/sidebar";

// Modal component
const Modal = ({ isOpen, onClose, summary, onSubmit }) => {
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlayStyled}>
            <div className={styles.modalContentStyled}>
                <span className={styles.close} onClick={onClose}>&times;</span>
                <h2 className={styles.modalTitle}>Review Transaction Summary</h2>
                <div className={styles.modalSummaryStyled}>
                    <div className={styles.summaryRowStyled}><strong>Billing Statement:</strong> {summary.billingStatement}</div>
                    <div className={styles.summaryRowStyled}><strong>Transaction Type:</strong> {summary.trn_type}</div>
                    <div className={styles.summaryRowStyled}><strong>Transaction Purpose:</strong> {summary.trn_purp}</div>
                    <div className={styles.summaryRowStyled}><strong>Payment Method:</strong> {summary.trn_method}</div>
                    <div className={styles.summaryRowStyled}><strong>Payment Amount:</strong> PHP {summary.trn_amount}</div>
                    {summary.trn_image && (
                        <div className={styles.summaryRowStyled}>
                            <strong>Proof of Deposit / Transfer:</strong>
                            <div className={styles.imagePreviewModal}><Image src={summary.trn_image} alt="Proof of Deposit" width={150} height={200} /></div>
                        </div>
                    )}
                </div>
                <label className={styles.confirmLabelStyled}>
                    <input
                        type="checkbox"
                        onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                    /> I confirm that the details are correct
                </label>
                <div className={styles.modalButtonsStyled}>
                    <button
                        onClick={() => {
                            onSubmit(); // Call the submit logic
                            if (summary.prop_owner_id) {
                                router.push(`/properties/${summary.prop_owner_id}`); // Redirect to properties page with prop_owner_id
                                console.log("Redirecting to:", `/properties/${summary.prop_owner_id}`);
                            } else {
                                console.error("Error: prop_owner_id is undefined");
                            }
                        }}
                        className={`${styles.submitButtonStyled} ${isCheckboxChecked ? styles.submitButtonEnabled : ''}`}
                        disabled={!isCheckboxChecked}
                    >
                        Submit for Approval
                    </button>
                    <button onClick={onClose} className={styles.cancelButtonStyled}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default function CreateTransaction() {
    const { propId } = useParams();
    const router = useRouter();
    const [selectedBillingStatement, setSelectedBillingStatement] = useState("");
    const [property, setProperty] = useState(null);
    const [proofOfDeposit, setProofOfDeposit] = useState(null);
    const [error, setError] = useState(null);
    const [minimumAmount, setMinimumAmount] = useState(0);
    const [summary, setSummary] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedTransactionType, setSelectedTransactionType] = useState(null);
    const [transactionPurpose, setTransactionPurpose] = useState('Select');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [transactionTypeError, setTransactionTypeError] = useState('');
    const [transactionPurposeError, setTransactionPurposeError] = useState('');
    const [paymentMethodError, setPaymentMethodError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [proofOfDepositError, setProofOfDepositError] = useState('');
    const [walletAdvHoaPay, setWalletAdvHoaPay] = useState(0);
    const [walletAdvWaterPay, setWalletAdvWaterPay] = useState(0);
    const [walletAdvGarbPay, setWalletAdvGarbPay] = useState(0);
    const [userData, setUserData] = useState(null);

    // Final submit to the database
 // Final submit to the database
 const handleConfirmSubmit = async () => {
    if (!proofOfDeposit) {
        alert("Please upload a proof of deposit.");
        return;
    }

    const transactionData = {
        trn_type: selectedTransactionType,
        trn_user_init: property?.prop_owner_id,
        trn_created_at: new Date().toISOString(),
        trn_purp: transactionPurpose,
        trn_method: selectedPaymentMethod,
        trn_amount: parseFloat(amountToPay),
        trn_image_url: proofOfDeposit.name,
    };

    const walletData = {
        wall_owner: property?.prop_owner_id,
        wall_adv_hoa_pay: parseFloat(walletAdvHoaPay) || 0,
        wall_adv_water_pay: parseFloat(walletAdvWaterPay) || 0,
        wall_adv_garb_pay: parseFloat(walletAdvGarbPay) || 0,
    };

    try {
        // Submit the transaction
        const transactionResponse = await fetch(`/api/transactions/${propId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(transactionData),
        });

        if (!transactionResponse.ok) {
            const transactionError = await transactionResponse.json();
            console.error("Transaction submission failed:", transactionError.message || transactionError.error);
            alert("Failed to submit transaction. Please try again.");
            return;
        }

        const transactionResponseData = await transactionResponse.json();
        console.log("Transaction submitted successfully:", transactionResponseData);

        // Handle wallet updates
        if (walletData.wall_adv_hoa_pay > 0 || walletData.wall_adv_water_pay > 0 || walletData.wall_adv_garb_pay > 0) {
            const walletCreated = await handleWalletUpdate(walletData);
            if (!walletCreated) {
                alert("Transaction submitted, but wallet creation failed.");
                return;
            }
        }

        alert(`Transaction submitted successfully with ID: ${transactionResponseData.transactionId}`);
        router.push(`/transaction/${property?.prop_owner_id}`);
    } catch (error) {
        console.error("Error during submission:", error);
        alert("An error occurred. Please try again.");
    }
};



const handleWalletUpdate = async (walletData) => {
    try {
        console.log('Sending wallet update request with data:', walletData); // Debugging

        const response = await fetch(`/api/wallet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(walletData),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error("Wallet creation failed:", data.message || data.error);
            alert("Failed to create wallet. Please try again.");
            return false;
        }

        console.log("Wallet created successfully.");
        return true;
    } catch (error) {
        console.error("Error creating wallet:", error);
        alert("An error occurred during wallet creation.");
        return false;
    }
};




useEffect(() => {
    const fetchProperty = async () => {
        console.log('Fetching property with propId:', propId); // Debugging
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/properties/${propId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching property details: ${response.status}`);
            }

            const data = await response.json();

            // Convert all Decimal128 fields in the property object
            const convertedData = {
                ...data,
                prop_curr_amt_due: convertDecimal(data.prop_curr_amt_due),
                prop_curr_hoamaint_fee: convertDecimal(data.prop_curr_hoamaint_fee),
                prop_curr_water_charges: convertDecimal(data.prop_curr_water_charges),
                prop_curr_garb_fee: convertDecimal(data.prop_curr_garb_fee),
            };

            console.log('Fetched Property Data:', convertedData);
            setProperty(convertedData);
        } catch (error) {
            console.error('Error fetching property:', error.message);
            alert('Error fetching property details. Please try again.');
        }
    };

    const fetchUserData = async (userId) => {
        try {
            const authToken = localStorage.getItem("authToken");
            const response = await fetch(`/api/header/${userId}`, {
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

    fetchUserData();
    fetchProperty();
}, [propId]);
    
    
    

    

    const convertDecimal = (value) => {
        // Convert MongoDB Decimal128 to a JavaScript number
        if (value && value.$numberDecimal) {
            return parseFloat(value.$numberDecimal);
        }
        return value;
    };


    
    const calculateTotalAmountDue = (data) => {
        // Calculate the total amount due
        const total =
            (data.prop_curr_hoamaint_fee || 0) +
            (data.prop_curr_water_charges || 0) +
            (data.prop_curr_garb_fee || 0) +
            (data.prop_tot_adv_water_pay || 0) +
            (data.prop_tot_adv_hoa_pay || 0) +
            (data.prop_tot_adv_garb_pay || 0);
    
        // Debugging: Log the total amount due
        console.log('Calculated Total Amount Due:', total);
        return total;
    };

    const handleTransactionType = (type) => {
        setSelectedTransactionType(type);
        setTransactionTypeError('');
        setAmountError('');

        // Get the corresponding amount for the selected transaction purpose
        let amount = 0;

        if (transactionPurpose === 'HOA Maintenance Fees') {
            amount = property?.prop_curr_hoamaint_fee || 0;
        } else if (transactionPurpose === 'Water Bill') {
            amount = property?.prop_curr_water_charges || 0;
        } else if (transactionPurpose === 'Garbage') {
            amount = property?.prop_curr_garb_fee || 0;
        } else if (transactionPurpose === 'All') {
            amount = (property?.prop_curr_hoamaint_fee || 0) +
                (property?.prop_curr_water_charges || 0) +
                (property?.prop_curr_garb_fee || 0);
        }

    // Handle amounts for specific transaction types
        if (type === 'Partial Payment') {
            const halfAmount = amount / 2;
            setMinimumAmount(halfAmount); // Minimum should be half
            setAmountToPay(halfAmount);  // Set the "Amount to Pay" to this value
        } else if (type === 'Advanced Payment') {
            setMinimumAmount(amount); // Set minimum as the current due amount
            setAmountToPay(amount);   // Initially, set to due amount without assumptions
        } else {
            setAmountToPay(amount);  // For Full Payment, directly use the current due amount
            setMinimumAmount(0);    // Reset the minimum amount
        }

        // Clear error only if valid
        if (type) {
            setTransactionTypeError('');
        } else {
            setTransactionTypeError('Transaction Type is required.');
        }
    };


    const handleAmountChange = (e) => {
        let inputAmount = parseFloat(e.target.value) || 0; // Ensure input is parsed as a number
        let maxAmount = property?.prop_curr_amt_due || 0;
        let minAmount = 0;
    
        // Reset wallet allocations if amount changes
        setWalletAdvHoaPay(0);
        setWalletAdvWaterPay(0);
        setWalletAdvGarbPay(0);
    
        // Reset error messages
        setAmountError("");
        let excessAmount = 0;
    
        // Handle Advance Payment logic first
        if (selectedTransactionType === 'Advance Payment' && transactionPurpose) {
            // Set the minimum amount based on the selected transaction purpose
            switch (transactionPurpose) {
                case 'HOA Maintenance Fees':
                    minAmount = property?.prop_curr_hoamaint_fee || 0;
                    break;
                case 'Water Bill':
                    minAmount = property?.prop_curr_water_charges || 0;
                    break;
                case 'Garbage':
                    minAmount = property?.prop_curr_garb_fee || 0;
                    break;
                case 'All':
                    minAmount = property?.prop_curr_amt_due || 0;
                    break;
                default:
                    minAmount = 0;
            }
    
            // Check if the entered amount is lower than the minimum amount for advance payment
            if (inputAmount < minAmount) {
                setAmountError(`Amount must be at least PHP ${minAmount.toFixed(2)}`);
            } else {
                setAmountError(''); // Clear the error if amount is valid
            }
    
            // No need for maximum or excess amount logic for advance payment
            setAmountToPay(inputAmount);
            return; // Exit early since advance payment doesn't need further checks
        }
    
        // Handle Partial Payment logic (fallback)
        if (selectedTransactionType === 'Partial Payment' && transactionPurpose) {
            switch (transactionPurpose) {
                case 'HOA Maintenance Fees':
                    maxAmount = property?.prop_curr_hoamaint_fee || 0;
                    break;
                case 'Water Bill':
                    maxAmount = property?.prop_curr_water_charges || 0;
                    break;
                case 'Garbage':
                    maxAmount = property?.prop_curr_garb_fee || 0;
                    break;
                case 'All':
                    maxAmount = property?.prop_curr_amt_due || 0;
                    break;
                default:
                    maxAmount = 0;
            }
            minAmount = maxAmount / 2; // Set minimum as half of the selected purpose amount
        }
    
        // Handle the general validation for Partial Payments
        if (inputAmount < minAmount) {
            setAmountError(`Amount must be at least PHP ${minAmount.toFixed(2)}`);
        } else if (inputAmount > maxAmount) {
            setAmountError(`Amount cannot exceed PHP ${maxAmount.toFixed(2)}`);
        } else {
            setAmountError('');
        }
    
        setAmountToPay(inputAmount);
    };
    
    
            
    const handleBillingStatementChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedBillingStatement(selectedValue);
    };

    // Handle transaction purpose change
    const handleTransactionPurposeChange = (e) => {
        const purpose = e.target.value;
        setTransactionPurpose(purpose);
        setTransactionPurposeError('');

        let prefilledAmount = 0;
        if (purpose === 'HOA Maintenance Fees') {
            prefilledAmount = property?.prop_curr_hoamaint_fee || 0;
        } else if (purpose === 'Water Bill') {
            prefilledAmount = property?.prop_curr_water_charges || 0;
        } else if (purpose === 'Garbage') {
            prefilledAmount = property?.prop_curr_garb_fee || 0;
        } else if (purpose === 'All') {
            prefilledAmount =
                (property?.prop_curr_hoamaint_fee || 0) +
                (property?.prop_curr_water_charges || 0) +
                (property?.prop_curr_garb_fee || 0);
        }

        setAmountToPay(prefilledAmount);
        setMinimumAmount(prefilledAmount);
    };

    const handlePaymentMethod = (method) => {
        setSelectedPaymentMethod(method);

         // Clear error only if valid
        if (method) {
            setPaymentMethodError('');
        } else {
            setPaymentMethodError('Payment Method is required.');
        }
    };

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

    const handleReview = (e) => {
        e.preventDefault();
    
        let hasError = false;
    
        if (!selectedTransactionType) {
            setTransactionTypeError('Transaction Type is required.');
            hasError = true;
        }
    
        if (!transactionPurpose || transactionPurpose === 'Select') {
            setTransactionPurposeError('Transaction Purpose is required.');
            hasError = true;
        }
    
        if (!selectedPaymentMethod) {
            setPaymentMethodError('Payment Method is required.');
            hasError = true;
        }
    
        if (!proofOfDeposit) {
            setProofOfDepositError('Proof of Deposit is required.');
            hasError = true;
        }
    
        if (hasError || amountError) {
            return;
        }
    
        if (!amountToPay && selectedTransactionType !== 'Full Payment') {
            setAmountError('Amount to Pay is required.');
            return;
        }
    
        setAmountError('');
        const transactionDetails = {
            billingStatement: selectedBillingStatement,
            trn_type: selectedTransactionType,
            trn_purp: transactionPurpose,
            trn_method: selectedPaymentMethod,
            trn_amount: parseFloat(amountToPay), // Fix here by using amountToPay
            trn_image: imagePreview,
            prop_owner_id: property?.prop_owner_id,
            propertyId: propId,
        };
    
        setSummary(transactionDetails);
        setModalOpen(true);
    };

    return (
        <div className={styles.createtrans_container}>
                <main className={styles.main_content}>
                    <header className={styles.createtrans_header}>
                        <h2>Create Transaction</h2>
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
                        <div className={styles.header}>
                            <button className={styles.back_button} onClick={() => window.history.back()}>
                                ←
                            </button>
                            <p className={styles.balance}>Outstanding Balance: <span>{property?.prop_curr_amt_due || 0}</span></p>
                        </div>
                        <div className="options_container">
                            <div className="billing_purpose_container">
                            <div className={styles.billing_statement}>
                                <label>Select Billing Statement:</label>
                                <select
                                    className={styles.statement}
                                    onChange={handleBillingStatementChange}
                                    value={selectedBillingStatement}
                                >
                                    {property ? (
                                        <>
                                            {property.prop_curr_amt_due !== undefined ? (
                                                <option value="current">
                                                    Current Bill: {property.prop_curr_amt_due.toFixed(2) || 'No data available'}
                                                </option>
                                            ) : (
                                                <option disabled>No data available</option>
                                            )}
                                        </>
                                    ) : (
                                        <option disabled>Loading...</option>
                                    )}
                                </select>

                            </div>

                                <div className={styles.transaction_purpose}>
                                    <label>Select Transaction Purpose:</label>
                                    <select
                                        className={styles.purposes}
                                        onChange={handleTransactionPurposeChange}
                                        value={transactionPurpose}
                                    >
                                        <option value="Select">Select</option>
                                        <option value="All">All</option>
                                        <option value="HOA Maintenance Fees">HOA Maintenance Fees</option>
                                        <option value="Water Bill">Water Bill</option>
                                        <option value="Garbage">Garbage</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {transactionPurposeError && <p className={styles.errorMessage}>{transactionPurposeError}</p>}
                                </div>
                            </div>

                            <div className="type_payment_container">
                                <div className={styles.transaction_details}>
                                    <p>Transaction Type:</p>
                                    <div className={styles.transaction_type}>
                                        <button
                                            type="button"
                                            onClick={() => handleTransactionType('Partial Payment')}
                                            className={`${styles.transaction_button} ${selectedTransactionType === 'Partial Payment' ? styles.activeTransaction : ''}`}
                                        >
                                            Partial Payment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTransactionType('Full Payment')}
                                            className={`${styles.transaction_button} ${selectedTransactionType === 'Full Payment' ? styles.activeTransaction : ''}`}
                                        >
                                            Full Payment
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTransactionType('Advanced Payment')}
                                            className={`${styles.transaction_button} ${selectedTransactionType === 'Advanced Payment' ? styles.activeTransaction : ''}`}
                                        >
                                            Advanced Payment
                                        </button>
                                        {transactionTypeError && <p className={styles.errorMessage}>{transactionTypeError}</p>}
                                    </div>
                                </div>

                                <div className={styles.payment_details}>
                                    <p>Payment Method:</p>
                                    <div className={styles.payment_method}>
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentMethod('GCash')}
                                            className={`${styles.payment_button} ${selectedPaymentMethod === 'GCash' ? styles.activePayment : ''}`}
                                        >
                                            GCash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handlePaymentMethod('BPI')}
                                            className={`${styles.payment_button} ${selectedPaymentMethod === 'BPI' ? styles.activePayment : ''}`}
                                        >
                                            BPI
                                        </button>
                                        {paymentMethodError && <p className={styles.errorMessage}>{paymentMethodError}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.breakdown_payment_container}>
                            <div className={styles.breakdown_container}>
                                <div className={styles.charges}>
                                    <h2>Billing Statement Breakdown:</h2>
                                    <div className={styles.item_header}>
                                        <span>ITEM</span>
                                        <span>Amount</span>
                                    </div>

                                    {property && transactionPurpose && (
                                        <>
                                            {(transactionPurpose === 'All' || transactionPurpose === 'HOA Maintenance Fees') && (
                                                <p>HOA Maintenance Fees: <span>{property.prop_curr_hoamaint_fee || 0}</span></p>
                                            )}
                                            {(transactionPurpose === 'All' || transactionPurpose === 'Water Bill') && (
                                                <p>Water Charges: <span>{property.prop_curr_water_charges || 0}</span></p>
                                            )}
                                            {(transactionPurpose === 'All' || transactionPurpose === 'Garbage') && (
                                                <p>Garbage Fee: <span>{property.prop_curr_garb_fee || 0}</span></p>
                                            )}
                                        </>
                                    )}

                                    {property?.prop_curr_amt_due != null && (
                                        <div className={styles.total_amount}>
                                            <p>Total Amount Due: <span>{property.prop_curr_amt_due}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.payment_options_container}>
                                {selectedPaymentMethod === 'GCash' && (
                                    <div className={styles.gcash_details}>
                                        <p>SCAN THE GCASH QR CODE</p>
                                        <Image src="/gcash.svg" alt="GCash QR Code" className={styles.qr_code} width={200} height={200} />
                                        <p>Name: Roy Asignacion</p>
                                        <p>Account: 09452419632</p>
                                    </div>
                                )}

                                {selectedPaymentMethod === 'BPI' && (
                                    <div className={styles.gcash_details}>
                                        <p>SLU CV HOA BPI ACCOUNT</p>
                                        <p>Name: </p>
                                        <p>Account Number: 0563840005</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.payment_summary}>
                            <div className={styles.amount_details}>
                                <label>
                                    Amount to Pay {selectedTransactionType === 'Partial Payment' && '*'}
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={amountToPay}
                                    onChange={handleAmountChange}
                                    disabled={selectedTransactionType === 'Full Payment'}
                                    required
                                    min={minimumAmount}
                                    step="0.01"
                                />
                                {amountError && <p className={styles.errorMessage}>{amountError}</p>}
                            </div>

                            <div className={styles.proof_of_deposit}>
                                <label>Proof of Deposit:</label>
                                <input type="file" onChange={handleFileUpload} />
                                {imagePreview && (
                                    <div className={styles.imagePreview}>
                                        <img src={imagePreview} alt="Proof of Deposit Preview" />
                                    </div>
                                )}
                                {proofOfDepositError && <p className={styles.errorMessage}>{proofOfDepositError}</p>}
                            </div>

                            <div className={styles.payment_note}>
                                <p>Please ensure the amount matches the billing breakdown before submitting proof of deposit.</p>
                            </div>
                        </div>

                        <div className={styles.button_container}>
                            <button type="button" onClick={handleReview} className={styles.submitButton}> Review Transaction Details </button>
                        </div>
                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setModalOpen(false)}
                            summary={{
                                billingStatement: selectedBillingStatement,
                                trn_type: selectedTransactionType,
                                trn_purp: transactionPurpose,
                                trn_method: selectedPaymentMethod,
                                trn_amount: amountToPay,
                                trn_image: imagePreview,
                                prop_owner_id: property?.prop_owner_id,
                            }}
                            onSubmit={handleConfirmSubmit}
                        />

                    </div>
                    

                </main>
        </div>
    );
}
