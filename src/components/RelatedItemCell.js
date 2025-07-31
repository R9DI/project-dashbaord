// RelatedItemCell.js
import React from "react";

const RelatedItemCell = ({ params, openRelatedItemModal }) => {
  console.log("🔍 Related Item 값:", params.value); // ✅ 값 확인

  const hasRelatedItems =
    Array.isArray(params.value) && params.value.length > 0;

  return (
    <span
      style={{ cursor: "pointer" }}
      onClick={() => openRelatedItemModal(params)}
    >
      {hasRelatedItems ? "🟢" : "⚪"}
    </span>
  );
};

export default RelatedItemCell;
