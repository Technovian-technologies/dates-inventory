import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/Dashboard";
import BatchesPage from "./pages/Batches";
import InventoryPage from "./pages/Inventory";
import ReportsPage from "./pages/Reports";
import SalesPage from "./pages/Sales";
import SettingsPage from "./pages/Settings";
import NotFoundPage from "./pages/NotFound";
import RegisterPage from "./pages/auth/Register";
import VerifyOTPPage from "./pages/auth/VerifyOTP";
import LoginPage from "./pages/auth/Login";

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/auth/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/auth/verify-otp"
        element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTPPage />}
      />
      <Route
        path="/auth/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth/login" replace />}
      />
      <Route
        path="/batches"
        element={isAuthenticated ? <BatchesPage /> : <Navigate to="/auth/login" replace />}
      />
      <Route
        path="/inventory"
        element={isAuthenticated ? <InventoryPage /> : <Navigate to="/auth/login" replace />}
      />
      <Route
        path="/reports"
        element={isAuthenticated ? <ReportsPage /> : <Navigate to="/auth/login" replace />}
      />
      <Route
        path="/sales"
        element={isAuthenticated ? <SalesPage /> : <Navigate to="/auth/login" replace />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth/login" replace />}
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
