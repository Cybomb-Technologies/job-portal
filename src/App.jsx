import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
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
import CandidatesPage from './pages/employer/CandidatesPage';
import CandidateDetailsPage from './pages/employer/CandidateDetailsPage';

// Profile Imports
import ProfileLayout from './pages/profile/ProfileLayout';
import ProfileDetails from './pages/profile/ProfileDetails';
import AppliedJobs from './pages/profile/AppliedJobs';
import ChangePassword from './pages/profile/ChangePassword';

// Info Pages
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import SalaryCalculator from './pages/SalaryCalculator';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/career-tips" element={<CareerTips />} />
          
          {/* Info Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/salary-calculator" element={<SalaryCalculator />} />
          
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
            path="/employer/candidates" 
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <CandidatesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer/candidates/:id" 
            element={
              <ProtectedRoute allowedRoles={['Employer']}>
                <CandidateDetailsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;