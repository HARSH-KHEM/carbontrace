import "./globals.css";

export const metadata = {
  title: "CarbonTrace | Eco-Conscious Carbon Tracking",
  description:
    "The high-fidelity carbon monitoring platform for the next generation of eco-conscious leaders. Track, reduce, and impact your environmental footprint.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&family=Hanken+Grotesk:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-body-md text-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}
