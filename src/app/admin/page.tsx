"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Types
interface User {
    id: number;
    email: string;
    plan: string;
    role: string;
    enterprise_id: number | null;
    avatar_url: string | null;
    slug: string | null;
    created_at: string;
    sub_license_count: number;
    parent_id: number | null;
    products?: User[];
}

interface Enterprise {
    id: number;
    company_name: string;
    license_count: number;
    sub_license_count: number;
    logo: string | null;
    super_admin_email: string | null;
    staff_count: number;
    active_sub_licenses: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    images: string;  // JSON string of image URLs
    tags: string;    // JSON string of tags for search optimization
    stock: number;
    is_active: number;
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [masterKey, setMasterKey] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'enterprise_grid' | 'products' | string>('dashboard');

    // Data
    const [users, setUsers] = useState<User[]>([]);
    const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, paidUsers: 0, enterpriseCount: 0 });

    // Modals
    const [modal, setModal] = useState<{ type: 'user' | 'enterprise' | 'licenses' | 'product' | null, data?: any }>({ type: null });

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem('castle_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Gatekeeper
        const key = sessionStorage.getItem('castle_master_key');
        if (!key) {
            const input = prompt("CRITICAL SYSTEM ACCESS: Enter Master Administrator Key to proceed.");
            if (input) {
                sessionStorage.setItem('castle_master_key', input);
                setMasterKey(input);
            } else {
                router.push('/dashboard');
            }
        } else {
            setMasterKey(key);
        }
    }, [router]);

    useEffect(() => {
        if (masterKey) {
            loadData();
        }
    }, [masterKey]);

    const loadData = async () => {
        setLoading(true);
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('castle_token')}`,
                'X-Admin-Master-Key': masterKey!
            };

            const [resUsers, resEnts] = await Promise.all([
                fetch('/api/admin/users', { headers }),
                fetch('/api/admin/enterprises', { headers })
            ]);

            if (resUsers.status === 403 || resEnts.status === 403) {
                alert("Invalid Master Key");
                sessionStorage.removeItem('castle_master_key');
                window.location.reload();
                return;
            }

            const usersData: User[] = await resUsers.json();
            const enterprisesData: Enterprise[] = await resEnts.json();

            const productsRes = await fetch('/api/admin/products', { headers });
            const productsData: Product[] = await productsRes.json();

            setUsers(usersData);
            setEnterprises(enterprisesData);
            setProducts(productsData);

            // Calc Stats
            const paid = usersData.filter(u => u.plan === 'professional' || u.plan === 'executive').length;
            setStats({
                totalUsers: usersData.length,
                paidUsers: paid,
                enterpriseCount: enterprisesData.length
            });

        } catch (e) {
            console.error("Load Error", e);
            alert("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 font-semibold">LOADING SYSTEM CORE...</p>
                </div>
            </div>
        );
    }

    const renderView = () => {
        if (activeView === 'dashboard') return <DashboardView users={users} enterprises={enterprises} stats={stats} setView={setActiveView} setModal={setModal} />;
        if (activeView === 'enterprise_grid') return <EnterpriseGridView enterprises={enterprises} users={users} setModal={setModal} />;
        if (activeView === 'products') return <ProductsView products={products} setModal={setModal} />;
        return <UserGridView plan={activeView} users={users} setModal={setModal} />;
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar activeView={activeView} setView={setActiveView} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header refresh={loadData} />
                <main className="p-8">
                    {renderView()}
                </main>
            </div>
            {modal.type === 'user' && <ManageUserModal data={modal.data} close={() => setModal({ type: null })} refresh={loadData} masterKey={masterKey} />}
            {modal.type === 'enterprise' && <CreateEnterpriseModal close={() => setModal({ type: null })} refresh={loadData} masterKey={masterKey} />}
            {modal.type === 'licenses' && <ModifyLicensesModal data={modal.data} close={() => setModal({ type: null })} refresh={loadData} masterKey={masterKey} />}
            {modal.type === 'product' && <ProductModal data={modal.data} close={() => setModal({ type: null })} refresh={loadData} masterKey={masterKey} />}
        </div>
    );
}

// Subcomponents

function Sidebar({ activeView, setView }: any) {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill' },
        { id: 'starter', label: 'Starter', icon: 'bi-lightning-charge' },
        { id: 'professional', label: 'Professional', icon: 'bi-award-fill' },
        { id: 'executive', label: 'Executive', icon: 'bi-rocket-takeoff-fill' },
        { id: 'enterprise_grid', label: 'Enterprise', icon: 'bi-buildings-fill' },
        { id: 'products', label: 'Products', icon: 'bi-shop' },
    ];

    return (
        <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-black uppercase tracking-tight text-black">System Admin</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl  transition font-bold text-xs uppercase tracking-wider flex items-center gap-3
                            ${activeView === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <i className={`bi ${item.icon}`}></i>
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

function Header({ refresh }: any) {
    return (
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-tight">Castle Crew Control Center</h1>
            <button onClick={refresh} className="bg-black text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition">
                <i className="bi bi-arrow-clockwise mr-2"></i>
                Refresh
            </button>
        </header>
    );
}

function DashboardView({ users, enterprises, stats, setView, setModal }: any) {
    return (
        <div>
            <h2 className="text-3xl font-black uppercase mb-8">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Total Users</p>
                    <p className="text-4xl font-black">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Paid Users</p>
                    <p className="text-4xl font-black">{stats.paidUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Enterprises</p>
                    <p className="text-4xl font-black">{stats.enterpriseCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-black uppercase mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => setView('starter')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm">
                            View Starter Users
                        </button>
                        <button onClick={() => setView('enterprise_grid')} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm">
                            Manage Enterprises
                        </button>
                        <button onClick={() => setModal({ type: 'enterprise' })} className="w-full text-left px-4 py-3 bg-black text-white hover:bg-gray-800 rounded-xl font-bold text-sm">
                            + Create New Enterprise
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <h3 className="text-xl font-black uppercase mb-4">Recent Activity</h3>
                    <p className="text-gray-500 text-sm">Latest users:</p>
                    <ul className="mt-4 space-y-2">
                        {users.slice(0, 5).map((u: User) => (
                            <li key={u.id} className="text-sm">
                                {u.email} - <span className="font-bold">{u.plan}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function ProductsView({ products, setModal }: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-gray-900">Product Management</h2>
                <button
                    onClick={() => setModal({ type: 'product', data: null })}
                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition"
                >
                    + Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                    <div
                        key={product.id}
                        onClick={() => setModal({ type: 'product', data: product })}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                        <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <i className="bi bi-box text-6xl text-gray-400"></i>
                            )}
                        </div>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{product.category}</span>
                                <span className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-black">${product.price.toFixed(2)}</span>
                                <span className="text-xs font-bold text-gray-500">Stock: {product.stock}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ProductModal({ data, close, refresh, masterKey }: any) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: data?.name || '',
        description: data?.description || '',
        price: data?.price || 0,
        category: data?.category || 'General',
        images: (data?.images ? JSON.parse(data.images) : []) as string[],
        tags: (data?.tags ? JSON.parse(data.tags) : []) as string[],
        stock: data?.stock || 0,
        is_active: data?.is_active ?? 1
    });

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            alert("Name and price are required");
            return;
        }

        setLoading(true);
        try {
            const method = data ? 'PUT' : 'POST';
            const body = data
                ? { id: data.id, ...form }
                : form;

            const res = await fetch('/api/admin/products', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Master-Key': masterKey
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                refresh();
                close();
            } else {
                alert("Error saving product");
            }
        } catch (e) {
            alert("Error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!data || !confirm("Delete this product?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/products?id=${data.id}`, {
                method: 'DELETE',
                headers: { 'X-Admin-Master-Key': masterKey }
            });

            if (res.ok) {
                refresh();
                close();
            } else {
                alert("Error deleting product");
            }
        } catch (e) {
            alert("Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">
                    {data ? 'Edit Product' : 'Add Product'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Product Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                            rows={3}
                            placeholder="Product description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Price ($)</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Stock</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                        <input
                            type="text"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                            placeholder="e.g., Smart Cards, Merch"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Tags / Labels (for search optimization)
                        </label>
                        <TagInput
                            tags={form.tags || []}
                            onChange={(tags) => setForm({ ...form, tags })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Product Images (4-10 images)
                        </label>
                        <ImageUploader
                            images={form.images || []}
                            onChange={(images) => setForm({ ...form, images })}
                            masterKey={masterKey}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={form.is_active === 1}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <label className="ml-2 text-sm font-bold text-gray-700">Active (visible in shop)</label>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                    {data && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-50 text-red-600 font-bold px-6 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition uppercase tracking-wider text-sm"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={close}
                        className="px-6 py-4 text-gray-400 text-sm font-bold uppercase tracking-wider hover:text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

function EnterpriseGridView({ enterprises, users, setModal }: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">Enterprise Accounts</h2>
                <button onClick={() => setModal({ type: 'enterprise' })} className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold">
                    + Create Enterprise
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enterprises.map((ent: Enterprise) => {
                    const staff = users.filter((u: User) => u.enterprise_id === ent.id && u.role === 'super_admin');
                    return (
                        <div key={ent.id} className="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-lg transition cursor-pointer" onClick={() => setModal({ type: 'licenses', data: ent })}>
                            <h3 className="text-lg font-black mb-2">{ent.company_name}</h3>
                            <p className="text-xs text-gray-500 mb-4">Licenses: {ent.license_count} | Sub-Licenses: {ent.sub_license_count}</p>
                            <p className="text-xs text-gray-500">Staff: {ent.staff_count} | Active: {ent.active_sub_licenses}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function UserGridView({ plan, users, setModal }: any) {
    const filtered = users.filter((u: User) => u.plan === plan);
    return (
        <div>
            <h2 className="text-3xl font-black mb-8 uppercase">{plan} Users ({filtered.length})</h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left p-4 font-bold text-xs uppercase tracking-widest text-gray-600">Email</th>
                            <th className="text-left p-4 font-bold text-xs uppercase tracking-widest text-gray-600">Role</th>
                            <th className="text-left p-4 font-bold text-xs uppercase tracking-widest text-gray-600">Created</th>
                            <th className="text-right p-4 font-bold text-xs uppercase tracking-widest text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((user: User) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-4 text-sm">{user.email}</td>
                                <td className="p-4 text-sm font-bold">{user.role}</td>
                                <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <button onClick={() => setModal({ type: 'user', data: user })} className="text-xs font-bold uppercase text-black hover:underline">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// MODALS
function CreateEnterpriseModal({ close, refresh, masterKey }: any) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ companyName: '', email: '', licenseCount: 10, subLicenseCount: 0 });

    const handleSubmit = async () => {
        if (!form.companyName || !form.email) {
            alert("Company name and email are required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/create-enterprise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Master-Key': masterKey },
                body: JSON.stringify(form)
            });
            if (res.ok) { refresh(); close(); } else { alert("Error"); }
        } catch (e) { alert("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl">
                <h2 className="text-2xl font-black uppercase mb-6">Create Enterprise</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Company Name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                    <input type="email" placeholder="Super Admin Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                    <input type="number" placeholder="License Count" value={form.licenseCount} onChange={(e) => setForm({ ...form, licenseCount: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                    <input type="number" placeholder="Sub-License Count" value={form.subLicenseCount} onChange={(e) => setForm({ ...form, subLicenseCount: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition">
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                    <button onClick={close} className="px-6 text-gray-400 font-bold hover:text-gray-900">Cancel</button>
                </div>
            </div>
        </div>
    );
}

function ModifyLicensesModal({ data, close, refresh, masterKey }: any) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ licenseCount: data.license_count, subLicenseCount: data.sub_license_count });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-enterprise-licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Master-Key': masterKey },
                body: JSON.stringify({ enterprise_id: data.id, ...form })
            });
            if (res.ok) { refresh(); close(); } else { alert("Error"); }
        } catch (e) { alert("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl">
                <h2 className="text-xl font-black uppercase mb-2">Modify Licenses</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-8">{data.company_name}</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">License Count</label>
                        <input type="number" value={form.licenseCount} onChange={(e) => setForm({ ...form, licenseCount: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Sub-License Count</label>
                        <input type="number" value={form.subLicenseCount} onChange={(e) => setForm({ ...form, subLicenseCount: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-black outline-none" />
                    </div>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition uppercase">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={close} className="px-6 text-gray-400 font-bold hover:text-gray-900 uppercase text-xs">Cancel</button>
                </div>
            </div>
        </div>
    );
}

function ManageUserModal({ data, close, refresh, masterKey }: any) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure? This action is irreversible.")) return;
        setLoading(true);
        try {
            // Logic to delete
            const res = await fetch('/api/admin/user-manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Master-Key': masterKey },
                body: JSON.stringify({ user_id: data.id, action: 'delete' })
            });
            if (res.ok) { refresh(); close(); } else { alert("Error"); }
        } catch (e) { alert("Error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">Manage User</h2>
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">{data.email}</p>

                <div className="space-y-4">
                    {/* Add update plan logic if needed, skipping for brevity as delete is most critical */}
                    <button onClick={handleDelete} disabled={loading} className="w-full bg-red-50 text-red-600 font-black py-4 rounded-2xl hover:bg-red-600 hover:text-white transition uppercase tracking-widest text-xs">
                        {loading ? 'Processing...' : 'Delete Account'}
                    </button>
                    <button onClick={close} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 hover:text-gray-900">Close</button>
                </div>
            </div>
        </div>
    );
}

// ImageUploader Component
function ImageUploader({ images, onChange, masterKey }: { images: string[], onChange: (images: string[]) => void, masterKey: string }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        const maxImages = 10;
        const minImages = 4;
        const currentCount = images.length;

        if (currentCount >= maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, maxImages - currentCount);

        setUploading(true);
        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/admin/upload-image', {
                    method: 'POST',
                    headers: { 'X-Admin-Master-Key': masterKey },
                    body: formData
                });

                if (!res.ok) {
                    const error = await res.json() as { error?: string };
                    throw new Error(error.error || 'Upload failed');
                }

                const data = await res.json() as { url: string };
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onChange([...images, ...uploadedUrls]);
        } catch (error: any) {
            alert(`Upload error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div>
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragActive ? 'border-black bg-gray-50' : 'border-gray-300'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
                <i className="bi bi-cloud-upload text-4xl text-gray-400 mb-2"></i>
                <p className="text-sm font-bold text-gray-600">
                    {uploading ? 'Uploading...' : 'Click or drag images here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {images.length} / 10 images ({images.length < 4 ? `Need ${4 - images.length} more` : 'Ready'})
                </p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                <i className="bi bi-x text-sm"></i>
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    MAIN
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
// TagInput Component
function TagInput({ tags, onChange }: { tags: string[], onChange: (tags: string[]) => void }) {
    const [inputValue, setInputValue] = useState('');

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInputValue('');
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag (press Enter)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                >
                    <i className="bi bi-plus-lg"></i>
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold"
                        >
                            <i className="bi bi-tag-fill text-xs"></i>
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="text-gray-500 hover:text-red-600 transition"
                            >
                                <i className="bi bi-x text-lg"></i>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
                {tags.length} tag{tags.length !== 1 ? 's' : ''} added
            </p>
        </div>
    );
}
