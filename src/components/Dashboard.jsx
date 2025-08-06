import React, { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import { Card, Button, Space, Typography, message } from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  ReloadOutlined,
  IssuesCloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getColorClass } from "../utils/colorUtils";
import {
  useProjects,
  useAddProject,
  useDeleteProject,
} from "../hooks/useProjects";
import { useColorSettingsStore } from "../stores/colorSettingsStore";
import { useModalStore } from "../stores/modalStore";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);
import IssueModal from "./IssueModal";
import ColorSettingsModal from "./ColorSettingsModal";

const { Text } = Typography;

const Dashboard = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const gridRef = useRef(null);

  // React Query hooks
  const { data: rowData = [], isLoading, refetch } = useProjects();
  const addProjectMutation = useAddProject();
  const deleteProjectMutation = useDeleteProject();

  // Zustand stores
  const { colorSettings, setColorSettings } = useColorSettingsStore();
  const {
    isIssueModalVisible,
    isColorSettingsModalVisible,
    selectedRowData,
    openIssueModal,
    closeIssueModal,
    openColorSettingsModal,
    closeColorSettingsModal,
    setSelectedRowData,
  } = useModalStore();

  // 빈 행 생성
  const generateEmptyRow = () => {
    return {
      id: Date.now(), // 고유 ID 생성
      projectName: "",
      inlinePassRate: 0,
      elecPassRate: 0,
      issueResponseIndex: 0,
      wipAchievementRate: 0,
      deadlineAchievementRate: 0,
      finalScore: 0,
      remark: "",
    };
  };

  // 셀 스타일 결정 함수
  const getCellClass = (params) => {
    const field = params.column.colId;
    const value = params.value;
    const settings = colorSettings[field];
    return getColorClass(field, value, settings);
  };

  // 컬럼 정의
  const columnDefs = useMemo(
    () => [
      {
        headerName: "과제명",
        field: "projectName",
        pinned: "left",
        width: 200,
        cellStyle: {
          fontWeight: "bold",
          backgroundColor: "#f8f9fa",
        },
      },
      {
        headerName: "Inline 합격률 (%)",
        field: "inlinePassRate",
        width: 160,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: getCellClass,
      },
      {
        headerName: "Elec 합격률 (%)",
        field: "elecPassRate",
        width: 160,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: getCellClass,
      },
      {
        headerName: "Issue 대응지수 (%)",
        field: "issueResponseIndex",
        width: 170,
        cellRenderer: (params) => {
          const projectId = params.data.id;
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{Math.round(params.value * 100)}%</span>
              <button
                className="issue-btn"
                data-project-id={projectId}
                style={{
                  background: "#1890ff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  marginLeft: "8px",
                  minWidth: "32px",
                  height: "24px",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRowData(params.data);
                  openIssueModal();
                }}
              >
                🔧
              </button>
            </div>
          );
        },
        cellClass: getCellClass,
      },
      {
        headerName: "WIP 실적 달성률 (%)",
        field: "wipAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: getCellClass,
      },
      {
        headerName: "과제 납기달성률 (%)",
        field: "deadlineAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: getCellClass,
      },
      {
        headerName: "Final Score",
        field: "finalScore",
        width: 150,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: getCellClass,
      },
      {
        headerName: "Remark",
        field: "remark",
        width: 150,
        // cellStyle flex 관련 제거
      },
    ],
    [colorSettings]
  ); // colorSettings가 변경될 때마다 columnDefs 재생성

  // 설정 저장
  const handleSettingsSave = (values) => {
    console.log("Settings saved:", values);
    setColorSettings(values);
    closeColorSettingsModal();
  };

  // 새 데이터 추가
  const addNewData = () => {
    const newRow = generateEmptyRow();
    addProjectMutation.mutate(newRow, {
      onSuccess: () => {
        message.success("새 행이 추가되었습니다!");
      },
      onError: () => {
        message.error("행 추가에 실패했습니다!");
      },
    });
  };

  // 단일 행 삭제
  const deleteRow = (rowId) => {
    deleteProjectMutation.mutate(rowId, {
      onSuccess: () => {
        message.success("행이 삭제되었습니다!");
      },
      onError: () => {
        message.error("행 삭제에 실패했습니다!");
      },
    });
  };

  // 데이터 새로고침
  const refreshData = () => {
    refetch();
    message.success("데이터가 새로고침되었습니다!");
  };

  // 통계 계산 함수
  const getStatistics = () => {
    if (rowData.length === 0) return { total: 0, win: 0, draw: 0, lose: 0 };

    const total = rowData.length;
    let win = 0,
      draw = 0,
      lose = 0;

    rowData.forEach((row) => {
      const finalScore = row.finalScore;
      const highThreshold = colorSettings.finalScore.high / 100;
      const lowThreshold = colorSettings.finalScore.low / 100;

      if (finalScore >= highThreshold) {
        win++;
      } else if (finalScore >= lowThreshold) {
        draw++;
      } else {
        lose++;
      }
    });

    return {
      total,
      win: Math.round((win / total) * 100),
      draw: Math.round((draw / total) * 100),
      lose: Math.round((lose / total) * 100),
    };
  };

  const stats = getStatistics();

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChartOutlined style={{ color: "#1890ff" }} />
            <span>프로젝트 관리 대시보드</span>
          </div>
        }
        style={{ marginBottom: 16 }}
        styles={{
          body: {
            padding: "16px",
          },
        }}
      >
        {/* 통계 정보 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}
            >
              {stats.total}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>총 과제 수</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}
            >
              {stats.win}%
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>승률</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#faad14" }}
            >
              {stats.draw}%
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>무승부</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#f5222d" }}
            >
              {stats.lose}%
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>패배률</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ marginBottom: "16px" }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addNewData}>
              새 데이터 생성
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                if (selectedRows.length === 0) {
                  message.warning("삭제할 행을 선택해주세요.");
                  return;
                }
                deleteRow(selectedRows[0].id);
                setSelectedRows([]);
              }}
              disabled={selectedRows.length === 0}
            >
              선택 행 삭제
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              데이터 새로고침
            </Button>
            <Button
              onClick={openColorSettingsModal}
              style={{ marginLeft: "8px" }}
            >
              색상 설정
            </Button>
          </Space>
        </div>

        {/* Ag-Grid */}
        <div
          className="ag-theme-alpine"
          style={{
            height: "500px",
            width: "100%",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
          }}
        >
          <AgGridReact
            modules={[ClientSideRowModelModule]}
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={10}
            rowHeight={60}
            ref={gridRef}
            rowSelection="single"
            suppressRowClickSelection={false}
            onSelectionChanged={(event) => {
              const selectedNodes = event.api.getSelectedNodes();
              const selectedData = selectedNodes.map((node) => node.data);
              setSelectedRows(selectedData);
            }}
            defaultColDef={{}}
          />
        </div>
      </Card>

      {/* Issue Modal */}
      <IssueModal
        isVisible={isIssueModalVisible}
        onClose={closeIssueModal}
        data={selectedRowData}
      />

      {/* Color Settings Modal */}
      <ColorSettingsModal
        isVisible={isColorSettingsModalVisible}
        onCancel={closeColorSettingsModal}
        onSave={handleSettingsSave}
        initialValues={colorSettings}
      />
    </>
  );
};

export default Dashboard;
