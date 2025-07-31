import React, { useState, useEffect } from "react";
import { Modal, Space } from "antd";
import { AgGridReact } from "ag-grid-react";

export const RelatedItemCell = ({ params, openRelatedItemModal }) => {
  const hasRelatedItems =
    Array.isArray(params.value) && params.value.length > 0;
  return (
    <span onClick={() => openRelatedItemModal(params)}>
      {hasRelatedItems ? "🟢" : "⚪"}
    </span>
  );
};

const RelatedItemModal = ({
  selectedRow,
  setSelectedRow,
  rowData,
  setRowData,
  gridApi,
}) => {
  const [relatedItemModalVisible, setRelatedItemModalVisible] = useState(false);
  const [relatedRowsIds, setRelatedRowsIds] = useState([]); // 선택된 related item
  const [quickFilterText, setQuickFilterText] = useState("");

  const openRelatedItemModal = (params) => {
    setSelectedRow(params);
    setRelatedRowsIds(params.value || []); // 기존 선택된 아이템 불러오기
    setRelatedItemModalVisible(true);
    setQuickFilterText("");
    setTimeout(() => {
      if (gridApi) {
        gridApi.setQuickFilter(""); // ✅ AG Grid 퀵필터 초기화
        gridApi.onFilterChanged(); // ✅ 필터 강제 업데이트
      }
    }, 100);
  };

  const closeRelatedItemModal = () => {
    setRelatedItemModalVisible(false);
  };

  const handleSaveRelatedItems = () => {
    console.log("📌 현재 선택된 Related Items:", relatedRowsIds);
    if (selectedRow) {
      const updatedRowData = rowData.map((row) =>
        row.row_id === selectedRow.data.row_id
          ? {
              ...row,
              RELATED_ITEM: relatedRowsIds, // ✅ 빈 배열이면 기존 값 유지
            }
          : row
      );

      setRowData(updatedRowData);
      closeRelatedItemModal();
    }
  };

  useEffect(() => {
    if (relatedItemModalVisible && gridApi) {
      setTimeout(() => {
        console.log("✅ 현재 relatedRowsIds:", relatedRowsIds);
        gridApi.forEachNode((node) => {
          node.setSelected(relatedRowsIds.includes(node.data.row_id));
        });
      }, 100);
    }
  }, [relatedItemModalVisible, gridApi, relatedRowsIds]);

  return (
    <Modal
      title="Related Items 선택"
      open={relatedItemModalVisible}
      onOk={handleSaveRelatedItems}
      onCancel={closeRelatedItemModal}
      width={800}
    >
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <div style={{ flexGrow: 3 }} />
        <input
          placeholder="검색어를 입력하세요"
          value={quickFilterText}
          onChange={(e) => {
            setQuickFilterText(e.target.value); // ✅ 상태 업데이트
            gridApi?.setQuickFilter(e.target.value); // ✅ AG Grid 퀵필터 적용
          }}
          style={{ width: 300 }}
        />
      </Space>
      <div
        className="ag-theme-alpine"
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
          columnDefs={[
            {
              field: "selected",
              headerName: "",
              checkboxSelection: true,
              headerCheckboxSelection: true,
              width: 50,
              pinned: "left",
            },
            { field: "CATEGORY1", headerName: "Category1", flex: 1 },
            { field: "CATEGORY2", headerName: "Category2", flex: 1 },
            { field: "STEP", headerName: "Step", flex: 1 },
            { field: "PARAMETER", headerName: "Parameter", flex: 1 },
          ]}
          rowData={rowData}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          onRowClicked={(params) => {
            params.node.setSelected(!params.node.isSelected()); // ✅ 클릭 시 선택/해제 토글
          }}
          onGridReady={(params) => {
            setTimeout(() => {
              params.api.forEachNode((node) => {
                node.setSelected(relatedRowsIds.includes(node.data.row_id));
              });
            }, 100);
          }}
          onSelectionChanged={(params) => {
            const selectedNodes = params.api.getSelectedNodes();
            const selectedIds = selectedNodes.map((node) => node.data.row_id);
            setRelatedRowsIds(selectedIds);
          }}
        />
      </div>
    </Modal>
  );
};

export default RelatedItemModal;
