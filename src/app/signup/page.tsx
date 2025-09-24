'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!userRole) {
            setError('Please select your role');
            return;
        }

        try {
            await signUp.create({
                emailAddress,
                password,
                unsafeMetadata: {
                    role: userRole
                }
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: unknown) {
            const error = err as { errors?: Array<{ message: string }> };
            setError(error.errors?.[0]?.message || 'An error occurred during signup');
        }
    };

    const onPressVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });
            
            if (completeSignUp.status !== 'complete') {
                console.log(JSON.stringify(completeSignUp, null, 2));
            }
            
            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                
                // Redirect based on role
                if (userRole === 'investor') {
                    router.push('/investor-portal');
                } else if (userRole === 'business_owner') {
                    router.push('/business-portal');
                } else {
                    router.push('/');
                }
            }
        } catch (err: unknown) {
            const error = err as { errors?: Array<{ message: string }> };
            setError(error.errors?.[0]?.message || 'An error occurred during verification');
        }
    };

    return (
        <div>
            <h1>Sign Up for Launchpad</h1>
            
            {!pendingVerification && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label>I am signing up as:</label>
                        <div>
                            <input
                                type="radio"
                                id="investor"
                                name="role"
                                value="investor"
                                checked={userRole === 'investor'}
                                onChange={(e) => setUserRole(e.target.value)}
                            />
                            <label htmlFor="investor">Investor</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="business_owner"
                                name="role"
                                value="business_owner"
                                checked={userRole === 'business_owner'}
                                onChange={(e) => setUserRole(e.target.value)}
                            />
                            <label htmlFor="business_owner">Business Owner</label>
                        </div>
                    </div>
                    
                    {error && <div style={{color: 'red'}}>{error}</div>}
                    
                    <button type="submit">Sign Up</button>
                </form>
            )}
            
            {pendingVerification && (
                <div>
                    <h2>Verify your email</h2>
                    <p>We&apos;ve sent a verification code to {emailAddress}</p>
                    <form onSubmit={onPressVerify}>
                        <div>
                            <label htmlFor="code">Verification Code</label>
                            <input
                                type="text"
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </div>
                        
                        {error && <div style={{color: 'red'}}>{error}</div>}
                        
                        <button type="submit">Verify Email</button>
                    </form>
                </div>
            )}
            
            <p>
                Already have an account? <Link href="/sign-in">Sign in</Link>
            </p>
        </div>
    );
}