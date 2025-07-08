import { Route, Routes } from "react-router-dom";

import LoginForm from "../components/LoginForm";
import NotFound from "../components/NotFound";
import RegisterForm from "../components/RegisterForm";
import HomePage from "../pages/HomePage";
import AttendancePage from "../pages/Listpage/AttendanceList";
import StudentListPage from "../pages/Listpage/StudentList";
import TeacherListPage from "../pages/Listpage/TeacherList";
import AdminPage from "../pages/admin/AdminPage";
import AdminAttendancePage from "../pages/admin/attendance/AttendancePage";
import AttendancePageGrid from "../pages/admin/attendance/AttendancePageGrid";
import AttendanceReports from "../pages/admin/attendance/AttendanceReports";
import ClassesPage from "../pages/admin/class/ClassesPage";
import MessagesPage from "../pages/admin/messages/MessagesPage";
import NoticesPage from "../pages/admin/notices/noticespage";
import StudentPage from "../pages/admin/studentList/StudentPage";
import SubjectsPage from "../pages/admin/subject/SubjectsPage";
import TeacherPage from "../pages/admin/teacherList/TeacherPage";
import UpdateEmailPassword from "../pages/admin/updateEmaillPassword/UpdateEmailPassword";
import ImageDetail from "../pages/images/ImageDetail";
import ImageGallery from "../pages/images/ImageGallery";
import ImageUpload from "../pages/images/ImageUpload";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/students" element={<StudentListPage />} />
      <Route path="/teachers" element={<TeacherListPage />} />
      <Route path="/attendance" element={<AttendancePage />} />

      {/* Image Gallery Route */}
      <Route path="/images" element={<ImageGallery />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminPage />}>
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="studentList" element={<StudentPage />} />
        <Route path="teacherList" element={<TeacherPage />} />
        <Route path="updateEmailPassword" element={<UpdateEmailPassword />} />
        <Route path="class" element={<ClassesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="subject" element={<SubjectsPage />} />
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="attendance/grid" element={<AttendancePageGrid />} />
        <Route path="attendance/reports" element={<AttendanceReports />} />
        
        {/* Protected routes */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Protected routes */}

      <Route path="/upload" element={<ImageUpload />} />

      <Route path="/gallery" element={<ImageGallery />} />
      <Route path="/images/:id" element={<ImageDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
