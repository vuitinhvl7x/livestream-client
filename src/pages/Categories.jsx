import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchCategories } from "../api/categoryApi";
import api from "../api";
import { getImageUrl } from "../utils/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isSearching, setIsSearching] = useState(false);

  const page = searchParams.get("page") || "1";

  const fetchPaginatedCategories = useCallback(async (currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      });
      const response = await api.get(`/categories?${params.toString()}`);
      setCategories(response.data.categories);
      setPagination({
        page: response.data.currentPage,
        limit: 12,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalCategories,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (query) => {
    setIsSearching(true);
    setPagination(null);
    try {
      const data = await searchCategories(query);
      setCategories(data.categories);
    } catch (error) {
      toast.error("Failed to search for categories.");
      setCategories([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        setLoading(true);
        performSearch(searchQuery).finally(() => setLoading(false));
      } else {
        fetchPaginatedCategories(page);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, page, fetchPaginatedCategories, performSearch]);

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    const newParams = new URLSearchParams(searchParams);
    if (newQuery) {
      newParams.set("q", newQuery);
      newParams.delete("page");
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
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
            pagination.page === i
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">All Categories</h1>
      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for categories..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-white"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-10 text-gray-300">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="text-center mt-10 text-red-500">{error}</div>
      ) : categories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                to={`/categories/${category.slug}`}
                key={category.id}
                className="block bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 overflow-hidden"
              >
                <img
                  src={getImageUrl(category.thumbnailUrl)}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-100 truncate">
                    {category.name}
                  </h2>
                  <p className="text-gray-300 mt-2 text-sm h-10 overflow-hidden text-ellipsis">
                    {category.description}
                  </p>
                  {category.tags && category.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {category.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center mt-10 text-gray-300">
          No categories found.
        </div>
      )}
    </div>
  );
};

export default Categories;
