declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: string
      isAdmin: boolean
      mobileNo: string
      shopAddress: string
      upiId: string
      isSuspended: boolean
      isApproved: boolean
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image?: string | null
    role: string
    isAdmin: boolean
    mobileNo: string
    shopAddress: string
    upiId: string
    isSuspended: boolean
    isApproved: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    isAdmin: boolean
    mobileNo: string
    shopAddress: string
    upiId: string
    isSuspended: boolean
    isApproved: boolean
  }
}
declare module "next-auth" {
  interface User {
    role?: string
  }
}