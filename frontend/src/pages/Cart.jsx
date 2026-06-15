import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartItem, removeFromCart } from "../store";
import { Layout } from "../components/layout/Layout";
import toast from "react-hot-toast";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { if (user) dispatch(fetchCart()); }, [user, dispatch]);

  const handleQtyChange = async (productId, qty) => {
    await dispatch(updateCartItem({ productId, quantity: qty }));
  };

  const handleRemove = async (productId) => {
    await dispatch(removeFromCart(productId));
    toast.success("Item removed");
  };

  const shippingPrice = totalPrice > 499 ? 0 : 49;
  const taxPrice = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + shippingPrice + taxPrice;

  if (!user) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Please login to view your cart</h2>
        <Link to="/login" className="btn-primary mt-4 inline-block">Login</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({totalItems} items)</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity, price }) => product && (
              <div key={product._id} className="card p-4 flex gap-4">
                <Link to={`/products/${product._id}`} className="flex-shrink-0">
                  <img src={product.images?.[0]?.url} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 text-sm hover:text-primary-600 line-clamp-2">{product.name}</Link>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{(price * quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">₹{price.toLocaleString()} each</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => handleRemove(product._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => handleQtyChange(product._id, quantity - 1)} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 font-bold text-sm">−</button>
                    <span className="px-3 py-1.5 font-semibold text-sm border-x border-gray-200">{quantity}</span>
                    <button onClick={() => handleQtyChange(product._id, quantity + 1)} disabled={quantity >= product.stock} className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 font-bold text-sm disabled:opacity-40">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card p-5 h-fit sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({totalItems} items)</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={shippingPrice === 0 ? "text-green-600 font-medium" : ""}>{shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>₹{taxPrice.toLocaleString()}</span></div>
              {totalPrice <= 499 && <p className="text-xs text-primary-600">Add ₹{499 - totalPrice} more for free shipping!</p>}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base text-gray-900">
                <span>Total</span><span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={() => navigate("/checkout")} className="btn-primary w-full text-base py-3">
              Proceed to Checkout →
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3">← Continue Shopping</Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
