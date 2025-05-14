import type { Role } from "./schema"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
      image?: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    role: Role
  }
}
