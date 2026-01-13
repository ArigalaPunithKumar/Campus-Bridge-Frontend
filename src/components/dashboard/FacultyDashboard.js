import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
    FaSignOutAlt, FaUserCheck, FaBook, FaPlus, FaSave,
    FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaGraduationCap
} from "react-icons/fa";
import "./FacultyDashboard.css";

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

/* ==================================================================================
   HELPER FUNCTIONS FOR NOTIFICATIONS
   ================================================================================== */
const notifyStudent = async (studentId, type, message) => {
    try {
        await axios.post("https://campus-bridge-backend-1.onrender.com/api/notifications/create", {
            studentId, type, message
        });
    } catch (err) { console.error("Failed to notify student", err); }
};

const notifyBatch = async (notificationArray) => {
    try {
        await axios.post("https://campus-bridge-backend-1.onrender.com/api/notifications/batch", {
            notifications: notificationArray
        });
    } catch (err) { console.error("Failed to send batch notifications", err); }
};

/* ==================================================================================
   SUB-COMPONENTS (Views)
   ================================================================================== */

const CoursesView = ({ newCourse, setNewCourse, handleCreateCourse, courses }) => {
    const [enrollData, setEnrollData] = useState({ courseId: "", email: "" });

    const handleEnroll = async () => {
        if (!enrollData.courseId || !enrollData.email) return alert("Select a course and enter student email");
        try {
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/enroll", {
                courseId: enrollData.courseId,
                studentEmail: enrollData.email
            });
            alert("Student Enrolled Successfully!");

            // Note: Ideally, the backend enrollment endpoint should handle this notification
            // But we can try to notify if we knew the ID. For now, just success alert.

            setEnrollData({ ...enrollData, email: "" });
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to enroll student");
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="section-container">
            <motion.div variants={itemVariants} className="card-form">
                <div className="form-header">
                    <h3><FaPlus style={{ color: '#6366f1' }} /> Create New Course</h3>
                    <p>Expand your curriculum with new subjects.</p>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Course Name</label>
                        <input placeholder="e.g. Advanced AI" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Course Code</label>
                        <input placeholder="e.g. AI404" value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" onClick={handleCreateCourse} style={{ marginTop: 'auto' }}>
                        Create Course
                    </motion.button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card-form" style={{ borderLeft: '5px solid #10b981' }}>
                <div className="form-header">
                    <h3><FaUserCheck style={{ color: '#10b981' }} /> Enroll Student</h3>
                    <p>Grant students access to your materials.</p>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Select Course</label>
                        <select value={enrollData.courseId} onChange={e => setEnrollData({ ...enrollData, courseId: e.target.value })}>
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Student Email</label>
                        <input placeholder="student@university.edu" value={enrollData.email} onChange={e => setEnrollData({ ...enrollData, email: e.target.value })} />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="submit-btn" onClick={handleEnroll} style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                        Enroll Student
                    </motion.button>
                </div>
            </motion.div>

            <h3 className="section-title" style={{ marginBottom: '1rem', color: '#1e293b' }}>Active Courses</h3>
            <div className="courses-grid-view">
                {courses.map(c => (
                    <motion.div key={c.id} variants={itemVariants} className="course-card">
                        <div className="course-header">
                            <h4>{c.course_name}</h4>
                            <span className="code-badge">{c.course_code}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const AssignmentsView = ({ newAssignment, setNewAssignment, handlePostAssignment, courses }) => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="section-container">
        <div className="card-form">
            <div className="form-header">
                <h3><FaClipboardList style={{ color: '#f59e0b' }} /> Post Assignment</h3>
                <p>Create tasks for your students to complete.</p>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Title</label>
                <input placeholder="Assignment Title" value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} />
            </div>
            <div className="form-row" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label>Subject</label>
                    <input placeholder="Topic" value={newAssignment.subject} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Course</label>
                    <select value={newAssignment.courseId} onChange={e => setNewAssignment({ ...newAssignment, courseId: e.target.value })}>
                        <option value="">Select Course...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" value={newAssignment.due} onChange={e => setNewAssignment({ ...newAssignment, due: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Type</label>
                    <select value={newAssignment.type} onChange={e => setNewAssignment({ ...newAssignment, type: e.target.value })}>
                        <option value="Code">Coding Task</option>
                        <option value="Theory">Theory / Upload</option>
                    </select>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="submit-btn" onClick={handlePostAssignment} style={{ marginTop: 'auto' }}>
                    Post Assignment
                </motion.button>
            </div>
        </div>
    </motion.div>
);

const AttendanceView = ({ courses, selectedCourseId, setSelectedCourseId, handleSaveAttendance, students, toggleAttendance }) => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="section-container">
        <div className="card-form">
            <div className="form-row">
                <div className="form-group">
                    <label>Select Course</label>
                    <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} disabled />
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="save-btn" onClick={handleSaveAttendance} style={{ marginTop: 'auto' }}>
                    <FaSave /> Save Register
                </motion.button>
            </div>
        </div>

        <div className="card-form table-container" style={{ padding: '1rem' }}>
            <table className="dashboard-table">
                <thead>
                    <tr><th>Student</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td><strong>{s.name}</strong></td>
                            <td><span className={`status-badge ${s.attendance.toLowerCase()}`}>{s.attendance}</span></td>
                            <td>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => toggleAttendance(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                                    {s.attendance === 'Present' ? <FaCheckCircle color="#10b981" /> : <FaTimesCircle color="#ef4444" />}
                                </motion.button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </motion.div>
);

const GradingView = ({ submissions, handleGradeSubmission, refreshSubmissions }) => {
    const [grades, setGrades] = useState({});

    const handleScoreChange = (id, val) => setGrades(prev => ({ ...prev, [id]: val }));
    const submitGrade = (id) => handleGradeSubmission(id, grades[id]);

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="section-container">
            <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3><FaGraduationCap style={{ color: '#a855f7' }} /> Grading</h3>
                <motion.button whileHover={{ scale: 1.05 }} onClick={refreshSubmissions} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}>Refresh</motion.button>
            </div>

            <div className="card-form" style={{ padding: '1rem' }}>
                <table className="dashboard-table">
                    <thead><tr><th>Student</th><th>Assignment</th><th>File</th><th>Score</th><th>Action</th></tr></thead>
                    <tbody>
                        {submissions.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center' }}>No pending submissions.</td></tr> : submissions.map(sub => (
                            <tr key={sub.id}>
                                <td><strong>{sub.studentName}</strong></td>
                                <td>{sub.title}</td>
                                <td><a href={sub.file} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: '600' }}>View Work</a></td>
                                <td>
                                    {sub.status === 'graded' ? <span className="status-badge graded">{sub.score}</span> :
                                        <input type="number" min="0" max="100" style={{ width: '60px', padding: '5px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={grades[sub.id] || ''} onChange={e => handleScoreChange(sub.id, e.target.value)} />}
                                </td>
                                <td>
                                    {sub.status === 'graded' ? <FaCheckCircle color="#10b981" /> :
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => submitGrade(sub.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Grade</motion.button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

const ScheduleView = ({ newClass, setNewClass, courses, handleAddClass, schedule }) => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="section-container">
        <div className="card-form">
            <div className="form-header"><h3><FaCalendarAlt style={{ color: '#3b82f6' }} /> Add Class</h3></div>
            <div className="form-row">
                <div className="form-group"><label>Course</label><select value={newClass.courseId} onChange={e => setNewClass({ ...newClass, courseId: e.target.value })}>{courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}</select></div>
                <div className="form-group"><label>Day</label><select value={newClass.day} onChange={e => setNewClass({ ...newClass, day: e.target.value })}>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="form-group"><label>Time</label><div style={{ display: 'flex', gap: '10px' }}><input type="time" value={newClass.startTime} onChange={e => setNewClass({ ...newClass, startTime: e.target.value })} /><input type="time" value={newClass.endTime} onChange={e => setNewClass({ ...newClass, endTime: e.target.value })} /></div></div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary" onClick={handleAddClass} style={{ marginTop: 'auto' }}>Add</motion.button>
            </div>
        </div>
        <div className="schedule-list">
            {schedule.map((s, i) => (
                <motion.div key={i} variants={itemVariants} className="schedule-item">
                    <div className="time-col"><span className="day">{s.day_of_week.substring(0, 3)}</span><span className="time">{s.start_time.substring(0, 5)}</span></div>
                    <div className="info-col"><h4>{s.course_name}</h4><div className="meta"><span><FaClock /> {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span><span><FaMapMarkerAlt /> {s.room_number}</span></div></div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

/* ==================================================================================
   MAIN DASHBOARD
   ================================================================================== */
const FacultyDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [faculty, setFaculty] = useState({ id: null, name: "Loading..." });
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [stats, setStats] = useState({ courses: 0, students: 0, pending: 0 });
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [newCourse, setNewCourse] = useState({ name: "", code: "" });
    const [newAssignment, setNewAssignment] = useState({ title: "", subject: "", due: "", type: "Code", courseId: "" });
    const [newClass, setNewClass] = useState({ courseId: "", day: "Monday", startTime: "", endTime: "", room: "" });

    // Init & Fetching Logic
    useEffect(() => {
        if (!location.state?.user || location.state.user.role !== "faculty") {
            const devUser = { id: 1, name: "Dr. Faculty", role: "faculty" };
            setFaculty(devUser);
            fetchDashboardData(devUser.id);
        } else {
            setFaculty(location.state.user);
            fetchDashboardData(location.state.user.id);
        }
    }, [location, navigate]);

    useEffect(() => { if (activeMenu === 'attendance' && selectedCourseId) fetchStudents(selectedCourseId); }, [activeMenu, selectedCourseId]);
    useEffect(() => { if (activeMenu === 'grading') fetchSubmissions(); }, [activeMenu]);

    const fetchDashboardData = async (fid) => {
        try {
            const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/faculty/dashboard/${fid}`);
            setStats(res.data.stats);
            setCourses(res.data.courses);
            if (res.data.courses.length > 0 && !selectedCourseId) setSelectedCourseId(res.data.courses[0].id);
        } catch (err) { console.error(err); }
    };
    const fetchStudents = async (cid) => { try { const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/faculty/students/${cid}`); setStudents(res.data); } catch (e) { } };
    const fetchSchedule = async () => { try { const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/faculty/schedule/${faculty.id}`); setSchedule(res.data); } catch (e) { } };
    const fetchSubmissions = async () => { try { const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/faculty/submissions/${faculty.id}`); setSubmissions(res.data); } catch (e) { } };

    // --- HELPER TO GET ALL STUDENTS (For New Course Announcements) ---
    // Note: Ensure your backend has a route to fetch all students, or use a specific subset
    const fetchAllStudents = async () => {
        try {
            const res = await axios.get("https://campus-bridge-backend-1.onrender.com/api/faculty/students/all");
            return res.data;
        } catch (e) {
            console.log("Could not fetch student list for broadcast");
            return [];
        }
    };

    // --- UPDATED ACTION HANDLERS WITH NOTIFICATIONS ---

    const handleCreateCourse = async () => {
        try {
            // 1. Create the Course
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/create-course", {
                facultyId: faculty.id,
                courseName: newCourse.name,
                courseCode: newCourse.code
            });

            // 2. Notify All Students about the new course
            // We fetch all students to send a broadcast
            const allStudents = await fetchAllStudents();

            if (allStudents.length > 0) {
                const notifications = allStudents.map(s => ({
                    studentId: s.id,
                    type: "info",
                    message: `New Course Available: ${newCourse.name} (${newCourse.code})`
                }));
                await notifyBatch(notifications);
            }

            alert("Course Created & Notification Broadcasted!");
            fetchDashboardData(faculty.id);
            setNewCourse({ name: '', code: '' });
        } catch (err) {
            console.error(err);
            alert("Error creating course");
        }
    };

    const handlePostAssignment = async () => {
        if (!newAssignment.courseId) return alert("Select a course");

        try {
            // 1. Post Assignment
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/assignments", newAssignment);

            // 2. Fetch students specifically for THIS course
            const res = await axios.get(`https://campus-bridge-backend-1.onrender.com/api/faculty/students/${newAssignment.courseId}`);
            const courseStudents = res.data;

            // 3. Send Notifications
            if (courseStudents.length > 0) {
                const notifications = courseStudents.map(s => ({
                    studentId: s.id, // Ensure your backend sends 'id'
                    type: "alert",
                    message: `New Assignment: ${newAssignment.title} for ${newAssignment.subject}`
                }));
                await notifyBatch(notifications);
            }
            alert("Assignment Posted & Students Notified!");
            setNewAssignment({ title: '', subject: '', due: '', type: 'Code', courseId: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to post assignment");
        }
    };

    const handleSaveAttendance = async () => {
        try {
            // 1. Save Attendance
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/attendance", {
                courseId: selectedCourseId,
                date: new Date().toISOString().split('T')[0],
                students
            });

            // 2. Notify Students (Alert if absent, Info if present)
            const notifications = students.map(s => ({
                studentId: s.id,
                type: s.attendance === "Absent" ? "alert" : "info",
                message: `Attendance marked for today: You are ${s.attendance}`
            }));
            await notifyBatch(notifications);

            alert("Attendance Saved & Notifications Sent!");
        } catch (err) {
            console.error(err);
            alert("Error saving attendance");
        }
    };

    const toggleAttendance = (id) => setStudents(prev => prev.map(s => s.id === id ? { ...s, attendance: s.attendance === "Present" ? "Absent" : "Present" } : s));

    const handleAddClass = async () => {
        await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/schedule", { ...newClass, facultyId: faculty.id });
        alert("Class Added!");
        fetchSchedule();
    };

    const handleGradeSubmission = async (sid, score) => {
        try {
            // 1. Save Grade
            await axios.post("https://campus-bridge-backend-1.onrender.com/api/faculty/grade", { submissionId: sid, score });

            // 2. Find the student ID from the submission list
            // IMPORTANT: 'submissions' state must contain studentId (from backend join query)
            const submission = submissions.find(s => s.id === sid);

            if (submission && submission.studentId) {
                await notifyStudent(
                    submission.studentId,
                    "success",
                    `Grade Posted: You scored ${score}/100 in ${submission.title}`
                );
                alert("Graded & Notification Sent!");
            } else {
                alert("Graded, but could not notify student (ID missing in submission data).");
            }

            fetchSubmissions();
        } catch (err) {
            console.error(err);
            alert("Error saving grade");
        }
    };

    return (
        <div className="faculty-dashboard-container">
            <aside className="faculty-sidebar">
                <div className="logo"><FaChalkboardTeacher /> Faculty<span className="brand-highlight">Portal</span></div>
                <div className="sidebar-menu">
                    <div className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}><FaClipboardList /> Dashboard</div>
                    <div className={`menu-item ${activeMenu === 'courses' ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}><FaBook /> Courses</div>
                    <div className={`menu-item ${activeMenu === 'assignments' ? 'active' : ''}`} onClick={() => setActiveMenu('assignments')}><FaPlus /> Assignments</div>
                    <div className={`menu-item ${activeMenu === 'attendance' ? 'active' : ''}`} onClick={() => setActiveMenu('attendance')}><FaUserCheck /> Attendance</div>
                    <div className={`menu-item ${activeMenu === 'grading' ? 'active' : ''}`} onClick={() => setActiveMenu('grading')}><FaGraduationCap /> Grading</div>
                    <div className={`menu-item ${activeMenu === 'schedule' ? 'active' : ''}`} onClick={() => setActiveMenu('schedule')}><FaCalendarAlt /> Schedule</div>
                    <div className="menu-item logout" onClick={() => navigate("/auth")}><FaSignOutAlt /> Logout</div>
                </div>
            </aside>
            <main className="faculty-main">
                <header className="faculty-header">
                    <div><h2>Hello, {faculty.name}</h2><p className="subtitle">Ready to teach today?</p></div>
                    <div className="avatar">{faculty.name[0]}</div>
                </header>
                <AnimatePresence mode="wait">
                    {activeMenu === 'dashboard' && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="stats-grid">
                            <div className="stat-card"><div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}><FaBook /></div><div><h3>{stats.courses}</h3><p>Courses</p></div></div>
                            <div className="stat-card"><div className="stat-icon" style={{ background: '#dcfce7', color: '#10b981' }}><FaUsers /></div><div><h3>{stats.students}</h3><p>Students</p></div></div>
                            <div className="stat-card"><div className="stat-icon" style={{ background: '#ffedd5', color: '#f59e0b' }}><FaClipboardList /></div><div><h3>{stats.pending}</h3><p>Pending Grades</p></div></div>
                        </motion.div>
                    )}
                    {activeMenu === 'courses' && <CoursesView {...{ newCourse, setNewCourse, handleCreateCourse, courses }} />}
                    {activeMenu === 'assignments' && <AssignmentsView {...{ newAssignment, setNewAssignment, handlePostAssignment, courses }} />}
                    {activeMenu === 'attendance' && <AttendanceView {...{ courses, selectedCourseId, setSelectedCourseId, handleSaveAttendance, students, toggleAttendance }} />}
                    {activeMenu === 'grading' && <GradingView {...{ submissions, handleGradeSubmission, refreshSubmissions: fetchSubmissions }} />}
                    {activeMenu === 'schedule' && <ScheduleView {...{ newClass, setNewClass, courses, handleAddClass, schedule }} />}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default FacultyDashboard;