import React from "react";

const GanttLegend = () => {
  const legendItems = [
    { color: "#1890ff", label: "진행 중" },
    { color: "#87ceeb", label: "이번달 완료" },
    { color: "#8c8c8c", label: "완료됨" },
    { color: "#ff4d4f", label: "미정" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "24px",
        padding: "12px 16px",
        backgroundColor: "#fafafa",
        border: "1px solid #e8e8e8",
        borderRadius: "6px",
        marginTop: "12px",
        fontSize: "12px",
      }}
    >
      {legendItems.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: item.color,
              borderRadius: "2px",
              border: "1px solid #d9d9d9",
            }}
          />
          <span style={{ color: "#666", fontWeight: "500" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default GanttLegend;
