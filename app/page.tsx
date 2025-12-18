"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Laptop, Gamepad2, ShoppingBag, User, Search, Phone, Mail, MapPin, Monitor, Headphones, Grid3x3, TrendingUp } from "lucide-react";
import Image from "next/image";

const WHATSAPP = "255674373436";

const categories = [
  { name: "All", icon: Grid3x3 },
  { name: "Laptops", icon: Laptop },
  { name: "Desktops", icon: Monitor },
  { name: "Gaming PCs", icon: Gamepad2 },
  { name: "Accessories", icon: Headphones },
];

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  specs: string[];
  warranty: string;
  images: string[];
};

const products: Product[] = [
  {
    id: 1,
    name: "HP EliteBook 840 G6",
    category: "Laptops",
    price: "950,000 TZS",
    specs: ["Intel i5", "8GB RAM", "256GB SSD"],
    warranty: "3 Months",
    images: [
      "/image/product/laptop 05a.jpg",
      "/image/product/laptop 05b.jpg",
      "/image/product/laptop 05c.jpg",
    ],
  },
  {
    id: 2,
    name: "Custom Gaming PC",
    category: "Gaming PCs",
    price: "1,850,000 TZS",
    specs: ["Ryzen 5", "16GB RAM", "RTX 3060"],
    warranty: "6 Months",
    images: [
      "/image/product/desktop 01a.jpg",
      "/image/product/desktop 01b.jpg",
    ],
  },
  {
    id: 3,
    name: "Dell OptiPlex 7080",
    category: "Desktops",
    price: "780,000 TZS",
    specs: ["Intel i7", "16GB RAM", "512GB SSD"],
    warranty: "3 Months",
    images: [
      "/image/product/moniter 01a.jpg",
      "/image/product/moniter 01b.jpg",
      "/image/product/moniter 01c.jpg",
    ],
  },
  {
    id: 4,
    name: "Dell 3189 X360 Convertible",
    category: "Laptops",
    price: "330,000 TZS",
    specs: ["RAM 4GB", "SSD 128GB", "Touch Screen", "X360 Convertible"],
    warranty: "3 Months",
    images: [
      "/image/product/laptop 01a.jpg",
      "/image/product/laptop 01b.jpg",
      "/image/product/laptop 01c.jpg",
    ],
  },
  {
    id: 5,
    name: "HP ProBook x360 11 G5 EE",
    category: "Laptops",
    price: "450,000 TZS",
    specs: [
      "Intel Pentium 5th Generation",
      "11.6\" HD 1366 x 768 Pixels",
      "RAM 8GB",
      "SSD 256GB",
      "Intel UHD Graphics 600",
      "Touch Screen",
    ],
    warranty: "3 Months",
    images: [
      "/image/product/laptop 02a.jpg",
      "/image/product/laptop 02b.jpg",
      "/image/product/laptop 02c.jpg",
    ],
  },
  {
    id: 6,
    name: "HP EliteBook 840 Aero",
    category: "Laptops",
    price: "900,000 TZS",
    specs: [
      "11th Gen Intel Core i5-1145G7 @2.61Ghz",
      "16GB RAM",
      "256GB SSD Storage",
      "Fingerprint & Face ID",
      "Keyboard Lights",
      "14\" Display",
      "Bang and Olufsen Speaker",
    ],
    warranty: "3 Months",
    images: [
      "/image/product/laptop 03a.jpg",
      "/image/product/laptop 03b.jpg",
      "/image/product/laptop 03c.jpg",
    ],
  },
  {
    id: 7,
    name: "Canon Printer",
    category: "Accessories",
    price: "185,000 TZS",
    specs: ["Copy", "Scan", "Print"],
    warranty: "3 Months",
    images: [
      "/image/product/printer.jpg",
      "/image/product/printer1.jpg",
    ],
  },
  {
    id: 8,
    name: "HP ProBook 11 G5 EE Touch Screen",
    category: "Laptops",
    price: "360,000 TZS",
    specs: [
      "Intel Pentium Processor",
      "11.5 inches Display",
      "HDMI, WiFi, Keyboard, Battery",
      "192GB SSD Storage",
      "4GB RAM",
      "Touch Screen",
      "Refurbished",
      "Includes Charger",
    ],
    warranty: "3 Months",
    images: [
      "/image/product/laptop 04a.jpg",
      "/image/product/laptop 04b.jpg",
      "/image/product/laptop 04c.jpg",
    ],
  },
];

function waLink(p: Product) {
  const text = `Hello 👋\nI want to buy:\n\n${p.name}\nSpecs: ${p.specs.join(", ")}\nPrice: ${p.price}\nWarranty: ${p.warranty}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

type View = "home" | "details" | "profile";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<View>("home");

  const popularProducts = products.slice(0, 3); // First 3 products as popular

  const filtered = products.filter((p) => {
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleProductClick = (product: Product) => {
    setSelected(product);
    setCurrentView("details");
  };

  const handleBackToHome = () => {
    setSelected(null);
    setCurrentView("home");
  };

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
        onNavClick={(view) => setCurrentView(view)}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setCurrentView("home");
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
          <h1 className="text-lg font-semibold">ABDUL TECH SERVICES</h1>
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

      {/* Popular Products Section */}
      {activeCategory === "All" && query === "" && (
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
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
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
      <main className="flex-1 px-4 pb-24 pt-4">
        {activeCategory === "All" && query === "" && (
          <div className="mb-4">
            <h2 className="text-base font-semibold mb-3">All Products</h2>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleProductClick(p)}
              className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer"
            >
              <div className="relative h-28 w-full">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{p.category}</p>
                <p className="text-sm font-semibold mt-2">{p.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-5 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            active={currentView === "home"}
            onClick={() => setCurrentView("home")}
          />
          <Nav 
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
          />
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            onClick={() => {
              setActiveCategory("All");
              setCurrentView("home");
              setQuery("");
            }}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <button onClick={onBack} className="p-4 text-sm text-green-500 w-fit">← Back</button>

      {/* Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 pb-24">
        {/* Image Carousel */}
        <div className="w-full mb-6">
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <Image
              src={product.images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          
          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
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
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
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

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-5 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => {
              onBack();
              onNavClick("home");
            }}
          />
          <Nav 
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
          />
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            onClick={() => {
              onBack();
              onCategoryChange("All");
            }}
          />
          <Nav 
            icon={<User />} 
            label="Profile" 
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
          <h1 className="text-2xl font-semibold">ABDUL TECH SERVICES</h1>
          <p className="text-neutral-400">Your Trusted Tech Partner</p>
        </div>

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
              <p className="text-sm font-medium">Dar es Salaam, Tanzania</p>
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
        <div className="grid grid-cols-5 py-2 text-xs text-neutral-400">
          <Nav 
            icon={<Home />} 
            label="Home" 
            onClick={() => {
              onBack();
              onNavClick("home");
            }}
          />
          <Nav 
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
          />
          <Nav 
            icon={<ShoppingBag />} 
            label="Shop" 
            onClick={() => {
              onBack();
              onCategoryChange("All");
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
