"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import useNotificationStore from "@/store/notificationStore";
import { userLogin, userSignup } from "@/app/actions/user.action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import PasswordStrengthIndicator from "../../Standard_Components/PasswordStrengthIndicatorComponents/PasswordStrengthIndicator";
import { passwordRegex } from "@/utils/passwordRegex";
import useFetch from "@/custom hooks/useFetch";
import { getBackendUrl } from "@/lib/getBackendUrl";
import { Label } from "@/components/ui/label";

const SignupSigninForm = ({ mode = "signup" }) => {
  const [step, setStep] = useState(1); // 1: email/name, 2: otp, 3: password
  const getFormSchema = () => {
    if (mode === "signin") {
      return z.object({
        email: z
          .string()
          .trim()
          .toLowerCase()
          .min(1, "Email is required")
          .email("Invalid email address"),
        password: z
          .string()
          .trim()
          .min(1, "Password is required")
          .regex(passwordRegex, "Password must be at least 8 characters long"),
      });
    }

    // Signup schema based on step
    const baseSchema = {
      email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .email("Invalid email address"),
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    };

    if (step >= 3) {
      baseSchema.password = z
        .string()
        .trim()
        .min(1, "Password is required")
        .regex(passwordRegex, "Password must be at least 8 characters long");
    }

    return z.object(baseSchema);
  };

  // Form setup
  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // State management
  const router = useRouter();
  const { setCurrentUserId, setCurrentUserRole, setCurrentUserName } =
    useNotificationStore();

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const { fetchData, loading: isLoading, error, success } = useFetch();
  const [buttonLoading, setButtonLoading] = useState(false);
  // Form submission
  const onSubmit = async (values) => {
    if (mode === "signup" && step === 1) {
      // First step: Send OTP
      await handleSendOTP(values);
      return;
    }

    if (mode === "signup" && step === 2) {
      // Second step: Verify OTP
      await handleVerifyOTP();
      return;
    }

    // Original signup/signin logic for step 3 or signin mode
    try {
      setFormError(null);
      setFormSuccess(null);
      setButtonLoading(true);
      useNotificationStore.setState({
        userId: null,
        userRole: null,
        notificationCount: 0,
        notifications: [],
        lastSync: null,
      });

      const authAction = mode === "signup" ? userSignup : userLogin;
      const res = await authAction(values);

      if (res && res.success) {
        setFormSuccess(
          mode === "signup"
            ? "Account created successfully!"
            : "Login successful! Redirecting..."
        );

        setCurrentUserId(res.data._id);
        setCurrentUserRole(res.data.role);
        setCurrentUserName(res.data.name);

        form.reset();
        setButtonLoading(false);
        setTimeout(() => {
          router.push("/user/user-add-complaint");
        }, 1000);
      } else {
        setFormError(
          res?.message || "Authentication failed. Please try again."
        );
        setButtonLoading(false);
      }
    } catch (error) {
      setFormError(
        error?.message || "An unexpected error occurred. Please try again."
      );
      setButtonLoading(false);
    }
  };

  const handleSendOTP = async (values) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      console.log("Sending OTP with values:", values);

      console.log(getBackendUrl());

      // const result = await sendOTP(values.email, values.name);
      const res = await fetchData(
        `${getBackendUrl()}/api/user-auth/send-otp`,
        "POST",
        values,
        null,
        false
      );
      console.log("OTP send result:", res);

      if (res.success) {
        setStep(2);
        setFormSuccess("OTP sent to your email successfully!");
        // Start resend timer (60 seconds)
        setResendTimer(60);
        const timer = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setFormError(res?.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.log("Error sending OTP:", error);
      setFormError(
        error?.message || "An unexpected error occurred while sending OTP."
      );
    }
  };

  // Handle OTP Verification function
  const handleVerifyOTP = async () => {
    try {
      setFormError(null);
      setFormSuccess(null);
      const email = form.getValues("email");

      if (!otp || otp.length !== 6) {
        setFormError("Please enter a valid 6-digit OTP.");
        return;
      }
      const sendToBackend = {
        email,
        otp,
      };
      const res = await fetchData(
        `${getBackendUrl()}/api/user-auth/verify-otp`,
        "POST",
        sendToBackend,
        null,
        false
      );
      console.log("Verify OTP result:", res);

      if (res.success) {
        setStep(3);
        setFormSuccess("Email verified successfully! Now set your password.");
      } else {
        setFormError(res?.message || "Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      setFormError(
        error?.message || "An unexpected error occurred. Please try again."
      );
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setFormError(null);
    setFormSuccess(null);
    if (resendTimer > 0) return;

    const email = form.getValues("email");
    const name = form.getValues("name");
    if (!email || !name) {
      setFormError("Please enter your email and name before resending OTP.");
      return;
    }
    await handleSendOTP({ email, name, resend: true });
  };
  const getSubmitButtonText = () => {
    if (isLoading) {
      if (mode === "signup") {
        if (step === 1) return "Sending OTP...";
        if (step === 2) return "Verifying...";
        if (step === 3) return "Creating Account...";
      }
      return "Signing In...";
    }

    if (mode === "signup") {
      if (step === 1) return "Send OTP";
      if (step === 2) return "Verify OTP";
      if (step === 3) return "Create Account";
    }
    return "Sign In";
  };

  // Update button disabled condition
  const isButtonDisabled = () => {
    if (isLoading) return true;
    // if (mode === "signup" && step === 2) {
    //   return otp.length !== 6;
    // }
    return false;
  };
  return (
    <div className=" min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Card container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden ">
          {/* Form header */}
          <div className="p-6 bg-primary text-white">
            <h2 className="text-2xl font-bold">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="mt-1 ">
              {mode === "signup"
                ? "Join our community to share your voice"
                : "Sign in to access your account"}
            </p>
          </div>

          {/* Form content */}
          <div className="p-6 pt-8">
            {/* Success message */}
            {formSuccess && (
              <Alert className="mb-6 bg-green/10 text-green border-green">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{formSuccess}</AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {formError && (
              <Alert
                className="mb-6 bg-red/10 text-red border-red/20"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Name field (signup only) */}
                {mode === "signup" && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-text_color font-medium">
                          Full Name
                        </FormLabel>
                        <div className="relative mt-1">
                          <User
                            className={`  absolute left-3  ${
                              form.formState.errors.name
                                ? "top-1/3 text-red"
                                : "top-1/2 text-primary"
                            } -translate-y-1/2  h-5 w-5`}
                          />
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              disabled={isLoading}
                              className={`pl-10 h-10 border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary/10 ${
                                form.formState.errors.name
                                  ? "border-red border-2"
                                  : ""
                              } `}
                              placeholder="Jane Doe"
                            />
                          </FormControl>
                          <FormMessage className="text-red text-sm mt-1" />
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-text_color font-medium">
                        Email Address
                      </FormLabel>
                      <div className="relative mt-1">
                        <Mail
                          className={`  absolute left-3  ${
                            form.formState.errors.email
                              ? "top-1/3 text-red"
                              : "top-1/2 text-primary"
                          } -translate-y-1/2  h-5 w-5`}
                        />
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={isLoading}
                            className={`pl-10 h-10 border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary/10 ${
                              form.formState.errors.email
                                ? "border-red border-2"
                                : ""
                            }`}
                            placeholder="your@email.com"
                          />
                        </FormControl>
                        <FormMessage className="text-red text-sm mt-1" />
                      </div>
                    </FormItem>
                  )}
                />
                {mode === "signup" && step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-text_color  font-medium block mb-2">
                        Enter OTP sent to your email
                      </Label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          disabled={isLoading}
                          className="text-center text-lg tracking-widest h-12 border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary/10"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text_color">
                        Didn't receive OTP?
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isButtonDisabled()}
                        className={`${
                          resendTimer > 0
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-primary hover:text-primary/80 hover:underline"
                        } font-medium`}
                      >
                        {resendTimer > 0
                          ? `Resend in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Password field */}
                {((mode === "signup" && step === 3) || mode === "signin") && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel className="text-text_color font-medium">
                            Password
                          </FormLabel>
                        </div>
                        <div className="relative mt-1">
                          <Lock
                            className={`  absolute left-3  ${
                              form.formState.errors.password
                                ? "top-1/3 text-red"
                                : "top-1/2 text-primary"
                            } -translate-y-1/2  h-5 w-5`}
                          />
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              disabled={isLoading}
                              className={`pl-10 h-10 border-gray-300 bg-gray-50 focus:border-primary focus:ring-primary/10 ${
                                form.formState.errors.password
                                  ? "border-red border-2"
                                  : ""
                              } `}
                              placeholder="••••••••"
                            />
                          </FormControl>

                          {/* Toggle password visibility */}
                          <button
                            type="button"
                            className={`absolute  flex items-center pr-3 ${
                              form.formState.errors.password
                                ? "text-red inset-y-0 right-0 -top-1/3"
                                : "text-text_color inset-y-0 right-0"
                            }`}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex="-1"
                          >
                            {showPassword ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 hover:text-text_color"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 hover:text-text_color"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                          <FormMessage className="text-red text-sm mt-1" />
                        </div>
                        <div className="mt-3">
                          {mode == "signup" && (
                            <PasswordStrengthIndicator
                              password={form.watch("password")}
                              className="mt-2"
                              showRequirements={true}
                            />
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* Submit button with loading state */}
                <Button
                  type="submit"
                  disabled={isLoading || buttonLoading || isButtonDisabled()}
                  className="w-full h-10 mt-3 bg-gradient-to-r from-primary to-green hover:from-blue-700 hover:to-primary-700 transition-all duration-200 text-white font-medium"
                >
                  {(isLoading || buttonLoading) && (
                    <Loader2 className={`h-4 w-4 mr-2 animate-spin`} />
                  )}
                  {getSubmitButtonText()}
                </Button>

                <div className="mt-2 ">
                  {mode === "signin" && (
                    <Link
                      href="/user/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline hover:scale-105"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="h-px w-full bg-gray-200"></div>
                  <span className="absolute bg-white px-4 text-text_color text-sm">
                    OR
                  </span>
                </div>

                {/* Toggle between signup and signin */}
                <div className="text-center text-text_color">
                  {mode === "signup"
                    ? "Existing User?"
                    : "Don't have an account?"}{" "}
                  <Link
                    href={
                      mode === "signup"
                        ? "/user/user-login"
                        : "/user/user-register"
                    }
                    className="font-medium text-primary hover:text-primary transition-colors hover:underline"
                  >
                    {mode === "signup" ? " Log in here" : "Sign up"}
                  </Link>
                </div>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-center text-sm font-medium text-text_color mb-2">
                    Demo Credentials
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Email:</span>
                    </div>
                    <div>vijay.r20799@gmail.com</div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Password:</span>
                    </div>
                    <div>Vijay@123</div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center bg-primary rounded-full shadow-md p-2">
          <p className="text-white text-sm flex items-center justify-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Secured with SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupSigninForm;
