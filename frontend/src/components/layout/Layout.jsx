import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="mt-16 border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-400">
        © 2024 ShopEase. Built with MERN Stack.
      </footer>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, token } = useSelector((s) => s.auth);
  if (!token && !user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-extrabold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">ShopEase</h1>
          <p className="text-gray-500 mt-1">Shop smarter, live better</p>
        </div>
        {children}
      </div>
    </div>
  );
}
