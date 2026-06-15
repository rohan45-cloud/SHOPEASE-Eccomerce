import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { Layout } from "../components/layout/Layout";
import { formatDistanceToNow, format } from "date-fns";

const STATUS_COLORS = {
  processing: "badge-orange", confirmed: "badge-purple",
  shipped: "badge-purple", delivered: "badge-green", cancelled: "badge-red",
};

// ── My Orders List ────────────────────────────────────
export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <Link to="/products" className="btn-primary mt-3 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
                </div>
                <span className={STATUS_COLORS[order.orderStatus]}>{order.orderStatus}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {order.items.slice(0,3).map((item, i) => (
                    <img key={i} src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-white" />
                  ))}
                  {order.items.length > 3 && <div className="w-10 h-10 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">+{order.items.length - 3}</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-1">{order.items.map(i => i.name).join(", ")}</p>
                </div>
                <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

// ── Order Detail ──────────────────────────────────────
export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div></Layout>;
  if (!order) return <Layout><p className="text-center text-gray-500 py-24">Order not found</p></Layout>;

  const STEPS = ["processing", "confirmed", "shipped", "delivered"];
  const currentStep = STEPS.indexOf(order.orderStatus);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/orders" className="text-gray-400 hover:text-gray-600">← My Orders</Link>
        </div>

        <div className="card p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-sm text-gray-500">Placed {format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}</p>
            </div>
            <span className={STATUS_COLORS[order.orderStatus]}>{order.orderStatus}</span>
          </div>

          {/* Progress */}
          {order.orderStatus !== "cancelled" && (
            <div className="flex items-center gap-0 mb-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= currentStep ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-xs text-gray-500 mt-1 capitalize whitespace-nowrap">{s}</p>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentStep ? "bg-primary-600" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Price + Address */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Price Details</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Items</span><span>₹{order.itemsPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{order.taxPrice}</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5"><span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Delivery Address</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Payment</p>
            <p className="text-sm text-gray-500 capitalize">{order.paymentMethod} · {order.isPaid ? <span className="text-green-600">Paid</span> : <span className="text-orange-600">Pending</span>}</p>
          </div>
          {order.trackingNumber && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Tracking</p>
              <p className="text-sm font-mono font-semibold text-primary-600">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
