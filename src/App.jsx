import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, useParams } from 'react-router-dom';
import './index.css';

const HOME_CAROUSEL_LINES = [
  { name: 'Heralds Originals', image: 'https://cdn.pixabay.com/photo/2023/05/10/05/56/groom-7983097_1280.jpg' },
  { name: 'Signature Collection', image: 'https://cdn.pixabay.com/photo/2017/11/14/06/15/shirt-2947548_1280.jpg' },
  { name: 'Premium Line', image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?auto=format&fit=crop&q=80&w=800' },
  { name: 'Essentials by Heralds', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=800' },
  { name: 'Elite Wear', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800' }
];

const MAIN_CATEGORIES = ['All', 'T-Shirts', 'Shirts', 'Hoodies', 'Pants', 'Shorts'];
const STYLE_FILTERS = ['Street Style', 'Casual Wear', 'Everyday Fits', 'Smart Casual', 'Minimal Style', 'Trending Now', 'New Arrivals'];

const SHIRT_COLORS = [
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Black', hex: '#222222' },
  { label: 'Navy Blue', hex: '#1C2841' },
  { label: 'Burgundy', hex: '#800020' },
  { label: 'Olive', hex: '#556B2F' }
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Home Screen Carousel State
  const [activeSlide, setActiveSlide] = useState(0);

  // Products Tab Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [activeStyle, setActiveStyle] = useState('');
  const [wishlist, setWishlist] = useState([]);

  // --- AI CUSTOMIZER STATE ---
  const [customConfig, setCustomConfig] = useState({
    sleeveType: 'Short Sleeve',
    collarType: 'Normal Collar',
    fitType: 'Regular Fit',
    pocket: 'Without Pocket',
    shirtColor: '#FFFFFF',
    shirtColorName: 'White',
    enableText: false,
    customText: '',
    extraNotes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ name: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(['All', ...data]))
      .catch(err => console.error('Failed to fetch categories:', err));

    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  }, []);


  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Home Screen Auto Carousel Refined
  const carouselOffset = 45; // percentage width of one slide

  useEffect(() => {
    if (location.pathname !== '/') return;
    const timer = setInterval(() => {
      setActiveSlide(prev => {
        const totalLines = HOME_CAROUSEL_LINES.length;
        const totalWidth = totalLines * carouselOffset;
        const maxOffset = totalWidth - 100;
        const currentOffset = prev * carouselOffset;

        if (currentOffset >= maxOffset) return 0;
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [location.pathname]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (activeCategory !== 'All' && product.category !== activeCategory) return false;
      if (activeStyle) {
        if (activeStyle === 'New Arrivals') {
          if (!product.isNew) return false;
        } else if (activeStyle === 'Trending Now') {
          if (!product.isTrending) return false;
        } else {
          if (!product.styles || !product.styles.includes(activeStyle)) return false;
        }
      }
      return true;
    });
  }, [products, searchTerm, activeCategory, activeStyle]);


  // Navigation Helpers
  const navToHome = () => { navigate('/'); window.scrollTo(0, 0); };
  const navToProducts = (prepCategory = 'All') => {
    setActiveCategory(prepCategory);
    setActiveStyle('');
    setSearchTerm('');
    navigate('/products');
    window.scrollTo(0, 0);
  };
  const navToCustomizable = () => {
    navigate('/customizable');
    setGeneratedImageUrl(null);
    window.scrollTo(0, 0);
  };
  const showDetails = (product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo(0, 0);
  };

  const navToAbout = () => { navigate('/about'); window.scrollTo(0, 0); };
  const navToContact = () => { navigate('/contact'); window.scrollTo(0, 0); };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]);
  };

  const handleOrderWhatsApp = (productName) => {
    const text = encodeURIComponent(`Hi Heralds Clothing! I would like to order the ${productName}.`);
    window.open(`https://wa.me/94705700616?text=${text}`, '_blank');
  };

  // --- AI GENERATION LOGIC ---
  const handleGeneratePreview = async () => {
    if (isGenerating) return; // Prevent multiple requests

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-shirt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: customConfig })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'AI Generation Failed');
      }

      // Blob-based rendering
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImageUrl(imageUrl);

    } catch (err) {
      console.error(err);
      alert(`AI Generation Failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProceedOrder = () => {
    if (!generatedImageUrl) {
      alert('Please generate a preview first!');
      return;
    }
    setShowOrderForm(true);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        orderDetails,
        configuration: customConfig,
        prompt: `${customConfig.shirtColorName || customConfig.shirtColor} ${customConfig.fitType} shirt, ${customConfig.sleeveType}, ${customConfig.collarType}, ${customConfig.pocket}, minimal streetwear fashion, centered front-facing t-shirt mockup, realistic clothing product photography, studio lighting, clean white background, high detail` + (customConfig.enableText ? `, with text "${customConfig.customText}" printed on chest` : ""),
        imageUrl: generatedImageUrl
      };

      const res = await fetch(`${API_BASE_URL}/api/custom-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setSubmitSuccess(true);
      } else {
        alert('Order processing failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- RENDERING HELPERS ---

  const Navbar = () => (
    <>
      <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); navToHome(); }}>
          <img src={new URL('./assets/logo.png', import.meta.url).href} alt="Heralds Logo" className="logo-img" />
          <span style={{ marginLeft: '12px' }}>HERALDS</span>
        </a>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navToHome(); }} className={location.pathname === '/' ? 'active-link' : ''}>Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navToProducts(); }} className={location.pathname === '/products' ? 'active-link' : ''}>Products</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navToCustomizable(); }} className={location.pathname === '/customizable' ? 'active-link' : ''}>Customizable</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navToAbout(); }} className={location.pathname === '/about' ? 'active-link' : ''}>About</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navToContact(); }} className={location.pathname === '/contact' ? 'active-link' : ''}>Contact</a>
        </div>
        <button
          className={`hamburger-btn ${mobileNavOpen ? 'open' : ''}`}
          onClick={() => setMobileNavOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'open' : ''}`}>
        <a href="#" onClick={(e) => { e.preventDefault(); navToHome(); }} className={location.pathname === '/' ? 'active-link' : ''}>Home</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navToProducts(); }} className={location.pathname === '/products' ? 'active-link' : ''}>Products</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navToCustomizable(); }} className={location.pathname === '/customizable' ? 'active-link' : ''}>Customizable</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navToAbout(); }} className={location.pathname === '/about' ? 'active-link' : ''}>About</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navToContact(); }} className={location.pathname === '/contact' ? 'active-link' : ''}>Contact</a>
      </div>
    </>
  );

  const ProductCard = ({ product }) => (
    <div className="product-card slide-up" onClick={() => showDetails(product)}>
      {product.isNew && <span className="badge">New Arrival</span>}
      {product.isTrending && <span className="badge badge-trending">Trending</span>}

      <button
        className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
        onClick={(e) => toggleWishlist(e, product.id)}
      >
        ♥
      </button>

      <div className="product-img-wrapper">
        <img src={product.images[0]} alt={product.name} className="product-img" />
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">Rs. {product.price}</div>
      </div>
    </div>
  );

  const ProductDetails = () => {
    const { id } = useParams();
    const product = products.find(p => p.id == id);
    if (!product && !loading) return <main className="container" style={{ paddingTop: '200px', textAlign: 'center' }}><h2>Product not found</h2><button className="btn-secondary" onClick={() => navigate('/products')}>Back to Gallery</button></main>;
    if (loading) return <div className="container" style={{ paddingTop: '200px', display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>;

    return (
      <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
        <div className="details-grid">
          <div className="details-images">
            <img src={product.images[0]} alt={product.name} className="details-main-img" />
          </div>
          <div className="details-info">
            <div className="product-category" style={{ fontSize: '1rem', marginBottom: '1rem' }}>{product.category}</div>
            <h2 className="details-name">{product.name}</h2>
            <div className="details-price">Rs. {product.price}</div>
            <p className="details-description">{product.description}</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {product.styles && product.styles.map(s => (
                <span key={s} className="badge" style={{ position: 'static', background: '#eee', color: '#333' }}>{s}</span>
              ))}
            </div>
            <div className="details-actions">
              <button className="btn-whatsapp" onClick={() => handleOrderWhatsApp(product.name)}>Order via WhatsApp</button>
              {product.customizable && (
                <button className="btn-primary" onClick={() => navigate('/customizable')}>AI Custom Build</button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={
          <div className="fade-in">
            <header className="hero">
              <img src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&q=80&w=2000" className="hero-bg" alt="Men's Formal Fashion" />
              <div className="hero-content">
                <h1>MASTERFULLY CRAFTED FORMALS</h1>
                <button className="btn-primary" onClick={() => navToProducts()}>View Collection</button>
              </div>
            </header>

            <main className="container">
              <h2 className="section-title">THE ARCHIVES</h2>
              <div className="carousel-container">
                <div className="carousel-track" style={{
                  transform: `translateX(-${Math.min(activeSlide * carouselOffset, (HOME_CAROUSEL_LINES.length * carouselOffset) - 100)}%)`
                }}>
                  {HOME_CAROUSEL_LINES.map(line => (
                    <div key={line.name} className="carousel-slide" onClick={() => navToProducts()}>
                      <div className="carousel-img-wrapper">
                        <img src={line.image} alt={line.name} className="carousel-img" />
                        <div className="carousel-overlay">
                          <h3 className="carousel-title">{line.name}</h3>
                          <button className="btn-secondary" style={{ color: 'white', borderColor: 'white' }}>View Line</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ margin: '8rem 0' }}>
                <h2 className="section-title">FEATURED PIECES</h2>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
                ) : (
                  <div className="products-grid">
                    {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            </main>
          </div>
        } />

        <Route path="/products" element={
          <main className="container fade-in" style={{ paddingTop: '150px' }}>
            <div className="page-header">
              <h1 className="section-title">OUR COLLECTION</h1>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <input type="text" className="control-input" style={{ borderRadius: '40px', padding: '15px 30px' }} placeholder="Search the collection..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="filters-container">
              <div className="filter-row">
                {categories.map(c => <button key={c} className={`filter-pill ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>)}
              </div>
              <div className="filter-row">
                <button className={`filter-pill ${activeStyle === '' ? 'active' : ''}`} onClick={() => setActiveStyle('')}>All Aesthetics</button>
                {STYLE_FILTERS.map(s => <button key={s} className={`filter-pill ${activeStyle === s ? 'active' : ''}`} onClick={() => setActiveStyle(s)}>{s}</button>)}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner"></div></div>
            ) : filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', margin: '5rem 0' }}>No pieces match your current filters.</p>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </main>
        } />

        <Route path="/product/:id" element={<ProductDetails />} />

        <Route path="/customizable" element={
          <main className="container fade-in" style={{ paddingTop: '150px' }}>
            <div className="page-header" style={{ marginBottom: '4rem' }}>
              <h1 className="section-title">AI FASHION STUDIO</h1>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>Architecture a garment unique to your vision.</p>
            </div>

            <div className="customizer-layout">
              <div className="customizer-canvas-wrapper">
                {isGenerating ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p style={{ fontWeight: '600', marginTop: '20px' }}>CONSTRUCTING VISION...</p>
                  </div>
                ) : generatedImageUrl ? (
                  <div className="preview-container fade-in" style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={generatedImageUrl} alt="AI Preview" className="generated-ai-image" />
                    <div className="preview-overlay-actions">
                      <button className="btn-secondary" style={{ background: 'white' }} onClick={handleGeneratePreview}>Redesign</button>
                      <button className="btn-primary" onClick={() => setShowOrderForm(true)}>Confirm Order</button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-preview">
                    <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>STREETWEAR CANVAS</h3>
                    <p>Select your specs and generate a high-fidelity preview.</p>
                  </div>
                )}
              </div>

              <div className="customizer-controls">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>SPECIFICATIONS</h3>
                <div className="control-group"><label>SLEEVE</label><select className="control-select" value={customConfig.sleeveType} onChange={(e) => setCustomConfig({ ...customConfig, sleeveType: e.target.value })}><option>Short Sleeve</option><option>Long Sleeve</option></select></div>
                <div className="control-group"><label>COLLAR</label><select className="control-select" value={customConfig.collarType} onChange={(e) => setCustomConfig({ ...customConfig, collarType: e.target.value })}><option>Normal Collar</option><option>Chinese Collar</option></select></div>
                <div className="control-group"><label>FIT</label><select className="control-select" value={customConfig.fitType} onChange={(e) => setCustomConfig({ ...customConfig, fitType: e.target.value })}><option>Regular Fit</option><option>Slim Fit</option><option>Oversized Fit</option></select></div>
                <div className="control-group"><label>POCKET</label><select className="control-select" value={customConfig.pocket} onChange={(e) => setCustomConfig({ ...customConfig, pocket: e.target.value })}><option>Without Pocket</option><option>With Pocket</option></select></div>
                <div className="control-group">
                  <label>FABRIC PALETTE</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {SHIRT_COLORS.map(c => (
                      <button
                        key={c.hex}
                        style={{ backgroundColor: c.hex, width: '30px', height: '30px', borderRadius: '50%', border: customConfig.shirtColor === c.hex ? '2px solid var(--accent)' : '1px solid #ddd', cursor: 'pointer' }}
                        onClick={() => setCustomConfig({ ...customConfig, shirtColor: c.hex, shirtColorName: c.label })}
                      />
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleGeneratePreview} disabled={isGenerating}>
                  {isGenerating ? 'GENERAING...' : 'GENERATE AI PREVIEW'}
                </button>
              </div>
            </div>
          </main>
        } />

        <Route path="/about" element={
          <main className="container fade-in" style={{ paddingTop: '150px' }}>
            <h1 className="section-title">THE HERITAGE</h1>
            <div className="about-grid" style={{
              marginTop: '5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '5rem',
              alignItems: 'center'
            }}>
              <div className="about-image-side">
                <img
                  src="https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=1200"
                  alt="Fine Tailoring"
                  style={{ width: '100%', height: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                />
              </div>
          <div className="about-text-side">
                <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '2.5rem', lineHeight: '1.1' }}>PRECISION IN EVERY FIBER</h2>
                <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '2rem', lineHeight: '1.8' }}>
                  At Heralds, we don't just sell clothing; we architect confidence. Our journey is rooted in classical tailoring, perfected for the modern man who requires seamless, powerful elegance.
                </p>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '3rem' }}>
                  Every piece in our collection is a testament to the skill of our artisans. We source the world's most resilient cottons to ensure that your Heralds garment is as enduring as it is elegant.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ borderTop: '2px solid var(--accent)', paddingTop: '1.5rem' }}>
                    <span style={{ fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>01. BESPOKE ORIGINS</span>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Inspired by classical tailoring heritage.</p>
                  </div>
                  <div style={{ borderTop: '2px solid var(--accent)', paddingTop: '1.5rem' }}>
                    <span style={{ fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>02. MODERN SILHOUETTE</span>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Mastered for the contemporary workspace.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        } />

        <Route path="/contact" element={
          <main className="container fade-in" style={{ paddingTop: '150px' }}>
            <h1 className="section-title">GET IN TOUCH</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '3rem', marginTop: '4rem' }}>
              <div className="contact-info">
                <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: '2rem' }}>VISIT OUR ATELIER</h2>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>No21, ritrit park weherahena road kekanadura</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>📞</span>
                    <div>
                      <p style={{ fontWeight: '700' }}>FRONT DESK</p>
                      <p>+94 70 570 0616</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>✉️</span>
                    <div>
                      <p style={{ fontWeight: '700' }}>INQUIRIES</p>
                      <p style={{ wordBreak: 'break-word' }}>heraldsclothing@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>FOLLOW THE JOURNEY</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="https://www.facebook.com/profile.php?id=61566508127577" target="_blank" className="btn-secondary" style={{ border: '1px solid #eee' }}>Facebook</a>
                    <a href="https://www.tiktok.com/@heraldsclothing" target="_blank" className="btn-secondary" style={{ border: '1px solid #eee' }}>TikTok</a>
                  </div>
                </div>
              </div>
              <div style={{ background: '#f9f9f9', padding: 'clamp(1.5rem, 5vw, 4rem)' }}>
                <form>
                  <h2 style={{ marginBottom: '2rem' }}>MESSAGE US</h2>
                  <div className="control-group"><label>NAME</label><input className="control-input" type="text" /></div>
                  <div className="control-group" style={{ marginTop: '1.5rem' }}><label>EMAIL</label><input className="control-input" type="email" /></div>
                  <div className="control-group" style={{ marginTop: '1.5rem' }}><label>MESSAGE</label><textarea className="control-textarea"></textarea></div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>SEND MESSAGE</button>
                </form>
              </div>
            </div>

            <div style={{ marginTop: '4rem', height: 'clamp(280px, 50vw, 400px)', width: '100%', overflow: 'hidden', borderRadius: '4px' }}>
              <iframe
                title="Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src="https://www.google.com/maps?q=No21,+ritrit+park+weherahena+road+kekanadura&output=embed">
              </iframe>
            </div>
          </main>
        } />
      </Routes>

      {showOrderForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <button className="btn-close-modal" onClick={() => setShowOrderForm(false)}>&times;</button>
            {submitSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>CONFIRMED</h2>
                <p>Your vision has been received. Our team will contact you for the final measurements.</p>
                <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => setShowOrderForm(false)}>Back to Studio</button>
              </div>
            ) : (
              <form onSubmit={handleFinalSubmit}>
                <h2 style={{ marginBottom: '2rem' }}>Fulfillment Details</h2>
                <div className="control-group"><label>Full Name</label><input required className="control-input" value={orderDetails.name} onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Email Address</label><input required className="control-input" type="email" value={orderDetails.email} onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Phone Number</label><input required className="control-input" type="tel" value={orderDetails.phone} onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Delivery Address</label><textarea required className="control-textarea" value={orderDetails.address} onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })} /></div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '3rem' }}>Submit Specification</button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="footer-logo">HERALDS CLOTHING</h2>
            <p style={{ letterSpacing: '4px', opacity: 0.6 }}>LEGACY IN EVERY STITCH</p>
            <div className="footer-social" style={{ marginTop: '2rem' }}>
              <a href="#" className="btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Instagram</a>
              <a href="#" className="btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Facebook</a>
            </div>
            <p style={{ marginTop: '4rem', opacity: 0.3 }}>&copy; {new Date().getFullYear()} HERALDS. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
