import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanyProfile';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CareerTips from './pages/CareerTips';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import PostJob from './pages/employer/PostJob';
import MyJobs from './pages/employer/MyJobs';
import JobApplications from './pages/employer/JobApplications';
import ApplicationDetails from './pages/employer/ApplicationDetails';
import CandidatesPage from './pages/employer/CandidatesPage';
import CandidateDetailsPage from './pages/employer/CandidateDetailsPage';
import VerificationCenter from './pages/employer/VerificationCenter';
import EmployerProfileLayout from './pages/employer/EmployerProfileLayout';
import EmployerRecruiterInfo from './pages/employer/EmployerRecruiterInfo';
import EmployerCompanyInfo from './pages/employer/EmployerCompanyInfo';
import EmployerReviews from './pages/employer/EmployerReviews';
import EmployerWhyJoinUs from './pages/employer/EmployerWhyJoinUs';
import EmployerActivityLogs from './pages/employer/EmployerActivityLogs';
import TeamManagement from './pages/employer/TeamManagement';
import EmployerFollowers from './pages/employer/EmployerFollowers';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEmployers from './pages/admin/AdminEmployers';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminSupport from './pages/admin/AdminSupport';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminContacts from './pages/admin/AdminContacts';
import AdminCompanyUpdates from './pages/admin/AdminCompanyUpdates';

// Profile Imports
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileDetails from './pages/profile/ProfileDetails';
import AppliedJobs from './pages/profile/AppliedJobs';
import MyTickets from './pages/profile/MyTickets';
import FollowingCompanies from './pages/profile/FollowingCompanies';
import ChangePassword from './pages/profile/ChangePassword';

// Info Pages
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SalaryCalculator from './pages/SalaryCalculator';
import ReportIssue from './pages/ReportIssue';
import Pricing from './pages/Pricing';
import Cookies from './pages/Cookies';
import FraudAlert from './pages/FraudAlert';
import TrustSafety from './pages/TrustSafety';

import ProtectedRoute from './components/ProtectedRoute';

import ScrollToTop from './components/ScrollToTop';

import { ChatProvider } from './context/ChatContext';
import ChatUI from './pages/ChatUI';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ChatProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:slug" element={<CompanyProfile />} />
            <Route path="/job/:slug" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/career-tips" element={<CareerTips />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Public Profile Route */}
            <Route path="/profile/:slug" element={<CandidateDetailsPage isPublic />} />
            
            {/* Chat Route */}
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <ChatUI />
                </ProtectedRoute>
              } 
            />
            
            {/* Info Pages */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/salary-calculator" element={<SalaryCalculator />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/fraud-alert" element={<FraudAlert />} />
            <Route path="/trust-safety" element={<TrustSafety />} />
            
            {/* Enhanced Profile Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProfileDetails />} />
              <Route path="applications" element={<AppliedJobs />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="following" element={<FollowingCompanies />} />
              <Route path="password" element={<ChangePassword />} />
            </Route>
  
            {/* Redirect old routes if necessary */}
            <Route path="/my-applications" element={<Navigate to="/profile/applications" replace />} />
  
            {/* Employer Routes */}
            <Route 
              path="/employer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/post-job" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/edit-job/:id" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
              <Route 
              path="/employer/my-jobs" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <MyJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/applications/:jobId" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <JobApplications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/application/:id" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <ApplicationDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/candidates" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <CandidatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/candidates/:slug" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <CandidateDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/verification" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <VerificationCenter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/profile" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <EmployerProfileLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<EmployerRecruiterInfo />} />
              <Route path="company" element={<EmployerCompanyInfo />} />
              <Route path="why-join-us" element={<EmployerWhyJoinUs />} />
              <Route path="reviews" element={<EmployerReviews />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="followers" element={<EmployerFollowers />} />
              <Route path="activity-logs" element={<EmployerActivityLogs />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="password" element={<ChangePassword />} />
            </Route>
  
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']} loginPath="/admin/login">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="employers" element={<AdminEmployers />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="company-updates" element={<AdminCompanyUpdates />} />
              <Route path="verifications" element={<AdminVerifications />} />
              <Route path="messages" element={<AdminContacts />} /> {/* New Route */}
              <Route path="support" element={<AdminSupport />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Routes>
        </Layout>
      </ChatProvider>
    </Router>
  );
}

export default App;