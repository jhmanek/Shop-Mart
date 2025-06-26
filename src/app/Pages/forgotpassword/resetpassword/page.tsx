"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FormValues = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    const otpParam = searchParams.get("otp") || "";

    reset({
      email: emailParam,
      otp: otpParam,
      newPassword: "",
      confirmPassword: "",
    });
  }, [searchParams, reset]);

  const onSubmit = async (data: FormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.trim(),
          otp: data.otp.trim(),
          password: data.newPassword,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("Password reset successful!");
        setTimeout(() => router.push("/Pages/login"), 2000);
      } else {
        setMessage(result.message || "Failed to reset password.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-pink-800 via-white dark:via-black to-pink-800 items-center justify-center rounded-r-2xl p-10">
        <div className="text-center space-y-2 max-w-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/14082/14082419.png"
            alt="Reset Password Icon"
            className="w-28 mx-auto drop-shadow-md dark:invert"
          />
          <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-600 leading-snug">
            Set a new password
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Let’s get you back in style
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen px-4 py-12 bg-white dark:bg-black">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-black shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-center text-pink-600 dark:text-white mb-6">
            Reset Password
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Email (disabled) */}
            <div className="relative z-0 w-full group">
              <input
                type="email"
                disabled
                {...register("email")}
                placeholder=" "
                className="block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none text-gray-900 dark:text-white
                  focus:outline-none focus:ring-0 peer transition-colors duration-300 border-gray-300 dark:border-gray-600 focus:border-pink-600"
              />
              <label
                className="absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                  peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                  peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600"
              >
                Email
              </label>
            </div>

            {/* New Password */}
            <div className="relative z-0 w-full group">
              <input
                type="password"
                {...register("newPassword", {
                  required: "New password is required",
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#]).{8,}$/,
                    message:
                      "Minimum 8 characters with uppercase, lowercase, number, and symbol",
                  },
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                  text-gray-700 dark:text-white focus:outline-none focus:ring-0 peer transition-colors duration-300
                  ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                  }`}
              />
              <label
                className="absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                  peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                  peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600"
              >
                New Password
              </label>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative z-0 w-full group">
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                  text-gray-700 dark:text-white focus:outline-none focus:ring-0 peer transition-colors duration-300
                  ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                  }`}
              />
              <label
                className="absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                  peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                  peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600"
              >
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-50 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <p
              className={`text-center text-sm mt-4 ${
                message.toLowerCase().includes("success")
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
