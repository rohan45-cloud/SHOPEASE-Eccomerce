import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, fetchMe } from "../store";
import api from "../api";
import { Layout } from "../components/layout/Layout";
import toast from "react-hot-toast";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [step, setStep] = useState(1); // 1=address, 2=payment
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: "", phone: "", street: "", city: "", state: "", pincode: "" });
  const [showNewAddress, setShowNewAddress] = useState(false);

  const shippingPrice = totalPrice > 499 ? 0 : 49;
  const taxPrice = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + shippingPrice + taxPrice;

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setSelectedAddress(def);
    }
  }, [user]);

  const handleSaveAddress = async () => {
    const { fullName, phone, street, city, state, pincode } = newAddress;
    if (!fullName || !phone || !street || !city || !state || !pincode)
      return toast.error("Please fill all address fields");
    try {
      await api.post("/auth/address", newAddress);
      dispatch(fetchMe());
      setShowNewAddress(false);
      toast.success("Address saved");
    } catch { toast.error("Failed to save address"); }
  };

  const handleRazorpay = async (orderId) => {
    const { data } = await api.post("/orders/razorpay", { amount: grandTotal });
    return new Promise((resolve, reject) => {
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "ShopEase",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await api.post(`/orders/${orderId}/pay/razorpay`, response);
            resolve();
          } catch { reject(new Error("Payment verification failed")); }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error("Please select a delivery address");
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        shippingAddress: selectedAddress,
        paymentMethod,
      });

      if (paymentMethod === "razorpay") {
        await handleRazorpay(data.order._id);
        toast.success("Payment successful! Order placed 🎉");
      } else {
        toast.success("Order placed! Cash on delivery 🎉");
      }
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || "Order failed");
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {["Delivery Address", "Payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-500"}`}>{step > i + 1 ? "✓" : i + 1}</div>
            <span className={`text-sm font-medium ${step === i + 1 ? "text-gray-900" : "text-gray-400"}`}>{s}</span>
            {i < 1 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Select Delivery Address</h2>
              <div className="space-y-3 mb-4">
                {user?.addresses?.map(addr => (
                  <button key={addr._id} onClick={() => setSelectedAddress(addr)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${selectedAddress?._id === addr._id ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <p className="font-semibold text-sm text-gray-900">{addr.fullName} · {addr.phone}</p>
                    <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.isDefault && <span className="text-xs text-primary-600 font-medium">Default</span>}
                  </button>
                ))}
              </div>

              {showNewAddress ? (
                <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <h3 className="font-medium text-gray-900 text-sm">New Address</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[["fullName","Full Name"],["phone","Phone"],["street","Street Address"],["city","City"],["state","State"],["pincode","Pincode"]].map(([field, label]) => (
                      <input key={field} className={`input-field text-sm ${field === "street" ? "col-span-2" : ""}`} placeholder={label}
                        value={newAddress[field]} onChange={(e) => setNewAddress(f => ({ ...f, [field]: e.target.value }))} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveAddress} className="btn-primary text-sm">Save Address</button>
                    <button onClick={() => setShowNewAddress(false)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowNewAddress(true)} className="btn-secondary text-sm w-full">+ Add New Address</button>
              )}

              <button onClick={() => { if (!selectedAddress) return toast.error("Select an address"); setStep(2); }}
                className="btn-primary w-full mt-4">Continue to Payment →</button>
            </div>
          )}

          {step === 2 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                {[{ id: "razorpay", label: "Razorpay", sub: "Credit/Debit Card, UPI, NetBanking", icon: "💳" },
                  { id: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "💵" }]
                  .map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors flex items-center gap-3 ${paymentMethod === m.id ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <span className="text-2xl">{m.icon}</span>
                      <div><p className="font-semibold text-sm text-gray-900">{m.label}</p><p className="text-xs text-gray-500">{m.sub}</p></div>
                      {paymentMethod === m.id && <span className="ml-auto text-primary-600">✓</span>}
                    </button>
                  ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button onClick={handlePlaceOrder} className="btn-primary flex-1" disabled={loading}>
                  {loading ? "Processing..." : `Place Order · ₹${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="card p-5 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map(({ product, quantity, price }) => product && (
              <div key={product._id} className="flex gap-2 text-sm">
                <img src={product.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-gray-900 line-clamp-1 text-xs font-medium">{product.name}</p><p className="text-gray-500 text-xs">×{quantity}</p></div>
                <span className="font-semibold text-xs">₹{(price * quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shippingPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingPrice}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{taxPrice}</span></div>
            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
