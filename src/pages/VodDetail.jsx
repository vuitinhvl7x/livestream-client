import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import VideoPlayer from "../components/VideoPlayer";
import ExpandableText from "../components/ExpandableText";
import { getImageUrl } from "../utils/image";

const VodDetail = () => {
  const { vodId } = useParams();
  const [vod, setVod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVodDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/vod/${vodId}`);
        setVod(response.data.data);
        setError(null);
      } catch (err) {
        setError(
          "Failed to fetch VOD details. The video might not exist or the service is down."
        );
        console.error("Error fetching VOD details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVodDetails();
  }, [vodId]);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-300">Loading VOD...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!vod) {
    return (
      <div className="text-center mt-10 text-gray-300">VOD not found.</div>
    );
  }
  console.log("vod.user.avatarUrl in vod detail", vod.user.avatarUrl);

  return (
    <div className="flex flex-col">
      <div className="flex-1 w-full flex flex-col">
        <VideoPlayer src={vod?.videoUrl} />
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">{vod.title}</h1>
          <ExpandableText>{vod.description}</ExpandableText>
          <div className="flex items-center mt-4">
            <Link
              to={`/channel/${vod.user.username}`}
              className="flex items-center"
            >
              <img
                src={getImageUrl(vod.user.avatarUrl)}
                alt={vod.user.displayName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <p className="font-semibold text-gray-100">
                  {vod.user.displayName}
                </p>
                <p className="text-sm text-gray-300">
                  {vod.viewCount.toLocaleString()} views
                </p>
              </div>
            </Link>
          </div>
          <div className="mt-4">
            <Link to={`/categories/${vod.category.slug}`}>
              <span className="text-sm bg-gray-700 text-sky-400 px-3 py-1 rounded-full hover:bg-gray-600 hover:text-sky-300">
                {vod.category.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VodDetail;
