import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import StreamCard from "../components/StreamCard";
import VodCard from "../components/VodCard";
import { getImageUrl } from "../utils/image";

const CategoryDetail = () => {
  const { slug } = useParams();
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const categoryResponse = await api.get(`/categories/${slug}`);
        const currentCategory = categoryResponse.data.data;

        if (!currentCategory) {
          setError("Category not found.");
          setLoading(false);
          return;
        }
        setCategory(currentCategory);

        // Fetch live streams and VODs in parallel
        const [streamsResponse, vodsResponse] = await Promise.all([
          api.get(
            `/streams?categoryId=${currentCategory.id}&status=live&limit=50`
          ),
          api.get(`/vod?categoryId=${currentCategory.id}&limit=50`),
        ]);

        setStreams(streamsResponse.data.streams || []);
        setVods(vodsResponse.data.data || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data for this category.");
        console.error("Lỗi khi fetch data cho category:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const totalLiveViewers = useMemo(
    () => streams.reduce((sum, stream) => sum + (stream.viewerCount || 0), 0),
    [streams]
  );

  const itemsToDisplay = activeTab === "live" ? streams : vods;
  const currentType = activeTab === "live" ? "stream" : "vod";

  const tabClasses = (tabName) =>
    `px-4 py-2 text-lg font-semibold border-b-4 transition-colors duration-200 ${
      activeTab === tabName
        ? "border-sky-500 text-white"
        : "border-transparent text-gray-300 hover:text-white"
    }`;

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-300">Loading streams...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!category) {
    return (
      <div className="text-center mt-10 text-gray-300">Category not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <img
          src={getImageUrl(category.thumbnailUrl)}
          alt={category.name}
          className="w-32 md:w-44 rounded-lg shadow-md"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          <p className="text-gray-300 font-semibold mt-2">
            {totalLiveViewers.toLocaleString()} viewers
          </p>
          <div className="flex flex-wrap gap-2 my-4">
            {category.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-300 mt-4 text-sm max-w-4xl">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("live")}
          className={tabClasses("live")}
        >
          Live <span className="text-gray-400 ml-1">({streams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={tabClasses("videos")}
        >
          Videos <span className="text-gray-400 ml-1">({vods.length})</span>
        </button>
      </div>

      {/* Item Grid */}
      {itemsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {itemsToDisplay.map((item) => {
            if (activeTab === "live") {
              return <StreamCard key={item.id} data={item} type="stream" />;
            }
            return <VodCard key={item.id} data={item} />;
          })}
        </div>
      ) : (
        <div className="text-center mt-16 text-gray-300">
          <h3 className="text-xl font-semibold text-gray-100">
            No {activeTab} content
          </h3>
          <p className="mt-2">
            There are no {activeTab === "live" ? "live channels" : "videos"} in
            this category right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
