import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStream } from "../../api/streamApi";
import { getCategories, searchCategories } from "../../api/categoryApi";
import { toast } from "sonner";
import { Copy, X, Loader2 } from "lucide-react";

const createStreamSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().optional(),
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

const CopyableField = ({ label, value }) => {
  const onCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          type="text"
          readOnly
          value={value}
          className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-100"
        />
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
        >
          <Copy className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const CreateStream = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [newStreamData, setNewStreamData] = useState(null);

  // State for category search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchContainerRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createStreamSchema),
  });

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => toast.error("Failed to load categories."));
  }, []);

  // Debounce search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsDropdownVisible(true);
    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCategories(searchQuery);
        setSearchResults(data.categories);
      } catch (error) {
        toast.error("Failed to search for categories.");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Click outside handler for search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const thumbnailFile = watch("thumbnailFile");
  useEffect(() => {
    if (thumbnailFile && thumbnailFile.length > 0) {
      const file = thumbnailFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setValue("categoryId", category.id, { shouldValidate: true });
    clearErrors("categoryId");
    setSearchQuery("");
    setSearchResults([]);
    setIsDropdownVisible(false);
  };

  const handleRemoveCategory = () => {
    setSelectedCategory(null);
    setValue("categoryId", "", { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    if (data.thumbnailFile && data.thumbnailFile.length > 0) {
      formData.append("thumbnailFile", data.thumbnailFile[0]);
    }

    try {
      const result = await createStream(formData);
      toast.success(result.message);
      setNewStreamData(result.data);
    } catch (error) {
      const errorMessage =
        error.errors?.[0]?.msg || error.message || "Failed to create stream.";
      toast.error(errorMessage);
    }
  };

  if (newStreamData) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">
          Stream Created Successfully!
        </h1>
        <p className="mb-6 text-gray-600">
          Use the details below to configure your streaming software (e.g.,
          OBS).
        </p>

        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Important Security Notice</p>
          <p>
            This is the **only** time you will see your stream key. Please copy
            and save it in a secure place. It will not be shown again.
          </p>
        </div>

        <div className="space-y-4 bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 text-left">
          <h2 className="text-xl font-semibold text-center mb-4">
            Streaming Keys
          </h2>
          <CopyableField
            label="RTMP Server URL"
            value="rtmp://localhost:1935/live"
          />
          <CopyableField label="Stream Key" value={newStreamData.streamKey} />
        </div>
        <button
          onClick={() =>
            navigate(`/dashboard/creator/stream-info/${newStreamData.id}`)
          }
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700"
        >
          Continue to Stream Settings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Stream</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="Thumbnail Preview"
            className="w-full h-auto object-cover rounded-md bg-gray-100"
          />
        )}
        <div>
          <label
            htmlFor="thumbnailFile"
            className="block text-sm font-medium text-gray-700"
          >
            Thumbnail (Optional)
          </label>
          <input
            id="thumbnailFile"
            type="file"
            {...register("thumbnailFile")}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
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
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows="3"
            {...register("description")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        <div ref={searchContainerRef}>
          <label
            htmlFor="category-search"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          {selectedCategory ? (
            <div className="mt-1 flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedCategory.thumbnailUrl ||
                    `https://via.placeholder.com/40x53?text=${selectedCategory.name}`
                  }
                  alt={selectedCategory.name}
                  className="w-10 h-[53px] object-cover rounded"
                />
                <span className="font-semibold">{selectedCategory.name}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCategory}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                id="category-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDropdownVisible(true)}
                autoComplete="off"
                placeholder="Search for a category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {isDropdownVisible && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 flex items-center justify-center text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                        onMouseDown={() => handleSelectCategory(cat)}
                      >
                        <img
                          src={
                            cat.thumbnailUrl ||
                            `https://via.placeholder.com/40x53?text=${cat.name}`
                          }
                          alt={cat.name}
                          className="w-10 h-[53px] object-cover rounded"
                        />
                        <span>{cat.name}</span>
                      </div>
                    ))
                  ) : (
                    searchQuery && (
                      <p className="p-3 text-gray-500">No results found.</p>
                    )
                  )}
                </div>
              )}
            </div>
          )}
          {/* Hidden input to hold the categoryId for react-hook-form */}
          <input type="hidden" {...register("categoryId")} />
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
          {isSubmitting ? "Creating..." : "Create Stream"}
        </button>
      </form>
    </div>
  );
};

export default CreateStream;
