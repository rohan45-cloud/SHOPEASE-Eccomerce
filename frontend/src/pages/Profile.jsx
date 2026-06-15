import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, setUser } from "../store";
import api from "../api";
import { Layout } from "../components/layout/Layout";
import ProductCard from "../components/product/ProductCard";
import toast from "react-hot-toast";

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState({ name: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, avatar: user.avatar || "" });
      setWishlist(user.wishlist || []);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      dispatch(setUser(data.user));
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update"); }
    finally { setLoading(false); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/auth/address/${id}`);
      dispatch(fetchMe());
      toast.success("Address removed");
    } catch { toast.error("Failed"); }
  };

  const TABS = [
    { id: "profile", label: "Profile" },
    { id: "addresses", label: "Addresses" },
    { id: "wishlist", label: "Wishlist" },
    { id: "security", label: "Security" },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>
        <div className="flex gap-1 mb-6 border-b border-gray-100">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="card p-6 max-w-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" className="input-field" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
                <input type="text" className="input-field" placeholder="https://..."
                  value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {tab === "addresses" && (
          <div className="max-w-lg space-y-3">
            {user?.addresses?.length === 0 && <p className="text-gray-500 text-sm">No saved addresses.</p>}
            {user?.addresses?.map(addr => (
              <div key={addr._id} className="card p-4 flex items-start justify-between gap-3">
                <div>
                  {addr.isDefault && <span className="badge-green mb-1 text-xs">Default</span>}
                  <p className="font-semibold text-sm text-gray-900">{addr.fullName} · {addr.phone}</p>
                  <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)}
                  className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">Remove</button>
              </div>
            ))}
          </div>
        )}

        {tab === "wishlist" && (
          <div>
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">❤️</p>
                <p className="text-gray-500">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {wishlist.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
            )}
          </div>
        )}

        {tab === "security" && (
          <div className="card p-6 max-w-md">
            <h2 className="font-bold text-gray-900 mb-4">Change Password</h2>
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </Layout>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmNew) return toast.error("New passwords don't match");
    if (form.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password updated!");
      setForm({ currentPassword: "", newPassword: "", confirmNew: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[["currentPassword","Current Password"],["newPassword","New Password"],["confirmNew","Confirm New Password"]].map(([field, label]) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form[field]} onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))} />
        </div>
      ))}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
