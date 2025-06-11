import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import useAuthStore from "../../state/authStore";

const DashboardLayout = () => {
  const userInfo = useAuthStore((state) => state.userInfo);

  const navLinks = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/dashboard/settings/profile", text: "Profile Settings" },
    { to: "/dashboard/followers", text: "Followers" },
    { to: "/dashboard/following", text: "Following" },
    { to: "/dashboard/notifications", text: "Notifications" },
  ];

  if (userInfo && userInfo.username) {
    navLinks.splice(1, 0, {
      to: `/channel/${userInfo.username}`,
      text: "My Channel",
    });
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-300">
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-4">
        <h2 className="text-2xl font-bold mb-6 text-white">Menu</h2>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to} className="mb-2">
                <NavLink
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded transition-colors duration-200 ${
                      isActive ? "bg-sky-500 text-white" : "hover:bg-gray-700"
                    }`
                  }
                >
                  {link.text}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
