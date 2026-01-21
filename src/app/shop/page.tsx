"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    stock: number;
}

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const url = selectedCategory
                ? `/api/products?category=${selectedCategory}`
                : '/api/products';
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json() as Product[];
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    };

    const [allCategories, setAllCategories] = useState<string[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json() as Product[];
                const categories = Array.from(new Set(data.flatMap(p => {
                    try {
                        const parsed = JSON.parse(p.category);
                        return Array.isArray(parsed) ? parsed : [p.category];
                    } catch {
                        return [p.category];
                    }
                }))).filter(Boolean);
                setAllCategories(categories);
            }
        };
        fetchCategories();
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/')) return url;
        return `/${url}`;
    };

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-black uppercase mb-6 leading-none">
                        Castle <span className="text-[#f00000]">Shop</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Premium branded products and custom solutions for your business
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="px-6 md:px-12 lg:px-20 mb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${!selectedCategory
                                ? "bg-[#f00000] text-white"
                                : "bg-[#121212] text-gray-400 hover:text-white border border-gray-800"
                                }`}
                        >
                            All Products
                        </button>
                        {allCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold uppercase transition ${selectedCategory === cat
                                    ? "bg-[#f00000] text-white"
                                    : "bg-[#121212] text-gray-400 hover:text-white border border-gray-800"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="px-6 md:px-12 lg:px-20 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="inline-block w-8 h-8 border-4 border-[#f00000] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 mt-4">Loading products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/shop/${product.id}`}
                                    className="bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#f00000]/50 transition group block"
                                >
                                    <div className="relative h-64 bg-[#0a0a0a] overflow-hidden">
                                        {product.image_url ? (
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <i className="bi bi-box text-6xl"></i>
                                            </div>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-1">
                                            {(() => {
                                                try {
                                                    const cats = JSON.parse(product.category);
                                                    const catList = Array.isArray(cats) ? cats : [product.category];
                                                    return catList.map((c, i) => (
                                                        <span key={i} className="text-[#f00000] text-[10px] font-bold uppercase tracking-wider">
                                                            {c}{i < catList.length - 1 ? " • " : ""}
                                                        </span>
                                                    ));
                                                } catch {
                                                    return (
                                                        <span className="text-[#f00000] text-[10px] font-bold uppercase tracking-wider">
                                                            {product.category}
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </div>
                                        <h3 className="text-xl font-bold mt-2 mb-2">{product.name}</h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-black text-[#f00000]">
                                                Rs {product.price.toFixed(2)}
                                            </span>
                                            <span className="text-sm text-gray-400 group-hover:text-[#f00000] transition">
                                                View Details <i className="bi bi-arrow-right ml-1"></i>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
