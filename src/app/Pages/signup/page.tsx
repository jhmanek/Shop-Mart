"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "react-hot-toast";
import CustomToast from "@/components/customToast"; // adjust this path if needed

type SignupFormInputs = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

const SignupPage: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [fade, setFade] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => {
    setFade(false);
    setTimeout(() => {
      setShowPassword((prev) => !prev);
      setFade(true);
    }, 150);
  };

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/register",
        data
      );

      if (response.status === 201) {
        const { token, user } = response.data;

        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast.custom((t) => (
          <CustomToast type="success" message="Signup successful!" toast={t} />
        ));

        router.push("/");
      } else {
        toast.custom((t) => (
          <CustomToast
            type="error"
            message={"Unexpected response: " + response.status}
            toast={t}
          />
        ));
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.custom((t) => (
        <CustomToast
          type="error"
          message={
            "Signup failed: " + (error.response?.data?.message || error.message)
          }
          toast={t}
        />
      ));
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/favicon.png"
            alt="Shop Mart Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain animate-bounce dark:invert-75"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-black dark:bg-black dark:text-white">
      {/* Left Banner */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-pink-800 via-white to-pink-800 dark:from-pink-900 dark:via-neutral-800 dark:to-pink-900 p-10">
        <div className="text-center space-y-6 max-w-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6537/6537760.png"
            alt="Signup Icon"
            className="w-28 mx-auto drop-shadow-md dark:invert-100"
          />
          <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-600">
            Why wait?
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Own the look!
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex justify-center items-center w-full md:w-1/2 px-8 py-12 min-h-screen md:min-h-0">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Sign Up
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Name */}
            <div className="relative z-0 w-full group">
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 text-black dark:text-white
                appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.name
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-pink-600 dark:border-gray-600 dark:focus:border-pink-500"
                }`}
              />
              <label
                className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
              >
                Full Name
              </label>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative z-0 w-full group">
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 text-black dark:text-white
                appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-pink-600 dark:border-gray-600 dark:focus:border-pink-500"
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

            {/* Mobile */}
            <div className="relative z-0 w-full group">
              <input
                type="tel"
                {...register("mobile", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit mobile number",
                  },
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 text-black dark:text-white
                appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.mobile
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-pink-600 dark:border-gray-600 dark:focus:border-pink-500"
                }`}
              />
              <label
                className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
              >
                Mobile Number
              </label>
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative z-0 w-full group">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#]).{8,}$/,
                    message:
                      "Password must be 8+ chars with uppercase, lowercase, number & special character",
                  },
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 text-black dark:text-white
                appearance-none focus:outline-none focus:ring-0 peer transition-opacity duration-200
                ${fade ? "opacity-100" : "opacity-0"}
                ${
                  errors.password
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-pink-600 dark:border-gray-600 dark:focus:border-pink-500"
                }`}
              />
              <label
                className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
                peer-placeholder-shown:text-gray-400 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-0 top-3 text-gray-500 hover:text-pink-600"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiEyeOff size={24} /> : <HiEye size={24} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600 p-3 rounded-lg text-white font-medium transition duration-200 cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/Pages/login" className="text-pink-600 hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
