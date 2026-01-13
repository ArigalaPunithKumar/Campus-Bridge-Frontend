import React, { useState, useEffect } from "react";
import "./Auth.css";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaGraduationCap } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const navigate = useNavigate();

    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [isForgot, setIsForgot] = useState(false);
    const [isOtpStage, setIsOtpStage] = useState(false);
    const [isResetStage, setIsResetStage] = useState(false);

    const [forgotEmail, setForgotEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // OTP Timer States
    const [otpTimer, setOtpTimer] = useState(60);
    const [isOtpExpired, setIsOtpExpired] = useState(false);

    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
    });

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    /* ================= OTP COUNTDOWN EFFECT ================= */
    useEffect(() => {
        let interval;
        if (isOtpStage && !isOtpExpired) {
            interval = setInterval(() => {
                setOtpTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsOtpExpired(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOtpStage, isOtpExpired]);

    // ------------------------------------
    // HANDLERS
    // ------------------------------------
    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/register", registerData);
            alert(res.data.msg);
            setIsRightPanelActive(false);
        } catch (error) {
            alert(error.response?.data?.msg || "Error registering user");
        }
    };

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/login", loginData);
            const { user } = res.data;
            alert(`Welcome back to Campus Bridge, ${user.name}!`);

            if (user.role === "student") navigate("/student/dashboard", { replace: true, state: { user } });
            else if (user.role === "faculty") navigate("/faculty/dashboard", { replace: true, state: { user } });
            else if (user.role === "admin") navigate("/admin/dashboard", { replace: true, state: { user } });
            else navigate("/auth");

        } catch (error) {
            alert(error.response?.data?.msg || "Invalid email or password");
        }
    };

    const handleForgotPassword = async () => {
        try {
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/forgot-password", { email: forgotEmail });
            alert(`OTP sent to ${forgotEmail}`);
            setOtpTimer(60);
            setIsOtpExpired(false);
            setIsOtpStage(true);
        } catch (err) {
            alert(err.response?.data?.msg || "Error sending OTP");
        }
    };

    const handleResendOtp = async () => {
        try {
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/forgot-password", { email: forgotEmail });
            alert(`OTP resent to ${forgotEmail}`);
            setOtpTimer(60);
            setIsOtpExpired(false);
        } catch (err) {
            alert(err.response?.data?.msg || "Error resending OTP");
        }
    };

    const handleOtpVerify = async () => {
        try {
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/verify-otp", { email: forgotEmail, otp });
            alert("OTP verified successfully");
            setIsResetStage(true);
        } catch (err) {
            alert(err.response?.data?.msg || "Invalid OTP");
        }
    };

    const handleResetPassword = async () => {
        try {
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/auth/reset-password", { email: forgotEmail, newPassword });
            alert("Password reset successful. Please login.");
            setForgotEmail("");
            setOtp("");
            setNewPassword("");
            setIsForgot(false);
            setIsOtpStage(false);
            setIsResetStage(false);
        } catch (err) {
            alert(err.response?.data?.msg || "Reset failed");
        }
    };

    const handlePanelSwitch = (status) => {
        setIsRightPanelActive(status);
        setIsForgot(false);
    };

    return (
        <div className="auth-container">
            {/* Header Branding */}
            <div className="brand-header">
                <FaUniversity className="uni-icon" />
                <div className="brand-text">
                    <h2>Mohan Babu University</h2>
                    <span>Campus Bridge Portal</span>
                </div>
            </div>

            <div className={`auth-wrapper ${isRightPanelActive ? "right-panel-active" : ""}`}>

                {/* --------------------- SIGN IN --------------------- */}
                {!isForgot && (
                    <div className="form-container sign-in-container">
                        <form className="auth-form" onSubmit={handleLogin}>
                            <h1>Sign In</h1>
                            <span className="subtitle">Access your MBU Dashboard</span>

                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input type="email" name="email" placeholder="University Email" value={loginData.email} onChange={handleLoginChange} required />
                            </div>

                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
                            </div>

                            <span className="forgot-password-link" onClick={() => setIsForgot(true)}>
                                Forgot Password?
                            </span>

                            <button type="submit" className="primary-btn">Login</button>
                        </form>
                    </div>
                )}

                {/* --------------------- SIGN UP --------------------- */}
                {!isForgot && (
                    <div className="form-container sign-up-container">
                        <form className="auth-form" onSubmit={handleRegister}>
                            <h1>Create Account</h1>
                            <span className="subtitle">Join the Campus Bridge Network</span>

                            <div className="input-group">
                                <FaUser className="input-icon" />
                                <input type="text" name="name" placeholder="Full Name" required value={registerData.name} onChange={handleRegisterChange} />
                            </div>

                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <input type="email" name="email" placeholder="MBU Email ID" required value={registerData.email} onChange={handleRegisterChange} />
                            </div>

                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input type="password" name="password" placeholder="Create Password" required value={registerData.password} onChange={handleRegisterChange} />
                            </div>

                            <div className="role-select-container">
                                <FaGraduationCap className="input-icon" />
                                <select name="role" value={registerData.role} onChange={handleRegisterChange}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button type="submit" className="primary-btn">Register</button>
                        </form>
                    </div>
                )}

                {/* --------------------- FORGOT / OTP / RESET UI --------------------- */}
                {isForgot && (
                    <div className="form-container sign-in-container forgot-mode">
                        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                            {!isOtpStage && !isResetStage && (
                                <>
                                    <h1>Reset Password</h1>
                                    <span>Enter your MBU email to receive OTP</span>
                                    <div className="input-group">
                                        <FaEnvelope className="input-icon" />
                                        <input type="email" placeholder="Email Address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                                    </div>
                                    <button className="primary-btn" onClick={handleForgotPassword}>Send OTP</button>
                                </>
                            )}

                            {isOtpStage && !isResetStage && (
                                <>
                                    <h1>Verify Identity</h1>
                                    <div className="timer-text">
                                        {isOtpExpired ? (
                                            <span className="expired-link" onClick={handleResendOtp}>Resend Code</span>
                                        ) : (
                                            <span>Code expires in <strong>{otpTimer}s</strong></span>
                                        )}
                                    </div>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input type="number" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                    </div>
                                    <button className="primary-btn" onClick={handleOtpVerify}>Verify</button>
                                </>
                            )}

                            {isResetStage && (
                                <>
                                    <h1>New Password</h1>
                                    <div className="input-group">
                                        <FaLock className="input-icon" />
                                        <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                    </div>
                                    <button className="primary-btn" onClick={handleResetPassword}>Update Password</button>
                                </>
                            )}

                            <span className="back-to-login-link" onClick={() => { setIsForgot(false); setIsOtpStage(false); setIsResetStage(false); }}>
                                ← Back to Login
                            </span>
                        </form>
                    </div>
                )}

                {/* --------------------- OVERLAY PANEL --------------------- */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>Reconnect with your campus dashboard and stay updated.</p>
                            <button className="ghost" onClick={() => handlePanelSwitch(false)}>
                                Sign In
                            </button>
                        </div>

                        <div className="overlay-panel overlay-right">
                            <h1>Hello, MBUian!</h1>
                            <p>New here? Join the Campus Bridge to access courses & updates.</p>
                            <button className="ghost" onClick={() => handlePanelSwitch(true)}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;