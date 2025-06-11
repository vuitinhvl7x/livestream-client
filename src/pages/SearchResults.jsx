import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import streamApi from "../api/streamApi";
import vodApi from "../api/vodApi";
import StreamCard from "../components/StreamCard";
import VODCard from "../components/VodCard";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery();
  const searchQuery = query.get("q");
  const [streams, setStreams] = useState([]);
  const [vods, setVods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const streamParams = { searchQuery };
        const vodParams = { searchQuery };

        const [streamRes, vodRes] = await Promise.all([
          streamApi.searchStreams(streamParams),
          vodApi.searchVODs(vodParams),
        ]);

        setStreams(streamRes.data.data.streams);
        setVods(vodRes.data.data.vods);
      } catch (err) {
        setError("Failed to fetch search results. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-4">
        Search Results for "{searchQuery}"
      </h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">Live Streams</h2>
        {streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {streams.map((stream) => (
              <StreamCard key={stream._id} stream={stream} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No live streams found.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">VODs</h2>
        {vods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vods.map((vod) => (
              <VODCard key={vod._id} vod={vod} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No VODs found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
