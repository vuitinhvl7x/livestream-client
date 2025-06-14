import React from "react";
import useAuthStore from "../../state/authStore";
import { Users, Clapperboard, Video, Loader2 } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { getAllUsers } from "../../api/userApi";
import { getStreams } from "../../api/streamApi";
import { getAllVods } from "../../api/vodApi";

const StatCard = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
  iconColor,
  isLoading,
}) => (
  <div
    className={`p-6 rounded-lg shadow-lg flex items-center ${bgColor} ${textColor}`}
  >
    <div className={`mr-4 ${iconColor}`}>{icon}</div>
    <div>
      <p className="text-sm font-bold opacity-80">{title}</p>
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <p className="text-3xl font-bold">{value}</p>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const userInfo = useAuthStore((state) => state.userInfo);

  const results = useQueries({
    queries: [
      {
        queryKey: ["totalUsers"],
        queryFn: getAllUsers,
      },
      {
        queryKey: ["totalStreams"],
        queryFn: () => getStreams({ limit: 1 }), // We only need the total, so limit to 1
      },
      {
        queryKey: ["totalVods"],
        queryFn: () => getAllVods({ limit: 1 }), // We only need the total, so limit to 1
      },
    ],
  });

  const usersQuery = results[0];
  const streamsQuery = results[1];
  const vodsQuery = results[2];

  const totalUsers = usersQuery.data?.totalUsers ?? "N/A";
  const totalStreams = streamsQuery.data?.totalStreams ?? "N/A";
  const totalVods = vodsQuery.data?.pagination?.totalItems ?? "N/A";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
      <p className="text-lg text-gray-400 mb-6">
        Welcome back,{" "}
        <span className="font-semibold text-gray-200">
          {userInfo?.username || "Admin"}
        </span>
        !
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          isLoading={usersQuery.isLoading}
          icon={<Users size={40} />}
          bgColor="bg-gray-800"
          textColor="text-blue-300"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Live Streams"
          value={totalStreams}
          isLoading={streamsQuery.isLoading}
          icon={<Clapperboard size={40} />}
          bgColor="bg-gray-800"
          textColor="text-green-300"
          iconColor="text-green-400"
        />
        <StatCard
          title="Total VODs"
          value={totalVods}
          isLoading={vodsQuery.isLoading}
          icon={<Video size={40} />}
          bgColor="bg-gray-800"
          textColor="text-purple-300"
          iconColor="text-purple-400"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
