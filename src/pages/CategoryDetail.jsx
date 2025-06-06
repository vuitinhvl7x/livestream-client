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
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    const fetchStreamsByCategory = async () => {
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
        console.log("Đây là data category bạn muốn xem:", currentCategory);
        const streamsResponse = await api.get(
          `/streams?categoryId=${currentCategory.id}&limit=50` // Fetch more streams
        );
        setStreams(streamsResponse.data.streams || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data for this category.");
        console.error("Lỗi khi fetch data cho category:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStreamsByCategory();
    }
  }, [slug]);

  const liveStreams = useMemo(
    () => streams.filter((s) => s.status === "live"),
    [streams]
  );
  const endedStreams = useMemo(
    () => streams.filter((s) => s.status === "ended"),
    [streams]
  );
  const totalLiveViewers = useMemo(
    () =>
      liveStreams.reduce((sum, stream) => sum + (stream.viewerCount || 0), 0),
    [liveStreams]
  );

  const streamsToDisplay = activeTab === "live" ? liveStreams : endedStreams;

  const tabClasses = (tabName) =>
    `px-4 py-2 text-lg font-semibold border-b-4 transition-colors duration-200 ${
      activeTab === tabName
        ? "border-purple-500 text-white"
        : "border-transparent text-gray-400 hover:text-gray-200"
    }`;

  if (loading) {
    return <div className="text-center mt-10">Loading streams...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!category) {
    return <div className="text-center mt-10">Category not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <img
          src={
            category.thumbnailUrl ||
            "https://fakeimg.pl/180x240/282828/eae0d0?text=Game"
          }
          alt={category.name}
          className="w-32 md:w-44 rounded-lg shadow-md"
        />
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-bold">{category.name}</h1>
          <p className="text-purple-400 font-semibold mt-2">
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
          <p className="text-gray-400 mt-4 text-sm max-w-4xl">
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
          Live{" "}
          <span className="text-gray-400 ml-1">({liveStreams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("ended")}
          className={tabClasses("ended")}
        >
          Videos{" "}
          <span className="text-gray-400 ml-1">({endedStreams.length})</span>
        </button>
      </div>

      {/* Stream Grid */}
      {streamsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {streamsToDisplay.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-16 text-gray-500">
          <h3 className="text-2xl font-bold">No {activeTab} content</h3>
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
