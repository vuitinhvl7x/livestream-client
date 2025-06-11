import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getStreamById, updateStream } from "../../api/streamApi";
import { getCategories } from "../../api/categoryApi";
import { toast } from "sonner";

const streamSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  categoryId: z.coerce.number().int().positive("Please select a category"),
  thumbnailFile: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 4 * 1024 * 1024,
      `Thumbnail size must be less than 4MB.`
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ["image/jpeg", "image/png"].includes(files[0].type),
      "Only .jpg and .png formats are supported."
    ),
});

const EditStreamInfo = () => {
  const { id: streamId } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(streamSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [streamData, categoriesData] = await Promise.all([
          getStreamById(streamId),
          getCategories(),
        ]);

        const currentStream = streamData.stream;
        setStream(currentStream);
        setCategories(categoriesData.categories);

        setValue("title", currentStream.title);
        setValue("description", currentStream.description);
        setValue("categoryId", currentStream.category.id);
        setThumbnailPreview(currentStream.thumbnailUrl);
      } catch (error) {
        toast.error(error.message || "Failed to load stream data.");
        if (error.response && error.response.status === 403) {
          toast.error("You don't have permission to edit this stream.");
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [streamId, setValue, navigate]);

  const thumbnailFile = watch("thumbnailFile");
  useEffect(() => {
    if (thumbnailFile && thumbnailFile.length > 0) {
      const file = thumbnailFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [thumbnailFile]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    if (data.thumbnailFile && data.thumbnailFile.length > 0) {
      formData.append("thumbnailFile", data.thumbnailFile[0]);
    }

    try {
      const result = await updateStream(streamId, formData);
      toast.success(result.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to update stream.");
    }
  };

  if (loading)
    return <div className="text-gray-300">Loading stream info...</div>;
  if (!stream) return <div className="text-gray-300">Stream not found.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Stream Info</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="Thumbnail Preview"
            className="w-full h-64 object-cover rounded-md"
          />
        )}
        <div>
          <label
            htmlFor="thumbnailFile"
            className="block text-sm font-medium text-gray-300"
          >
            Thumbnail
          </label>
          <input
            id="thumbnailFile"
            type="file"
            {...register("thumbnailFile")}
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700"
          />
          {errors.thumbnailFile && (
            <p className="text-red-500 text-sm mt-1">
              {errors.thumbnailFile.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            rows="3"
            {...register("description")}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-300"
          >
            Category
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categoryId.message}
            </p>
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

export default EditStreamInfo;
