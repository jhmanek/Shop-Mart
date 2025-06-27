"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { PiInfoBold } from "react-icons/pi";

type FormData = {
  name: string;
  email: string;
  message: string;
};

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  message: Yup.string().required("Message is required"),
});

const ErrorText = ({ message }: { message: string }) => (
  <p className="flex items-center mt-2 text-red-600 font-semibold text-sm">
    <PiInfoBold className="mr-1" />
    {message}
  </p>
);

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formStatus, setFormStatus] = React.useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // 1.2s loading effect
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok)
        throw new Error(result.message || "Something went wrong");

      setFormStatus(
        "Thank you for reaching out! We will get back to you soon."
      );
      reset();
    } catch (error: any) {
      setFormStatus(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormStatus(null), 4000);
    }
  };

  if (loading || isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
        <img
          src="/favicon.png"
          alt="Loading"
          className="w-24 h-24 md:w-32 md:h-32 object-contain animate-bounce dark:invert-100"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col items-center justify-center py-16 px-4 md:px-0">
      <div className="w-full max-w-lg bg-white dark:bg-black  rounded-xl shadow-lg p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-[#FF3F6C] tracking-wide">
          Get in <span className="underline decoration-[#FF3F6C]">Touch</span>
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Name */}
          <div className="relative z-0 w-full group">
            <input
              id="name"
              type="text"
              placeholder=" "
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
              className={`block py-3 px-0 w-full bg-transparent text-gray-900 dark:text-white border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.name
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-b-[rgba(255,255,255,0.5)] focus:border-pink-600"
                }`}
            />
            <label
              htmlFor="name"
              className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 dark:peer-placeholder-shown:text-white
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
            >
              Full Name*
            </label>
            {errors.name && <ErrorText message={errors.name.message!} />}
          </div>

          {/* Email */}
          <div className="relative z-0 w-full group">
            <input
              id="email"
              type="email"
              placeholder=" "
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email")}
              className={`block py-3 px-0 w-full bg-transparent text-gray-900 dark:text-white border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-b-[rgba(255,255,255,0.5)] focus:border-pink-600"
                }`}
            />
            <label
              htmlFor="email"
              className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 dark:peer-placeholder-shown:text-white
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
            >
              Email Address*
            </label>
            {errors.email && <ErrorText message={errors.email.message!} />}
          </div>

          {/* Message */}
          <div className="relative z-0 w-full group">
            <textarea
              id="message"
              rows={5}
              placeholder=" "
              aria-invalid={errors.message ? "true" : "false"}
              {...register("message")}
              className={`block py-3 px-0 w-full bg-transparent text-gray-900 dark:text-white border-0 border-b-2 resize-none appearance-none focus:outline-none focus:ring-0 peer transition-colors duration-300
                ${
                  errors.message
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-b-[rgba(255,255,255,0.5)] focus:border-pink-600"
                }`}
            />
            <label
              htmlFor="message"
              className={`absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 dark:peer-placeholder-shown:text-white
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600`}
            >
              Message*
            </label>
            {errors.message && <ErrorText message={errors.message.message!} />}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF3F6C] hover:bg-[#e0365c] text-white py-3 rounded-full font-bold shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>

        {formStatus && (
          <div className="mt-6 text-center text-[#FF3F6C] font-semibold">
            {formStatus}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-gray-300 dark:border-gray-700 mt-16 pt-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center text-gray-600 dark:text-gray-400 text-sm">
          <div className="mb-6 md:mb-0 md:w-1/2 text-left space-y-2">
            <p>
              Contact us at{" "}
              <Link
                href="mailto:jhon220@gmail.com"
                className="text-[#FF3F6C] font-semibold underline"
              >
                jhon220@gmail.com
              </Link>{" "}
              or call <span className="font-semibold">+91 9099899046</span>
            </p>
            <p>
              Manek Tech (Timber-Point), Code: 380015,
              <br />
              Prahladnagar, Ahmedabad
            </p>
          </div>

          <div className="md:w-1/2 flex flex-wrap justify-end gap-x-6 gap-y-2 text-right">
            <Link
              href="/terms"
              className="text-[#FF3F6C] underline font-semibold whitespace-nowrap"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-[#FF3F6C] underline font-semibold whitespace-nowrap"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookies"
              className="text-[#FF3F6C] underline font-semibold whitespace-nowrap"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
