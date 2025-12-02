import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "fitbit",
      name: "Fitbit",
      type: "oauth",
      authorization: {
        url: "https://www.fitbit.com/oauth2/authorize",
        params: {
          scope: "activity heartrate sleep profile nutrition weight",
          prompt: "consent",
        },
      },
      token: "https://api.fitbit.com/oauth2/token",
      userinfo: "https://api.fitbit.com/1/user/-/profile.json",
      clientId: process.env.FITBIT_CLIENT_ID,
      clientSecret: process.env.FITBIT_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.user.encodedId,
          name: profile.user.displayName,
          email: profile.user.email || "",
          image: profile.user.avatar,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
