import { configureStore, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "./api";

// ── Auth Slice ────────────────────────────────────────
const storedUser = JSON.parse(localStorage.getItem("user") || "null");
const storedToken = localStorage.getItem("token") || null;

export const loginUser = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try { const res = await api.post("/auth/login", data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Login failed"); }
});
export const registerUser = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try { const res = await api.post("/auth/register", data); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || "Registration failed"); }
});
export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try { const res = await api.get("/auth/me"); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: storedUser, token: storedToken, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null; state.token = null;
      localStorage.removeItem("token"); localStorage.removeItem("user");
    },
    setUser(state, action) { state.user = action.payload; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    const handleAuth = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    };
    b.addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(loginUser.fulfilled, handleAuth);
    b.addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(registerUser.fulfilled, handleAuth);
    b.addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload.user;
      localStorage.setItem("user", JSON.stringify(a.payload.user));
    });
  },
});
export const { logout, setUser, clearError } = authSlice.actions;

// ── Cart Slice ─────────────────────────────────────────
export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  const r = await api.get("/cart"); return r.data.cart;
});
export const addToCart = createAsyncThunk("cart/add", async (data) => {
  const r = await api.post("/cart", data); return r.data.cart;
});
export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, quantity }) => {
  const r = await api.put(`/cart/${productId}`, { quantity }); return r.data.cart;
});
export const removeFromCart = createAsyncThunk("cart/remove", async (productId) => {
  const r = await api.delete(`/cart/${productId}`); return r.data.cart;
});
export const clearCart = createAsyncThunk("cart/clear", async () => {
  await api.delete("/cart"); return { items: [], totalPrice: 0, totalItems: 0 };
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], totalPrice: 0, totalItems: 0, loading: false },
  reducers: {
    setLocalCart(state, action) { Object.assign(state, action.payload); },
  },
  extraReducers: (b) => {
    const setCart = (s, a) => { s.loading = false; if (a.payload) Object.assign(s, a.payload); };
    [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart].forEach(thunk => {
      b.addCase(thunk.pending, (s) => { s.loading = true; });
      b.addCase(thunk.fulfilled, setCart);
      b.addCase(thunk.rejected, (s) => { s.loading = false; });
    });
  },
});
export const { setLocalCart } = cartSlice.actions;

// ── Products Slice ─────────────────────────────────────
export const fetchProducts = createAsyncThunk("products/fetch", async (params) => {
  const r = await api.get("/products", { params }); return r.data;
});
export const fetchProduct = createAsyncThunk("products/fetchOne", async (id) => {
  const r = await api.get(`/products/${id}`); return r.data.product;
});

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], product: null, pagination: {}, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s) => { s.loading = true; });
    b.addCase(fetchProducts.fulfilled, (s, a) => {
      s.loading = false; s.items = a.payload.products; s.pagination = a.payload.pagination;
    });
    b.addCase(fetchProducts.rejected, (s) => { s.loading = false; });
    b.addCase(fetchProduct.pending, (s) => { s.loading = true; s.product = null; });
    b.addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; });
    b.addCase(fetchProduct.rejected, (s) => { s.loading = false; });
  },
});

// ── Store ──────────────────────────────────────────────
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    products: productsSlice.reducer,
  },
});
