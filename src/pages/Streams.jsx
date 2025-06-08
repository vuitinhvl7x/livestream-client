import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import StreamCard from "../components/StreamCard";

const Streams = () => {
  const [streams, setStreams] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") || "";
  const page = searchParams.get("page") || "1";

  const fetchStreams = useCallback(async (currentPage, currentStatus) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12, // Let's show 12 per page
      });
      if (currentStatus) {
        params.append("status", currentStatus);
      }
      const response = await api.get(`/streams?${params.toString()}`);
      setStreams(response.data.streams);
      setPagination({
        page: response.data.currentPage,
        limit: 12, // The limit we sent
        totalPages: response.data.totalPages,
        totalItems: response.data.totalStreams,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch streams. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams(page, status);
  }, [fetchStreams, page, status]);

  const handleStatusChange = (newStatus) => {
    setSearchParams({ status: newStatus, page: "1" });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ status, page: newPage });
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
      <h1 className="text-3xl font-bold mb-6">Browse Streams</h1>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => handleStatusChange("")}
          className={`px-4 py-2 rounded ${
            !status ? "bg-purple-600" : "bg-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusChange("live")}
          className={`px-4 py-2 rounded ${
            status === "live" ? "bg-purple-600" : "bg-gray-700"
          }`}
        >
          Live
        </button>
        <button
          onClick={() => handleStatusChange("ended")}
          className={`px-4 py-2 rounded ${
            status === "ended" ? "bg-purple-600" : "bg-gray-700"
          }`}
        >
          Ended
        </button>
      </div>
      {streams.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <StreamCard key={stream.id} data={stream} type="stream" />
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          No streams found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default Streams;
