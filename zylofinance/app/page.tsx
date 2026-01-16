import { Sidebar } from "./src/components/sidebar/sidebar";
import { Dashboard } from "./src/components/dashboard";

export default function Home() {
  return (
    <Sidebar>
      <Dashboard />
    </Sidebar>
  );
}
