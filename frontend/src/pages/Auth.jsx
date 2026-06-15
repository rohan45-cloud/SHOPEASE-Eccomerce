import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearError } from "../store";
import { AuthLayout } from "../components/layout/Layout";
import toast from "react-hot-toast";

// ── Login ─────────────────────────────────────────────
export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => { if (user) navigate("/"); }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please fill all fields");
    const res = await dispatch(loginUser(form));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  return (
    <AuthLayout>
      <div className="card p-7">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
        <p className="text-sm text-gray-500 mb-6">Enter your credentials below</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">Forgot password?</Link>
            </div>
            <input type="password" className="input-field" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Admin: admin@shopease.com / admin123</p>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up free</Link>
      </p>
    </AuthLayout>
  );
}

// ── Register ──────────────────────────────────────────
export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  useEffect(() => { if (user) navigate("/"); }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Please fill all fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return toast.error("Passwords don't match");
    const res = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    }
  };

  return (
    <AuthLayout>
      <div className="card p-7">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
        <p className="text-sm text-gray-500 mb-6">Join thousands of happy shoppers</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input type="text" className="input-field" placeholder="John Doe"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password" className="input-field" placeholder="••••••••"
              value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
