import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    FaBookOpen, FaCode, FaChartLine, FaSignOutAlt, FaBell, FaUserGraduate,
    FaFire, FaCalendarAlt, FaClock, FaUpload, FaMoon, FaSun, FaRobot,
    FaPlay, FaExclamationCircle, FaTimes, FaSearch, FaCog,
    FaCloudUploadAlt, FaFileAlt, FaTrashAlt, FaCheckCircle, FaBars,
    FaUser, FaLock, FaEnvelope, FaPalette, FaShieldAlt
} from "react-icons/fa";
import "./StudentDashboard.css";

// --- Animations ---
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
};

/* ==================================================================================
   SUB-COMPONENTS
   ================================================================================== */

// 1. DASHBOARD HOME
const DashboardHome = ({ user, currentTime, courses, assignments, attendanceData, schedule }) => {
    const activeAssignments = assignments.filter(a => a.status === 'pending').length;
    const avgAttendance = attendanceData.length > 0
        ? Math.round(attendanceData.reduce((acc, curr) => acc + (curr.attended / curr.total) * 100, 0) / attendanceData.length)
        : 0;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[currentTime.getDay()];

    const todaysClasses = schedule
        .filter(item => item.day_of_week === todayName)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return (
        <motion.div className="dashboard-grid" variants={pageVariants} initial="initial" animate="in" exit="out">
            <div className="welcome-banner">
                <div className="banner-text">
                    <h1>Hello, {user.name}! 👋</h1>
                    <p>You have <strong>{activeAssignments} assignments</strong> due soon.</p>
                </div>
                <div className="banner-illustration"><FaCode size={80} opacity={0.2} /></div>
            </div>

            <div className="stats-row">
                <StatCard icon={<FaBookOpen />} title="Enrolled Courses" value={courses.length} color="#6366f1" />
                <StatCard icon={<FaCheckCircle />} title="Avg Attendance" value={`${avgAttendance}%`} color="#10b981" />
                <StatCard icon={<FaFire />} title="Streak" value="12 Days" color="#f59e0b" />
                <StatCard icon={<FaCode />} title="Total Assignments" value={assignments.length} color="#ec4899" />
            </div>

            <div className="main-split">
                <div className="card-section schedule-card">
                    <div className="card-header">
                        <h3><FaCalendarAlt /> Today's Schedule ({todayName})</h3>
                    </div>
                    <div className="timeline">
                        {todaysClasses.length === 0 ? (
                            <div className="no-data-text">
                                <p>No classes scheduled for today.</p>
                                <small>Enjoy your free time! 🎉</small>
                            </div>
                        ) : (
                            todaysClasses.map((cls, idx) => (
                                <div key={idx} className="timeline-item">
                                    <div className="time">{cls.start_time.substring(0, 5)}</div>
                                    <div className="details">
                                        <h4>{cls.course_name} <span className="code-badge">{cls.course_code}</span></h4>
                                        <small>{cls.room_number ? `Room: ${cls.room_number}` : 'Online'} • {cls.faculty_name || "Faculty"}</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card-section courses-card">
                    <div className="card-header"><h3>My Courses</h3></div>
                    <div className="course-list">
                        {courses.length === 0 ? (
                            <p className="no-data-text">No courses enrolled yet.</p>
                        ) : (
                            courses.map(c => (
                                <div key={c.id} className="course-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div className="course-details">
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{c.name}</h4>
                                        <small style={{ color: '#64748b', fontWeight: '500' }}>{c.code}</small>
                                    </div>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '10px',
                                        background: c.color || '#e0e7ff',
                                        color: '#6366f1',
                                        display: 'grid', placeItems: 'center',
                                        fontSize: '1.1rem'
                                    }}>
                                        <FaBookOpen />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// 2. TIMETABLE VIEW
const TimetableView = ({ schedule }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return (
        <motion.div className="assignments-container" variants={pageVariants} initial="initial" animate="in" exit="out">
            <div className="assignments-header"><h2>Weekly Timetable</h2></div>
            <div className="timetable-grid">
                {days.map(day => (
                    <div key={day} className="day-column">
                        <div className="day-header">{day}</div>
                        <div className="day-content">
                            {schedule.filter(s => s.day_of_week === day).length === 0 ? (
                                <div className="free-slot">No Classes</div>
                            ) : (
                                schedule.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time)).map((cls, idx) => (
                                    <div key={idx} className="class-card">
                                        <span className="time-badge">{cls.start_time.substring(0, 5)} - {cls.end_time.substring(0, 5)}</span>
                                        <h4>{cls.course_name}</h4>
                                        <small>{cls.room_number || "TBA"}</small>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

// 3. REAL-TIME CODING ARENA
const CodingArena = ({ selectedLanguage, setSelectedLanguage, code, setCode, isRunning, setIsRunning, compilerInput, setCompilerInput, compilerOutput, setCompilerOutput }) => {
    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
        if (e.target.value === 'python') setCode('print("Hello Campus Bridge!")');
        if (e.target.value === 'javascript') setCode('console.log("Hello Campus Bridge!");');
        if (e.target.value === 'java') setCode('public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}');
        if (e.target.value === 'cpp') setCode('#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello World";\n\treturn 0;\n}');
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setCompilerOutput("Compiling and executing...");
        try {
            const res = await axios.post("https://campus-bridge-backend-1.onrender.com/api/compiler/execute", {
                language: selectedLanguage,
                code: code,
                stdin: compilerInput
            });
            if (res.data.stderr) {
                setCompilerOutput(`ERROR:\n${res.data.stderr}`);
            } else {
                setCompilerOutput(res.data.output || "No output returned.");
            }
        } catch (error) {
            setCompilerOutput("Server Error: Could not connect to compiler.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <motion.div className="compiler-container" variants={pageVariants} initial="initial" animate="in" exit="out">
            <div className="compiler-header">
                <div className="lang-selector">
                    <select value={selectedLanguage} onChange={handleLanguageChange}>
                        <option value="javascript">JavaScript (Node 18)</option>
                        <option value="python">Python 3.10</option>
                        <option value="java">Java 15</option>
                        <option value="cpp">C++ (GCC)</option>
                    </select>
                </div>
                <div className="compiler-controls">
                    <button className="run-btn" onClick={handleRunCode} disabled={isRunning}>
                        {isRunning ? <FaExclamationCircle className="spin" /> : <FaPlay />}
                        {isRunning ? " Running..." : " Run Code"}
                    </button>
                </div>
            </div>
            <div className="editor-grid">
                <div className="editor-pane">
                    <div className="pane-label">Source Code</div>
                    <textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck="false" className="code-editor" />
                </div>
                <div className="io-pane">
                    <div className="input-section">
                        <div className="pane-label">STDIN (Input)</div>
                        <textarea value={compilerInput} onChange={(e) => setCompilerInput(e.target.value)} placeholder="Enter input for your program here..." />
                    </div>
                    <div className="output-section">
                        <div className="pane-label">STDOUT (Output)</div>
                        <pre className={isRunning ? "pulse" : ""}>{compilerOutput}</pre>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// 4. ATTENDANCE ANALYTICS
const AttendanceAnalytics = ({ attendanceData }) => (
    <motion.div className="analytics-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out">
        <div className="chart-header">
            <h2>Attendance Analytics</h2>
            <div className="legend"><span className="dot safe"></span> Safe (>75%) <span className="dot danger"></span> Low (&lt;75%)</div>
        </div>
        <div className="bars-container">
            {attendanceData.length === 0 ? <p>No attendance records found.</p> : attendanceData.map((sub, i) => {
                const percentage = sub.total === 0 ? 0 : Math.round((sub.attended / sub.total) * 100);
                const isLow = percentage < 75;
                return (
                    <div key={i} className="bar-group">
                        <div className="bar-labels"><span>{sub.subject}</span><span>{percentage}%</span></div>
                        <div className="bar-track">
                            <motion.div className={`bar-fill ${isLow ? 'low' : ''}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: i * 0.1 }} />
                        </div>
                        <small>{sub.attended}/{sub.total} Classes</small>
                    </div>
                )
            })}
        </div>
    </motion.div>
);

// 5. ASSIGNMENTS VIEW
const AssignmentsView = ({ assignments, setAssignments, user, code }) => {
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedAssignment) return;
        if (!file && !code) return alert("Please upload a file or write code in the compiler to submit.");

        setUploading(true);
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 20;
            setProgress(currentProgress);
            if (currentProgress >= 100) clearInterval(interval);
        }, 100);

        try {
            const formData = new FormData();
            formData.append("assignmentId", selectedAssignment.id);
            formData.append("studentId", user.id);
            if (file) formData.append("file", file);
            formData.append("code", code || "");

            await axios.post("https://campus-bridge-backend-1.onrender.com/api/student/submit", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setTimeout(() => {
                setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? { ...a, status: "submitted" } : a));
                setUploading(false);
                setSelectedAssignment(null);
                setFile(null);
                setProgress(0);
                alert("Assignment Submitted Successfully!");
            }, 800);
        } catch (error) {
            setUploading(false);
            alert("Failed to submit assignment.");
        }
    };

    return (
        <motion.div className="assignments-container" variants={pageVariants} initial="initial" animate="in" exit="out">
            <div className="assignments-header"><h2>Assignments</h2></div>
            <div className="assignments-grid">
                {assignments.length === 0 ? <p>No pending assignments!</p> : assignments.map(assign => (
                    <div key={assign.id} className={`assignment-card ${assign.status}`}>
                        <div className="assign-badge">{assign.type}</div>
                        <h3>{assign.title}</h3>
                        <p className="assign-sub">{assign.subject}</p>
                        <div className="assign-meta">
                            {assign.status === "graded" ? (
                                <span className="status-tag success" style={{ background: '#dcfce7', color: '#166534' }}>
                                    <FaCheckCircle /> Graded: <strong>{assign.score}/100</strong>
                                </span>
                            ) : assign.status === "submitted" ? (
                                <span className="status-tag success"><FaCheckCircle /> Submitted</span>
                            ) : (
                                <span className="status-tag pending"><FaClock /> Due: {assign.due ? new Date(assign.due).toLocaleDateString() : "TBA"}</span>
                            )}
                        </div>
                        {assign.status === "pending" && (
                            <button className="upload-trigger-btn" onClick={() => setSelectedAssignment(assign)}>Submit Work</button>
                        )}
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {selectedAssignment && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="upload-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                            <div className="modal-header">
                                <h3>Submit: {selectedAssignment.title}</h3>
                                <button className="close-btn" onClick={() => { setSelectedAssignment(null); setFile(null); }}><FaTimes /></button>
                            </div>
                            <div className={`drop-zone ${file ? 'active' : ''}`} onClick={() => fileInputRef.current.click()}>
                                <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                                {file ? (
                                    <div className="file-preview">
                                        <FaFileAlt size={40} color="#6366f1" />
                                        <div className="file-info"><span>{file.name}</span><small>{(file.size / 1024).toFixed(2)} KB</small></div>
                                        {!uploading && <button className="remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); }}><FaTrashAlt /></button>}
                                    </div>
                                ) : (
                                    <div className="upload-placeholder"><FaCloudUploadAlt size={50} /><p>Click to browse file</p></div>
                                )}
                            </div>
                            {uploading && <div className="upload-progress-container"><div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div><span>Uploading... {progress}%</span></div>}
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={() => setSelectedAssignment(null)} disabled={uploading}>Cancel</button>
                                <button className="confirm-upload-btn" onClick={handleUpload} disabled={!file || uploading}>{uploading ? "Uploading..." : "Upload Assignment"}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// 6. SETTINGS VIEW (UPDATED - FULLY EXPANDED)
const SettingsView = ({ settings, setSettings, user }) => {

    // Helper to toggle a boolean setting
    const toggleSetting = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings); // Optimistic UI update

        // Save to Backend
        try {
            await axios.put(`https://campus-bridge-backend-1.onrender.com/api/student/settings/${user.id}`, newSettings);
        } catch (err) {
            console.error("Failed to save setting");
        }
    };

    return (
        <motion.div className="settings-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out">
            <h2 style={{ marginBottom: '20px' }}>Settings</h2>

            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                {/* 1. APPEARANCE */}
                <div className="settings-card">
                    <div className="card-header-small" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1' }}>
                        <FaPalette /> <span>Appearance</span>
                    </div>

                    <div className="setting-item">
                        <div className="info"><h4>Dark Mode</h4><p>Switch between light and dark themes</p></div>
                        <button className={`toggle-switch ${settings.darkMode ? 'active' : ''}`} onClick={() => toggleSetting('darkMode')}>
                            <div className="toggle-knob"></div>
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="info"><h4>Compact View</h4><p>Reduce padding for more density</p></div>
                        <button className={`toggle-switch ${settings.compactView ? 'active' : ''}`} onClick={() => toggleSetting('compactView')}>
                            <div className="toggle-knob"></div>
                        </button>
                    </div>
                </div>

                {/* 2. NOTIFICATIONS */}
                <div className="settings-card">
                    <div className="card-header-small" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
                        <FaBell /> <span>Notifications</span>
                    </div>

                    <div className="setting-item">
                        <div className="info"><h4>Email Alerts</h4><p>Receive grades via email</p></div>
                        <button className={`toggle-switch ${settings.emailNotifs ? 'active' : ''}`} onClick={() => toggleSetting('emailNotifs')}>
                            <div className="toggle-knob"></div>
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="info"><h4>Assignment Reminders</h4><p>Get notified 24h before due date</p></div>
                        <button className={`toggle-switch ${settings.assignmentReminders ? 'active' : ''}`} onClick={() => toggleSetting('assignmentReminders')}>
                            <div className="toggle-knob"></div>
                        </button>
                    </div>
                </div>

                {/* 3. ACCOUNT & PRIVACY */}
                <div className="settings-card">
                    <div className="card-header-small" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
                        <FaUser /> <span>Account</span>
                    </div>

                    <div className="setting-input-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#64748b' }}>Full Name</label>
                        <input type="text" value={user.name} disabled style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f1f5f9' }} />
                    </div>

                    <div className="setting-item">
                        <div className="info"><h4>Public Profile</h4><p>Allow other students to see you</p></div>
                        <button className={`toggle-switch ${settings.publicProfile ? 'active' : ''}`} onClick={() => toggleSetting('publicProfile')}>
                            <div className="toggle-knob"></div>
                        </button>
                    </div>
                </div>

                {/* 4. SECURITY ZONE */}
                <div className="settings-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="card-header-small" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                        <FaShieldAlt /> <span>Security</span>
                    </div>

                    <div className="setting-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                            <FaLock /> Change Password
                        </button>
                        <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '6px', background: '#fef2f2', cursor: 'pointer' }}>
                            <FaSignOutAlt /> Sign out of all devices
                        </button>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

// 7. AI ASSISTANT
const ChatAssistant = ({ showAssistant, setShowAssistant, code, language }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{ role: 'bot', text: 'Hello! I am your AI coding assistant.' }]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, showAssistant]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        try {
            const res = await axios.post("https://campus-bridge-backend-1.onrender.com/api/compiler/analyze", {
                message: input, code: code, context: language
            });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: "Sorry, connection failed." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {showAssistant && (
                <motion.div className="ai-panel" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}>
                    <div className="ai-header">
                        <h3><FaRobot /> AI Help</h3>
                        <button onClick={() => setShowAssistant(false)}><FaTimes /></button>
                    </div>
                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`msg ${msg.role}`}>{msg.text}</div>
                        ))}
                        {isLoading && <div className="msg bot">Typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="ai-input">
                        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask about your code..." disabled={isLoading} />
                        <button onClick={handleSend} disabled={isLoading}><FaPlay /></button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/* ==================================================================================
   MAIN STUDENT DASHBOARD COMPONENT
   ================================================================================== */

const StudentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Core State
    const [user, setUser] = useState({ name: "Student", id: null });
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // UI & Settings State
    const [showAssistant, setShowAssistant] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // NEW: Expanded Settings State
    const [settings, setSettings] = useState({
        darkMode: false,
        compactView: false,
        emailNotifs: true,
        assignmentReminders: true,
        publicProfile: false
    });

    // Data State
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Compiler State
    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("// Write your solution here...\nconsole.log('Hello Campus Bridge!');");
    const [compilerInput, setCompilerInput] = useState("");
    const [compilerOutput, setCompilerOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    // --- INITIALIZATION ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        if (!location.state?.user || location.state.user.role !== "student") {
            const devUser = { id: 7, name: "Test Student", role: "student" }; // Default to 7 for testing
            setUser(devUser);
            setCourses([{ id: 1, name: 'React', code: 'CS101', color: '#e0e7ff' }]);
            fetchNotifications(devUser.id);
        } else {
            const currentUser = location.state.user;
            setUser(currentUser);
            fetchStudentData(currentUser.id);
            fetchNotifications(currentUser.id);
            fetchSchedule(currentUser.id);
        }

        const handleResize = () => {
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            clearInterval(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [location, navigate]);

    // --- API CALLS ---
    const fetchStudentData = async (studentId) => {
        try {
            const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/student/dashboard/${studentId}`);
            setCourses(res.data.courses || []);
            setAssignments(res.data.assignments || []);
            setAttendanceData(res.data.attendanceData || []);
        } catch (err) { console.error("Error fetching dashboard data:", err); }
    };

    const fetchNotifications = async (studentId) => {
        try {
            const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/notifications/${studentId}`);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) { console.error("Error fetching notifications:", err); }
    };

    const fetchSchedule = async (studentId) => {
        try {
            const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/student/schedule/${studentId}`);
            setSchedule(res.data || []);
        } catch (err) { console.error("Error fetching schedule:", err); }
    };

    const markNotificationRead = async (id) => {
        try {
            await axios.put(`https://campus-bridge-backend-1.onrender.com/api/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const clearAllNotifications = async () => {
        try {
            await axios.delete(`https://campus-bridge-backend-1.onrender.com/api/notifications/clear/${user.id}`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to clear notifications", err);
        }
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            navigate("/auth", { replace: true });
        }
    };

    // --- RENDER ---
    return (
        <div className={`app-container ${settings.darkMode ? "dark-theme" : "light-theme"}`} onClick={() => { if (notificationsOpen) setNotificationsOpen(false); }}>
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="brand"><FaUserGraduate className="brand-icon" /><span>Campus<span className="brand-highlight">Bridge</span></span></div>
                <nav className="nav-menu">
                    <NavItem icon={<FaChartLine />} label="Dashboard" active={activeMenu === "dashboard"} onClick={() => setActiveMenu("dashboard")} />
                    <NavItem icon={<FaCalendarAlt />} label="Timetable" active={activeMenu === "schedule"} onClick={() => setActiveMenu("schedule")} />
                    <NavItem icon={<FaCode />} label="Compiler" active={activeMenu === "compiler"} onClick={() => setActiveMenu("compiler")} />
                    <NavItem icon={<FaCheckCircle />} label="Attendance" active={activeMenu === "attendance"} onClick={() => setActiveMenu("attendance")} />
                    <NavItem icon={<FaBookOpen />} label="Assignments" active={activeMenu === "assignments"} onClick={() => setActiveMenu("assignments")} />
                    <NavItem icon={<FaCog />} label="Settings" active={activeMenu === "settings"} onClick={() => setActiveMenu("settings")} />
                </nav>
                <div className="sidebar-footer">
                    <div className="user-mini">
                        <div className="avatar">{user.name[0]}</div>
                        <div className="user-details"><span className="name">{user.name}</span><span className="role">Student</span></div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /></button>
                </div>
            </aside>

            <main className="main-viewport">
                <header className="top-bar">
                    <div className="breadcrumbs"><span>Student</span> / <span className="active">{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</span></div>
                    <div className="top-actions">
                        <div className="search-bar"><FaSearch /><input placeholder="Search..." /></div>

                        {/* Quick Toggle for Dark Mode */}
                        <button className="action-btn" onClick={() => setSettings(p => ({ ...p, darkMode: !p.darkMode }))}>
                            {settings.darkMode ? <FaSun /> : <FaMoon />}
                        </button>

                        <div className="notification-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button className="action-btn" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                                <FaBell />{unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                            </button>
                            {notificationsOpen && (
                                <motion.div className="dropdown-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="dd-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Notifications</span>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAllNotifications}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    <div className="dd-body">
                                        {notifications.length === 0 ? <div className="dd-item" style={{ justifyContent: 'center', color: '#888' }}>No new notifications</div> : notifications.map(notif => (
                                            <div key={notif.id} className={`dd-item ${!notif.is_read ? 'unread' : ''}`} onClick={() => markNotificationRead(notif.id)}>
                                                <div className={`dot ${notif.type === 'alert' ? 'danger' : 'safe'}`}></div>
                                                <div className="notif-content">
                                                    <span>{notif.message}</span>
                                                    <small style={{ fontSize: '0.7rem', color: '#888', display: 'block', marginTop: '2px' }}>
                                                        {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <button className={`ai-toggle ${showAssistant ? 'active' : ''}`} onClick={() => setShowAssistant(!showAssistant)}><FaRobot /> AI Help</button>
                    </div>
                </header>

                <div className="content-area">
                    <AnimatePresence mode="wait">
                        {activeMenu === "dashboard" && <DashboardHome user={user} currentTime={currentTime} courses={courses} assignments={assignments} attendanceData={attendanceData} schedule={schedule} />}
                        {activeMenu === "schedule" && <TimetableView schedule={schedule} />}
                        {activeMenu === "compiler" && (
                            <CodingArena
                                selectedLanguage={selectedLanguage}
                                setSelectedLanguage={setSelectedLanguage}
                                code={code}
                                setCode={setCode}
                                isRunning={isRunning}
                                setIsRunning={setIsRunning}
                                compilerInput={compilerInput}
                                setCompilerInput={setCompilerInput}
                                compilerOutput={compilerOutput}
                                setCompilerOutput={setCompilerOutput}
                            />
                        )}
                        {activeMenu === "attendance" && <AttendanceAnalytics attendanceData={attendanceData} />}
                        {activeMenu === "assignments" && <AssignmentsView assignments={assignments} setAssignments={setAssignments} user={user} code={code} />}
                        {/* PASS NEW SETTINGS PROP */}
                        {activeMenu === "settings" && <SettingsView settings={settings} setSettings={setSettings} user={user} />}
                    </AnimatePresence>
                </div>
            </main>

            <ChatAssistant
                showAssistant={showAssistant}
                setShowAssistant={setShowAssistant}
                code={code}
                language={selectedLanguage}
            />
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
        <span className="icon">{icon}</span><span className="label">{label}</span>
        {active && <motion.div layoutId="active-pill" className="active-pill" />}
    </div>
);

const StatCard = ({ icon, title, value, color }) => (
    <motion.div className="stat-card" whileHover={{ y: -5 }}>
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>{icon}</div>
        <div className="stat-info"><h3>{value}</h3><p>{title}</p></div>
    </motion.div>
);

export default StudentDashboard;