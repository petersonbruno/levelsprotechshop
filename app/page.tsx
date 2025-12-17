"use client";

import { motion } from "framer-motion";
import { Home, Laptop, Gamepad2, Monitor, ShoppingBag, MessageCircle, User } from "lucide-react";
import Image from "next/image";

const WHATSAPP = "255674373436";

const products = [
  {
    id: 1,
    name: "HP EliteBook 840 G6",
    category: "Laptops",
    price: "950,000 TZS",
    specs: "i5 • 8GB RAM • 256GB SSD",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  },
  {
    id: 2,
    name: "Custom Gaming PC",
    category: "Gaming PCs",
    price: "1,850,000 TZS",
    specs: "Ryzen 5 • 16GB • RTX 3060",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
  },
  {
    id: 3,
    name: "Dell OptiPlex 7080",
    category: "Desktops",
    price: "780,000 TZS",
    specs: "i7 • 16GB • 512GB SSD",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d1",
  },
  {
    id: 4,
    name: "Wireless Mouse",
    category: "Accessories",
    price: "25,000 TZS",
    specs: "2.4GHz • Silent Click",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
  },
];

function waLink(p: typeof products[0]) {
  const text = `Hello 👋\nI want to buy this product:\n\nProduct: ${p.name}\nSpecs: ${p.specs}\nPrice: ${p.price}\n\nIs it available?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export default function LevelsProTechApp() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">LevelsProTechShop</h1>
          <MessageCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="px-4 pb-3">
          <input
            placeholder="Search laptops, gaming PC, accessories…"
            className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm focus:outline-none"
          />
        </div>
      </header>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {["All", "Laptops", "Desktops", "Gaming PCs", "Accessories"].map((c) => (
          <span
            key={c}
            className="shrink-0 rounded-full border border-neutral-800 px-4 py-1 text-xs"
          >
            {c}
          </span>
        ))}
      </div>

      {/* Products */}
      <main className="flex-1 px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <motion.a
              whileTap={{ scale: 0.97 }}
              key={p.id}
              href={waLink(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden"
            >
              <div className="relative h-28 w-full">
                <Image 
                  src={p.image} 
                  alt={p.name} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
                <p className="text-xs text-neutral-400 mt-1">{p.specs}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold">{p.price}</span>
                  <span className="text-xs text-green-500">Order</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-neutral-950 border-t border-neutral-800">
        <div className="grid grid-cols-5 px-2 py-2 text-xs">
          <Nav icon={<Home />} label="Home" />
          <Nav icon={<Laptop />} label="Laptops" />
          <Nav icon={<Gamepad2 />} label="Gaming" />
          <Nav icon={<ShoppingBag />} label="Shop" />
          <Nav icon={<User />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function Nav({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-neutral-400">
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
