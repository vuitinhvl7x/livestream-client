import React, { useState } from "react";

const ExpandableText = ({ children, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!children) {
    return null;
  }

  const text = children;

  // Do not show expand/collapse if text is short
  if (text.length <= maxLength) {
    return <p className="text-gray-300 mt-2 whitespace-pre-wrap">{text}</p>;
  }

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="text-gray-300 mt-2">
      <p className="whitespace-pre-wrap">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
        <button
          onClick={toggleIsExpanded}
          className="text-sky-400 hover:text-sky-300 ml-2 font-semibold focus:outline-none"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      </p>
    </div>
  );
};

export default ExpandableText;
