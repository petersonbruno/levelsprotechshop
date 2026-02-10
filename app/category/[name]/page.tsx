"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Image as ImageIcon } from "lucide-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProducts, normalizeImageUrl, type ApiProduct } from "@/lib/api";

type Product = ApiProduct;

export default function CategoryPage({ params }: { params: Promise<{ name: string }> | { name: string } }) {
  const resolvedParams = (React as any).use(params) as { name?: string };
  const name = decodeURIComponent(resolvedParams?.name || "");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCachedProducts(category: string) {
    try {
      const raw = sessionStorage.getItem(`products:${category}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.data) return null;
      if (Date.now() - parsed.ts > CACHE_TTL) {
        sessionStorage.removeItem(`products:${category}`);
        return null;
      }
      return parsed.data as Product[];
    } catch (err) {
      return null;
    }
  }

  function setCachedProducts(category: string, data: Product[]) {
    try {
      sessionStorage.setItem(`products:${category}`, JSON.stringify({ ts: Date.now(), data }));
    } catch (err) {
      // ignore
    }
  }

  // Load products once per category (use cached value if available). Do not refetch on every query change.
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const cached = getCachedProducts(name);
        if (cached) {
          if (!mounted) return;
          setProducts(cached);
          setLoading(false);
          return;
        }

        const res = await fetchProducts({ category: name });
        if (!mounted) return;
        setProducts(res || []);
        setCachedProducts(name, res || []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [name]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="sticky top-0 z-20 bg-neutral-950 border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-green-500">← Back</Link>
            <h1 className="text-lg font-semibold">{name}</h1>
          </div>
          <div className="w-1/2">
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-2">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${name}...`}
                className="bg-transparent text-sm w-full outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold mb-3">{name} ({products.length})</h2>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No products in this category</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="text-left rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden hover:border-green-600 transition-colors">
                <div className="relative h-28 w-full bg-neutral-800">
                  {p.image_urls && p.image_urls.length > 0 ? (
                    <Image
                      src={normalizeImageUrl(p.image_urls[0])}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function shouldUnoptimizeImage(url: string | undefined | null): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return true;
  const normalized = normalizeImageUrl(url);
  return (
    normalized.startsWith('http://localhost') ||
    normalized.startsWith('http://127.0.0.1') ||
    normalized.includes('pythonanywhere.com')
  );
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  const parent = target.parentElement;
  if (parent) {
    target.style.display = 'none';
    if (!parent.querySelector('.image-error-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-error-placeholder absolute inset-0 flex items-center justify-center bg-neutral-800';
      placeholder.innerHTML = '<svg class="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
      parent.appendChild(placeholder);
    }
  }
}

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.52 3.48A11.9 11.9 0 0012 .5C6.21.5 1.5 5.21 1.5 11c0 1.95.51 3.86 1.48 5.57L.5 23.5l6.15-1.62A11.5 11.5 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5 0-3.03-1.18-5.86-3.98-7.52zM12 20.5c-1.1 0-2.18-.15-3.18-.44l-.23-.08-3.65.96.98-3.57-.08-.23A8.5 8.5 0 013.5 11c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5S16.69 20.5 12 20.5z" />
      <path d="M17.57 14.45c-.29-.14-1.71-.84-1.97-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.91 1.13-.17.19-.33.21-.62.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.12.29-.33.44-.5.15-.17.2-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44 0 1.44 1.03 2.83 1.17 3.03.14.19 2.03 3.1 4.92 4.35 1.37.58 1.93.62 2.62.52.41-.06 1.71-.7 1.95-1.36.24-.66.24-1.23.17-1.36-.07-.12-.26-.19-.55-.33z" fill="#fff" />
    </svg>
  );
}

function waLink(p: Product) {
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '255674373436';
  const text = `Hello 👋\nI want to buy:\n\n${p.name}\nSpecs: ${p.specs?.join(', ')}\nPrice: ${p.price}\nWarranty: ${p.warranty}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}


