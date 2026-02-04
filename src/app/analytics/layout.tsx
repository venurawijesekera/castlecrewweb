import Sidebar from "@/components/dashboard/Sidebar";

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-slate-50">
            <Sidebar />
            <main className="flex-1 relative overflow-y-auto bg-slate-50">
                {children}
            </main>
        </div>
    );
}
