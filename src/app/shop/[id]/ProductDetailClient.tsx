"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    images: string;
    tags: string;
    sku?: string;
    stock: number;
    is_active: number;
}

export default function ProductDetailClient() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageList, setImageList] = useState<string[]>([]);
    const [tagList, setTagList] = useState<string[]>([]);

    useEffect(() => {
        loadProduct();
    }, [params.id]);

    const loadProduct = async () => {
        try {
            const res = await fetch(`/api/products/${params.id}`);
            if (res.ok) {
                const data = await res.json() as Product;
                setProduct(data);

                // Parse images
                const imgs = data.images ? JSON.parse(data.images) : [];
                setImageList(imgs);

                // Parse tags
                const tags = data.tags ? JSON.parse(data.tags) : [];
                setTagList(tags);
            } else {
                router.push('/shop');
            }
        } catch (error) {
            console.error("Failed to load product", error);
            router.push('/shop');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('/')) return url;
        return `/${url}`;
    };

    const handleOrder = () => {
        // TODO: Implement order/contact functionality
        alert(`Order functionality coming soon! Product: ${product?.name}`);
    };

    if (loading) {
        return (
            <main className="bg-[#050505] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-[#f00000] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading product...</p>
                </div>
            </main>
        );
    }

    if (!product) return null;

    return (
        <main className="bg-[#050505] min-h-screen text-white">
            <Navigation />

            <section className="pt-32 pb-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/shop')}
                        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Shop
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Image Gallery */}
                        <div>
                            {/* Main Image */}
                            <div className="bg-[#121212] rounded-2xl overflow-hidden mb-4 aspect-square">
                                {imageList.length > 0 ? (
                                    <img
                                        src={getImageUrl(imageList[selectedImage])}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        <i className="bi bi-box text-6xl"></i>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {imageList.length > 1 && (
                                <div className="grid grid-cols-5 gap-3">
                                    {imageList.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-xl overflow-hidden border-2 transition ${selectedImage === index
                                                ? 'border-[#f00000]'
                                                : 'border-gray-800 hover:border-gray-600'
                                                }`}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div>
                            <span className="text-[#f00000] text-sm font-bold uppercase tracking-wider">
                                {product.category}
                            </span>
                            <h1 className="text-5xl md:text-6xl font-black uppercase mb-4 mt-2">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-4xl font-black text-[#f00000]">
                                    Rs {product.price.toFixed(2)}
                                </span>
                                {product.stock > 0 ? (
                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                                        In Stock ({product.stock} available)
                                    </span>
                                ) : (
                                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <div className="bg-[#121212] rounded-2xl p-6 mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                                    Description
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Tags */}
                            {tagList.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tagList.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="bg-[#121212] border border-gray-800 text-gray-300 px-3 py-1.5 rounded-full text-sm"
                                            >
                                                <i className="bi bi-tag-fill text-xs text-[#f00000] mr-2"></i>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleOrder}
                                    disabled={product.stock === 0}
                                    className={`flex-1 py-4 rounded-full font-bold uppercase text-sm transition ${product.stock === 0
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'bg-[#f00000] text-white hover:bg-red-700'
                                        }`}
                                >
                                    {product.stock === 0 ? (
                                        <>
                                            <i className="bi bi-x-circle mr-2"></i>
                                            Sold Out
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-cart-plus mr-2"></i>
                                            Order Now
                                        </>
                                    )}
                                </button>
                                <button className="px-6 py-4 bg-[#121212] border border-gray-800 rounded-full hover:border-gray-600 transition">
                                    <i className="bi bi-share text-xl"></i>
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="mt-8 pt-8 border-t border-gray-800">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">SKU</p>
                                        <p className="font-bold">{product.sku || `CASTLE-${product.id}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Availability</p>
                                        <p className="font-bold">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
