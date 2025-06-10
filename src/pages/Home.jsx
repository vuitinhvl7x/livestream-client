import React, { useEffect, useState } from "react";
import api from "../api";
import StreamCard from "../components/StreamCard";
import Sidebar from "../components/Sidebar";

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

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white fixed h-full">
        <Sidebar />
      </aside>
      <main className="ml-64 flex-1 p-4">
        <h1 className="text-3xl font-bold mb-6">Live Streams</h1>
        {error && <div className="text-center mt-10 text-red-500">{error}</div>}
        {loading ? (
          <div className="text-center mt-10">Loading...</div>
        ) : !error && streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {streams.map((stream) => (
              <StreamCard key={stream.id} data={stream} type="stream" />
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center mt-10 text-gray-500">
              No live streams available right now.
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Home;
