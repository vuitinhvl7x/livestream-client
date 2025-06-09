import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const navLinks = [
    { to: "/dashboard", text: "Dashboard" },
    { to: "/dashboard/settings/profile", text: "Profile Settings" },
    { to: "/dashboard/followers", text: "Followers" },
    { to: "/dashboard/following", text: "Following" },
    { to: "/dashboard/notifications", text: "Notifications" },
  ];

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/dashboard"}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-700"
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
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
