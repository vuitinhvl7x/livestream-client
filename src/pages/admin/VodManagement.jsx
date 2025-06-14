import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { manualUploadVod } from "../../api/adminApi";

const vodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().url("Must be a valid URL"),
  urlExpiresAt: z.string().datetime("Must be a valid ISO 8601 datetime"),
  b2FileId: z.string().min(1, "B2 File ID is required"),
  b2FileName: z.string().min(1, "B2 File Name is required"),
  durationSeconds: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive("Duration must be a positive number")
  ),
  userId: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().positive("User ID must be a positive number")
  ),
  categoryId: z.preprocess(
    (a) => (a ? parseInt(z.string().parse(a), 10) : null),
    z.number().positive().optional().nullable()
  ),
  thumbnailUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  thumbnailUrlExpiresAt: z.string().datetime().optional().or(z.literal("")),
  b2ThumbnailFileId: z.string().optional(),
  b2ThumbnailFileName: z.string().optional(),
});

const InputField = ({ label, id, register, error, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {label}
    </label>
    <input
      id={id}
      {...register(id)}
      {...props}
      className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);

const VodManagement = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vodSchema),
  });

  const mutation = useMutation({
    mutationFn: manualUploadVod,
    onSuccess: (data) => {
      toast.success(data.message || "VOD created successfully!");
      queryClient.invalidateQueries(["vods"]); // Invalidate any VOD lists
      reset();
    },
    onError: (err) => {
      toast.error(
        `Failed to create VOD: ${err.response?.data?.error || err.message}`
      );
    },
  });

  const onSubmit = (data) => {
    // Filter out empty optional fields
    const payload = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== "" && v !== null)
    );
    mutation.mutate(payload);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Manual VOD Upload</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-md">
        <p className="text-sm text-gray-400 mb-6">
          This form allows an administrator to manually create a VOD record for
          a video file that has already been uploaded to B2 storage.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Title"
              id="title"
              register={register}
              error={errors.title}
            />
            <InputField
              label="User ID"
              id="userId"
              type="number"
              register={register}
              error={errors.userId}
            />
            <InputField
              label="Video URL"
              id="videoUrl"
              register={register}
              error={errors.videoUrl}
            />
            <InputField
              label="URL Expires At (ISO 8601)"
              id="urlExpiresAt"
              register={register}
              error={errors.urlExpiresAt}
              placeholder="e.g., 2024-12-31T23:59:59Z"
            />
            <InputField
              label="B2 File ID"
              id="b2FileId"
              register={register}
              error={errors.b2FileId}
            />
            <InputField
              label="B2 File Name"
              id="b2FileName"
              register={register}
              error={errors.b2FileName}
            />
            <InputField
              label="Duration (seconds)"
              id="durationSeconds"
              type="number"
              register={register}
              error={errors.durationSeconds}
            />
            <InputField
              label="Category ID (Optional)"
              id="categoryId"
              type="number"
              register={register}
              error={errors.categoryId}
            />
            <InputField
              label="Thumbnail URL (Optional)"
              id="thumbnailUrl"
              register={register}
              error={errors.thumbnailUrl}
            />
            <InputField
              label="Thumbnail Expires At (Optional)"
              id="thumbnailUrlExpiresAt"
              register={register}
              error={errors.thumbnailUrlExpiresAt}
              placeholder="e.g., 2024-12-31T23:59:59Z"
            />
            <InputField
              label="B2 Thumbnail File ID (Optional)"
              id="b2ThumbnailFileId"
              register={register}
              error={errors.b2ThumbnailFileId}
            />
            <InputField
              label="B2 Thumbnail File Name (Optional)"
              id="b2ThumbnailFileName"
              register={register}
              error={errors.b2ThumbnailFileName}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows="4"
              className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400"
            >
              {mutation.isLoading ? "Submitting..." : "Create VOD Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VodManagement;
