/* eslint-disable react/prop-types */
import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
