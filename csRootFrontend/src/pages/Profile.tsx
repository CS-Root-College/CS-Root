import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import toast from "react-hot-toast";

function formatDate(dateString?: string | Date | null) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

const DEFAULT_PROFILE_PICTURE =
  "https://res.cloudinary.com/dlzi244at/image/upload/v1763367677/defaultPersonImage_exseqc.avif";

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  }
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create image"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

export function Profile() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    githubUsername: "",
  });

  const handleOpenEdit = () => {
    setFormData({
      name: user?.name || "",
      bio: user?.bio || "",
      githubUsername: user?.githubUsername || "",
    });

    setIsEditOpen(true);
  };

  const handleCameraClick = () => {
    if (isUploadingPicture) return;

    fileInputRef.current?.click();
  };

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      e.target.value = "";
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setCrop({
      x: 0,
      y: 0,
    });
    setZoom(1);
    setCroppedAreaPixels(null);

    e.target.value = "";
  };

  const handleCropComplete = useCallback(
    (
      _: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
      croppedPixels: {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    ) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const closeCropModal = () => {
    if (isUploadingPicture) return;

    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    setSelectedImage(null);
    setCrop({
      x: 0,
      y: 0,
    });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const uploadCroppedImage = async () => {
  if (!selectedImage || !croppedAreaPixels || !user) {
    return;
  }

  try {
    setIsUploadingPicture(true);

    const croppedBlob = await getCroppedImage(
      selectedImage,
      croppedAreaPixels
    );

    const file = new File(
      [croppedBlob],
      "profile-picture.jpg",
      {
        type: "image/jpeg",
      }
    );

    const imageFormData = new FormData();

    imageFormData.append(
      "profilePicture",
      file
    );

    await api.patch(
      "/users/update-profile-picture",
      imageFormData
    );

    URL.revokeObjectURL(selectedImage);

    setSelectedImage(null);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);

    setCroppedAreaPixels(null);

    window.location.reload();

    toast.success("Profile picture updated successfully");

  } catch (error) {
    console.error(
      "Profile picture upload failed:",
      error
    );
  } finally {
    setIsUploadingPicture(false);
  }
};

  const handleSaveDetails = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      setIsSavingDetails(true);

      const response = await axios.patch(
        `${BACKEND_URL}/users/update-proifle-details`,
        {
          name: formData.name,
          bio: formData.bio,
          githubUsername: formData.githubUsername,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setIsEditOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error(
        "Profile details update failed:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "Backend response:",
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
            "Failed to update profile."
        );
      } else {
        alert(
          "Something went wrong while updating your profile."
        );
      }
    } finally {
      setIsSavingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-[#00FF87]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-8 text-center shadow-2xl">
          <h1 className="text-xl font-black tracking-tight">
            Not Logged In
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Sign in to access your dashboard,
            streak, and badges.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#00FF87] to-[#60EFFF] font-bold text-black shadow-lg shadow-[#00FF87]/20 transition-all hover:opacity-90 active:scale-95"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const xpTotal = user.experiencePoints ?? 0;

  const currentXp = xpTotal % 1000;

  const level =
    Math.floor(xpTotal / 1000) + 1;

  const progressPercent =
    Math.min(
      Math.max(
        (currentXp / 1000) * 100,
        0
      ),
      100
    );

  const stats = [
    {
      label: "Points",
      value: (
        user.totalPoints ?? 0
      ).toLocaleString(),
      color: "text-white",
    },
    {
      label: "XP Points",
      value: xpTotal.toLocaleString(),
      color: "text-[#60EFFF]",
    },
    {
      label: "Streak",
      value: `${user.streaks ?? 0}d`,
      color: "text-[#FF8A00]",
    },
    {
      label: "Badges",
      value: user.badgesCount ?? 0,
      color: "text-[#00FF87]",
    },
  ];

  const profilePicture =
    user.profilePicture ||
    DEFAULT_PROFILE_PICTURE;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white">

      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[380px] w-[500px] -translate-x-1/2 rounded-full bg-[#00FF87]/15 blur-[120px]" />

      <div className="pointer-events-none absolute top-1/3 -right-32 -z-10 h-[340px] w-[340px] rounded-full bg-[#60EFFF]/10 blur-[130px]" />

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-[#09090b]/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00FF87] via-[#60EFFF] to-[#FF8A00]" />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-5 sm:gap-6">

              <div className="group relative shrink-0">

                <img
                  src={profilePicture}
                  alt={user.username || "Avatar"}
                  className="h-20 w-20 rounded-2xl border-2 border-zinc-700/80 object-cover shadow-2xl shadow-black/80 transition duration-300 group-hover:border-[#00FF87] sm:h-24 sm:w-24"
                />

                <button
                  type="button"
                  onClick={handleCameraClick}
                  disabled={isUploadingPicture}
                  title="Change avatar"
                  className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-gradient-to-tr from-[#00FF87] to-[#60EFFF] text-black shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingPicture ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />

              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2.5">

                  <h1 className="truncate text-2xl font-black sm:text-3xl">
                    {user.name || user.username}
                  </h1>

                  {user.isEmailVerified && (
                    <span className="rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 px-2.5 py-0.5 text-xs font-bold text-[#00FF87]">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <p className="mt-0.5 text-sm font-medium text-zinc-400">
                  @{user.username}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-zinc-400">

                  {user.email && (
                    <span className="break-all">
                      {user.email}
                    </span>
                  )}

                  {user.githubUsername && (
                    <span>
                      gh/{user.githubUsername}
                    </span>
                  )}

                </div>

              </div>

            </div>

            <div className="flex w-full flex-row gap-3 sm:w-auto">

              <button
                type="button"
                onClick={handleOpenEdit}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#60EFFF] px-6 py-2.5 text-center text-sm font-bold text-black shadow-lg shadow-[#00FF87]/20 transition duration-200 hover:opacity-90 active:scale-95 sm:flex-initial"
              >
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/90 px-5 py-2.5 text-center text-sm font-semibold text-zinc-300 transition duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-95 sm:flex-initial"
              >
                Settings
              </button>

            </div>

          </div>

          {user.bio ? (
            <p className="mt-6 border-t border-zinc-800/80 pt-5 text-sm leading-relaxed text-zinc-300">
              {user.bio}
            </p>
          ) : (
            <p className="mt-6 border-t border-zinc-800/80 pt-5 text-xs italic text-zinc-500">
              No bio added yet.
            </p>
          )}

        </div>

        <div className="rounded-3xl border border-zinc-800/90 bg-[#09090b]/80 p-6 backdrop-blur-xl">

          <div className="flex items-center justify-between text-sm">

            <div>
              <p className="text-lg font-black text-white sm:text-xl">
                Level {level}
              </p>

              <p className="text-xs text-zinc-400">
                CS ROOT Learner
              </p>
            </div>

            <div className="text-right">

              <p className="font-bold text-[#60EFFF]">
                {currentXp.toLocaleString()} / 1,000 XP
              </p>

              <p className="text-xs text-zinc-500">
                Level {level + 1} next
              </p>

            </div>

          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 p-0.5">

            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00FF87] to-[#60EFFF] shadow-md shadow-[#00FF87]/40 transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
              }}
            />

          </div>

        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#09090b]/80 p-5 text-center transition-all duration-300 hover:border-zinc-700"
            >
              <p
                className={`text-2xl font-black tracking-tight sm:text-3xl ${stat.color}`}
              >
                {stat.value}
              </p>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
            </div>
          ))}

        </div>

        <div className="divide-y divide-zinc-900 rounded-3xl border border-zinc-800/90 bg-[#09090b]/80 px-6 py-2 backdrop-blur-xl">

          <div className="flex items-center justify-between py-4 text-sm">
            <span className="text-zinc-400">
              Membership
            </span>

            <span className="font-bold uppercase tracking-wider text-[#00FF87]">
              {user.subscription?.plan || "Free"}
            </span>
          </div>

          <div className="flex items-center justify-between py-4 text-sm">
            <span className="text-zinc-400">
              Preferred Language
            </span>

            <span className="font-semibold capitalize text-white">
              {user.preferredLanguage || "JavaScript"}
            </span>
          </div>

          <div className="flex items-center justify-between py-4 text-sm">

            <span className="text-zinc-400">
              Two-Step Verification
            </span>

            <span
              className={`font-semibold ${
                user.twoStepVerification
                  ? "text-[#00FF87]"
                  : "text-zinc-500"
              }`}
            >
              {user.twoStepVerification
                ? "Active"
                : "Disabled"}
            </span>

          </div>

          <div className="flex items-center justify-between py-4 text-sm">

            <span className="text-zinc-400">
              Member Since
            </span>

            <span className="font-medium text-zinc-300">
              {formatDate(user.createdAt)}
            </span>

          </div>

          <div className="flex items-center justify-between py-4 text-sm">

            <span className="text-zinc-400">
              Last Active
            </span>

            <span className="font-medium text-zinc-300">
              {formatDate(user.lastActiveAt)}
            </span>

          </div>

        </div>

        {user.isBanned && (
          <div className="rounded-2xl border border-red-900/60 bg-red-950/30 p-5 text-center">

            <p className="text-sm font-bold text-red-400">
              Account Restricted
            </p>

            <p className="mt-1 text-xs text-red-400/80">
              Your account currently has active restrictions.
            </p>

          </div>
        )}

      </main>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md sm:items-center sm:p-4">

          <div className="w-full max-w-lg rounded-t-3xl border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl sm:rounded-2xl">

            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">

              <h2 className="text-lg font-black text-white">
                Edit Profile
              </h2>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isSavingDetails}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSaveDetails}
              className="mt-5 space-y-4"
            >

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Display Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00FF87]"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  GitHub Username
                </label>

                <input
                  type="text"
                  value={formData.githubUsername}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      githubUsername: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00FF87]"
                  placeholder="e.g. torvalds"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Bio
                </label>

                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bio: e.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-[#00FF87]"
                  placeholder="Tell the community about what you code..."
                />
              </div>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSavingDetails}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingDetails}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#60EFFF] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#00FF87]/20 transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingDetails
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4">

          <div className="flex h-full max-h-[850px] w-full max-w-2xl flex-col rounded-3xl border border-zinc-800 bg-[#0d0d10] p-4 shadow-2xl">

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">

              <div>
                <h2 className="text-lg font-black text-white">
                  Crop Profile Picture
                </h2>

                <p className="text-xs text-zinc-500">
                  Adjust your picture before uploading
                </p>
              </div>

              <button
                type="button"
                onClick={closeCropModal}
                disabled={isUploadingPicture}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">

              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={true}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />

            </div>

            <div className="mt-4">

              <div className="mb-4 flex items-center gap-3">

                <span className="text-xs font-semibold text-zinc-500">
                  Zoom
                </span>

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) =>
                    setZoom(Number(e.target.value))
                  }
                  disabled={isUploadingPicture}
                  className="flex-1 accent-[#00FF87]"
                />

              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeCropModal}
                  disabled={isUploadingPicture}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={isUploadingPicture || !croppedAreaPixels}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#60EFFF] py-3 text-sm font-bold text-black shadow-lg shadow-[#00FF87]/20 transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploadingPicture
                    ? "Uploading..."
                    : "Crop & Continue"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}