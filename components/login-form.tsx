"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/income",
      })
    } catch (error) {
      console.error("Sign in failed", error)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isSignUp) {
        await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/income",
        })
      } else {
        await authClient.signIn.email({
          email,
          password,
          callbackURL: "/income",
        })
      }
      router.push("/income")
    } catch (error) {
      console.error("Authentication failed", error)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "יצירת חשבון" : "ברוכים הבאים"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp 
              ? "הזינו את הפרטים שלכם כדי ליצור חשבון" 
              : "התחברו למערכת"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {isSignUp && (
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">שם מלא</label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="אלי קופטר"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-right"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">אימייל</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">סיסמה</label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="mr-auto text-sm underline-offset-4 hover:underline"
                    >
                      שכחתם סיסמה?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-left"
                  dir="ltr"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "יצירת חשבון" : "התחברות"}
              </Button>

              {!isSignUp && (
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    או המשיכו עם
                  </span>
                </div>
              )}

              {!isSignUp && (
                <div className="flex flex-col gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    התחברות עם Google
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              )}
              
              <div className="text-center text-sm text-muted-foreground">
                {isSignUp ? "כבר יש לכם חשבון?" : "אין לכם חשבון?"}{" "}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  {isSignUp ? "התחברות" : "הרשמה"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        בלחיצה על המשך, אתם מסכימים <a href="#">לתנאי השימוש</a>{" "}
        <a href="#">ומדיניות הפרטיות</a> שלנו.
      </div>
    </div>
  )
}
