import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { Layout } from "../../components/layout/Layout";
import { format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["processing", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_COLORS = {
  processing: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchOrders = () => {
    setLoading(true);
    api.get("/orders", { params: { status: filterStatus, page, limit: 15 } })
      .then(r => { setOrders(r.data.orders); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, page]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Status updated");
      fetchOrders();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select className="input-field w-44" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Orders</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Action"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i}><td colSpan={8} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order._id}`} className="text-primary-600 font-mono text-xs hover:underline">#{order._id.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-xs">{order.user?.name}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">₹{order.totalPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {order.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[order.orderStatus]}`}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-white text-gray-900 font-normal">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(order.createdAt), "dd MMM yy")}</td>
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order._id}`} className="text-xs text-primary-600 hover:text-primary-700 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Total: {pagination.total} orders</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">← Prev</button>
              <span className="text-xs text-gray-500 flex items-center px-2">{page} / {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
