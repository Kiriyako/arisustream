import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});import "./globals.css";


export const metadata = {
  title: "arisu",
  description: "site to watch anime without ads",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${raleway.variable}`}>
        {children}
      </body>
       <footer style={{
       textAlign: "center",
  padding: "20px",
  color: "#333",
  fontSize: "0.8rem",
  fontFamily: "Raleway, sans-serif",
  position: "relative",
  zIndex: 1,
        }}>
          Made with ♥ by Kiriyako
        </footer>
    </html>
  );
}
