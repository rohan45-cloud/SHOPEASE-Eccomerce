import { useEffect, useState } from "react";
import api from "../../api";
import { Layout } from "../../components/layout/Layout";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    api.get("/admin/users", { params: { search } })
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Delete this user?")) return;
    try { await api.delete(`/admin/users/${userId}`); toast.success("User deleted"); fetchUsers(); }
    catch { toast.error("Failed"); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users ({users.length})</h1>
        <input className="input-field w-64" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{["User", "Email", "Role", "Joined", "Actions"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{u.name?.[0]?.toUpperCase()}</div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(u.createdAt), "dd MMM yyyy")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => handleRoleToggle(u._id, u.role)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                      {u.role === "admin" ? "Make User" : "Make Admin"}
                    </button>
                    <button onClick={() => handleDelete(u._id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
