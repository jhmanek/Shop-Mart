"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HiCheckCircle } from "react-icons/hi";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          mobile: res.data.mobile || "",
          address: res.data.address || "",
        });
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!form.name.trim() || !form.mobile.trim()) {
      setError("Name and mobile are required.");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.patch(
        "/api/profile",
        { name: form.name, mobile: form.mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.patch(
        "/api/profile/address",
        { address: form.address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser({ ...res.data, address: form.address });
      setEditMode(false);
      setError("");
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/Pages/login");
  };

  if (loading || actionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
        <img
          src="/favicon.png"
          alt="Loading"
          className="w-24 h-24 object-contain animate-bounce"
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white flex flex-col lg:flex-row">
      {/* Sidebar only for logged-in users */}
      {user && (
        <aside className="w-full lg:w-64 bg-white dark:bg-black p-6 border-b lg:border-r lg:border-b-0 border-gray-200 dark:border-gray-700 flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-start gap-4">
          <button className="w-full text-left px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded font-bold">
            Personal Information
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded font-bold cursor-pointer"
          >
            Logout
          </button>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10 overflow-x-hidden">
        {user ? (
          <div className="w-full max-w-3xl md:mt-20 lg:mt-40">
            {/* EXISTING PROFILE UI */}
            <h1 className="text-2xl font-bold mb-6 text-center lg:text-left">
              Personal Information
            </h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={!editMode}
                  className="w-full border px-4 py-2 rounded text-gray-700 dark:text-white dark:bg-neutral-800 dark:border-[rgba(255,255,255,0.5)] disabled:bg-gray-100 dark:disabled:bg-neutral-700"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full border px-4 py-2 rounded text-gray-700 dark:text-white bg-gray-100 dark:bg-neutral-700 dark:border-[rgba(255,255,255,0.5)]"
                  />
                  <HiCheckCircle
                    className="text-green-500 text-xl"
                    title="Verified"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  disabled={!editMode}
                  className="w-full border px-4 py-2 rounded text-gray-700 dark:text-white dark:bg-neutral-800 dark:border-[rgba(255,255,255,0.5)] disabled:bg-gray-100 dark:disabled:bg-neutral-700"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full border px-4 py-2 rounded text-gray-700 dark:text-white dark:bg-neutral-800 dark:border-[rgba(255,255,255,0.5)] disabled:bg-gray-100 dark:disabled:bg-neutral-700"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              {editMode ? (
                <>
                  <button
                    onClick={handleUpdate}
                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="border border-orange-500 text-orange-500 px-6 py-2 rounded hover:bg-orange-50 dark:hover:bg-orange-950 cursor-pointer"
                  >
                    Discard Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl bg-orange-50 dark:bg-neutral-900 border border-orange-200 dark:border-neutral-700 rounded-3xl px-6 py-10 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-orange-600 dark:text-orange-400 mb-4 sm:mb-6">
              You're not logged in
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              Sign in to view your profile and securely manage your personal
              details.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <button
                onClick={() => router.push("/Pages/login")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-semibold shadow hover:shadow-lg transition duration-300 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/Pages/signup")}
                className="bg-white dark:bg-neutral-800 border border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950 px-6 sm:px-8 py-3 rounded-xl text-base sm:text-lg font-semibold shadow hover:shadow-lg transition duration-300 cursor-pointer"
              >
                Signup
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
