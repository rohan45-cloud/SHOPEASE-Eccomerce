import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { Layout } from "../../components/layout/Layout";
import { format } from "date-fns";

const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-extrabold ${color}`}>{value ?? "—"}</p>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(r => setData(r.data.dashboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="btn-primary text-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn-secondary text-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${data?.totalRevenue?.toLocaleString()}`} icon="💰" color="text-green-600" />
        <StatCard label="Total Orders" value={data?.totalOrders} icon="📦" color="text-primary-600" />
        <StatCard label="Total Products" value={data?.totalProducts} icon="🛍️" color="text-orange-500" />
        <StatCard label="Total Users" value={data?.totalUsers} icon="👥" color="text-teal-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-600">View all</Link>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{order.user?.name} · {format(new Date(order.createdAt), "dd MMM")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "processing" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top Selling Products</h2>
            <Link to="/admin/products" className="text-sm text-primary-600">Manage</Link>
          </div>
          <div className="space-y-3">
            {data?.topProducts?.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={product.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sold} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
