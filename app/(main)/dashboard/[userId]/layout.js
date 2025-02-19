// app/dashboard/layout.js

import compstyle from '@/app/components.module.css';
import Header from "./components/header.js";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route.js';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/components/sidebar.js';

export const metadata = {
  title: "CVConnect | Home Owner- Dashboard",
  description: "Integrated solutions for record management.",
};

export default async function DashboardLayout({ children, params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <>
    <Sidebar userId={params.userId}>
      {children}
    </Sidebar>
    </>
  );
}