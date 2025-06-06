import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import StreamCard from "../components/StreamCard";

const CategoryDetail = () => {
  const { slug } = useParams();
  const [streams, setStreams] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreamsByCategory = async () => {
      try {
        setLoading(true);
        // Step 1: Fetch all categories to find the ID for the given slug
        const categoriesResponse = await api.get("/categories");
        const currentCategory = categoriesResponse.data.categories.find(
          (c) => c.slug === slug
        );

        if (!currentCategory) {
          setError("Category not found.");
          setLoading(false);
          return;
        }
        setCategory(currentCategory);

        // Step 2: Fetch streams using the found categoryId
        const streamsResponse = await api.get(
          `/streams?categoryId=${currentCategory.id}`
        );
        setStreams(streamsResponse.data.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data for this category.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamsByCategory();
  }, [slug]);

  if (loading) {
    return <div className="text-center mt-10">Loading streams...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        Streams in: {category ? category.name : "Category"}
      </h1>
      {streams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          There are no streams in this category right now.
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
