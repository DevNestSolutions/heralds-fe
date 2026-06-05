import { useState, useEffect } from 'react';
import './index.css';
import './admin.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Admin() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [adminTab, setAdminTab] = useState('products'); // Default to products
    const [adminLoginData, setAdminLoginData] = useState({ username: '', password: '' });
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Form States
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        images: [''],
        customizable: false,
        isNew: false,
        isTrending: false,
        styles: []
    });

    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const prodRes = await fetch(`${API_BASE_URL}/api/products`);
            const prodData = await prodRes.json();
            setProducts(prodData);

            const catRes = await fetch(`${API_BASE_URL}/api/categories`);
            const catData = await catRes.json();
            setCategories(catData);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminLoginData.username === 'admin' && adminLoginData.password === 'heralds123') {
            setIsAdminLoggedIn(true);
        } else {
            alert('Invalid Credentials');
        }
    };

    // --- CATEGORY ACTIONS ---
    const addCategory = async () => {
        if (!newCategory) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: newCategory, action: 'add' })
        });
        const data = await res.json();
        if (data.success) {
            setCategories(data.categories);
            setNewCategory('');
        }
    };

    const deleteCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat}"?`)) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: cat, action: 'delete' })
        });
        const data = await res.json();
        if (data.success) setCategories(data.categories);
    };

    // --- PRODUCT ACTIONS ---
    const openAddModal = () => {
        setEditingProduct(null);
        setProductForm({
            name: '', price: '', category: categories[0] || '',
            description: '', images: [''], customizable: false,
            isNew: true, isTrending: false, styles: []
        });
        setShowProductModal(true);
    };

    const openEditModal = (p) => {
        setEditingProduct(p);
        setProductForm({ ...p });
        setShowProductModal(true);
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setProductForm({ ...productForm, images: [data.url] });
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (err) {
            console.error('Upload Error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        if (isUploading) return alert('Please wait for image to finish uploading');

        const action = editingProduct ? 'edit' : 'add';
        const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, product: productForm })
        });
        const data = await res.json();
        if (data.success) {
            setProducts(data.products);
            setShowProductModal(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', product: { id } })
        });
        const data = await res.json();
        if (data.success) setProducts(data.products);
    };

    if (!isAdminLoggedIn) {
        return (
            <main className="admin-login-page">
                <div className="admin-login-card">
                    <img src={new URL('./assets/logo.png', import.meta.url).href} alt="Heralds Logo" className="logo-img" style={{ height: '70px', marginBottom: '1.5rem', alignSelf: 'center' }} />
                    <h1>Heralds Staff</h1>
                    <p>Inventory Management Access</p>
                    <form onSubmit={handleAdminLogin}>
                        <div className="control-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                            <label>Manager ID</label>
                            <input required type="text" className="control-input" value={adminLoginData.username} onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })} />
                        </div>
                        <div className="control-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                            <label>Passcode</label>
                            <input required type="password" className="control-input" value={adminLoginData.password} onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })} />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login to Inventory</button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <div className="admin-layout">
            <nav className="glass-nav admin-nav-top">
                <a href="/" className="nav-logo">
                    <img src={new URL('./assets/logo.png', import.meta.url).href} alt="Heralds Logo" className="logo-img" />
                    <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: '#888' }}>ADMIN</span>
                </a>
                <div className="nav-links">
                    <button className={adminTab === 'products' ? 'active' : ''} onClick={() => setAdminTab('products')}>Products</button>
                    <button className={adminTab === 'categories' ? 'active' : ''} onClick={() => setAdminTab('categories')}>Categories</button>
                    <button onClick={() => setIsAdminLoggedIn(false)} className="btn-secondary small">Logout</button>
                </div>
            </nav>

            <main className="admin-main" style={{ paddingTop: '100px' }}>
                {adminTab === 'products' && (
                    <div className="admin-content-card">
                        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1>Product Catalog</h1>
                                <p>Manage your storefront items</p>
                            </div>
                            <button className="btn-primary" onClick={openAddModal}>+ New Product</button>
                        </div>

                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><img src={p.images[0]} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} alt="" /></td>
                                            <td><strong>{p.name}</strong></td>
                                            <td>{p.category}</td>
                                            <td>Rs. {p.price}</td>
                                            <td>
                                                {p.isNew && <span className="badge badge-new" style={{ position: 'static', marginRight: '5px' }}>New</span>}
                                                {p.isTrending && <span className="badge badge-trending" style={{ position: 'static' }}>Trending</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button className="btn-icon" onClick={() => openEditModal(p)}>✏️</button>
                                                    <button className="btn-icon delete" onClick={() => deleteProduct(p.id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {adminTab === 'categories' && (
                    <div className="admin-content-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h1>Category Management</h1>
                        <div className="add-category-box" style={{ display: 'flex', gap: '10px', margin: '2rem 0' }}>
                            <input
                                type="text"
                                className="control-input"
                                placeholder="New Category Name..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <button className="btn-primary" onClick={addCategory}>Add</button>
                        </div>
                        <div className="category-list">
                            {categories.map(cat => (
                                <div key={cat} className="category-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee' }}>
                                    <span style={{ fontWeight: 600 }}>{cat}</span>
                                    <button className="btn-icon delete" onClick={() => deleteCategory(cat)}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* PRODUCT MODAL */}
            {showProductModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <button className="btn-close-modal" onClick={() => setShowProductModal(false)}>&times;</button>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={saveProduct} style={{ marginTop: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="control-group">
                                    <label>Product Name</label>
                                    <input required className="control-input" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                                </div>
                                <div className="control-group">
                                    <label>Price (Rs.)</label>
                                    <input required type="number" className="control-input" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                                </div>
                                <div className="control-group">
                                    <label>Category</label>
                                    <select className="control-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="control-group">
                                    <label>Product Image</label>
                                    <div className="upload-container">
                                        {productForm.images[0] && (
                                            <img
                                                src={productForm.images[0]}
                                                alt="Preview"
                                                className="upload-preview-img"
                                            />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <input
                                                type="file"
                                                className="upload-input-file"
                                                onChange={handleImageUpload}
                                            />
                                            {isUploading && <small style={{ color: '#D4AF37' }}>Uploading to Cloudinary...</small>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="control-group" style={{ marginTop: '1.5rem' }}>
                                <label>Description</label>
                                <textarea className="control-textarea" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                            </div>


                            <div className="control-group" style={{ marginTop: '1.5rem' }}>
                                <label>Product Styles (comma separated)</label>
                                <input
                                    className="control-input"
                                    placeholder="e.g. Smart Casual, Minimal Style, Street Style"
                                    value={productForm.styles.join(', ')}
                                    onChange={(e) => setProductForm({ ...productForm, styles: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>

                            <div className="checkbox-row">
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={productForm.isNew} onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })} />
                                    New Arrival
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={productForm.isTrending} onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })} />
                                    Trending
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={productForm.customizable} onChange={(e) => setProductForm({ ...productForm, customizable: e.target.checked })} />
                                    AI Customizable
                                </label>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '15px' }}>
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}

export default Admin;
