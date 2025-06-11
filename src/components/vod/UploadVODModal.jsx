import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { uploadVOD } from "../../api/vodApi";

const UploadVODModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleClose = () => {
    reset();
    setVideoFile(null);
    setThumbnailFile(null);
    onClose();
  };

  const onSubmit = async (data) => {
    if (!videoFile) {
      toast.error("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("videoFile", videoFile);
    if (thumbnailFile) {
      formData.append("thumbnailFile", thumbnailFile);
    }

    try {
      await uploadVOD(formData);
      toast.success("VOD uploaded successfully! It will be processed shortly.");
      onUploadSuccess();
      handleClose();
    } catch (error) {
      toast.error(`Upload failed: ${error.errors?.[0]?.msg || error.message}`);
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Upload New VOD</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              {...register("title", { required: "Title is required" })}
              className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              {...register("description")}
              className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-3 text-white"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Video File (Required)
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="videoFile"
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Choose File
              </label>
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="hidden"
              />
              <span className="text-gray-400">
                {videoFile ? videoFile.name : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              Thumbnail (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="thumbnailFile"
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Choose File
              </label>
              <input
                type="file"
                id="thumbnailFile"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="hidden"
              />
              <span className="text-gray-400">
                {thumbnailFile ? thumbnailFile.name : "No file chosen"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-sky-800"
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadVODModal;
