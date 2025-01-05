"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from "next-auth/react";
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
  const [authMethod, setAuthMethod] = useState<"password" | "email">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Define Zod schema for form validation
  const SignInSchema = z.object({
    username: z.string().trim().min(1, { message: t("validation.username.required") }),
    password: z.string().trim().min(1, { message: t("validation.password.required") }),
    email: z.string().optional(),
    verificationCode: z.string().optional()
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      verificationCode: ""
    }
  });

  useEffect(() => {
    setIsMounted(true);
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
    // Reset previous messages
    setMessage(null);
    
    setLoading(true);
    
    try {
      setLoading(true);
      setMessage(null);
      
      // Sign in with NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        username: values.username.trim(),
        password: values.password.trim(),
        callbackUrl: "/dashboard/profile" // Use path without locale
      });

      if (result?.error) {
        console.error('Sign-In Error:', result.error);
        let errorMessage = t("invalidCredentials");
        
        // Map specific error messages
        if (result.error === "Please provide both username and password") {
          errorMessage = t("validation.credentials.required");
        } else if (result.error.includes("Invalid credentials")) {
          errorMessage = t("invalidCredentials");
        } else {
          errorMessage = t("errors.unknown");
        }
        
        setMessage({
          type: "error",
          text: errorMessage
        });
        return;
      }

      console.log('Sign-in successful');
      setMessage({
        type: "success",
        text: t("success")
      });

      // Close the modal
      onClose();

      // Redirect to dashboard without locale prefix
      const redirectPath = "/dashboard/profile";
      console.log('Redirecting to:', redirectPath);
      router.replace(redirectPath);
      return;
    } catch (error) {
      console.error('Unexpected Authentication Error:', error);
      setMessage({
        type: "error",
        text: t("networkError")
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
      setMessage({ text: t("networkError"), type: "error" });
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
    if (loading) return;

    try {
      setLoading(true);
      setMessage(null);

      // Ensure email is validated before sending
      const emailValidation = SignInSchema.shape.email;
      const emailValue = getValues("email");

      if (!emailValue) {
        setMessage({
          type: "error",
          text: t("validation.email.required")
        });
        return;
      }

      // Request a new verification code
      const response = await fetch("http://localhost:8000/users/request-verification/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email: emailValue 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationSent(true);
        setMessage({ 
          type: "success", 
          text: t("codeSentAgain") 
        });
        setCountdown(300); // Reset 5-minute countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setMessage({ 
          type: "error", 
          text: data.message || t("resendError") 
        });
      }
    } catch (error) {
      console.error("Resend verification code error:", error);
      setMessage({ 
        text: t("networkError"), 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name: keyof z.infer<typeof SignInSchema>, label: string, type: string = "text", icon: React.ReactNode, disabled: boolean = false) => {
    const placeholderKeys: Record<keyof z.infer<typeof SignInSchema>, string> = {
      email: "emailPlaceholder",
      username: "usernamePlaceholder",
      password: "passwordPlaceholder",
      verificationCode: "verificationCodePlaceholder"
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
                        placeholder={t("usernamePlaceholder")}
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
                        placeholder={t("passwordPlaceholder")}
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {renderField("email", t("email"), "email", <IoMailOutline />)}
                  {verificationSent && (
                    renderField(
                      "verificationCode",
                      t("verificationCode"),
                      "text",
                      <IoKeyOutline />,
                      countdown > 0
                    )
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading || (verificationSent && countdown === 0)}
                  >
                    {loading ? t("signingIn") : (verificationSent ? t("verifyCode") : t("sendCode"))}
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
