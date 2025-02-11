import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session
}
// export default async function getCurrentUser() {
//   try {
//     const session = await getSession();

//     if (!session?.user.email) {
//       return null;
//     }

//     const { hashedPassword, ...props } = currentUser;

//     return {
//       ...props,
//       role: currentUser.role.toString(),
//       createdAt: currentUser.createdAt.toISOString(),
//       updatedAt: currentUser.updatedAt.toISOString(),
//       emailVerified: currentUser.emailVerified?.toISOString() || null,
//     };
//   } catch (error) {
//     return null;
//   }
// }