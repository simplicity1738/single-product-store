import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0F0C0B] text-white">
      <AdminSidebar />
      <div className="min-w-0 w-full flex-1 max-w-none">{children}</div>
    </div>
  );
}
