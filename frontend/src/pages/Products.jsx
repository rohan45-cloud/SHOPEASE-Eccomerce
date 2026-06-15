import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store";
import { Layout } from "../components/layout/Layout";
import ProductCard from "../components/product/ProductCard";

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports", "Beauty", "Toys", "Other"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function Products() {
  const dispatch = useDispatch();
  const { items: products, pagination, loading } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    minPrice: "", maxPrice: "",
    rating: "", sort: "newest",
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== "" && v !== 1));
    dispatch(fetchProducts(filters));
  }, [filters, dispatch]);

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.category || filters.keyword ? (filters.category || `"${filters.keyword}"`) : "All Products"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total || 0} products found</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm flex items-center gap-1.5 md:hidden">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
          <select className="input-field text-sm w-48" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`w-56 flex-shrink-0 space-y-5 ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
            <div className="space-y-1.5">
              <button onClick={() => setFilter("category", "")} className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!filters.category ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>All Categories</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilter("category", cat === filters.category ? "" : cat)}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${filters.category === cat ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
            <div className="space-y-2">
              <input type="number" className="input-field text-sm" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => setFilter("minPrice", e.target.value)} />
              <input type="number" className="input-field text-sm" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => setFilter("maxPrice", e.target.value)} />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Min Rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2, 1].map(r => (
                <button key={r} onClick={() => setFilter("rating", r === filters.rating ? "" : r)}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${filters.rating === r ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                  {"★".repeat(r)}{"☆".repeat(5 - r)} <span className="text-xs">& above</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setFilters({ keyword: "", category: "", minPrice: "", maxPrice: "", rating: "", sort: "newest", page: 1 })}
            className="w-full btn-secondary text-sm">Clear All Filters</button>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => <div key={i} className="card aspect-[3/4] animate-pulse bg-gray-100" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
                  <span className="text-sm text-gray-500">Page {filters.page} of {pagination.pages}</span>
                  <button disabled={filters.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
