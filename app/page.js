// Login Page Component

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { signIn, useSession } from "next-auth/react";
export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateInputs()) {
            console.log(validateInputs())
            performLogin();
        } else {
            setErrorMessage('* Please enter both username and password');
        }
    };
    const {status, data} = useSession()

    useEffect(() => {
        if(status === "authenticated" && data?.user.usr_id ) {
            router.push(`/dashboard/${data.user.usr_id}`);
        }
    }, [status])

    console.log(useSession())
    const validateInputs = () => {
        return username.trim() !== '' && password.trim() !== '';
    };

    const performLogin = async () => {
        setIsSubmitting(true); // Prevent further submissions
        setErrorMessage(''); // Clear previous errors

        try {
            console.log({username, password})
            const result = await signIn("credentials", {
                redirect: false,
                username,  // Ensure these variables are set correctly
                password,
              });
              console.log(result)
              if (result && result.ok) {
                // router.push(`/dashboard/${data.user.usr_id}`);
                // localStorage.setItem('authToken', data.token);
                // localStorage.setItem('userId', data.user.usr_id);
                // Redirect to dashboard on successful login
              } else {
                setErrorMessage(result?.error || "Invalid login credentials");
              }
        } catch (error) {
            console.error('Login error:', error.message);
            setErrorMessage('* ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.login_container}>
            <div className={styles.left_side}>
                <Image src="/logo3.png" alt="Logo" width={80} height={80} className={styles.logo_image} />
                <div className={styles.inner_left_side}>
                    <h1>Welcome to CV CONNECT!</h1>
                    <p>Homeowner Portal v1.0.0</p>
                </div>
            </div>

            <div className={styles.right_side}>
                <div className={styles.login_form_container}>
                    <h2>Login</h2>
                    {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input_field}
                        />
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input_field}
                        />
                        <button
                            type="submit"
                            className={styles.submit_button}
                            disabled={isSubmitting} // Disable the button while submitting
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
