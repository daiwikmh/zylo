import { Sidebar } from '../src/components/sidebar/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}
