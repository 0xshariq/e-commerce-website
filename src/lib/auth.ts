import "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/database"
import { Customer } from "@/models/customer"
import { Vendor } from "@/models/vendor"
import { Admin } from "@/models/admin"

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2 hours

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        // Check for remember me option
        const rememberMe = credentials.rememberMe === "true";
        
        // Set maxAge for token if remember me is checked
        // This will be passed to the jwt callback via token.rememberMe
        const tokenMaxAge = rememberMe 
          ? 3 * 24 * 60 * 60 // 3 days for remember me
          : 1 * 24 * 60 * 60;  // 1 day for normal session
        
        await dbConnect()

        // Get the role selected by the user
        const selectedRole = credentials.role || "customer"
        let user = null
        let userRole = selectedRole
        
        try {
          // Check the model corresponding to the selected role first
          switch(selectedRole) {
            case "customer":
              user = await Customer.findOne({ email: credentials.email })
              break
            case "vendor":
              user = await Vendor.findOne({ email: credentials.email })
              // Check if vendor is approved
              if (user && !user.isApproved) {
                throw new Error("Your vendor account is pending admin approval")
              }
              break
            case "admin":
              user = await Admin.findOne({ email: credentials.email })
              break
            default:
              break
          }
          
          // If not found and not strict mode, try other collections
          if (!user) {
            console.log(`User not found in ${selectedRole} collection, checking others...`)
            
            // Try Customer if not already checked
            if (selectedRole !== "customer") {
              user = await Customer.findOne({ email: credentials.email })
              if (user) {
                userRole = "customer"
                console.log("Found in customer collection instead")
              }
            }
            
            // Try Vendor if not found in Customer and not already checked
            if (!user && selectedRole !== "vendor") {
              user = await Vendor.findOne({ email: credentials.email })
              if (user) {
                userRole = "vendor"
                console.log("Found in vendor collection instead")
                // Check if vendor is approved
                if (!user.isApproved) {
                  throw new Error("Your vendor account is pending admin approval")
                }
              }
            }
            
            // Try Admin if not found in Vendor and not already checked
            if (!user && selectedRole !== "admin") {
              user = await Admin.findOne({ email: credentials.email })
              if (user) {
                userRole = "admin"
                console.log("Found in admin collection instead")
              }
            }
          }
        } catch (error) {
          console.error("Error finding user:", error)
          throw error
        }

        if (!user) {
          throw new Error("No account found with this email address")
        }

        // Check if account is suspended
        if (user.isSuspended) {
          throw new Error("Your account has been suspended. Please contact support.")
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new Error("Account is temporarily locked due to too many failed login attempts")
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          // Increment login attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1

          if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCK_TIME)
          }

          await user.save()
          throw new Error("Invalid password")
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0
        user.lockUntil = undefined
        user.lastLogin = new Date()
        await user.save()

        // Prepare a safe way to handle the user data with type safety
        let firstName = "";
        let lastName = "";
        let email = "";
        let profileImage = null;
        let mobileNo = "";
        let upiId = "";
        let isSuspended = false;
        let isApproved = true;
        
        // Extract common properties safely regardless of user model
        if (typeof user.email === 'string') email = user.email;
        if (typeof user.firstName === 'string') firstName = user.firstName;
        if (typeof user.lastName === 'string') lastName = user.lastName;
        if (typeof user.profileImage === 'string') profileImage = user.profileImage;
        if (typeof user.mobileNo === 'string') mobileNo = user.mobileNo;
        if (typeof user.isSuspended === 'boolean') isSuspended = user.isSuspended;
        
        // Handle role-specific properties
        if (userRole === "vendor") {
          if (typeof (user as any).upiId === 'string') upiId = (user as any).upiId;
          if (typeof (user as any).isApproved === 'boolean') isApproved = (user as any).isApproved;
        }
        
        // Construct name from available properties
        const name = firstName && lastName ? 
          `${firstName} ${lastName}` : 
          (email ? email.split("@")[0] : "User");
        
        // Create and return the user data object
        return {
          id: user._id?.toString() || "",
          name,
          email,
          role: userRole,
          isAdmin: userRole === "admin",
          image: profileImage,
          mobileNo,
          upiId,
          isSuspended,
          isApproved,
          // Include the remember me preference and token maxAge
          rememberMe,
          tokenMaxAge
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile) {
        await dbConnect()

        // Check if user already exists
        let existingUser = await Customer.findOne({ 
          $or: [
            { email: profile.email },
            { oauthId: profile.sub, oauthProvider: 'google' }
          ]
        })

        if (!existingUser) {
          // Extract first and last names from profile
          const firstName = profile.given_name || profile.name?.split(' ')[0] || '';
          const lastName = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
          
          // Create new customer account for Google users
          existingUser = await Customer.create({
            firstName,
            lastName,
            email: profile.email,
            password: await bcrypt.hash(Math.random().toString(36), 12), // Random password for OAuth users
            mobileNo: null, // Will be updated later in profile
            profileImage: profile.picture,
            isOAuthUser: true,
            oauthProvider: 'google',
            oauthId: profile.sub,
            isEmailVerified: profile.email_verified || false
          })
        } else if (!existingUser.isOAuthUser) {
          // Update existing customer to include OAuth info
          existingUser.isOAuthUser = true;
          existingUser.oauthProvider = 'google';
          existingUser.oauthId = profile.sub;
          existingUser.isEmailVerified = profile.email_verified || existingUser.isEmailVerified;
          if (profile.picture) existingUser.profileImage = profile.picture;
          await existingUser.save();
        }

        const displayName = existingUser.firstName && existingUser.lastName 
          ? `${existingUser.firstName} ${existingUser.lastName}`
          : profile.name || existingUser.email.split('@')[0];

        return {
          id: existingUser._id?.toString() || "",
          name: displayName,
          email: profile.email || "",
          image: profile.picture || existingUser.profileImage || "",
          role: "customer",
          isAdmin: false,
          mobileNo: existingUser.mobileNo || "",
          isSuspended: existingUser.isSuspended || false,
          isApproved: true,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isAdmin = user.isAdmin
        token.mobileNo = user.mobileNo
        token.email = user.email
        token.image = user.image || null
        token.isSuspended = user.isSuspended
        token.isApproved = user.isApproved
        
        // Handle remember me option - set the token maxAge
        if (user.rememberMe) {
          token.rememberMe = true
          // This is used in the session configuration
          token.maxAge = user.tokenMaxAge || 3 * 24 * 60 * 60 // 3 days default
        } else {
          token.rememberMe = false
          token.maxAge = user.tokenMaxAge || 1 * 24 * 60 * 60 // 1 day default
        }
      }

      if (trigger === "update" && session) {
        if (session.image) token.image = session.image
        if (session.name) token.name = session.name
        if (session.mobileNo) token.mobileNo = session.mobileNo
      }

      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.mobileNo = token.mobileNo as string
        session.user.email = token.email as string
        session.user.image = token.image as string | null
        session.user.isSuspended = token.isSuspended as boolean
        session.user.isApproved = token.isApproved as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      // Role-based redirects
      if (url.includes("role=admin")) return `${baseUrl}/admin/dashboard`
      if (url.includes("role=vendor")) return `${baseUrl}/vendor/dashboard`
      if (url.includes("role=customer")) return `${baseUrl}/customer/dashboard`

      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    // Will be overridden in the authorize callback based on rememberMe
    maxAge: 30 * 24 * 60 * 60, // 30 days default
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    // Will be overridden in the authorize callback based on rememberMe
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  events: {
    async signIn({ user }: any) {
      console.log(`User ${user.email} signed in with role: ${user.role}`)
    },
    async signOut({ token }: any) {
      console.log(`User ${token?.email} signed out`)
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}
