import React from "react";

const GanttLegend = () => {
  const legendItems = [
    { color: "#1890ff", label: "진행 중" },
    { color: "#87ceeb", label: "이번달 완료" },
    { color: "#8c8c8c", label: "완료됨" },
    { color: "#ff4d4f", label: "미정" },
  ];

  return (
    <div className="flex justify-center items-center gap-6 p-3 px-4 bg-gray-50 border border-gray-200 rounded-md mt-3 text-xs">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-500 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GanttLegend;
