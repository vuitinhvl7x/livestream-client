import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import VodCard from "../components/VodCard";

const Vods = () => {
  const [vods, setVods] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

  const fetchVods = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      });
      const response = await api.get(`/vod?${params.toString()}`);
      setVods(response.data.data);
      setPagination({
        page: response.data.currentPage,
        limit: 12,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalVods,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch VODs. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVods(page);
  }, [fetchVods, page]);

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
          className={`px-4 py-2 mx-1 rounded ${
            i === pagination.page ? "bg-purple-600 text-white" : "bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }
    return <div className="flex justify-center mt-6">{pages}</div>;
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Browse VODs</h1>
      {vods.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vods.map((vod) => (
              <VodCard key={vod.id} data={vod} />
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center mt-10 text-gray-500">No VODs found.</div>
      )}
    </div>
  );
};

export default Vods;
