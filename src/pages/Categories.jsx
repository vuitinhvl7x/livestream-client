import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

  const fetchCategories = useCallback(async (currentPage) => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchCategories(page);
  }, [fetchCategories, page]);

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
            i === pagination.page
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

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-300">
        Loading categories...
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">All Categories</h1>
      {categories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                to={`/categories/${category.slug}`}
                key={category.id}
                className="block bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-200 overflow-hidden"
              >
                <img
                  src={
                    category.thumbnailUrl ||
                    "https://fakeimg.pl/285x380/282828/eae0d0?text=Category"
                  }
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
