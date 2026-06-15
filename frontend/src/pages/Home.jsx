import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store";
import { Layout } from "../components/layout/Layout";
import ProductCard from "../components/product/ProductCard";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports", "Beauty", "Toys"];
const CAT_ICONS = { Electronics: "⚡", Clothing: "👕", Books: "📚", "Home & Kitchen": "🏠", Sports: "🏃", Beauty: "✨", Toys: "🎮" };

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);

  useEffect(() => { dispatch(fetchProducts({ featured: true, limit: 8 })); }, [dispatch]);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-700 rounded-3xl p-8 md:p-14 mb-10 text-white flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">🎉 New Arrivals Every Week</span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Shop Smarter,<br />Live Better
          </h1>
          <p className="text-primary-100 text-lg mb-6">Discover thousands of products at unbeatable prices. Fast delivery, easy returns.</p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/products" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Shop Now →
            </Link>
            <Link to="/products?featured=true" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Featured Deals
            </Link>
          </div>
        </div>
        <div className="text-9xl hidden md:block">🛍️</div>
      </div>

      {/* Categories */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-5">Shop by Category</h2>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="card p-3 text-center hover:shadow-md hover:border-primary-200 transition-all group"
            >
              <div className="text-3xl mb-1.5">{CAT_ICONS[cat]}</div>
              <p className="text-xs font-medium text-gray-700 group-hover:text-primary-600 leading-tight">{cat}</p>
            </Link>
          ))}
          <Link to="/products" className="card p-3 text-center hover:shadow-md transition-all group">
            <div className="text-3xl mb-1.5">🔍</div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-primary-600">All</p>
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700">View all →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>

      {/* Banner */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        <div className="bg-gradient-to-r from-orange-500 to-accent-500 rounded-2xl p-6 text-white">
          <p className="text-sm font-semibold mb-1">Limited Time</p>
          <h3 className="text-2xl font-bold mb-2">Electronics Sale<br />Up to 50% Off</h3>
          <Link to="/products?category=Electronics" className="inline-block bg-white text-orange-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">Shop Now</Link>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl p-6 text-white">
          <p className="text-sm font-semibold mb-1">Free Shipping</p>
          <h3 className="text-2xl font-bold mb-2">On All Orders<br />Above ₹499</h3>
          <Link to="/products" className="inline-block bg-white text-teal-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors">Start Shopping</Link>
        </div>
      </div>
    </Layout>
  );
}
