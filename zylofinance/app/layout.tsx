import "./globals.css";
import { AppProvider } from "./src/providers/metamask";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
export default Layout;