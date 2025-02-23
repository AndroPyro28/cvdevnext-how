import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Helper function to determine the API URL based on the environment


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {

        const response = await fetch(`${process.env.NEXT_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' },
        });

        const user = await response.json();

        if (response.ok && user) {
          // Check if the user role is 'admin'
          // Assign user.id (ObjectId as string)

          if (user.usr_role !== 'homeowner') {
            throw new Error("User is not an homeowner");
          }
          // Assign user.id (ObjectId as string)

          if (user._id) {
            user.id = user._id.toString();
          }
          // user.usr_id is already included
          return user;
        } else {
          throw new Error(user.error || 'Invalid login credentials');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 3 * 60 * 60, // 3 hours in seconds
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {

      if(trigger === "update") {
        console.log("update trigger", session, token)
        token.profile_photo = session.user.profile_photo
        token.username = session.user.username
        token.email = session.user.email;
        return token
      }

      if (user) {
        // Add user information to the token
        token.id = user.id; // ObjectId as string
        token.usr_id = user.usr_id; // Custom user ID
        token.username = user.usr_username;
        token.email = user.usr_email;
        token.role = user.usr_role;
        token.profile_photo = user.usr_profile_photo;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token information to the session
      session.user = {
        id: token.id, // ObjectId as string
        usr_id: token.usr_id, // Custom user ID
        username: token.username,
        email: token.email,
        role: token.role,
        profile_photo: token.profile_photo
      };
      return session;
    },
  },
  secret: process.env.NEXT_SECRET,
  pages: {
    signIn: '/',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };