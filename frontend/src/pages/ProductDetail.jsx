import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProduct, addToCart } from "../store";
import api from "../api";
import { Layout } from "../components/layout/Layout";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const Stars = ({ rating, size = "w-4 h-4", interactive = false, onRate }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} onClick={() => interactive && onRate?.(s)}
        className={`${size} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"} ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { dispatch(fetchProduct(id)); }, [id, dispatch]);

  const handleAddToCart = async () => {
    if (!user) return toast.error("Please login to add to cart");
    try {
      await dispatch(addToCart({ productId: id, quantity: qty })).unwrap();
      toast.success("Added to cart!");
    } catch (err) { toast.error(err || "Failed"); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return toast.error("Please write a comment");
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success("Review submitted!");
      dispatch(fetchProduct(id));
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmittingReview(false); }
  };

  if (loading || !product) return (
    <Layout>
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4"><div className="h-8 bg-gray-100 rounded" /><div className="h-4 bg-gray-100 rounded w-2/3" /><div className="h-12 bg-gray-100 rounded" /></div>
      </div>
    </Layout>
  );

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-100">
            <img src={product.images?.[selectedImage]?.url || "https://via.placeholder.com/600"} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary-500" : "border-gray-100"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <span className="badge-purple">{product.category}</span>
            {product.stock > 0 ? <span className="badge-green">In Stock ({product.stock})</span> : <span className="badge-red">Out of Stock</span>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-400 mb-3">by <span className="text-gray-600 font-medium">{product.brand}</span></p>

          <div className="flex items-center gap-3 mb-4">
            <Stars rating={product.ratings} />
            <span className="text-sm font-semibold text-gray-700">{product.ratings}</span>
            <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">₹{product.price.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="bg-accent-500 text-white text-sm font-bold px-2 py-0.5 rounded-lg">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(t => <span key={t} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg">#{t}</span>)}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 font-bold">−</button>
                <span className="px-4 py-2.5 font-semibold text-gray-900 border-x border-gray-200">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 font-bold">+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1">Add to Cart 🛒</button>
            </div>
          )}

          <div className="card p-4 bg-gray-50 mt-4">
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div><div className="text-xl mb-1">🚚</div><p className="text-gray-600">Free Delivery<br/><span className="text-xs text-gray-400">On orders above ₹499</span></p></div>
              <div><div className="text-xl mb-1">↩️</div><p className="text-gray-600">Easy Returns<br/><span className="text-xs text-gray-400">7-day return policy</span></p></div>
              <div><div className="text-xl mb-1">🔒</div><p className="text-gray-600">Secure Payment<br/><span className="text-xs text-gray-400">100% protected</span></p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Review list */}
          <div className="space-y-4">
            {product.reviews?.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">No reviews yet. Be the first!</div>
            ) : product.reviews?.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{r.name?.[0]}</div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</p>
                  </div>
                  <Stars rating={r.rating} size="w-3.5 h-3.5" />
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Add review */}
          {user ? (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                  <Stars rating={reviewForm.rating} size="w-7 h-7" interactive onRate={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Review</label>
                  <textarea className="input-field resize-none" rows={4} placeholder="What did you think of this product?"
                    value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500 mb-3">Login to write a review</p>
              <Link to="/login" className="btn-primary">Login</Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
