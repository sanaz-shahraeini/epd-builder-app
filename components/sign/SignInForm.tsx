import { useTranslations } from 'next-intl';
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import LanguageSwitcher from '../LanguageSwitcher';

interface SignInFormProps {
  open: boolean;
  onClose: () => void;
  setShowSignUp: (show: boolean) => void;
  setShowForgotPassword: (show: boolean) => void;
}

type Message = {
  text: string;
  type: "error" | "success";
};

const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export function SignInForm({
  open,
  onClose,
  setShowSignUp,
  setShowForgotPassword,
}: SignInFormProps) {
  const t = useTranslations('SignIn');
  const [tabValue, setTabValue] = useState("regular");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({
            text: data.message || t("signInSuccess"),
            type: "success",
          });
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setMessage({ text: data.error || t("signInFailed"), type: "error" });
        }
      } catch (error) {
        setMessage({ text: t("networkError"), type: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSignUpClick = () => {
    onClose();
    setShowSignUp(true);
  };

  const handleGoogleSignIn = () => {
    // Implement Google sign-in logic
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-[#42B7B0] to-[#1B4242] bg-clip-text text-transparent">
              {t('welcomeBack')}
            </h1>
            <LanguageSwitcher />
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">{t('regularUser')}</TabsTrigger>
              <TabsTrigger value="company">{t('companyUser')}</TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    disabled={loading}
                    {...formik.getFieldProps('username')}
                    className={cn(
                      formik.touched.username && formik.errors.username && "border-red-500"
                    )}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="text-sm text-red-500">{formik.errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={loading}
                    {...formik.getFieldProps('password')}
                    className={cn(
                      formik.touched.password && formik.errors.password && "border-red-500"
                    )}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="px-0 font-normal"
                  >
                    {t('forgotPassword')}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                  ) : (
                    t('signIn')
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="company">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    disabled={loading}
                    {...formik.getFieldProps('username')}
                    className={cn(
                      formik.touched.username && formik.errors.username && "border-red-500"
                    )}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="text-sm text-red-500">{formik.errors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={loading}
                    {...formik.getFieldProps('password')}
                    className={cn(
                      formik.touched.password && formik.errors.password && "border-red-500"
                    )}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-sm text-red-500">{formik.errors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setShowForgotPassword(true)}
                    className="px-0 font-normal"
                  >
                    {t('forgotPassword')}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                  ) : (
                    t('signIn')
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Separator />

          {tabValue === "regular" && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FaGoogle className="mr-2 h-4 w-4" />
              {t('signInWithGoogle')}
            </Button>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{" "}
              <Button
                variant="link"
                className="p-0 font-normal"
                onClick={handleSignUpClick}
              >
                {t('signUp')}
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
