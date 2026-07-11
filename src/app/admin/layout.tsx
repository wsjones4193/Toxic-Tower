import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#080808]">
      <AdminNav />
      <main className="flex-1 ml-0 md:ml-56 min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
