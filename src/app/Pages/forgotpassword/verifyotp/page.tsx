"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyOtpPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const context = searchParams.get("context"); // "forgot" or "email-change"
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ otp: string }>();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const onSubmit = async (data: { otp: string }) => {
    setMessage("");
    setIsError(false);

    try {
      const otpPayload =
        context === "email-change"
          ? {
              otp: data.otp,
              purpose: "email-change",
              userId: localStorage.getItem("userId"),
            }
          : {
              otp: data.otp,
              purpose: "forgot-password",
              email,
            };

      const res = await axios.post("/api/verify-otp", otpPayload);

      setMessage(res.data.message);

      if (res.data.success) {
        setTimeout(() => {
          router.push(
            context === "email-change"
              ? "/Pages/profile"
              : `/Pages/forgotpassword/resetpassword?email=${email}`
          );
        }, 1000);
      } else {
        setIsError(true);
      }
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-pink-800 via-white to-pink-800 dark:via-gray-800 items-center justify-center rounded-r-2xl p-10">
        <div className="text-center space-y-6 max-w-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6530/6530765.png"
            alt="OTP Icon"
            className="w-28 mx-auto drop-shadow-md dark:invert-100"
          />
          <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-600 leading-snug">
            Check your inbox
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Enter the code we sent to unlock your style.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center min-h-screen px-4 py-12 bg-white dark:bg-black">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-black shadow-xl rounded-lg">
          <h1 className="text-3xl font-bold text-center text-pink-600 dark:text-white mb-6">
            OTP Verification
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative z-0 w-full group">
              <input
                type="text"
                maxLength={6}
                {...register("otp", {
                  required: "OTP is required",
                  minLength: {
                    value: 6,
                    message: "OTP must be 6 digits",
                  },
                })}
                placeholder=" "
                className={`text-gray-700 dark:text-white block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.otp
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                }`}
              />
              <label
                className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
              >
                Enter 6-digit OTP
              </label>
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          {message && (
            <p
              className={`text-center text-sm ${
                isError ? "text-red-600" : "text-green-600 dark:text-green-400"
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

export default VerifyOtpPage;
