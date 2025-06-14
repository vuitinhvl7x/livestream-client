import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const activeLinkClass = "bg-gray-700 text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-grow p-2">
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) =>
              `${
                isActive ? activeLinkClass : inactiveLinkClass
              } block px-4 py-2 rounded-md text-sm font-medium`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `${
                isActive ? activeLinkClass : inactiveLinkClass
              } block px-4 py-2 mt-2 rounded-md text-sm font-medium`
            }
          >
            Manage Categories
          </NavLink>
          <NavLink
            to="/admin/vods"
            className={({ isActive }) =>
              `${
                isActive ? activeLinkClass : inactiveLinkClass
              } block px-4 py-2 mt-2 rounded-md text-sm font-medium`
            }
          >
            Manage VODs
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
