import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { requireUser } from "@/lib/auth";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <div className="min-h-screen bg-[#f6f1ea]"><div className="flex min-h-screen"><AppSidebar user={user} /><div className="flex min-h-screen min-w-0 flex-1 flex-col"><AppTopbar user={user} /><main className="flex-1 px-4 py-6 md:px-8 md:py-8"><div className="mx-auto max-w-7xl">{children}</div></main></div></div></div>;
}
