import { Route, Routes } from "react-router-dom";

import LoginForm from "../components/LoginForm";
import NotFound from "../components/NotFound";
import RegisterForm from "../components/RegisterForm";
import AboutPage from "../pages/AboutPage";
import ChairmanMessagePage from "../pages/ChairmanMessagePage";
import EventsPage from "../pages/EventsPage";
import GallaryPage from "../pages/GallaryPage/GallaryPage";
import HomePage from "../pages/HomePage";
import AttendancePage from "../pages/Listpage/AttendanceList";
import ResultsList from "../pages/Listpage/ResultsList";
import RoutinList from "../pages/Listpage/RoutinList";
import StudentListPage from "../pages/Listpage/StudentList";
import TeacherListPage from "../pages/Listpage/TeacherList";
import AdminPage from "../pages/admin/AdminPage";
import AdminAttendancePage from "../pages/admin/attendance/AttendancePage";
import AttendancePageGrid from "../pages/admin/attendance/AttendancePageGrid";
import AttendanceReports from "../pages/admin/attendance/AttendanceReports";
import ClassesPage from "../pages/admin/class/ClassesPage";
import AdminEventsPage from "../pages/admin/events/EventsPage";
import ExamPage from "../pages/admin/exams/ExamsPage";
import AdminImageGallery from "../pages/admin/gallery/AdminImageGallery";
import MessagesPage from "../pages/admin/messages/MessagesPage";
import NoticesPage from "../pages/admin/notices/noticespage";
import StudentResultEntry from "../pages/admin/results/StudentResultEntry";
import RoutinePage from "../pages/admin/routine/AdminRoutine";
import StudentPage from "../pages/admin/studentList/StudentPage";
import SubjectsPage from "../pages/admin/subject/SubjectsPage";
import TeacherPage from "../pages/admin/teacherList/TeacherPage";
import UpdateEmailPassword from "../pages/admin/updateEmaillPassword/UpdateEmailPassword";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chairman-message" element={<ChairmanMessagePage />} />
      <Route path="/students" element={<StudentListPage />} />
      <Route path="/teachers" element={<TeacherListPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/result" element={<ResultsList />} />
      <Route path="/routine" element={<RoutinList />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/gallery" element={<GallaryPage />} />
      <Route path="/imageGallary" element={<GallaryPage />} />
      <Route path="*" element={<NotFound />} />

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
        <Route path="gallery" element={<AdminImageGallery />} />
        <Route path="routine" element={<RoutinePage />} />
        <Route path="results" element={<StudentResultEntry />} />
        <Route path="exams" element={<ExamPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="*" element={<NotFound />} />
        {/* Protected routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
