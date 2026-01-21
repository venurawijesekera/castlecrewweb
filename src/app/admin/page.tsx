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
    stock: number;
    is_active: number;
}

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [masterKey, setMasterKey] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'enterprise_grid' | string>('dashboard');

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

    if (!masterKey) return null; // Waiting for prompt
    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-xl uppercase tracking-widest animate-pulse">Initializing System Core...</div>;

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
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shrink-0 z-50">
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-10">
                    <img src="/assets/img/logo.png" alt="CastleCrew" className="h-8 w-auto" />
                    <span className="font-black text-xl tracking-tighter text-gray-900">Castle<span className="text-[#f00000]">Crew</span></span>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Main Menu</p>
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide cursor-pointer transition ${activeView === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <i className={`bi ${item.icon} text-lg`}></i> {item.label}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-auto p-6 border-t border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-[#f00000] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-500/20">SA</div>
                    <div>
                        <p className="text-xs font-black text-gray-900">System Admin</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Root Control</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Header({ refresh }: any) {
    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm px-8 py-4 flex justify-between items-center">
            <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-gray-400">System Control Center</h1>
            </div>
            <div className="flex gap-3">
                <button onClick={refresh} className="p-2.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
                <a href="/dashboard" className="px-4 py-2.5 rounded-xl bg-[#f00000] text-white font-bold text-xs uppercase tracking-wide hover:bg-red-600 transition shadow-lg shadow-red-500/20 flex items-center gap-2">
                    <i className="bi bi-box-arrow-left"></i> Back to App
                </a>
            </div>
        </header>
    );
}

function DashboardView({ users, enterprises, stats, setView, setModal }: any) {
    return (
        <div className="space-y-12">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome back! 👋</h2>
                <p className="text-gray-500">Full control over users, organizations, and system settings.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={stats.totalUsers} icon="bi-people-fill" color="blue" />
                <StatCard label="Premium Members" value={stats.paidUsers} icon="bi-star-fill" color="red" />
                <StatCard label="Enterprises" value={stats.enterpriseCount} icon="bi-buildings-fill" color="purple" />
                <StatCard label="System Status" value="Active" icon="bi-shield-check" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* User Plans Summary Table could go here, or handled by Filter Views. Legacy showed empty placeholders or summary. */}
                    {/* We will show enterprise list preview here */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Enterprise Management</h3>
                            <button onClick={() => setModal({ type: 'enterprise' })} className="px-5 py-3 rounded-2xl bg-[#f00000] text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition flex items-center gap-2 shadow-xl shadow-red-500/10">
                                <i className="bi bi-plus-lg"></i> New Organization
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-5 pl-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Licenses</th>
                                        <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {enterprises.length === 0 ? (
                                        <tr><td colSpan={3} className="p-10 text-center opacity-30 text-xs font-black uppercase">No organizations found</td></tr>
                                    ) : enterprises.map((ent: any) => (
                                        <tr key={ent.id} className="hover:bg-gray-50/50 transition">
                                            <td className="p-5 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{ent.company_name.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{ent.company_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">ID: #{ent.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{ent.active_sub_licenses}/{ent.sub_license_count || 0} Products</span>
                                            </td>
                                            <td className="p-5 text-right pr-8">
                                                <button onClick={() => setModal({ type: 'licenses', data: ent })} className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest mr-3">Modify</button>
                                                {/* <button className="text-gray-400 hover:text-gray-900"><i className="bi bi-three-dots"></i></button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f00000] opacity-10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Engine Info</h4>
                        <div className="space-y-4 relative z-10 text-sm">
                            <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-gray-400">Version</span> <span className="font-black">V 2.1.0-Next</span></div>
                            <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-gray-400">Core</span> <span className="text-green-500 font-black">STABLE</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-[#f00000]',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600'
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${colors[color]}`}>
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
    );
}

function EnterpriseGridView({ enterprises, users, setModal }: any) {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Enterprise Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {enterprises.map((ent: any) => (
                    <div key={ent.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden ring-1 ring-transparent hover:ring-blue-500/20">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border-2 border-blue-500 text-blue-600 flex items-center justify-center text-3xl font-black mb-4 group-hover:scale-110 transition">{ent.company_name.charAt(0)}</div>
                        <div className="text-center mb-6">
                            <h4 className="text-gray-900 font-black truncate">{ent.company_name}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #{ent.id}</p>
                        </div>
                        <div className="flex gap-2 justify-center mb-6">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">{ent.staff_count} Staff</span>
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-[9px] font-black uppercase">{ent.license_count} Max</span>
                        </div>
                        <button onClick={() => setModal({ type: 'licenses', data: ent })} className="w-full py-3 rounded-xl bg-gray-50 text-gray-900 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition">Settings</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserGridView({ plan, users, setModal }: any) {
    const filtered = users.filter((u: any) => {
        if (plan === 'enterprise') return u.plan === 'enterprise' || u.role === 'admin' || u.role === 'super_admin';
        return u.plan === plan;
    });

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{plan} Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filtered.map((user: any) => (
                    <div key={user.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 mb-4 flex items-center justify-center overflow-hidden">
                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <span className="font-black text-gray-400">{user.email.charAt(0).toUpperCase()}</span>}
                        </div>
                        <h4 className="text-sm font-black text-gray-900 truncate w-full">{user.email.split('@')[0]}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-4">{user.email}</p>
                        <button onClick={() => setModal({ type: 'user', data: user })} className="mt-auto px-4 py-2 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition">Manage</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Modals

function CreateEnterpriseModal({ close, refresh, masterKey }: any) {
    const [data, setData] = useState({ name: '', adminName: '', email: '', password: '', licenses: '10', subLicenses: '0' });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/create-enterprise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Master-Key': masterKey },
                body: JSON.stringify({
                    company_name: data.name,
                    super_admin_email: data.email,
                    super_admin_password: data.password,
                    total_licenses: parseInt(data.licenses),
                    sub_licenses: parseInt(data.subLicenses)
                })
            });
            const json: any = await res.json();
            if (res.ok) {
                alert("Enterprise Created!");
                refresh();
                close();
            } else {
                alert("Error: " + json.error);
            }
        } catch (e) { alert("Failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">New Enterprise</h2>
                <div className="space-y-4">
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold" placeholder="Company Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold" placeholder="Admin Email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
                    <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold" type="password" placeholder="Admin Password" value={data.password} onChange={e => setData({ ...data, password: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <input className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold" type="number" placeholder="Licenses" value={data.licenses} onChange={e => setData({ ...data, licenses: e.target.value })} />
                        <input className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm font-bold" type="number" placeholder="Sub-Lic" value={data.subLicenses} onChange={e => setData({ ...data, subLicenses: e.target.value })} />
                    </div>
                    <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition uppercase tracking-widest text-xs">
                        {loading ? 'creating...' : 'Provision Organization'}
                    </button>
                    <button onClick={close} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 hover:text-gray-900">Cancel</button>
                </div>
            </div>
        </div>
    );
}

function ModifyLicensesModal({ data, close, refresh, masterKey }: any) {
    const [lic, setLic] = useState(data.license_count);
    const [sub, setSub] = useState(data.sub_license_count);
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-enterprise-licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Master-Key': masterKey },
                body: JSON.stringify({
                    enterprise_id: data.id,
                    license_count: parseInt(lic),
                    sub_license_count: parseInt(sub)
                })
            });
            if (res.ok) {
                refresh();
                close();
            } else {
                alert("Failed");
            }
        } catch (e) { alert("Failed"); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-sm p-10 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Modify Licenses</h2>
                <p className="text-gray-400 text-xs font-bold mb-6">{data.company_name}</p>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Profile Licenses</label>
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-lg font-black text-center" type="number" value={lic} onChange={e => setLic(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">product Cards</label>
                        <input className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-lg font-black text-center" type="number" value={sub} onChange={e => setSub(e.target.value)} />
                    </div>
                    <button onClick={submit} disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition uppercase tracking-widest text-xs">
                        {loading ? 'saving...' : 'Update Capacity'}
                    </button>
                    <button onClick={close} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 hover:text-gray-900">Cancel</button>
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

// Products View Component
function ProductsView({ products, setModal }: any) {
    return (
        <div>
            <div className=\"flex justify-between items-center mb-8\">
                <h2 className=\"text-3xl font-black text-gray-900\">Product Management</h2>
                <button
                    onClick={() => setModal({ type: 'product', data: null })}
                    className=\"bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition\"
                >
                    + Add Product
                </button>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
                {products.map((product: any) => (
                    <div
                        key={product.id}
                        onClick={() => setModal({ type: 'product', data: product })}
                        className=\"bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer\"
                    >
                        <div className=\"h-48 bg-gray-100 flex items-center justify-center overflow-hidden\">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className=\"w-full h-full object-cover\" />
                            ) : (
                                <i className=\"bi bi-box text-6xl text-gray-400\"></i>
                            )}
                        </div>
                        <div className=\"p-5\">
                            <div className=\"flex items-center justify-between mb-2\">
                                <span className=\"text-xs font-bold text-gray-500 uppercase tracking-wider\">{product.category}</span>
                                <span className={\w-2 h-2 rounded-full \\}></span>
                            </div>
                            <h3 className=\"font-bold text-lg text-gray-900 mb-1\">{product.name}</h3>
                            <p className=\"text-sm text-gray-600 mb-3 line-clamp-2\">{product.description}</p>
                            <div className=\"flex items-center justify-between\">
                                <span className=\"text-2xl font-black text-black\">\</span>
                                <span className=\"text-xs font-bold text-gray-500\">Stock: {product.stock}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Product Modal Component
function ProductModal({ data, close, refresh, masterKey }: any) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: data?.name || '',
        description: data?.description || '',
        price: data?.price || 0,
        category: data?.category || 'General',
        image_url: data?.image_url || '',
        stock: data?.stock || 0,
        is_active: data?.is_active ?? 1
    });

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            alert(\"Name and price are required\");
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
                alert(\"Error saving product\");
            }
        } catch (e) {
            alert(\"Error\");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!data || !confirm(\"Delete this product?\")) return;

        setLoading(true);
        try {
            const res = await fetch(\/api/admin/products?id=\\, {
                method: 'DELETE',
                headers: { 'X-Admin-Master-Key': masterKey }
            });

            if (res.ok) {
                refresh();
                close();
            } else {
                alert(\"Error deleting product\");
            }
        } catch (e) {
            alert(\"Error\");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=\"fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4\">
            <div className=\"bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto\">
                <h2 className=\"text-2xl font-black text-gray-900 uppercase tracking-tight mb-6\">
                    {data ? 'Edit Product' : 'Add Product'}
                </h2>

                <div className=\"space-y-4\">
                    <div>
                        <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Product Name</label>
                        <input
                            type=\"text\"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                            placeholder=\"Enter product name\"
                        />
                    </div>

                    <div>
                        <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                            rows={3}
                            placeholder=\"Product description\"
                        />
                    </div>

                    <div className=\"grid grid-cols-2 gap-4\">
                        <div>
                            <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Price (\$)</label>
                            <input
                                type=\"number\"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                                className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                                step=\"0.01\"
                            />
                        </div>

                        <div>
                            <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Stock</label>
                            <input
                                type=\"number\"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                                className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                            />
                        </div>
                    </div>

                    <div>
                        <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Category</label>
                        <input
                            type=\"text\"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                            placeholder=\"e.g., Smart Cards, Merch\"
                        />
                    </div>

                    <div>
                        <label className=\"block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2\">Image URL</label>
                        <input
                            type=\"text\"
                            value={form.image_url}
                            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            className=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none\"
                            placeholder=\"https://example.com/image.jpg\"
                        />
                    </div>

                    <div className=\"flex items-center\">
                        <input
                            type=\"checkbox\"
                            checked={form.is_active === 1}
                            onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                            className=\"w-4 h-4 rounded border-gray-300 text-black focus:ring-black\"
                        />
                        <label className=\"ml-2 text-sm font-bold text-gray-700\">Active (visible in shop)</label>
                    </div>
                </div>

                <div className=\"flex gap-4 mt-8\">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className=\"flex-1 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition uppercase tracking-wider text-sm disabled:opacity-50\"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                    {data && (
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className=\"bg-red-50 text-red-600 font-bold px-6 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition uppercase tracking-wider text-sm\"
                        >
                            Delete
                        </button>
                    )}
                    <button
                        onClick={close}
                        className=\"px-6 py-4 text-gray-400 text-sm font-bold uppercase tracking-wider hover:text-gray-900\"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
