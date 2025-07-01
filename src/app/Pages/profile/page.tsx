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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const [screenSize, setScreenSize] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    handleResize();
    if (screenSize >= 1024) {
      window.scrollTo(0, 0);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (screenSize >= 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }

    return () => {
      document.body.style.overflow = "scroll";
    };
  }, [screenSize]);

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

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.clear();
      router.push("/Pages/signup");
    } catch (err) {
      setError("Failed to delete account. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setActionLoading(false);
    }
  };
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDeleteModal]);

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
    <div className=" bg-white dark:bg-black text-black dark:text-white flex flex-col lg:flex-row">
      {user && (
        <aside className="w-full lg:min-h-screen lg:w-64 bg-white dark:bg-black p-6 border-b lg:border-r lg:border-b-0 border-gray-200 dark:border-gray-700 flex flex-col sm:flex-col justify-between lg:justify-start items-center lg:items-start gap-4">
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

      <main className="flex-1 flex items-center justify-center  px-4 py-10 overflow-x-hidden m-0">
        {user ? (
          <div className="w-full max-w-3xl ">
            {/* Top Title + Delete Button */}
            <div className="flex flex-col gap-2  md:flex-row justify-between md:items-center mb-6   md:gap-0">
              <h1 className="text-2xl font-bold text-center">
                Personal Information
              </h1>
              <button
                onClick={() => {
                  if (user.role !== "admin") setShowDeleteModal(true);
                }}
                disabled={user.role === "admin"}
                className={`border w-full px-3 py-1 text-sm rounded md:w-fit ${
                  user.role === "admin"
                    ? "text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100 dark:text-gray-500 dark:border-gray-600 dark:bg-neutral-800"
                    : "text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
                }`}
                title={
                  user.role === "admin" ? "Admin account can't be deleted" : ""
                }
              >
                Delete Account
              </button>
            </div>

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

            {/* Action Buttons */}
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

            {/* Delete Account Modal */}
            {showDeleteModal && (
              <>
                <style>{`body { overflow: hidden; }`}</style>

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
                  <div className="w-[90%] max-w-sm bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-2xl shadow-2xl p-6 sm:p-8 text-center animate-modal-pop">
                    {/* Icon */}
                    <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full">
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01M12 6v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                      Are you sure?
                    </h2>

                    {/* Message */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
                      Deleting your account is permanent and cannot be undone.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleDelete}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg shadow cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 font-semibold py-2 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
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
