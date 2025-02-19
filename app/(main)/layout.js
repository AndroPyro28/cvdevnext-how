import { getSession } from "@/actions/getCurrentSession";
import { redirect } from "next/navigation";

export default async function UserLayout({
  children,
}) {
    const session = await getSession()

    if(!session || !session.user) {
      return redirect("/")
    }

  return (
   <main>
        {children}
   </main>
  );
}