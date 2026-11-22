import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route, useParams } from 'react-router-dom';
import './index.css';
import SEO from './components/SEO.jsx';
import {
  trackPageView,
  trackViewItemList,
  trackSelectItem,
  trackViewItem,
  trackWhatsAppOrder,
  trackContactClick,
  trackCustomOrderSubmit
} from './utils/analytics.js';

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

const Navbar = ({
  isScrolled,
  mobileNavOpen,
  setMobileNavOpen,
  pathname,
  navToHome,
  navToProducts,
  navToCustomizable,
  navToAbout,
  navToContact
}) => {
  const logoUrl = new URL('./assets/logo.png', import.meta.url).href;
  return (
    <>
      <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`}>
        <a href="/" className="nav-logo" onClick={(e) => { e.preventDefault(); navToHome(); }} aria-label="Heralds Sri Lanka Home">
          <img src={logoUrl} alt="Heralds Logo - Sri Lankan Clothing Brand" className="logo-img" />
          <span style={{ marginLeft: '12px' }}>HERALDS</span>
        </a>
        <div className="nav-links">
          <a href="/" onClick={(e) => { e.preventDefault(); navToHome(); }} className={pathname === '/' ? 'active-link' : ''}>Home</a>
          <a href="/products" onClick={(e) => { e.preventDefault(); navToProducts(); }} className={pathname === '/products' ? 'active-link' : ''}>Products</a>
          <a href="/customizable" onClick={(e) => { e.preventDefault(); navToCustomizable(); }} className={pathname === '/customizable' ? 'active-link' : ''}>Customizable</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); navToAbout(); }} className={pathname === '/about' ? 'active-link' : ''}>About</a>
          <a href="/contact" onClick={(e) => { e.preventDefault(); navToContact(); }} className={pathname === '/contact' ? 'active-link' : ''}>Contact</a>
        </div>
        <button
          className={`hamburger-btn ${mobileNavOpen ? 'open' : ''}`}
          onClick={() => setMobileNavOpen(o => !o)}
          aria-label="Toggle navigation menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'open' : ''}`}>
        <a href="/" onClick={(e) => { e.preventDefault(); navToHome(); }} className={pathname === '/' ? 'active-link' : ''}>Home</a>
        <a href="/products" onClick={(e) => { e.preventDefault(); navToProducts(); }} className={pathname === '/products' ? 'active-link' : ''}>Products</a>
        <a href="/customizable" onClick={(e) => { e.preventDefault(); navToCustomizable(); }} className={pathname === '/customizable' ? 'active-link' : ''}>Customizable</a>
        <a href="/about" onClick={(e) => { e.preventDefault(); navToAbout(); }} className={pathname === '/about' ? 'active-link' : ''}>About</a>
        <a href="/contact" onClick={(e) => { e.preventDefault(); navToContact(); }} className={pathname === '/contact' ? 'active-link' : ''}>Contact</a>
      </div>
    </>
  );
};

const ProductCard = ({ product, wishlist, toggleWishlist, showDetails }) => (
  <div
    className="product-card slide-up"
    onClick={() => {
      trackSelectItem(product, 'Product Gallery');
      showDetails(product);
    }}
  >
    {product.isNew && <span className="badge">New Arrival</span>}
    {product.isTrending && <span className="badge badge-trending">Trending</span>}

    <button
      className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
      onClick={(e) => toggleWishlist(e, product.id)}
      aria-label={`Save ${product.name} to wishlist`}
    >
      ♥
    </button>

    <div className="product-img-wrapper">
      <img
        src={product.images[0]}
        alt={`${product.name} - Sri Lankan Men's Printed Shirt | Heralds`}
        className="product-img"
        loading="lazy"
        decoding="async"
      />
    </div>
    <div className="product-info">
      <div className="product-category">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>
      <div className="product-price">Rs. {Number(product.price).toLocaleString()}</div>
    </div>
  </div>
);

const ProductDetails = ({ products, loading, handleOrderWhatsApp }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id == id);

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor(null);
    }
    if (product) {
      trackViewItem(product);
    }
  }, [product]);

  if (!product && !loading) {
    return (
      <main className="container" style={{ paddingTop: '200px', textAlign: 'center' }}>
        <SEO
          title="Product Not Found | Heralds Sri Lanka"
          description="The requested product could not be found in our catalog. Explore our latest men's printed shirts collection."
          canonical={`/product/${id}`}
          noindex={true}
        />
        <h2>Product not found</h2>
        <p style={{ margin: '1.5rem 0', color: '#666' }}>The product you are looking for may have been moved or is currently out of stock.</p>
        <button className="btn-secondary" onClick={() => navigate('/products')}>Back to Gallery</button>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '200px', display: 'flex', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const currentImage = selectedColor?.image || product.images[0];
  const colorName = selectedColor?.name || 'Default';

  // Dynamic Product JSON-LD Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `https://heralds-fe.vercel.app/product/${product.id}#product`,
        name: product.name,
        image: product.images,
        description: product.description || `Explore stylish ${product.name} from Heralds Sri Lanka. Crafted with premium fabrics for comfort and enduring elegance.`,
        sku: `HERALDS-${product.id}`,
        category: product.category,
        brand: {
          '@type': 'Brand',
          name: 'Heralds'
        },
        offers: {
          '@type': 'Offer',
          url: `https://heralds-fe.vercel.app/product/${product.id}`,
          priceCurrency: 'LKR',
          price: product.price,
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Heralds Sri Lanka'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://heralds-fe.vercel.app/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://heralds-fe.vercel.app/products'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://heralds-fe.vercel.app/product/${product.id}`
          }
        ]
      }
    ]
  };

  const seoTitle = `${product.name} | Heralds Sri Lanka`;
  const seoDescription = `Buy ${product.name} online in Sri Lanka. Crafted by Heralds, featuring ${product.category} in ${product.styles?.join(', ') || 'modern fit'}. Price: Rs. ${Number(product.price).toLocaleString()}. Islandwide delivery available.`;

  return (
    <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`/product/${product.id}`}
        ogImage={currentImage}
        ogType="product"
        keywords={`${product.name}, ${product.category} Sri Lanka, Men's Printed Shirts Sri Lanka, Men's Fashion Sri Lanka, Buy Shirts Online Sri Lanka, Heralds Clothing`}
        schema={productSchema}
      />

      {/* Semantic Breadcrumbs for Navigation & SEO */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
        <span>/</span>
        <a href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>Products</a>
        <span>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      <div className="details-grid">
        <div className="details-images">
          <img
            src={currentImage}
            alt={`${product.name} - ${colorName} - Men's Fashion Sri Lanka | Heralds`}
            className="details-main-img"
            fetchpriority="high"
          />
        </div>
        <div className="details-info">
          <div className="product-category" style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>{product.category}</div>
          <h1 className="details-name">{product.name}</h1>
          <div className="details-price">Rs. {Number(product.price).toLocaleString()}</div>
          <p className="details-description">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '10px' }}>Color</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button
                    key={c.name}
                    className={`btn-secondary ${selectedColor?.name === c.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '8px 15px',
                      borderColor: selectedColor?.name === c.name ? 'var(--accent)' : '#eee',
                      color: selectedColor?.name === c.name ? 'white' : '#333',
                      background: selectedColor?.name === c.name ? 'var(--accent)' : 'transparent'
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '10px' }}>Size</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                <button
                  key={sz}
                  className={`btn-secondary ${selectedSize === sz ? 'active' : ''}`}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '8px 15px',
                    borderColor: selectedSize === sz ? 'var(--accent)' : '#eee',
                    color: selectedSize === sz ? 'white' : '#333',
                    background: selectedSize === sz ? 'var(--accent)' : 'transparent'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {product.styles && product.styles.map(s => (
              <span key={s} className="badge" style={{ position: 'static', background: '#eee', color: '#333' }}>{s}</span>
            ))}
          </div>

          {/* Sri Lanka Delivery & Trust Signals Box */}
          <div className="delivery-badge-box">
            <div className="delivery-badge-row">
              <span style={{ fontSize: '1.2rem' }}>🚚</span>
              <div>
                <strong>Islandwide Delivery in Sri Lanka</strong>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0' }}>Delivered across Colombo, Kandy, Galle, Matara &amp; all districts in 2-4 business days.</p>
              </div>
            </div>
            <div className="delivery-badge-row">
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <div>
                <strong>Payment Options</strong>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0' }}>Cash on Delivery (COD) and Direct Bank Transfer available.</p>
              </div>
            </div>
            <div className="delivery-badge-row">
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <div>
                <strong>Customer Support &amp; Sizing Inquiries</strong>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: '2px 0 0' }}>Chat with our team on WhatsApp for size guidance: +94 70 570 0616</p>
              </div>
            </div>
          </div>

          <div className="details-actions">
            <button
              className="btn-whatsapp"
              onClick={() => handleOrderWhatsApp(product.name, colorName, selectedSize, product.price)}
            >
              Order via WhatsApp
            </button>
            {product.customizable && (
              <button className="btn-primary" onClick={() => navigate('/customizable')}>AI Custom Build</button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

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

  // GA4 Page View tracking on route change
  useEffect(() => {
    trackPageView(location.pathname);
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Track product catalog views in GA4
  useEffect(() => {
    if (products.length > 0) {
      if (location.pathname === '/') {
        trackViewItemList(products.slice(0, 4), 'Featured Pieces Homepage');
      } else if (location.pathname === '/products') {
        trackViewItemList(products, 'Full Collection Sri Lanka');
      }
    }
  }, [products, location.pathname]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleOrderWhatsApp = (productName, color = 'Default', size = 'M', price = 0) => {
    trackWhatsAppOrder(productName, color, size, price);
    const text = encodeURIComponent(`Hi Heralds Sri Lanka! I would like to order the ${productName}.\nColor: ${color}\nSize: ${size}`);
    window.open(`https://wa.me/94705700616?text=${text}`, '_blank');
  };

  // --- AI GENERATION LOGIC ---
  const handleGeneratePreview = async () => {
    if (isGenerating) return;

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
        trackCustomOrderSubmit(orderDetails, customConfig);
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

  return (
    <>
      <Navbar
        isScrolled={isScrolled}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        pathname={location.pathname}
        navToHome={navToHome}
        navToProducts={navToProducts}
        navToCustomizable={navToCustomizable}
        navToAbout={navToAbout}
        navToContact={navToContact}
      />

      <Routes>
        <Route path="/" element={
          <div className="fade-in">
            <SEO
              title="Heralds Sri Lanka | Premium Printed Shirts & Men's Fashion"
              description="Discover unique printed shirts and stylish men's fashion from Heralds, a Sri Lankan clothing brand. Explore our latest collections and order online with islandwide delivery."
              canonical="/"
              keywords="Printed Shirts Sri Lanka, Men's Shirts Sri Lanka, Men's Fashion Sri Lanka, Buy Shirts Online Sri Lanka, Casual Shirts Sri Lanka, Online Clothing Store Sri Lanka, Sri Lankan Clothing Brand, Men's Printed Shirts, Fashion Shirts for Men"
            />

            <header className="hero">
              <img
                src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&q=80&w=2000"
                className="hero-bg"
                alt="Men's Printed Shirts & Fashion Wear Sri Lanka | Heralds"
                fetchpriority="high"
                loading="eager"
              />
              <div className="hero-content">
                <h1>PREMIUM PRINTED SHIRTS &amp; MEN&#39;S FASHION</h1>
                <p>Sri Lanka&#39;s premier brand for bespoke fits, printed shirts, and contemporary streetwear. Delivered islandwide.</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => navToProducts()}>View Collection</button>
                  <button
                    className="btn-secondary"
                    style={{ color: 'white', borderColor: 'white' }}
                    onClick={() => {
                      trackContactClick('WhatsApp Hero', '+94705700616');
                      window.open('https://wa.me/94705700616?text=' + encodeURIComponent('Hi Heralds Sri Lanka! I would like to inquire about your printed shirts collection.'), '_blank');
                    }}
                  >
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            </header>

            {/* Sri Lanka Trust Signals Bar */}
            <div className="trust-signals-bar">
              <div className="trust-signal-item">
                <div className="trust-signal-icon">🚚</div>
                <div>
                  <div className="trust-signal-title">Islandwide Delivery</div>
                  <div className="trust-signal-desc">Fast courier across all 9 provinces in Sri Lanka</div>
                </div>
              </div>
              <div className="trust-signal-item">
                <div className="trust-signal-icon">🇱🇰</div>
                <div>
                  <div className="trust-signal-title">Sri Lankan Brand</div>
                  <div className="trust-signal-desc">Proudly designed &amp; tailored in Sri Lanka</div>
                </div>
              </div>
              <div className="trust-signal-item">
                <div className="trust-signal-icon">💬</div>
                <div>
                  <div className="trust-signal-title">Quick WhatsApp Orders</div>
                  <div className="trust-signal-desc">Instant confirmation via +94 70 570 0616</div>
                </div>
              </div>
              <div className="trust-signal-item">
                <div className="trust-signal-icon">✨</div>
                <div>
                  <div className="trust-signal-title">Premium Quality</div>
                  <div className="trust-signal-desc">Resilient cottons &amp; modern bespoke silhouettes</div>
                </div>
              </div>
            </div>

            <main className="container">
              <h2 className="section-title">THE ARCHIVES</h2>
              <div className="carousel-container">
                <div className="carousel-track" style={{
                  transform: `translateX(-${Math.min(activeSlide * carouselOffset, (HOME_CAROUSEL_LINES.length * carouselOffset) - 100)}%)`
                }}>
                  {HOME_CAROUSEL_LINES.map(line => (
                    <div key={line.name} className="carousel-slide" onClick={() => navToProducts()}>
                      <div className="carousel-img-wrapper">
                        <img src={line.image} alt={`${line.name} - Sri Lankan Men's Fashion Collection`} className="carousel-img" loading="lazy" />
                        <div className="carousel-overlay">
                          <h3 className="carousel-title">{line.name}</h3>
                          <button className="btn-secondary" style={{ color: 'white', borderColor: 'white' }}>View Line</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ margin: '6rem 0' }}>
                <h2 className="section-title">FEATURED PIECES</h2>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner"></div></div>
                ) : (
                  <div className="products-grid">
                    {products.slice(0, 4).map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        wishlist={wishlist}
                        toggleWishlist={toggleWishlist}
                        showDetails={showDetails}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Natural Sri Lanka Brand & SEO Content */}
              <section className="seo-brand-intro">
                <h2>AUTHENTIC SRI LANKAN CRAFTSMANSHIP &amp; MEN&#39;S FASHION</h2>
                <p>
                  Welcome to <strong>Heralds</strong>, an authentic Sri Lankan clothing brand built for men who value individuality, precision tailoring, and timeless style. Whether you are searching for stylish <strong>printed shirts in Sri Lanka</strong>, relaxed casual shirts, everyday fits, or bespoke tailored formalwear, our collections deliver timeless sophistication and lasting comfort.
                </p>
                <p>
                  Every garment is crafted with high-grade, breathable cottons engineered to withstand the tropical Sri Lankan climate while maintaining crisp, confident silhouettes. From Colombo and Kandy to Galle, Matara, and Jaffna, we provide seamless online ordering and prompt islandwide delivery right to your doorstep.
                </p>
                <div style={{ marginTop: '1.8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => navToProducts('Shirts')}>Browse Shirts</button>
                  <button className="btn-secondary" onClick={() => navToCustomizable()}>Customize Your Shirt</button>
                </div>
              </section>
            </main>
          </div>
        } />

        <Route path="/products" element={
          <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
            <SEO
              title="Men's Printed Shirts & Clothing Collection | Heralds Sri Lanka"
              description="Shop premium men's printed shirts, casual shirts, and streetwear online in Sri Lanka. Islandwide delivery. Cash on Delivery & WhatsApp ordering available."
              canonical="/products"
              keywords="Buy Shirts Online Sri Lanka, Printed Shirts Sri Lanka, Men's Shirts Sri Lanka, Men's Fashion Sri Lanka, Casual Shirts Sri Lanka, Online Clothing Store Sri Lanka"
            />

            <div className="page-header">
              <h1 className="section-title">OUR COLLECTION</h1>
              <p style={{ textAlign: 'center', color: '#666', marginTop: '-1.5rem', marginBottom: '2rem' }}>
                Discover premium printed shirts, casual wear, and essentials crafted in Sri Lanka.
              </p>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <input
                  type="text"
                  className="control-input"
                  style={{ borderRadius: '40px', padding: '15px 30px' }}
                  placeholder="Search printed shirts, formals, casuals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search collection"
                />
              </div>
            </div>

            <div className="filters-container">
              <div className="filter-row">
                {categories.map(c => (
                  <button
                    key={c}
                    className={`filter-pill ${activeCategory === c ? 'active' : ''}`}
                    onClick={() => setActiveCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <button
                  className={`filter-pill ${activeStyle === '' ? 'active' : ''}`}
                  onClick={() => setActiveStyle('')}
                >
                  All Aesthetics
                </button>
                {STYLE_FILTERS.map(s => (
                  <button
                    key={s}
                    className={`filter-pill ${activeStyle === s ? 'active' : ''}`}
                    onClick={() => setActiveStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner"></div></div>
            ) : filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', margin: '5rem 0' }}>No pieces match your current filters.</p>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    showDetails={showDetails}
                  />
                ))}
              </div>
            )}
          </main>
        } />

        <Route path="/product/:id" element={
          <ProductDetails
            products={products}
            loading={loading}
            handleOrderWhatsApp={handleOrderWhatsApp}
          />
        } />

        <Route path="/customizable" element={
          <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
            <SEO
              title="Custom Shirt Studio | Tailored Shirts in Sri Lanka | Heralds"
              description="Design your custom shirt with Heralds AI Studio. Choose your collar, fit, sleeves, and fabric palette. Tailored for you in Sri Lanka with islandwide delivery."
              canonical="/customizable"
              keywords="Custom Shirts Sri Lanka, Tailored Shirts Sri Lanka, Bespoke Men's Fashion Sri Lanka, AI Fashion Studio Sri Lanka"
            />

            <div className="page-header" style={{ marginBottom: '4rem' }}>
              <h1 className="section-title">AI FASHION STUDIO</h1>
              <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>Architect a garment unique to your vision, tailored to perfection in Sri Lanka.</p>
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
                    <img src={generatedImageUrl} alt="Custom AI Shirt Preview - Heralds Sri Lanka" className="generated-ai-image" />
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
                        aria-label={`Color ${c.label}`}
                        style={{ backgroundColor: c.hex, width: '30px', height: '30px', borderRadius: '50%', border: customConfig.shirtColor === c.hex ? '2px solid var(--accent)' : '1px solid #ddd', cursor: 'pointer' }}
                        onClick={() => setCustomConfig({ ...customConfig, shirtColor: c.hex, shirtColorName: c.label })}
                      />
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={handleGeneratePreview} disabled={isGenerating}>
                  {isGenerating ? 'GENERATING...' : 'GENERATE AI PREVIEW'}
                </button>
              </div>
            </div>
          </main>
        } />

        <Route path="/about" element={
          <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
            <SEO
              title="About Heralds | Sri Lankan Clothing & Fashion Brand"
              description="Learn about Heralds, an authentic Sri Lankan clothing brand dedicated to modern tailoring, premium printed shirts, and timeless craftsmanship."
              canonical="/about"
              keywords="About Heralds, Sri Lankan Clothing Brand, Men's Fashion Sri Lanka, Sri Lanka Fashion Designer, Tailored Shirts Sri Lanka"
            />

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
                  alt="Fine Tailoring and Craftsmanship at Heralds Sri Lanka"
                  style={{ width: '100%', height: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                  loading="lazy"
                />
              </div>
              <div className="about-text-side">
                <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '2.5rem', lineHeight: '1.1' }}>PRECISION IN EVERY FIBER</h2>
                <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '2rem', lineHeight: '1.8' }}>
                  At Heralds, we don&#39;t just produce garments; we architect confidence. Founded as an authentic <strong>Sri Lankan clothing brand</strong>, our journey is rooted in classical tailoring, perfected for the modern man who requires seamless, powerful elegance.
                </p>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '3rem' }}>
                  Every printed shirt, casual piece, and custom garment in our collection is a testament to the skill of Sri Lankan artisans. We source the world&#39;s most resilient cottons to ensure that your Heralds garment is as enduring as it is refined in Sri Lanka&#39;s tropical climate.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ borderTop: '2px solid var(--accent)', paddingTop: '1.5rem' }}>
                    <span style={{ fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>01. BESPOKE ORIGINS</span>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Inspired by classical tailoring heritage in Sri Lanka.</p>
                  </div>
                  <div style={{ borderTop: '2px solid var(--accent)', paddingTop: '1.5rem' }}>
                    <span style={{ fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>02. MODERN SILHOUETTE</span>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Mastered for contemporary workspaces and casual street style.</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        } />

        <Route path="/contact" element={
          <main className="container fade-in" style={{ paddingTop: '150px', paddingBottom: '5rem' }}>
            <SEO
              title="Contact Heralds Sri Lanka | Atelier, Phone & WhatsApp"
              description="Get in touch with Heralds Clothing in Sri Lanka. Visit our atelier in Matara, call +94 70 570 0616, or message us on WhatsApp for orders."
              canonical="/contact"
              keywords="Contact Heralds, Heralds Sri Lanka Phone, WhatsApp Order Shirts Sri Lanka, Matara Clothing Store, Sri Lanka Fashion Brand Support"
            />

            <h1 className="section-title">GET IN TOUCH</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '3rem', marginTop: '4rem' }}>
              <div className="contact-info">
                <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', marginBottom: '2rem' }}>VISIT OUR ATELIER</h2>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>No 21, Ritrit Park, Weherahena Road, Kekanadura, Matara, Southern Province, Sri Lanka</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>📞</span>
                    <div>
                      <p style={{ fontWeight: '700' }}>PHONE &amp; WHATSAPP SUPPORT</p>
                      <a
                        href="tel:+94705700616"
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={() => trackContactClick('Phone', '+94705700616')}
                      >
                        +94 70 570 0616
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>✉️</span>
                    <div>
                      <p style={{ fontWeight: '700' }}>EMAIL INQUIRIES</p>
                      <a
                        href="mailto:heraldsclothing@gmail.com"
                        style={{ color: 'inherit', textDecoration: 'none', wordBreak: 'break-word' }}
                        onClick={() => trackContactClick('Email', 'heraldsclothing@gmail.com')}
                      >
                        heraldsclothing@gmail.com
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>🚚</span>
                    <div>
                      <p style={{ fontWeight: '700' }}>ISLANDWIDE SHIPPING</p>
                      <p style={{ color: '#666', fontSize: '0.95rem' }}>Reliable courier delivery across all 25 districts in Sri Lanka.</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>FOLLOW OUR JOURNEY</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a
                      href="https://www.facebook.com/profile.php?id=61566508127577"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ border: '1px solid #eee' }}
                      onClick={() => trackContactClick('Facebook', 'Heralds')}
                    >
                      Facebook
                    </a>
                    <a
                      href="https://www.tiktok.com/@heraldsclothing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ border: '1px solid #eee' }}
                      onClick={() => trackContactClick('TikTok', 'Heralds')}
                    >
                      TikTok
                    </a>
                    <a
                      href="https://wa.me/94705700616"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ border: '1px solid #eee' }}
                      onClick={() => trackContactClick('WhatsApp', '+94705700616')}
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
              <div style={{ background: '#f9f9f9', padding: 'clamp(1.5rem, 5vw, 4rem)' }}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  trackContactClick('Contact Form Submit', 'Contact Page');
                  alert('Thank you for reaching out! We will contact you via email or WhatsApp promptly.');
                }}>
                  <h2 style={{ marginBottom: '2rem' }}>SEND US A MESSAGE</h2>
                  <div className="control-group"><label>NAME</label><input required className="control-input" type="text" /></div>
                  <div className="control-group" style={{ marginTop: '1.5rem' }}><label>EMAIL</label><input required className="control-input" type="email" /></div>
                  <div className="control-group" style={{ marginTop: '1.5rem' }}><label>PHONE (OPTIONAL / WHATSAPP)</label><input className="control-input" type="tel" placeholder="+94..." /></div>
                  <div className="control-group" style={{ marginTop: '1.5rem' }}><label>MESSAGE</label><textarea required className="control-textarea"></textarea></div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>SEND MESSAGE</button>
                </form>
              </div>
            </div>

            <div style={{ marginTop: '4rem', height: 'clamp(280px, 50vw, 400px)', width: '100%', overflow: 'hidden', borderRadius: '4px' }}>
              <iframe
                title="Heralds Atelier Location in Kekanadura Matara Sri Lanka"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src="https://www.google.com/maps?q=No21,+ritrit+park+weherahena+road+kekanadura&output=embed">
              </iframe>
            </div>
          </main>
        } />
      </Routes>

      {showOrderForm && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <button className="btn-close-modal" onClick={() => setShowOrderForm(false)} aria-label="Close modal">&times;</button>
            {submitSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>CONFIRMED</h2>
                <p>Your custom vision has been received. Our tailoring team in Sri Lanka will contact you via WhatsApp for final measurement confirmations.</p>
                <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => setShowOrderForm(false)}>Back to Studio</button>
              </div>
            ) : (
              <form onSubmit={handleFinalSubmit}>
                <h2 style={{ marginBottom: '2rem' }}>Custom Shirt Fulfillment Details</h2>
                <div className="control-group"><label>Full Name</label><input required className="control-input" value={orderDetails.name} onChange={(e) => setOrderDetails({ ...orderDetails, name: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Email Address</label><input required className="control-input" type="email" value={orderDetails.email} onChange={(e) => setOrderDetails({ ...orderDetails, email: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Phone Number (WhatsApp Preferred)</label><input required className="control-input" type="tel" placeholder="+94..." value={orderDetails.phone} onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })} /></div>
                <div className="control-group" style={{ marginTop: '1.5rem' }}><label>Islandwide Delivery Address (Sri Lanka)</label><textarea required className="control-textarea" value={orderDetails.address} onChange={(e) => setOrderDetails({ ...orderDetails, address: e.target.value })} /></div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '3rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'PROCESSING...' : 'SUBMIT CUSTOM SPECIFICATION'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="footer-logo">HERALDS CLOTHING</h2>
            <p style={{ letterSpacing: '4px', opacity: 0.7 }}>LEGACY IN EVERY STITCH — SRI LANKA</p>

            {/* Semantic Footer Internal Links */}
            <nav className="footer-nav-links" aria-label="Footer navigation">
              <a href="/" onClick={(e) => { e.preventDefault(); navToHome(); }}>Home</a>
              <a href="/products" onClick={(e) => { e.preventDefault(); navToProducts(); }}>Collection</a>
              <a href="/customizable" onClick={(e) => { e.preventDefault(); navToCustomizable(); }}>AI Custom Studio</a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navToAbout(); }}>About Us</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navToContact(); }}>Contact</a>
            </nav>

            <div className="footer-social" style={{ marginTop: '1.5rem' }}>
              <a
                href="https://www.facebook.com/profile.php?id=61566508127577"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => trackContactClick('Footer Facebook', 'Heralds')}
              >
                Facebook
              </a>
              <a
                href="https://www.tiktok.com/@heraldsclothing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => trackContactClick('Footer TikTok', 'Heralds')}
              >
                TikTok
              </a>
              <a
                href="https://wa.me/94705700616"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => trackContactClick('Footer WhatsApp', '+94705700616')}
              >
                WhatsApp Order
              </a>
            </div>

            <p className="footer-delivery-note">
              🚚 Islandwide Delivery Across Sri Lanka (Colombo, Kandy, Galle, Matara, Jaffna &amp; Nationwide)
            </p>
            <p style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.85rem' }}>
              Atelier: No 21, Ritrit Park, Weherahena Road, Kekanadura, Matara, Sri Lanka | Phone: +94 70 570 0616
            </p>
            <p style={{ marginTop: '1.5rem', opacity: 0.3, fontSize: '0.8rem' }}>
              &copy; {new Date().getFullYear()} HERALDS SRI LANKA. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
