import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/adminApi";
import { searchCategories } from "../../api/categoryApi";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";

// Zod schema for validation
const categorySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  tags: z.string().optional(),
  thumbnailFile: z.any().optional(),
});

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset page to 1 when search query changes
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", "1");
      if (searchQuery) {
        newParams.set("q", searchQuery);
      } else {
        newParams.delete("q");
      }
      setSearchParams(newParams, { replace: true });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const { data, isLoading, error, isSearching } = useQuery({
    queryKey: ["adminCategories", page, debouncedSearchQuery],
    queryFn: async () => {
      if (debouncedSearchQuery) {
        const searchData = await searchCategories(debouncedSearchQuery);
        // The search API might not return pagination info, so we create a mock one
        return {
          categories: searchData.categories,
          totalPages: 1,
          currentPage: 1,
        };
      }
      const response = await api.get(`/categories?page=${page}&limit=10`);
      return response.data;
    },
    keepPreviousData: true,
  });

  const categories = data?.categories;
  const pagination = debouncedSearchQuery
    ? null
    : data
      ? { totalPages: data.totalPages, currentPage: data.currentPage }
      : null;

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(
        `Failed to create category: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: () => {
      toast.success("Category updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(
        `Failed to update category: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
    },
    onError: (err) => {
      toast.error(
        `Failed to delete category: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    },
  });

  const openModal = (category = null) => {
    setEditingCategory(category);
    reset(
      category
        ? {
            name: category.name,
            description: category.description,
            tags: category.tags?.join(", "),
          }
        : { name: "", description: "", tags: "" }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.tags) {
      // Split the string into an array, trim whitespace, and filter out empty strings
      const tagsArray = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Append each tag individually. The backend will receive this as an array.
      tagsArray.forEach((tag) => {
        formData.append("tags", tag);
      });
    }
    if (data.thumbnailFile && data.thumbnailFile[0]) {
      formData.append("thumbnailFile", data.thumbnailFile[0]);
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 mx-1 rounded text-white ${
            pagination.currentPage === i
              ? "bg-sky-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }
    return <div className="flex justify-center mt-6">{pages}</div>;
  };

  if (isLoading && !data) return <div className="text-white">Loading...</div>;
  if (error)
    return (
      <div className="text-red-400">
        Error loading categories: {error.message}
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Category Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Category
        </button>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for categories..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
        />
        {(isLoading || isSearching) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        {categories && categories.length > 0 ? (
          <>
            <table className="w-full table-auto">
              <thead className="text-left">
                <tr className="bg-gray-700">
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Thumbnail
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Name
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Tags
                  </th>
                  <th className="p-3 text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-700">
                    <td className="p-3">
                      <img
                        src={cat.thumbnailUrl}
                        alt={cat.name}
                        className="h-10 w-12 rounded object-cover"
                      />
                    </td>
                    <td className="p-3 font-semibold text-gray-200">
                      {cat.name}
                    </td>
                    <td className="p-3">
                      {cat.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs mr-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openModal(cat)}
                        className="text-sky-400 hover:text-sky-300 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPagination()}
          </>
        ) : (
          <p className="text-center py-4 text-gray-400">No categories found.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingCategory ? "Edit Category" : "Create Category"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  {...register("name")}
                  className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  {...register("tags")}
                  className="w-full px-3 py-2 border bg-gray-700 text-white border-gray-600 rounded-lg"
                />
              </div>
              <div className="pt-2">
                <label
                  htmlFor="thumbnailFile"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Thumbnail
                </label>
                <input
                  type="file"
                  id="thumbnailFile"
                  {...register("thumbnailFile")}
                  className="w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-sky-600 file:text-white
                    hover:file:bg-sky-700 cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 disabled:bg-sky-400"
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
