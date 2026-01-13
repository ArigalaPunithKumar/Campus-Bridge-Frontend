import React, { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";

import {

    FaUserShield, FaUsers, FaChalkboardTeacher, FaUserGraduate,

    FaSignOutAlt, FaSearch, FaTrashAlt, FaBan, FaCheckCircle,

    FaKey, FaSync, FaExclamationTriangle, FaCogs, FaToggleOn, FaToggleOff

} from "react-icons/fa";

import "./AdminDashboard.css";



const AdminDashboard = () => {

    const navigate = useNavigate();

    const location = useLocation();



    // --- State Management ---

    const [admin, setAdmin] = useState({ name: "Admin" });

    const [stats, setStats] = useState({ total: 0, students: 0, faculty: 0, active: 0 });

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [activeTab, setActiveTab] = useState("users"); // Switcher State



    // --- Initialization ---

    useEffect(() => {

        if (!location.state?.user || location.state.user.role !== "admin") {

            // navigate("/auth", { replace: true });

            console.warn("Using Dev Admin.");

            setAdmin({ name: "Dev Admin", role: "admin" });

            fetchAllData();

        } else {

            setAdmin(location.state.user);

            fetchAllData();

        }

    }, [location, navigate]);



    // --- API Calls ---

    const fetchAllData = async () => {

        setLoading(true);

        setError(null);

        try {

            const [statsRes, usersRes] = await Promise.all([

                axios.get("https://campus-bridge-backend-1.onrender.com/api/admin/stats"),

                axios.get("https://campus-bridge-backend-1.onrender.com/api/admin/users")

            ]);

            setStats(statsRes.data);

            if (Array.isArray(usersRes.data)) {

                setUsers(usersRes.data);

            } else {

                setUsers([]);

            }

        } catch (err) {

            console.error("FULL ERROR DETAILS:", err);

            setError("Failed to load data. Is the backend running?");

        } finally {

            setLoading(false);

        }

    };



    const handleStatusToggle = async (id, currentStatus) => {

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {

            await axios.put(`https://campus-bridge-backend-1.onrender.com/api/admin/user-status/${id}`, { status: newStatus });

            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));

        } catch (err) { alert("Failed to update status."); }

    };



    const handleDelete = async (id) => {

        if (!window.confirm("Delete this user permanently?")) return;

        try {

            await axios.delete(`https://campus-bridge-backend-1.onrender.com/api/admin/user/${id}`);

            setUsers(prev => prev.filter(u => u.id !== id));

            setStats(prev => ({ ...prev, total: prev.total - 1 }));

        } catch (err) { alert("Failed to delete user."); }

    };



    const handleResetPassword = async (id) => {

        if (!window.confirm("Reset password to 'Campus123'?")) return;

        try {

            await axios.put(`https://campus-bridge-backend-1.onrender.com/api/admin/reset-password/${id}`);

            alert("Password reset.");

        } catch (err) { alert("Failed to reset."); }

    };



    const handleLogout = () => navigate("/auth", { replace: true });



    // --- SUB-COMPONENTS ---



    const UsersView = () => {

        const filteredUsers = users.filter(u =>

            (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||

            (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))

        );



        return (

            <div className="content-card">

                <div className="card-header">

                    <h2>User List</h2>

                    <div className="search-wrapper">

                        <FaSearch />

                        <input

                            placeholder="Search users..."

                            value={searchTerm}

                            onChange={e => setSearchTerm(e.target.value)}

                        />

                    </div>

                </div>

                <div className="table-responsive">

                    <table className="users-table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>User Info</th>

                                <th>Role</th>

                                <th>Status</th>

                                <th className="text-right">Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredUsers.length === 0 ? (

                                <tr><td colSpan="5" className="empty-state">No users found</td></tr>

                            ) : (

                                filteredUsers.map(user => (

                                    <tr key={user.id} className={user.status === 'inactive' ? 'dimmed' : ''}>

                                        <td>#{user.id}</td>

                                        <td>

                                            <div className="user-info">

                                                <strong>{user.name}</strong>

                                                <small>{user.email}</small>

                                            </div>

                                        </td>

                                        <td><span className={`role-pill ${user.role}`}>{user.role}</span></td>

                                        <td><span className={`status-dot ${user.status}`}></span> {user.status}</td>

                                        <td className="actions-col">

                                            <button className="btn-icon warning" onClick={() => handleResetPassword(user.id)} title="Reset Password"><FaKey /></button>

                                            <button className={`btn-icon ${user.status === 'active' ? 'danger-light' : 'success-light'}`} onClick={() => handleStatusToggle(user.id, user.status)}>

                                                {user.status === 'active' ? <FaBan /> : <FaCheckCircle />}

                                            </button>

                                            <button className="btn-icon danger" onClick={() => handleDelete(user.id)} title="Delete"><FaTrashAlt /></button>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        );

    };



    // ... inside AdminDashboard component ...



    const SettingsView = () => {

        // Local state for settings inside this view

        const [config, setConfig] = useState({

            maintenance_mode: false,

            allow_registrations: true,

            system_notifications: true

        });

        const [loadingSettings, setLoadingSettings] = useState(true);



        useEffect(() => {

            fetchSettings();

        }, []);



        const fetchSettings = async () => {

            try {

                const res = await axios.get("https://campus-bridge-backend-1.onrender.com/api/admin/settings");

                setConfig(res.data);

            } catch (err) {

                console.error("Failed to load settings");

            } finally {

                setLoadingSettings(false);

            }

        };



        const handleToggle = async (key) => {

            // Optimistic UI update

            const oldValue = config[key];

            setConfig(prev => ({ ...prev, [key]: !oldValue }));



            try {

                await axios.post("https://campus-bridge-backend-1.onrender.com/api/admin/settings/toggle", { key });

            } catch (err) {

                // Revert on failure

                setConfig(prev => ({ ...prev, [key]: oldValue }));

                alert("Failed to update setting");

            }

        };



        if (loadingSettings) return <div style={{ padding: "2rem" }}>Loading settings...</div>;



        return (

            <div className="content-card">

                <div className="card-header">

                    <h2>System Settings</h2>

                </div>

                <div className="settings-grid" style={{ padding: "2rem" }}>



                    {/* Maintenance Mode */}

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

                        <div>

                            <h4 style={{ margin: 0, color: '#1e293b' }}>Maintenance Mode</h4>

                            <p style={{ margin: '5px 0 0 0', color: "#64748b", fontSize: "0.9rem" }}>Disable login for all non-admin users.</p>

                        </div>

                        <div onClick={() => handleToggle('maintenance_mode')} style={{ cursor: 'pointer' }}>

                            {config.maintenance_mode ?

                                <FaToggleOn size={35} color="#ef4444" /> :

                                <FaToggleOff size={35} color="#ccc" />

                            }

                        </div>

                    </div>



                    <hr style={{ margin: "1.5rem 0", border: "0", borderTop: "1px solid #e2e8f0" }} />



                    {/* Allow Registrations */}

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>

                        <div>

                            <h4 style={{ margin: 0, color: '#1e293b' }}>Allow New Registrations</h4>

                            <p style={{ margin: '5px 0 0 0', color: "#64748b", fontSize: "0.9rem" }}>If disabled, only admins can add users.</p>

                        </div>

                        <div onClick={() => handleToggle('allow_registrations')} style={{ cursor: 'pointer' }}>

                            {config.allow_registrations ?

                                <FaToggleOn size={35} color="#10b981" /> :

                                <FaToggleOff size={35} color="#ccc" />

                            }

                        </div>

                    </div>



                    <hr style={{ margin: "1.5rem 0", border: "0", borderTop: "1px solid #e2e8f0" }} />



                    {/* System Notifications */}

                    <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <div>

                            <h4 style={{ margin: 0, color: '#1e293b' }}>System Notifications</h4>

                            <p style={{ margin: '5px 0 0 0', color: "#64748b", fontSize: "0.9rem" }}>Enable global alerts for downtime.</p>

                        </div>

                        <div onClick={() => handleToggle('system_notifications')} style={{ cursor: 'pointer' }}>

                            {config.system_notifications ?

                                <FaToggleOn size={35} color="#10b981" /> :

                                <FaToggleOff size={35} color="#ccc" />

                            }

                        </div>

                    </div>



                </div>

            </div>

        );

    };



    // --- MAIN RENDER ---

    if (loading) return <div className="admin-loading"><div className="spinner"></div></div>;

    if (error) return <div className="admin-error"><h2>Error</h2><p>{error}</p><button onClick={fetchAllData}>Retry</button></div>;



    return (

        <div className="admin-container">

            <aside className="admin-sidebar">

                <div className="brand"><FaUserShield /> <span>Admin<span className="highlight">Control</span></span></div>

                <div className="admin-profile">

                    <div className="avatar">{admin.name[0]}</div>

                    <div className="info"><h4>{admin.name}</h4><span className="badge">Super Admin</span></div>

                </div>

                <nav className="menu">

                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>

                        <FaUsers /> User Management

                    </button>

                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>

                        <FaCogs /> System Settings

                    </button>

                </nav>

                <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>

            </aside>



            <main className="admin-content">

                <header className="page-header">

                    <div><h1>Dashboard Overview</h1><p>Welcome back, Administrator.</p></div>

                    <div className="refresh-btn" onClick={fetchAllData}><FaSync /></div>

                </header>



                <div className="stats-row">

                    <div className="stat-card"><div className="icon-bg purple"><FaUsers /></div><div><h3>{stats.total}</h3><p>Total Users</p></div></div>

                    <div className="stat-card"><div className="icon-bg blue"><FaUserGraduate /></div><div><h3>{stats.students}</h3><p>Students</p></div></div>

                    <div className="stat-card"><div className="icon-bg orange"><FaChalkboardTeacher /></div><div><h3>{stats.faculty}</h3><p>Faculty</p></div></div>

                    <div className="stat-card"><div className="icon-bg green"><FaCheckCircle /></div><div><h3>{stats.active}</h3><p>Active</p></div></div>

                </div>



                {/* CONDITIONAL RENDERING SWITCH */}

                {activeTab === 'users' ? <UsersView /> : <SettingsView />}



            </main>

        </div>

    );

};



export default AdminDashboard;