"use client";
import { Inter } from "next/font/google";
import "../globals.css";
import { useEffect, useState } from "react";
import { Cloud, MessageCircle, MessagesSquare, Radio, Settings, UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import UserProvider from "../Provider";

const inter = Inter({ subsets: ["latin"] });

const Sidebar = ({ activeButton, setActiveButton }: {
  activeButton: string;
  setActiveButton: (button: string) => void
}) => {
  const navItems = [
    { id: 'message', icon: MessageCircle, routeLink: "/dashboard" },
    { id: 'profile', icon: UserIcon, routeLink: "/dashboard/profile" },
    { id: 'cloud', icon: Cloud, routeLink: "/dashboard/cloud" },
    { id: 'live', icon: Radio, routeLink: "/dashboard/live" },
    { id: 'setting', icon: Settings, routeLink: "/dashboard/setting" },
  ];
  const route = useRouter();

  return (
    <aside className="h-screen w-20 flex-shrink-0 overflow-hidden p-2 border-r border-white/10">
      <h1 className="text-4xl flex items-center justify-center text-center py-4 font-semibold text-white">
        <MessagesSquare className="h-8 w-8" />
      </h1>
      <div className="flex justify-center">
        <div className="w-12 h-px bg-white/20" />
      </div>
      <nav className="mt-8">
        <ul className="flex flex-col gap-3">
          {navItems.map(({ id, icon: Icon, routeLink }) => (
            <li key={id} className="flex justify-center">
              <button
                className={`p-3 rounded-lg ${activeButton === id
                  ? "bg-white/10 ring-white/5 ring-2 border border-white/6"
                  : "hover:bg-white/10"
                  } transition-all duration-300 group`}
                onClick={() => {
                  setActiveButton(id);
                  route.push(`${routeLink}`)
                  localStorage.setItem("activeButton", id)
                }}
              >
                <Icon className={`h-6 w-6 ${activeButton === id ? "text-white" : "text-white/70"
                  }`} />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeButton, setActiveButton] = useState<string>("message");

  const path = usePathname();
  useEffect(() => {
    const activePath = path.split("/")[2];
    if (activePath) setActiveButton(activePath);
    else setActiveButton("message");
  }, [])
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <UserProvider>
          <main className="flex h-screen bg-DarkNavy">
            <Sidebar activeButton={activeButton} setActiveButton={setActiveButton} />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </UserProvider>
      </body>
    </html>
  );
}
