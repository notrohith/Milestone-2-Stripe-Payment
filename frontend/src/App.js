import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'sonner';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignupWizard from './pages/SignupWizard';
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import MyRides from './pages/MyRides';
import CompleteProfile from './pages/CompleteProfile';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Driver
import DriverDashboard from './pages/driver/DriverDashboard';
import CreateRide from './pages/driver/CreateRide';
import Profile from './pages/Profile';
import RiderDashboard from './pages/rider/RiderDashboard';
import SearchRides from './pages/rider/SearchRides';
import RideDetail from './pages/rider/RideDetail';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: '#fff', minHeight: '100vh' }}>
          <h1>Application Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupWizard />} />
            <Route path="/signup-wizard" element={<SignupWizard />} /> {/* Alias if needed */}
            <Route path="/home" element={<Home />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/my-rides" element={<MyRides />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/create-ride" element={<CreateRide />} />
            <Route path="/rider/dashboard" element={<RiderDashboard />} />
            <Route path="/search" element={<SearchRides />} />
            <Route path="/rides/:id" element={<RideDetail />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="pending" element={<UserManagement filterStatus="Pending" />} />
              <Route path="drivers" element={<UserManagement filterRole="DRIVER" />} />
              <Route path="passengers" element={<UserManagement filterRole="PASSENGER" />} />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
