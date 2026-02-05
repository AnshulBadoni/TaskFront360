// import { MobileNav, Sidebar } from "@/components";
// import { getLoggedInUser } from "@/lib/actions/user.actions";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ChatBot from "@/components/Chatbot";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('authToken');
  // check if user is logged in, if not redirect to login

  if (!token) {
    redirect('/sign-in');
  }

  return (
    <main className="flex h-screen w-full font-inter">
      {/* <Sidebar user={loggedIn} /> */}

      <div className="flex size-full flex-col">
        <div className="root-layout">
          <div>{/* <MobileNav user={loggedIn} /> */}</div>
        </div>
        <div className="flex">
          <Sidebar />
          <div className="flex flex-col w-full">
            {/* <Navbar /> */}
            {children}
            {/* <ChatBot /> */}
          </div>
        </div>
      </div>
    </main>
  );
}
