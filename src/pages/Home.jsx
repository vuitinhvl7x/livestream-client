import React, { useEffect, useState } from "react";
import api from "../api";
import StreamCard from "../components/StreamCard";

const Home = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        setLoading(true);
        const response = await api.get("/streams?status=live");
        setStreams(response.data.streams);
        setError(null);
      } catch (err) {
        setError("Failed to fetch live streams. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveStreams();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Live Streams</h1>
      {streams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center mt-10 text-gray-500">
          No live streams available right now.
        </div>
      )}
    </div>
  );
};

export default Home;
