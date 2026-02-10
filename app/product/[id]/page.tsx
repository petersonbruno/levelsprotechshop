"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { normalizeImageUrl, type ApiProduct } from "@/lib/api";
import { useProduct } from "@/lib/hooks";

function shouldUnoptimizeImage(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("data:")) return true;
  const normalized = normalizeImageUrl(url);
  return (
    normalized.startsWith("http://localhost") ||
    normalized.startsWith("http://127.0.0.1") ||
    normalized.includes("pythonanywhere.com")
  );
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  const parent = target.parentElement;
  if (parent) {
    target.style.display = "none";
    if (!parent.querySelector(".image-error-placeholder")) {
      const placeholder = document.createElement("div");
      placeholder.className = "image-error-placeholder absolute inset-0 flex items-center justify-center bg-neutral-800";
      placeholder.innerHTML = '<svg class="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
      parent.appendChild(placeholder);
    }
  }
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20.52 3.48A11.9 11.9 0 0012 .5C6.21.5 1.5 5.21 1.5 11c0 1.95.51 3.86 1.48 5.57L.5 23.5l6.15-1.62A11.5 11.5 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5 0-3.03-1.18-5.86-3.98-7.52zM12 20.5c-1.1 0-2.18-.15-3.18-.44l-.23-.08-3.65.96.98-3.57-.08-.23A8.5 8.5 0 013.5 11c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5S16.69 20.5 12 20.5z" />
      <path d="M17.57 14.45c-.29-.14-1.71-.84-1.97-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.91 1.13-.17.19-.33.21-.62.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.12.29-.33.44-.5.15-.17.2-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44 0 1.44 1.03 2.83 1.17 3.03.14.19 2.03 3.1 4.92 4.35 1.37.58 1.93.62 2.62.52.41-.06 1.71-.7 1.95-1.36.24-.66.24-1.23.17-1.36-.07-.12-.26-.19-.55-.33z" fill="#fff" />
    </svg>
  );
}

function waLink(product: ApiProduct) {
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "255674373436";
  const text = `Hello 👋\nI want to buy:\n\n${product.name}\nSpecs: ${product.specs?.join(", ")}\nPrice: ${product.price}\nWarranty: ${product.warranty}`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolved = (React as any).use(params) as { id?: string };
  const id = resolved?.id || "";
  const { product, isLoading, error } = useProduct(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (isLoading) return <div className="flex-1 flex items-center justify-center p-6"><p className="text-neutral-400">Loading...</p></div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!product) return <div className="p-6">Product not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="p-4 text-sm"><Link href="/" className="text-green-500">← Back</Link></div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 pb-40">
        <div className="w-full mb-6">
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 cursor-pointer" onClick={() => setIsFullScreen(true)}>
            {product.image_urls && product.image_urls.length > 0 ? (
              <Image src={normalizeImageUrl(product.image_urls[currentImageIndex])} alt={product.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 800px" unoptimized={shouldUnoptimizeImage(product.image_urls[currentImageIndex])} onError={handleImageError} />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 bg-neutral-800" /></div>
            )}
          </div>

          {product.image_urls && product.image_urls.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.image_urls.map((img, i) => (
                <button key={i} onClick={() => setCurrentImageIndex(i)} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImageIndex === i ? "border-green-600" : "border-neutral-800"}`}>
                  <Image src={normalizeImageUrl(img)} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" unoptimized={shouldUnoptimizeImage(img)} onError={handleImageError} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full space-y-4 text-center">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <p className="text-2xl font-bold text-green-500">{product.price}</p>

          <div className="text-left">
            <h3 className="text-sm font-semibold mb-2 text-neutral-300">Specifications</h3>
            <ul className="text-sm text-neutral-400 space-y-2">
              {product.specs?.map((s) => (
                <li key={s} className="flex items-center gap-2"><span className="text-green-500">•</span><span>{s}</span></li>
              ))}
            </ul>
          </div>

          <div className="text-sm pt-2"><span className="text-neutral-300">Warranty: </span><span className="text-neutral-400">{product.warranty}</span></div>
        </div>

        <a href={waLink(product)} target="_blank" rel="noopener noreferrer" className="fixed bottom-20 left-4 right-4 bg-green-600 text-center py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors text-white">
          <span className="inline-flex items-center justify-center gap-2"><WhatsAppIcon className="w-5 h-5 text-white" /><span>Order on WhatsApp</span></span>
        </a>

        {isFullScreen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={() => setIsFullScreen(false)}>
            <button onClick={() => setIsFullScreen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"><X className="w-5 h-5 text-white" /></button>
            <div className="flex-1 flex items-center justify-center relative px-4 py-20">
              {product.image_urls && product.image_urls.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i - 1 + product.image_urls.length) % product.image_urls.length); }} className="absolute left-4 z-10 w-12 h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"><ChevronLeft className="w-6 h-6 text-white" /></button>
              )}

              <div className="relative w-full h-full max-w-4xl max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                {product.image_urls && product.image_urls.length > 0 ? (
                  <Image src={normalizeImageUrl(product.image_urls[currentImageIndex])} alt={`${product.name} - Image ${currentImageIndex + 1}`} fill className="object-contain" sizes="100vw" unoptimized={shouldUnoptimizeImage(product.image_urls[currentImageIndex])} onError={handleImageError} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" />
                )}
              </div>

              {product.image_urls && product.image_urls.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i + 1) % product.image_urls.length); }} className="absolute right-4 z-10 w-12 h-12 rounded-full bg-neutral-800/80 hover:bg-neutral-700 flex items-center justify-center transition-colors"><ChevronRight className="w-6 h-6 text-white" /></button>
              )}
            </div>

            <div className="px-4 pb-8" onClick={(e) => e.stopPropagation()}>
              <a href={waLink(product)} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-center py-4 rounded-2xl font-semibold hover:bg-green-700 transition-colors text-white"><span className="inline-flex items-center justify-center gap-2"><WhatsAppIcon className="w-5 h-5 text-white" /><span>Order Now</span></span></a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
