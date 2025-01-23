"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import SignUpForm from "./SignUpForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRouter } from '@/i18n/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IoMailOutline, IoKeyOutline, IoPersonOutline, IoAtCircleOutline } from "react-icons/io5";
import { FaGoogle } from "react-icons/fa";
import { getUserProfile } from "@/lib/api/auth";
import { useUserStore } from "@/lib/store/user";
import { useToast } from "@/components/ui/use-toast";

interface SignInFormProps {
  open: boolean;
  onClose: () => void;
  setShowSignUp: (show: boolean) => void;
  callbackUrl?: string;
}

interface Message {
  type: "error" | "success";
  text: string;
}

const defaultValues = {
  username: "",
  password: "",
  email: "",
  verificationCode: "",
};

function SignInForm({ 
  open, 
  onClose, 
  setShowSignUp, 
  callbackUrl = "/dashboard/profile" 
}: SignInFormProps) {
  const router = useRouter();
  const t = useTranslations('SignIn');
  const locale = useLocale();
  const { data: session } = useSession();
  const [authMethod, setAuthMethod] = useState<"password" | "email">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { setUser } = useUserStore();
  const { toast } = useToast();

  // Define Zod schema for form validation
  const SignInSchema = z.object({
    username: z.string().trim().min(1, { message: t("validation.username.required") }),
    password: z.string().trim().min(1, { message: t("validation.password.required") }),
    email: authMethod === "email" 
      ? z.string().email({ message: t("validation.email.invalid") })
      : z.string().optional(),
    verificationCode: z.string().optional()
  }).superRefine((data, ctx) => {
    if (authMethod === "email" && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.email.required"),
        path: ["email"]
      });
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    watch,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
    mode: "onChange"
  });

  const emailValue = watch("email");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (verificationSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [verificationSent, countdown]);

  if (!isMounted) {
    return null;
  }

  const onSubmit: SubmitHandler<z.infer<typeof SignInSchema>> = async (values) => {
    setMessage(null);
    setLoading(true);
    
    try {
      console.log('Attempting sign in with:', { username: values.username });
      
      const result = await signIn("credentials", {
        redirect: false,
        username: values.username.trim(),
        password: values.password.trim(),
      });

      if (result?.error) {
        console.error('Sign-In Error:', result.error);
        let errorMessage = t("errors.invalidCredentials");
        
        if (result.error === "CredentialsSignin" || result.error.includes("Invalid credentials")) {
          errorMessage = t("errors.invalidCredentials");
        } else if (result.error === "Please provide both username and password") {
          errorMessage = t("errors.missingCredentials");
        } else {
          console.error('Unknown error:', result.error);
          errorMessage = t("errors.unknown");
        }
        
        setMessage({
          type: "error",
          text: errorMessage
        });
      } else {
        // Fetch user profile after successful sign in
        try {
          const userProfile = await getUserProfile()
          console.log('Fetched user profile after sign in:', userProfile)
          
          if (userProfile) {
            const userData = {
              id: userProfile.id,
              username: userProfile.username,
              first_name: userProfile.first_name || "",
              last_name: userProfile.last_name || "",
              email: userProfile.email || "",
              user_type: userProfile.user_type || "regular",
              profile_picture_url: userProfile.profile?.profile_picture_url || "",
              company_name: userProfile.company_name || "",
              city: userProfile.city || "",
              country: userProfile.country || "",
            }
            
            console.log('Setting user data in store after login:', userData)
            setUser(userData)

            // Check user type and handle accordingly
            if (userProfile.user_type === "regular") {
              toast({
                variant: "destructive",
                title: t("errors.accessDenied"),
                description: t("errors.regularUserNotAllowed"),
                duration: 5000,
              });
              // Sign out the user since they're not allowed
              await signOut({ redirect: false });
              return;
            } else {
              router.push("/dashboard")
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setMessage({
            type: "error",
            text: t("errors.unknown")
          });
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage({
        type: "error",
        text: t("errors.unknown")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { 
        callbackUrl: "/dashboard/profile", // Use path without locale
        redirect: false 
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setMessage({ text: t("errors.networkError"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthMethodChange = (value: string) => {
    setAuthMethod(value as "password" | "email");
    setMessage(null);
    setVerificationSent(false);
    setCountdown(0);
    reset(defaultValues);
  };

  const handleEmailSubmit = async (values: z.infer<typeof SignInSchema>) => {
    console.log("handleEmailSubmit called with values:", values);
    
    if (!values.email) {
      setMessage({
        type: "error",
        text: t("validation.email.required")
      });
      return;
    }

    setMessage(null);
    setLoading(true);
    
    try {
      if (!verificationSent) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const requestUrl = `${apiUrl}/users/password-reset/request/`;
        console.log('Full Request URL:', requestUrl);

        try {
          const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email: values.email }),
          });

          console.log('Response status:', response.status);
          const responseText = await response.text();
          console.log('Raw response:', responseText);
          
          let data;
          try {
            data = JSON.parse(responseText);
            console.log('Parsed response data:', data);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            throw new Error('Invalid response from server');
          }

          if (response.ok) {
            setVerificationSent(true);
            setCountdown(300); // 5 minutes countdown
            setMessage({
              type: "success",
              text: t("success.verificationEmailSent")
            });
          } else {
            throw new Error(data.message || data.detail || t("errors.emailNotFound"));
          }
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      } else {
        const validateUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/password-reset/validate/`;
        console.log('Validate URL:', validateUrl);

        const validateResponse = await fetch(validateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: values.email,
            code: values.verificationCode
          }),
        });

        const validateText = await validateResponse.text();
        console.log('Raw validate response:', validateText);
        
        let validateData;
        try {
          validateData = JSON.parse(validateText);
          console.log('Parsed validate data:', validateData);
        } catch (e) {
          console.error('Error parsing validate JSON:', e);
          throw new Error('Invalid response from server');
        }

        if (validateResponse.ok) {
          // Code is valid, proceed with password reset
          router.push({
            pathname: '/reset-password',
            query: { 
              email: values.email,
              code: values.verificationCode
            }
          });
        } else {
          throw new Error(validateData.message || validateData.detail || t("errors.invalidCode"));
        }
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("errors.networkError")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (loading || !getValues("email")) return;

    try {
      setLoading(true);
      setMessage(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const requestUrl = `${apiUrl}/users/password-reset/request/`;
      console.log('Resend code URL:', requestUrl);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: getValues("email") }),
      });

      const responseText = await response.text();
      console.log('Raw resend response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed resend data:', data);
      } catch (e) {
        console.error('Error parsing resend JSON:', e);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        setVerificationSent(true);
        setCountdown(300); // Reset 5-minute countdown
        setMessage({ 
          type: "success", 
          text: t("success.verificationEmailSent") 
        });
      } else {
        throw new Error(data.message || data.detail || t("errors.resendError"));
      }
    } catch (error) {
      console.error("Resend verification code error:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : t("errors.networkError")
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name: keyof z.infer<typeof SignInSchema>, label: string, type: string = "text", icon: React.ReactNode, disabled: boolean = false) => {
    const placeholderKeys: Record<keyof z.infer<typeof SignInSchema>, string> = {
      email: "placeholders.email",
      username: "placeholders.username",
      password: "placeholders.password",
      verificationCode: "placeholders.verificationCode"
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <div className="relative">
          <Input
            id={name}
            type={type}
            disabled={disabled}
            placeholder={t(placeholderKeys[name])}
            className={cn("pl-10", errors[name] && "border-red-500")}
            {...register(name)}
          />
          <div className="absolute left-3 top-3 h-5 w-5 text-teal-500">
            {icon}
          </div>
        </div>
        {errors[name] && (
          <p className="text-sm text-red-500">
            {errors[name]?.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={cn(
                "border-l-4",
                message.type === "error"
                  ? "border-l-red-500"
                  : "border-l-teal-600"
              )}
            >
              <AlertCircle className="h-4 w-4" />
              <span className="ml-2">{message.text}</span>
            </Alert>
          )}

          <Tabs
            defaultValue="password"
            className="w-full"
            value={authMethod}
            onValueChange={handleAuthMethodChange}
          >
            <TabsList className="grid w-full grid-cols-2 bg-background">
              <TabsTrigger 
                value="password"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                {t("signInWithPassword")}
              </TabsTrigger>
              <TabsTrigger 
                value="email"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
              >
                {t("signInWithEmail")}
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto mt-4">
              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="block mb-2">
                      {t("username")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder={t("placeholders.username")}
                        {...register("username")}
                        className={cn(
                          "w-full pl-10",
                          errors.username && "border-destructive"
                        )}
                      />
                      <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="block mb-2">
                      {t("password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder={t("placeholders.password")}
                        {...register("password")}
                        className={cn(
                          "w-full pl-10",
                          errors.password && "border-destructive"
                        )}
                      />
                      <IoKeyOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("signingIn")}</span>
                      </div>
                    ) : (
                      t("submit")
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      {t("or")}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <FaGoogle className="mr-2 h-4 w-4" />
                  {t("signInWithGoogle")}
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form 
                  onSubmit={(e) => {
                    console.log("Form submitted"); 
                    handleSubmit(handleEmailSubmit)(e);
                  }} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("placeholders.email")}
                        className={cn(
                          "w-full pl-10",
                          errors.email && "border-destructive"
                        )}
                        {...register("email")}
                      />
                      <IoMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {verificationSent && (
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">{t("verificationCode")}</Label>
                      <div className="relative">
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder={t("placeholders.verificationCode")}
                          className={cn(
                            "w-full pl-10",
                            errors.verificationCode && "border-destructive"
                          )}
                          {...register("verificationCode")}
                        />
                        <IoKeyOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      </div>
                      {errors.verificationCode && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.verificationCode.message}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading || !emailValue || (verificationSent && countdown === 0)}
                    onClick={() => console.log("Submit button clicked")} 
                  >
                    {loading ? t("processing") : (verificationSent ? t("verifyCode") : t("sendCode"))}
                  </Button>

                  {verificationSent && countdown > 0 && (
                    <p 
                      className="text-sm text-center text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {t("resendCodeIn", { seconds: countdown })}
                    </p>
                  )}

                  {verificationSent && countdown === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-teal-600 hover:bg-teal-50 hover:text-teal-600"
                      onClick={handleResendCode}
                      disabled={loading}
                    >
                      {t("resendCode")}
                    </Button>
                  )}
                </form>
              </TabsContent>
            </div>
          </Tabs>

          <div className="text-sm text-center text-muted-foreground">
            {t("noAccount")}{" "}
            <button
              type="button"
              className="text-teal-600 hover:underline font-medium"
              onClick={() => {
                onClose(); // Close the sign-in modal first
                setShowSignUp(true); // Then show sign-up modal
              }}
            >
              {t("signUp")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignInForm;
