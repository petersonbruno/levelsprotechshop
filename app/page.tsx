"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Laptop, Gamepad2, ShoppingBag, User, Search, Phone, Mail, MapPin, Monitor, Headphones, Grid3x3, TrendingUp, X, ChevronLeft, ChevronRight, Plus, Settings, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { fetchProducts, createProduct, updateProduct, deleteProduct, normalizeImageUrl, type ApiProduct } from "@/lib/api";

const WHATSAPP = "255674373436";

const categories = [
  { name: "All", icon: Grid3x3 },
  { name: "Laptops", icon: Laptop },
  { name: "Desktops", icon: Monitor },
  { name: "Gaming PCs", icon: Gamepad2 },
  { name: "Accessories", icon: Headphones },
];

type Product = ApiProduct;


function waLink(p: Product) {
  const text = `Hello 👋\nI want to buy:\n\n${p.name}\nSpecs: ${p.specs.join(", ")}\nPrice: ${p.price}\nWarranty: ${p.warranty}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

type View = "home" | "shop" | "details" | "profile" | "dashboard";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<View>("home");
  const [previousView, setPreviousView] = useState<View>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from API on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const popularProducts = products.slice(0, 3); // First 3 products as popular

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error refreshing products:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelected(product);
    setPreviousView(currentView);
    setCurrentView("details");
  };

  const handleBackToHome = () => {
    setSelected(null);
    setCurrentView(previousView);
  };

  if (currentView === "shop") {
    const shopFiltered = products.filter((p) => {
      const matchCategory = activeCategory === "All" || p.category === activeCategory;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
    
    return (
      <ShopPage
        query={query}
        setQuery={setQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        filtered={shopFiltered}
        onProductClick={handleProductClick}
        onNavClick={(view) => setCurrentView(view)}
      />
    );
  }

  if (currentView === "dashboard") {
    return (
      <DashboardPage
        products={products}
        onRefresh={refreshProducts}
        onBack={() => setCurrentView("profile")}
        onNavClick={(view) => setCurrentView(view)}
      />
    );
  }

  if (currentView === "profile") {
    return (
      <ProfilePage 
        onBack={() => setCurrentView("home")}
        onNavClick={(view) => setCurrentView(view)}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setCurrentView("home");
          setQuery("");
        }}
      />
    );
  }

  if (currentView === "details" && selected) {
    return (
      <ProductDetails 
        product={selected} 
        onBack={handleBackToHome}
        onNavClick={(view) => {
          setCurrentView(view);
          setPreviousView(view);
        }}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setCurrentView(previousView);
          setQuery("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-neutral-950 border-b border-neutral-800">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">LEVELS TECH SERVICES</h1>
          <div className="mt-3 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laptops, gaming PC..."
              className="bg-transparent text-sm flex-1 outline-none"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.name;
          return (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs border flex items-center gap-2 ${
                isActive
                  ? "bg-green-600 border-green-600 text-white"
                  : "border-neutral-800 text-neutral-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-neutral-400">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error: {error}</p>
            <button
              onClick={refreshProducts}
              className="text-green-500 hover:text-green-400"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Popular Products Section */}
      {!loading && !error && activeCategory === "All" && query === "" && (
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h2 className="text-base font-semibold">Popular Products</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {popularProducts.map((p) => (
              <motion.div
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleProductClick(p)}
                className="min-w-[160px] rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer"
              >
                <div className="relative h-32 w-full">
                  {p.image_urls && p.image_urls.length > 0 ? (
                    <Image
                      src={normalizeImageUrl(p.image_urls[0])}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                      unoptimized={p.image_urls[0]?.startsWith('http://localhost') || p.image_urls[0]?.startsWith('http://127.0.0.1')}
                      onError={(e) => {
                        console.error("Image load error:", normalizeImageUrl(p.image_urls[0]));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{p.category}</p>
                  <p className="text-sm font-semibold mt-2">{p.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <main className="flex-1 px-4 pb-24 pt-4">
          {activeCategory === "All" && query === "" && (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-3">All Products</h2>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleProductClick(p)}
                  className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer"
                >
                <div className="relative h-28 w-full">
                  {p.image_urls && p.image_urls.length > 0 ? (
                    <Image
                      src={normalizeImageUrl(p.image_urls[0])}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized={p.image_urls[0]?.startsWith('http://localhost') || p.image_urls[0]?.startsWith('http://127.0.0.1')}
                      onError={(e) => {
                        console.error("Image load error:", normalizeImageUrl(p.image_urls[0]));
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-full h-full bg-neutral-800 flex items-center justify-center"><svg class="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}
                </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{p.category}</p>
                    <p className="text-sm font-semibold mt-2">{p.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-3 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            active={currentView === "home"}
            onClick={() => setCurrentView("home")}
          />
          {/* <Nav 
            icon={<Laptop />} 
            label="Laptops" 
            onClick={() => {
              setActiveCategory("Laptops");
              setCurrentView("home");
              setQuery("");
            }}
          />
          <Nav 
            icon={<Gamepad2 />} 
            label="Gaming" 
            onClick={() => {
              setActiveCategory("Gaming PCs");
              setCurrentView("home");
              setQuery("");
            }}
          /> */}
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            active={false}
            onClick={() => {
              setActiveCategory("All");
              setCurrentView("shop");
              setQuery("");
            }}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
            active={false}
            onClick={() => setCurrentView("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function ProductDetails({ 
  product, 
  onBack,
  onNavClick,
  onCategoryChange
}: { 
  product: Product; 
  onBack: () => void;
  onNavClick: (view: View) => void;
  onCategoryChange: (category: string) => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleImageClick = () => {
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageCount = product.image_urls?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % imageCount);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imageCount = product.image_urls?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <button onClick={onBack} className="p-4 text-sm text-green-500 w-fit">← Back</button>

      {/* Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 pb-24">
        {/* Image Carousel */}
        <div className="w-full mb-6">
          <div 
            className="relative w-full h-80 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer"
            onClick={handleImageClick}
          >
            {product.image_urls && product.image_urls.length > 0 ? (
              <Image
                src={normalizeImageUrl(product.image_urls[currentImageIndex])}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
                unoptimized={product.image_urls[currentImageIndex]?.startsWith('http://localhost') || product.image_urls[currentImageIndex]?.startsWith('http://127.0.0.1')}
                onError={(e) => {
                  console.error("Image load error:", normalizeImageUrl(product.image_urls[currentImageIndex]));
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-neutral-600" />
              </div>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.image_urls.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    currentImageIndex === i
                      ? "border-green-600"
                      : "border-neutral-800"
                  }`}
                >
                  <Image
                    src={normalizeImageUrl(img)}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={img?.startsWith('http://localhost') || img?.startsWith('http://127.0.0.1')}
                    onError={(e) => {
                      console.error("Image load error:", normalizeImageUrl(img));
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Centered */}
        <div className="w-full space-y-4 text-center">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <p className="text-2xl font-bold text-green-500">{product.price}</p>

          <div className="text-left">
            <h3 className="text-sm font-semibold mb-2 text-neutral-300">Specifications</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              {product.specs.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="text-green-500">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm pt-2">
            <span className="text-neutral-300">Warranty: </span>
            <span className="text-neutral-400">{product.warranty}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href={waLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 left-4 right-4 bg-green-600 text-center py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors"
      >
        Order on WhatsApp
      </a>

      {/* Full Screen Image Viewer */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={handleCloseFullScreen}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseFullScreen}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center relative px-4 py-20">
            {/* Previous Button */}
            {product.image_urls && product.image_urls.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 z-10 w-12 h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Image */}
            <div 
              className="relative w-full h-full max-w-4xl max-h-[70vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {product.image_urls && product.image_urls.length > 0 ? (
                <Image
                  src={normalizeImageUrl(product.image_urls[currentImageIndex])}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized={product.image_urls[currentImageIndex]?.startsWith('http://localhost') || product.image_urls[currentImageIndex]?.startsWith('http://127.0.0.1')}
                  onError={(e) => {
                    console.error("Image load error:", normalizeImageUrl(product.image_urls[currentImageIndex]));
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-neutral-600" />
                </div>
              )}
            </div>

            {/* Next Button */}
            {product.image_urls && product.image_urls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 z-10 w-12 h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Image Indicators */}
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex justify-center gap-2 pb-4">
              {product.image_urls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentImageIndex === i ? "bg-green-500" : "bg-neutral-600"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Order Button */}
          <div className="px-4 pb-8" onClick={(e) => e.stopPropagation()}>
            <a
              href={waLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 text-center py-4 rounded-2xl font-semibold hover:bg-green-700 transition-colors text-white"
            >
              Order Now
            </a>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-3 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => {
              onBack();
              onNavClick("home");
            }}
          />
          {/* <Nav 
            icon={<Laptop />} 
            label="Laptops" 
            onClick={() => {
              onBack();
              onCategoryChange("Laptops");
            }}
          />
          <Nav 
            icon={<Gamepad2 />} 
            label="Gaming" 
            onClick={() => {
              onBack();
              onCategoryChange("Gaming PCs");
            }}
          /> */}
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            active={false}
            onClick={() => {
              onBack();
              onCategoryChange("All");
              onNavClick("shop");
            }}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
            active={false}
            onClick={() => onNavClick("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function ShopPage({
  query,
  setQuery,
  activeCategory,
  setActiveCategory,
  filtered,
  onProductClick,
  onNavClick
}: {
  query: string;
  setQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filtered: Product[];
  onProductClick: (product: Product) => void;
  onNavClick: (view: View) => void;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header - without LEVELS TECH SERVICES heading */}
      <header className="sticky top-0 z-20 bg-neutral-950 border-b border-neutral-800">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-2">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search laptops, gaming PC..."
              className="bg-transparent text-sm flex-1 outline-none"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.name;
          return (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs border flex items-center gap-2 ${
                isActive
                  ? "bg-green-600 border-green-600 text-white"
                  : "border-neutral-800 text-neutral-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid - All Products */}
      <main className="flex-1 px-4 pb-24 pt-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold mb-3">
            {query 
              ? `Search Results (${filtered.length})` 
              : activeCategory === "All" 
                ? "All Products" 
                : `${activeCategory} (${filtered.length})`}
          </h2>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onProductClick(p)}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer"
              >
                <div className="relative h-28 w-full">
                  {p.image_urls && p.image_urls.length > 0 ? (
                    <Image
                      src={normalizeImageUrl(p.image_urls[0])}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized={p.image_urls[0]?.startsWith('http://localhost') || p.image_urls[0]?.startsWith('http://127.0.0.1')}
                      onError={(e) => {
                        console.error("Image load error:", normalizeImageUrl(p.image_urls[0]));
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{p.category}</p>
                  <p className="text-sm font-semibold mt-2">{p.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-3 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => onNavClick("home")}
          />
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            active={true}
            onClick={() => onNavClick("shop")}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
            active={false}
            onClick={() => onNavClick("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function ProfilePage({ 
  onBack,
  onNavClick,
  onCategoryChange
}: { 
  onBack: () => void;
  onNavClick: (view: View) => void;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 pb-24">
        {/* Profile Header */}
        <div className="w-full text-center space-y-4 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-700 mx-auto flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">LEVELSPROTECH SHOP</h1>
          <p className="text-neutral-400">Your Trusted Tech Partner</p>
        </div>

        {/* Dashboard Button */}
        <button
          onClick={() => onNavClick("dashboard")}
          className="w-full mb-3 flex items-center gap-3 p-4 rounded-2xl bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold"
        >
          <Settings className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        {/* Contact Info */}
        <div className="w-full space-y-3">
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-green-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-400">WhatsApp</p>
              <p className="text-sm font-medium">+255 674 373 436</p>
            </div>
          </a>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
              <Mail className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-400">Email</p>
              <p className="text-sm font-medium">info@levelsprotech.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-400">Location</p>
              <p className="text-sm font-medium">Morogoro-Msamvu, Tanzania</p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="w-full mt-8 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <h2 className="text-sm font-semibold mb-2">About Us</h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            We specialize in providing high-quality laptops, desktops, gaming PCs, and tech accessories. 
            All products come with warranty and excellent customer support.
          </p>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-3 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => {
              onBack();
              onNavClick("home");
            }}
          />
          {/* <Nav 
            icon={<Laptop />} 
            label="Laptops" 
            onClick={() => {
              onBack();
              onCategoryChange("Laptops");
            }}
          />
          <Nav 
            icon={<Gamepad2 />} 
            label="Gaming" 
            onClick={() => {
              onBack();
              onCategoryChange("Gaming PCs");
            }}
          /> */}
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            active={false}
            onClick={() => {
              onBack();
              onCategoryChange("All");
              onNavClick("shop");
            }}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
            active={true}
            onClick={() => onNavClick("profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function DashboardPage({
  products,
  onRefresh,
  onBack,
  onNavClick
}: {
  products: Product[];
  onRefresh: () => Promise<void>;
  onBack: () => void;
  onNavClick: (view: View) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Laptops",
    price: "",
    warranty: "3 Months",
    specs: [""],
    images: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!formData.name || !formData.price) {
      setSubmitError("Please fill in all required fields (name, price)");
      return;
    }

    // Check if at least one image is provided (base64 or URL)
    const validImages = formData.images.filter(img => img.trim() !== "");
    if (validImages.length === 0) {
      setSubmitError("At least one image is required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Extract base64 images (those starting with data:)
      const imagesData = validImages
        .filter(img => img.startsWith('data:'))
        .map(img => {
          // Remove data:image/...;base64, prefix to get just the base64 string
          const base64Index = img.indexOf(',');
          return base64Index !== -1 ? img.substring(base64Index + 1) : img;
        });

      if (imagesData.length === 0) {
        setSubmitError("Please upload at least one image file");
        return;
      }

      await createProduct({
        name: formData.name,
        category: formData.category,
        price: formData.price,
        warranty: formData.warranty,
        specs: formData.specs.filter(s => s.trim() !== ""),
        images_data: imagesData,
      });
      
      // Reset form
      setFormData({
        name: "",
        category: "Laptops",
        price: "",
        warranty: "3 Months",
        specs: [""],
        images: [""],
      });
      
      // Refresh products list
      await onRefresh();
      
      // Close the form
      setShowAddForm(false);
      
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        setIsSubmitting(true);
        await deleteProduct(id);
        await onRefresh();
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert(error instanceof Error ? error.message : "Failed to delete product");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const addSpecField = () => {
    setFormData({ ...formData, specs: [...formData.specs, ""] });
  };

  const removeSpecField = (index: number) => {
    setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) });
  };

  const updateSpec = (index: number, value: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index] = value;
    setFormData({ ...formData, specs: newSpecs });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleImageUpload = (index: number, file: File | null) => {
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newImages = [...formData.images];
      newImages[index] = base64String;
      setFormData({ ...formData, images: newImages });
    };
    reader.onerror = () => {
      alert("Error reading image file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="sticky top-0 z-20 bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-green-500">← Back</button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Products List Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Products ({products.length})</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No products yet. Click "Add Product" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden hover:border-green-600 transition-colors"
                  >
                    <div className="relative h-48 w-full">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <Image
                          src={normalizeImageUrl(product.image_urls[0])}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized={product.image_urls[0]?.startsWith('http://localhost') || product.image_urls[0]?.startsWith('http://127.0.0.1')}
                          onError={(e) => {
                            console.error("Image load error:", normalizeImageUrl(product.image_urls[0]));
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-700">
                          <ImageIcon className="w-12 h-12 text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-neutral-400 mb-2">{product.category}</p>
                      <p className="text-green-500 font-medium mb-3">{product.price}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Product Form - Collapsible */}
          {showAddForm && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Add New Product
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              {submitError && (
                <div className="bg-red-900/50 border border-red-600 rounded-xl p-3 text-sm text-red-300">
                  {submitError}
                </div>
              )}
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-green-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-green-500"
                  required
                >
                  {categories.filter(c => c.name !== "All").map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 950,000 TZS"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-green-500"
                  required
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-sm font-medium mb-2">Warranty</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  placeholder="e.g., 3 Months"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-green-500"
                />
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium mb-2">Specifications</label>
                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => updateSpec(index, e.target.value)}
                      placeholder={`Spec ${index + 1}`}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-green-500"
                    />
                    {formData.specs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecField(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-xl"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecField}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  + Add Specification
                </button>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Images *</label>
                {formData.images.map((image, index) => (
                  <div key={index} className="mb-4 space-y-2">
                    <div className="flex gap-2">
                      {/* File Upload */}
                      <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl cursor-pointer transition-colors flex-1">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageUpload(index, file);
                          }}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                      </label>
                      
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-xl"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Image Preview */}
                    {image && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700">
                        {image.startsWith('data:') || image.startsWith('http') || image.startsWith('/') ? (
                          <Image
                            src={image}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized={image.startsWith('data:') || image.startsWith('http://localhost') || image.startsWith('http://127.0.0.1')}
                            onError={(e) => {
                              console.error("Image preview error:", image);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-sm text-green-500 hover:text-green-400 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Image
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Product"}
              </button>
            </form>
          </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-3 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => onNavClick("home")}
          />
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            active={false}
            onClick={() => onNavClick("shop")}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
            active={false}
            onClick={() => {
              onBack();
              onNavClick("profile");
            }}
          />
        </div>
      </nav>
    </div>
  );
}

function Nav({ 
  icon, 
  label, 
  active = false,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? "text-green-500" : "text-neutral-400"
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
}
