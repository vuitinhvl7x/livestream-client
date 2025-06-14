import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import useAuthStore from "../state/authStore";
import authApi from "../api/authApi";
import { toast } from "sonner";
import logo from "../../public/logo.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.userInfo);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await authApi.post("/users/logout");
      toast.success(response.data.message || "Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout failed:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể đăng xuất. Token có thể đã hết hạn.";
      toast.error(errorMessage);
    } finally {
      clearAuth();
      navigate("/account/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery("");
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "bg-gray-900 text-white"
        : "text-sky-400 hover:bg-gray-700 hover:text-sky-300"
    }`;

  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-white font-bold text-xl"
            >
              <img src={logo} alt="LiveX Logo" className="h-8 w-auto mr-2" />
              LiveX
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClasses} end>
                  Home
                </NavLink>
                <NavLink to="/streams" className={navLinkClasses}>
                  Streams
                </NavLink>
                <NavLink to="/categories" className={navLinkClasses}>
                  Categories
                </NavLink>
              </div>
            </div>
          </div>
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 justify-center px-2 lg:ml-6">
              <div className="max-w-lg w-full lg:max-w-xs">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full bg-gray-700 border border-transparent rounded-md py-2 pl-10 pr-3 leading-5 text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                    placeholder="Search streams & VODs"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </div>
            </div>
          )}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <>
                  {user && (
                    <span className="text-gray-300 mr-4">
                      Welcome, {user.displayName || user.username}
                    </span>
                  )}
                  {user?.role === "admin" && (
                    <Link to="/admin/dashboard">
                      <button className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 mr-2">
                        Admin Panel
                      </button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <button className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 mr-2">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/account/login">
                    <button className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                      Login
                    </button>
                  </Link>
                  <Link to="/account/register">
                    <button className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 ml-2">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated && (
              <form onSubmit={handleSearch} className="mb-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="search-mobile"
                    name="search-mobile"
                    className="block w-full bg-gray-700 border border-transparent rounded-md py-2 pl-10 pr-3 leading-5 text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            )}
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/streams" className={navLinkClasses}>
              Streams
            </NavLink>
            <NavLink to="/categories" className={navLinkClasses}>
              Categories
            </NavLink>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="px-2">
              {isAuthenticated ? (
                <>
                  {user && (
                    <div className="mb-2">
                      <span className="text-gray-300">
                        Welcome, {user.displayName || user.username}
                      </span>
                    </div>
                  )}
                  {user?.role === "admin" && (
                    <Link to="/admin/dashboard">
                      <button className="w-full text-left bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 mb-2">
                        Admin Panel
                      </button>
                    </Link>
                  )}
                  <Link to="/dashboard">
                    <button className="w-full text-left bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 mb-2">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/account/login">
                    <button className="w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium mb-2">
                      Login
                    </button>
                  </Link>
                  <Link to="/account/register">
                    <button className="w-full text-left bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                      Register
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
