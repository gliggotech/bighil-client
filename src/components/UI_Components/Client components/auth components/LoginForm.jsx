"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useNotificationStore from "@/store/notificationStore";
import Link from "next/link";
import {
  clientLogin,
  twoFactorVerification,
} from "@/app/actions/client.actions";
import VerifyTwoFACode from "../../Standard_Components/VerifytwoFACode";

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string().trim().min(1, "Password is required"),
});

export default function LoginForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const {
    setCurrentUserId,
    setCurrentUserRole,
    setCurrentTheme,
    setCurrentUserName,
    setCurrentUserEmail,
    setCompanyId,
    setPreferredRoleName,
  } = useNotificationStore();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showTwoFaDialog, setShowTwoFaDialog] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await clientLogin(data);
      if (res.requiresTwoFactor) {
        setShowTwoFaDialog(true);
        return;
      }

      if (res.success) {
        setIsSuccess(true);
        setCurrentUserId(res.user.id);
        setCurrentUserRole(res.user.role);
        setCurrentTheme(res.user.theme);
        setCurrentUserName(res.user.name);
        setCurrentUserEmail(res.user.email);
        setCompanyId(res.user.companyId);
        setPreferredRoleName(res.user.preferredRoleName || null);

        // Delay navigation for better UX
        setTimeout(() => {
          router.push("/client/client-dashboard");
        }, 100);
      } else {
        setErrorMessage(
          res.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-client_login_bg to-client_login_bg/90 p-4">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          {/* Accent bar */}
          {/* <div className="h-2 bg-gradient-to-r from-primary via-purple to-pink" /> */}

          <div className="p-3 lg:p-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-semibold text-text_color ">
                Welcome Back
              </h1>
              <p className="text-text_color mt-1 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Success message */}
            {isSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-fadeIn">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-emerald-800 font-medium text-sm">
                    Login successful!
                  </p>
                  <p className="text-emerald-600 text-xs">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-rose-800 font-medium text-sm">
                    Login failed
                  </p>
                  <p className="text-rose-600 text-xs">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage("")}
                  className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-text_color text-sm font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail className="h-5 w-5 text-client_login_bg" />
                          </div>
                          <Input
                            placeholder="name@company.com"
                            className={cn(
                              "pl-11 h-10 rounded-xl border-slate-200 bg-white",
                              "placeholder:text-slate-400 text-text_color focus:outline-none"
                            )}
                            disabled={isLoading || isSuccess}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs pl-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-text_color text-sm font-medium">
                          Password
                        </FormLabel>
                        <Link
                          href="/client/forgot-password"
                          className="text-primary hover:text-primary text-sm transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <KeyRound className="h-5 w-5 text-client_login_bg" />
                          </div>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={cn(
                              "pl-11 h-10 rounded-xl border-slate-200 bg-white",
                              "placeholder:text-slate-400 text-text_color focus:outline-none"
                            )}
                            disabled={isLoading || isSuccess}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text_color transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-client_login_bg" />
                            ) : (
                              <Eye className="h-5 w-5 text-client_login_bg" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-500 text-xs pl-1" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-white text-sm transition-all",
                      isSuccess
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-client_login_bg hover:bg-client_login_bg/90",
                      "shadow-md hover:shadow-lg"
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    ) : isSuccess ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-white" />
                        <span>Login Successful</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="mt-6">
              <p className="text-sm text-text_color dark:text-text-light">
                Don’t have a client account?{" "}
                <Link
                  href="/client/request-access"
                  className="text-primary hover:text-primary hover:underline transition-colors"
                >
                  Request Access
                </Link>
              </p>
            </div>

            {/* Demo credentials toggle */}
            <div className="mt-8">
              <button
                onClick={() => setShowCredentials(!showCredentials)}
                className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-primary-600 text-sm py-2 transition-colors"
              >
                <Info className="h-4 w-4" />
                <span>
                  {showCredentials
                    ? "Hide demo credentials"
                    : "View demo credentials"}
                </span>
              </button>
              {showTwoFaDialog && (
                <VerifyTwoFACode
                  open={showTwoFaDialog}
                  onClose={(success) => {
                    setShowTwoFaDialog(false);
                    if (success) {
                      // router.push happens inside component now
                    }
                  }}
                  redirectOnSuccess={true}
                  verifyFunction={twoFactorVerification}
                  email={form.getValues("email")}
                />
              )}

              {showCredentials && (
                <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                    <h3 className="text-text_color font-medium text-sm">
                      Demo Credentials
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-200">
                    <div className="px-4 py-3">
                      <div className="text-primary text-xs font-medium mb-1">
                        Super Admin
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-text_color">
                          vijayakumar.r@gliggo.com
                        </span>
                        <span className="text-slate-500">Password:</span>
                        <span className="text-text_color">Vijay@123</span>
                      </div>
                    </div>

                    <div className="px-4 py-3">
                      <div className="text-primary text-xs font-medium mb-1">
                        Sub Admin
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-text_color">
                          mohammed.shahul@gliggo.com
                        </span>
                        <span className="text-slate-500">Password:</span>
                        <span className="text-text_color">Password!11</span>
                      </div>
                    </div>

                    <div className="px-4 py-3">
                      <div className="text-primary text-xs font-medium mb-1">
                        Admin
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-text_color">
                          muruganantham.s@gliggo.com
                        </span>
                        <span className="text-slate-500">Password:</span>
                        <span className="text-text_color">Muruga@123</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security badge */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-client_login_bg border border-slate-200 text-white text-xs">
                <Shield className="w-3 h-3 text-white" />
                Secured with end-to-end encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
