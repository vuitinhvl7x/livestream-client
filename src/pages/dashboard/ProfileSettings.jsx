import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getMyProfile, updateMyProfile } from "../../api/userApi";
import useAuthStore from "../../state/authStore";
import { toast } from "sonner";
import { getImageUrl } from "../../utils/image";

const profileSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  avatarFile: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 2 * 1024 * 1024, // 2MB
      `Avatar size must be less than 2MB.`
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["image/jpeg", "image/png", "image/gif"].includes(files[0].type),
      "Only .jpg, .png, and .gif formats are supported."
    ),
});

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });
  const setUserInfo = useAuthStore((state) => state.setUserInfo);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getMyProfile();
        setUser(profileData);
        setValue("displayName", profileData.displayName);
        setValue("bio", profileData.bio);
        setAvatarPreview(profileData.avatarUrl);
      } catch (error) {
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const avatarFile = watch("avatarFile");
  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [avatarFile]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("displayName", data.displayName);
    if (data.bio) {
      formData.append("bio", data.bio);
    }
    if (data.avatarFile && data.avatarFile.length > 0) {
      formData.append("avatarFile", data.avatarFile[0]);
    }

    try {
      const result = await updateMyProfile(formData);
      setUser(result.user);
      setUserInfo(result.user); // Update zustand store
      setAvatarPreview(result.user.avatarUrl);
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  if (loading)
    return <div className="text-gray-300">Loading profile settings...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
          {avatarPreview && (
            <img
              src={getImageUrl(avatarPreview)}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <label
              htmlFor="avatarFile"
              className="block text-sm font-medium text-gray-300"
            >
              Avatar
            </label>
            <input
              id="avatarFile"
              type="file"
              {...register("avatarFile")}
              className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
            />
            {errors.avatarFile && (
              <p className="text-red-500 text-sm mt-1">
                {errors.avatarFile.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-300"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            {...register("displayName")}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
          />
          {errors.displayName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.displayName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-300"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows="3"
            {...register("bio")}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
          ></textarea>
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
