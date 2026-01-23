import "./globals.css";
import "./src/styles/mobile-neo-brutalist.css";
import { AppProvider } from "./src/providers/web3auth";
import { AuthGuard } from "./src/components/auth";

export const metadata = {
  title: 'Zylo Finance',
  description: 'Decentralized Finance on Flare Network',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AppProvider>
      </body>
    </html>
  );
};

export default Layout;
