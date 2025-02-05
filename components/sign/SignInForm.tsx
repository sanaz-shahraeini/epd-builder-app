"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

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
  callbackUrl = '/dashboard/profile'
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
    username: z.string().optional(),
    password: z.string().optional(),
    email: z.string().optional(),
    verificationCode: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (authMethod === "password") {
      // Validate username and password only for password auth
      if (!data.username?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.username.required"),
          path: ["username"]
        });
      }
      if (!data.password?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.password.required"),
          path: ["password"]
        });
      }
    } else if (authMethod === "email") {
      // Validate email and verification code for email auth
      if (!data.email?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.email.required"),
          path: ["email"]
        });
      } else if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.email.invalid"),
          path: ["email"]
        });
      }
      
      if (verificationSent && !data.verificationCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.verificationCode.required"),
          path: ["verificationCode"]
        });
      }
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
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
    console.log('Form errors:', errors);
    console.log('Form is valid:', isValid);
    console.log('Form is submitting:', isSubmitting);
  }, [errors, isValid, isSubmitting]);

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

  // Password sign-in handler
  const onPasswordSubmit: SubmitHandler<z.infer<typeof SignInSchema>> = async (values) => {
    console.log('Password sign-in started with values:', values);
    
    if (!values.username || !values.password) {
      setMessage({
        type: "error",
        text: t("errors.missingCredentials")
      });
      return;
    }

    setMessage(null);
    setLoading(true);
    
    try {
      console.log('Attempting password sign in with:', { username: values.username });
      
      const result = await signIn("credentials", {
        redirect: false,
        username: values.username.trim(),
        password: values.password.trim(),
        type: "password"
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
        await handleSuccessfulSignIn();
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

  // Helper function for successful sign-in
  const handleSuccessfulSignIn = async () => {
    try {
      const userProfile = await getUserProfile();
      console.log('Fetched user profile after sign in:', userProfile);
      
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
        };
        
        console.log('Setting user data in store after login:', userData);
        setUser(userData);
        
        // Close the dialog before navigation
        onClose();
        
        // Navigate with locale to profile
        router.push(`/${locale}/dashboard/profile`);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage({
        type: "error",
        text: t("errors.unknown")
      });
    }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      console.log('Using API URL:', apiUrl);

      if (!verificationSent) {
        // Step 1: Send verification code
        const sendCodeUrl = `${apiUrl}/users/email-verification/send/`;
        console.log('Sending verification code to:', sendCodeUrl);
        console.log('Request body:', JSON.stringify({ email: values.email }));

        const sendResponse = await fetch(sendCodeUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: values.email }),
          credentials: 'include',
          mode: 'cors',
        });

        console.log('Send code response status:', sendResponse.status);
        let responseData;
        try {
          const text = await sendResponse.text();
          console.log('Raw response:', text);
          responseData = text ? JSON.parse(text) : {};
          console.log('Send code response data:', responseData);
        } catch (e) {
          console.error('Error parsing response:', e);
          throw new Error(t("errors.serverError"));
        }

        if (!sendResponse.ok) {
          throw new Error(responseData?.error || responseData?.message || t("errors.emailNotFound"));
        }

        setVerificationSent(true);
        setCountdown(600); // 10 minutes countdown
        setMessage({
          type: "success",
          text: t("success.verificationEmailSent")
        });
      } else {
        // Step 2: Verify the email code
        console.log('Verifying email code...');
        const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/email-verification/verify/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            code: values.verificationCode,
          }),
        });

        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json();
          console.error('Verification failed:', errorData);
          throw new Error(errorData.error || 'Failed to verify email');
        }

        const verificationData = await verificationResponse.json();
        console.log('Verification successful:', verificationData);

        // Step 3: Sign in with the tokens from verification
        const result = await signIn("credentials", {
          redirect: false,
          access: verificationData.access,
          refresh: verificationData.refresh,
          email: verificationData.email,
          type: "token",
          callbackUrl: `/${locale}/dashboard/profile`
        });

        if (result?.error) {
          console.error('Sign in error:', result.error);
          throw new Error(result.error);
        }

        // Use the shared success handler
        await handleSuccessfulSignIn();
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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { 
        callbackUrl: `/${locale}/dashboard/profile`,
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

  const handleResendCode = async () => {
    if (loading || !getValues("email")) return;

    try {
      setLoading(true);
      setMessage(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const requestUrl = `${apiUrl}/users/email-verification/send/`;
      console.log('Resend code URL:', requestUrl);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          "email": getValues("email")
        }),
      });

      let data;
      try {
        data = await response.json();
        console.log('Resend response:', data);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error(t("errors.serverError"));
      }

      if (response.ok) {
        setVerificationSent(true);
        setCountdown(600); // Reset 10-minute countdown
        setMessage({ 
          type: "success", 
          text: t("success.verificationEmailSent") 
        });
      } else {
        throw new Error(data?.message || data?.detail || t("errors.resendError"));
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
                <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
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
                  disabled={true}
                >
                  <FaGoogle className="mr-2 h-4 w-4" />
                  {t("signInWithGoogle")}
                </Button>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <form 
                  onSubmit={handleSubmit(handleEmailSubmit)}
                  className="space-y-4"
                >
                  {renderField("email", t("email"), "email", <IoAtCircleOutline />, verificationSent)}

                  {verificationSent && (
                    <div className="space-y-4">
                      {renderField("verificationCode", t("verificationCode"), "text", <IoKeyOutline />)}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {countdown > 0 ? (
                            <>
                              {t("codeExpiresIn")} {Math.floor(countdown / 60)}:
                              {String(countdown % 60).padStart(2, '0')}
                            </>
                          ) : (
                            t("codeExpired")
                          )}
                        </span>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-teal-600"
                          onClick={handleResendCode}
                          disabled={loading || countdown > 0}
                        >
                          {t("resendCode")}
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading || (verificationSent && !watch("verificationCode"))}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{verificationSent ? t("verifying") : t("sendingCode")}</span>
                      </div>
                    ) : (
                      verificationSent ? t("verify") : t("sendCode")
                    )}
                  </Button>

                  {verificationSent && (
                    <p className="text-sm text-muted-foreground text-center">
                      {t("checkEmail")}
                    </p>
                  )}
                </form>
              </TabsContent>
            </div>
          </Tabs>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {t("noAccount")}{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-teal-600"
              onClick={() => setShowSignUp(true)}
            >
              {t("createAccount")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignInForm;
