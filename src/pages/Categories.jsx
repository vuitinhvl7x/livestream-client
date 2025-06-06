import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/categories");
        setCategories(response.data.categories);
        setError(null);
      } catch (err) {
        setError("Failed to fetch categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Categories</h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              to={`/categories/${category.slug}`}
              key={category.id}
              className="block bg-gray-800 rounded-lg p-6 shadow-md hover:bg-gray-700 transition-colors duration-200"
            >
              <h2 className="text-xl font-bold text-purple-400">
                {category.name}
              </h2>
              <p className="text-gray-400 mt-2">{category.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          No categories found.
        </div>
      )}
    </div>
  );
};

export default Categories;
