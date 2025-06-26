"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: { email: string }) => {
    setMessage("");
    setIsError(false);
    try {
      const res = await axios.post("/api/forgot-password", {
        email: data.email,
      });

      setMessage(res.data.message);

      if (res.data.success) {
        setTimeout(() => {
          router.push(`/Pages/forgotpassword/verifyotp?email=${data.email}`);
        }, 1500);
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
      {/* Left side image section */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-pink-800 via-white to-pink-800 dark:via-black p-10">
        <div className="text-center space-y-6 max-w-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/128/1000/1000999.png"
            alt="Lock and Key Icon"
            className="w-28 mx-auto drop-shadow-md dark:invert-100"
          />
          <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-600">
            Lost the key to your style?
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Let’s reset your password and unlock the look
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen px-4 py-12 bg-white dark:bg-black">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-black shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-center text-pink-600 dark:text-pink-600 mb-6">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative z-0 w-full group">
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                text-gray-700 dark:text-white focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                }`}
              />
              <label
                className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
              >
                Email
              </label>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !watch("email")}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {message && (
            <p
              className={`text-center text-sm mt-2 ${
                isError ? "text-red-500" : "text-green-600 dark:text-green-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
