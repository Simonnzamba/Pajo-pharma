import SidebarLayout from '@/components/layout/sidebar-layout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
