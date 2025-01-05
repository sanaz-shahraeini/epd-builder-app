"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { FaGoogle } from "react-icons/fa";
import { 
  IoMailOutline, 
  IoBusinessOutline, 
  IoBriefcaseOutline, 
  IoCallOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoKeyOutline,
  IoGridOutline,
  IoAtCircleOutline
} from "react-icons/io5";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

interface SignUpFormProps {
  open: boolean;
  onClose: () => void;
  setShowSignIn: (show: boolean) => void;
  setShowSignUp: (show: boolean) => void;
}

type Message = {
  text: string;
  type: "error" | "success";
};

function SignUpForm({ open, onClose, setShowSignIn, setShowSignUp }: SignUpFormProps) {
  const t = useTranslations("SignUp");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("user");
  const [message, setMessage] = useState<Message | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const validationSchema = {
    user: yup.object({
      firstName: yup
        .string()
        .trim()
        .min(2, t("validation.first_name.min"))
        .max(50, t("validation.first_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.first_name.matches")
        )
        .required(t("validation.first_name.required")),
      lastName: yup
        .string()
        .trim()
        .min(2, t("validation.last_name.min"))
        .max(50, t("validation.last_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.last_name.matches")
        )
        .required(t("validation.last_name.required")),
      username: yup
        .string()
        .trim()
        .min(3, t("validation.username.min"))
        .max(50, t("validation.username.max"))
        .required(t("validation.username.required")),
      email: yup
        .string()
        .email(t("validation.email.invalid"))
        .required(t("validation.email.required")),
      password: yup
        .string()
        .min(8, t("validation.password.min"))
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          t("validation.password.matches")
        )
        .required(t("validation.password.required")),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], t("validation.confirmPassword.mustMatch"))
        .required(t("validation.confirmPassword.required")),
      companyName: yup
        .string()
        .trim()
        .min(2, t("validation.company_name.min"))
        .max(100, t("validation.company_name.max"))
        .required(t("validation.company_name.required")),
      jobTitle: yup
        .string()
        .trim()
        .min(2, t("validation.job_title.min"))
        .max(50, t("validation.job_title.max"))
        .required(t("validation.job_title.required")),
      industry: yup
        .string()
        .trim()
        .min(2, t("validation.industry.min"))
        .max(50, t("validation.industry.max"))
        .required(t("validation.industry.required")),
      country: yup
        .string()
        .trim()
        .min(2, t("validation.country.min"))
        .max(50, t("validation.country.max"))
        .required(t("validation.country.required")),
      phoneNumber: yup
        .string()
        .trim()
        .matches(
          /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
          t("validation.phone_number.matches")
        )
        .required(t("validation.phone_number.required")),
    }),
    company: yup.object({
      firstName: yup
        .string()
        .trim()
        .min(2, t("validation.first_name.min"))
        .max(50, t("validation.first_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.first_name.matches")
        )
        .required(t("validation.first_name.required")),
      lastName: yup
        .string()
        .trim()
        .min(2, t("validation.last_name.min"))
        .max(50, t("validation.last_name.max"))
        .matches(
          /^[a-zA-Z\s-']+$/,
          t("validation.last_name.matches")
        )
        .required(t("validation.last_name.required")),
      username: yup
        .string()
        .trim()
        .min(3, t("validation.username.min"))
        .max(50, t("validation.username.max"))
        .required(t("validation.username.required")),
      email: yup
        .string()
        .email(t("validation.email.invalid"))
        .required(t("validation.email.required")),
      password: yup
        .string()
        .min(8, t("validation.password.min"))
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          t("validation.password.matches")
        )
        .required(t("validation.password.required")),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], t("validation.confirmPassword.mustMatch"))
        .required(t("validation.confirmPassword.required")),
      companyName: yup
        .string()
        .trim()
        .min(2, t("validation.company_name.min"))
        .max(100, t("validation.company_name.max"))
        .required(t("validation.company_name.required")),
      jobTitle: yup
        .string()
        .trim()
        .min(2, t("validation.job_title.min"))
        .max(50, t("validation.job_title.max"))
        .required(t("validation.jobTitle.required")),
      industry: yup
        .string()
        .trim()
        .min(2, t("validation.industry.min"))
        .max(50, t("validation.industry.max"))
        .required(t("validation.industry.required")),
      country: yup
        .string()
        .trim()
        .min(2, t("validation.country.min"))
        .max(50, t("validation.country.max"))
        .required(t("validation.country.required")),
      phoneNumber: yup
        .string()
        .trim()
        .matches(
          /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
          t("validation.phone_number.matches")
        )
        .required(t("validation.phone_number.required")),
    }),
  };

  const userFormik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      company_name: "",
      job_title: "",
      industry: "",
      country: "",
      phone_number: "",
    },
    validationSchema: validationSchema.user,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Check username availability
        const usernameResponse = await fetch(`http://localhost:8000/users/check-username/${values.username}/`);
        if (!usernameResponse.ok) {
          setMessage({ type: "error", text: t("errors.usernameTaken") });
          setLoading(false);
          return;
        }

        // Check email availability
        const emailResponse = await fetch(`http://localhost:8000/users/check-email/${values.email}/`);
        if (!emailResponse.ok) {
          setMessage({ type: "error", text: t("errors.emailRegistered") });
          setLoading(false);
          return;
        }

        // Submit signup form
        const response = await fetch("http://localhost:8000/users/signup/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            userType: "regular",
          }),
        });

        if (response.ok) {
          setMessage({ type: "success", text: t("success.registrationComplete") });
          setTimeout(() => {
            onClose();
            setShowSignIn(true);
          }, 2000);
        } else {
          const data = await response.json();
          setMessage({ type: "error", text: data.message || t("errors.registrationFailed") });
        }
      } catch (error) {
        setMessage({ type: "error", text: t("errors.generalError") });
      }
      setLoading(false);
    },
  });

  const companyFormik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      company_name: "",
      job_title: "",
      industry: "",
      country: "",
      phone_number: "",
    },
    validationSchema: validationSchema.company,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Check username availability
        const usernameResponse = await fetch(`http://localhost:8000/users/check-username/${values.username}/`);
        if (!usernameResponse.ok) {
          setMessage({ type: "error", text: t("errors.usernameTaken") });
          setLoading(false);
          return;
        }

        // Check email availability
        const emailResponse = await fetch(`http://localhost:8000/users/check-email/${values.email}/`);
        if (!emailResponse.ok) {
          setMessage({ type: "error", text: t("errors.emailRegistered") });
          setLoading(false);
          return;
        }

        // Submit signup form
        const response = await fetch("http://localhost:8000/users/signup/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            userType: "company",
          }),
        });

        if (response.ok) {
          setMessage({ type: "success", text: t("success.registrationComplete") });
          setTimeout(() => {
            onClose();
            setShowSignIn(true);
          }, 2000);
        } else {
          const data = await response.json();
          setMessage({ type: "error", text: data.message || t("errors.registrationFailed") });
        }
      } catch (error) {
        setMessage({ type: "error", text: t("errors.generalError") });
      }
      setLoading(false);
    },
  });

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>, formik: any) => {
    const username = e.target.value;
    formik.handleChange(e);

    if (username.length >= 3) {
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`http://localhost:8000/users/check-username/${username}/`);
        if (!response.ok) {
          formik.setFieldError("username", t("validation.username.taken"));
        }
      } catch (error) {
        console.error("Error checking username:", error);
      }
      setIsCheckingUsername(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>, formik: any) => {
    const email = e.target.value;
    formik.handleChange(e);

    if (email && email.includes("@")) {
      setIsCheckingEmail(true);
      try {
        const response = await fetch(`http://localhost:8000/users/check-email/${email}`);
        if (!response.ok) {
          formik.setFieldError("email", t("validation.email.registered"));
        }
      } catch (error) {
        console.error("Error checking email:", error);
      }
      setIsCheckingEmail(false);
    }
  };

  const renderField = (formik: any, name: string, label: string, type: string = "text", icon: React.ReactNode) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          onChange={name === "username" ? (e) => handleUsernameChange(e, formik) : 
                   name === "email" ? (e) => handleEmailChange(e, formik) :
                   formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          className={cn(
            "pl-10",
            formik.touched[name] && formik.errors[name] ? "border-red-500" : ""
          )}
        />
        <div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
          {icon}
        </div>
      </div>
      {formik.touched[name] && formik.errors[name] && (
        <div className="text-sm text-red-500">{formik.errors[name]}</div>
      )}
    </div>
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-background z-10">
              <TabsTrigger value="user" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                {t("regular_user")}
              </TabsTrigger>
              <TabsTrigger value="company" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                {t("company_user")}
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[calc(90vh-400px)] mt-4">
              <TabsContent value="user" className="space-y-4">
                <form onSubmit={userFormik.handleSubmit} className="space-y-4">
                  {renderField(userFormik, "first_name", t("first_name"), "text", <IoPersonOutline className="text-teal-500" />)}
                  {renderField(userFormik, "last_name", t("last_name"), "text", <IoPersonOutline className="text-teal-500" />)}
                  {renderField(userFormik, "username", t("username"), "text", <IoAtCircleOutline className="text-teal-500" />)}
                  {renderField(userFormik, "email", t("email"), "email", <IoMailOutline className="text-teal-500" />)}
                  {renderField(userFormik, "company_name", t("company_name"), "text", <IoBusinessOutline className="text-teal-500" />)}
                  {renderField(userFormik, "job_title", t("job_title"), "text", <IoBriefcaseOutline className="text-teal-500" />)}
                  {renderField(userFormik, "industry", t("industry"), "text", <IoGridOutline className="text-teal-500" />)}
                  {renderField(userFormik, "country", t("country"), "text", <IoLocationOutline className="text-teal-500" />)}
                  {renderField(userFormik, "phone_number", t("phone_number"), "tel", <IoCallOutline className="text-teal-500" />)}
                  {renderField(userFormik, "password", t("password"), "password", <IoKeyOutline className="text-teal-500" />)}
                  {renderField(userFormik, "confirmPassword", t("confirmPassword"), "password", <IoKeyOutline className="text-teal-500" />)}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("creatingAccount")}</span>
                      </div>
                    ) : (
                      t("createAccount")
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <form onSubmit={companyFormik.handleSubmit} className="space-y-4">
                  {renderField(companyFormik, "first_name", t("first_name"), "text", <IoPersonOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "last_name", t("last_name"), "text", <IoPersonOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "username", t("username"), "text", <IoAtCircleOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "email", t("email"), "email", <IoMailOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "company_name", t("company_name"), "text", <IoBusinessOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "job_title", t("job_title"), "text", <IoBriefcaseOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "industry", t("industry"), "text", <IoGridOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "country", t("country"), "text", <IoLocationOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "phone_number", t("phone_number"), "tel", <IoCallOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "password", t("password"), "password", <IoKeyOutline className="text-teal-500" />)}
                  {renderField(companyFormik, "confirmPassword", t("confirmPassword"), "password", <IoKeyOutline className="text-teal-500" />)}

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t("creatingAccount")}</span>
                      </div>
                    ) : (
                      t("createAccount")
                    )}
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("continueWithGoogle")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-teal-600 hover:bg-teal-50 hover:text-teal-600"
            onClick={() => signIn("google")}
          >
            <FaGoogle className="mr-2 h-4 w-4 text-teal-600" />
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {t("alreadyAccount")}{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-teal-600 hover:underline"
              onClick={() => {
                setShowSignUp(false);
                setShowSignIn(true);
              }}
            >
              {t("signIn")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignUpForm;