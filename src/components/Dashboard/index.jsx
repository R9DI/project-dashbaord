import React, { useState, useRef, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import {
  ClientSideRowModelModule,
  CellStyleModule,
  ValidationModule,
} from "ag-grid-community";

import { Card, Button, Space, Typography, message } from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getColorClass } from "../../utils/colorUtils";
import { useProjects, useAddProject } from "../../hooks/useProjects";
import { useColorSettingsStore } from "../../stores/colorSettingsStore";
import { useModalStore } from "../../stores/modalStore";
import IssueModal from "../IssueModal";
import ColorSettingsModal from "./ColorSettingsModal";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CellStyleModule,
  ValidationModule,
]);

const { Text } = Typography;

const Dashboard = () => {
  const gridRef = useRef(null);

  // React Query hooks
  const { data: rowData = [], isLoading, refetch } = useProjects();
  const addProjectMutation = useAddProject();

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

  // 모달이 닫힐 때 selectedRowData 정리
  useEffect(() => {
    if (!isIssueModalVisible && selectedRowData) {
      setSelectedRowData(null);
    }
  }, [isIssueModalVisible, selectedRowData, setSelectedRowData]);

  // colorSettings 변경 시 디버깅
  useEffect(() => {
    console.log("Dashboard: colorSettings changed:", colorSettings);
  }, [colorSettings]);

  // 빈 행 생성
  const generateEmptyRow = () => {
    const newId = Math.max(...(rowData.map((p) => p.id) || [0])) + 1;
    return {
      id: newId,
      projectId: newId,
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

    console.log(
      `getCellClass called for field: ${field}, value: ${value}, colorSettings:`,
      colorSettings
    );

    // 과제명 컬럼은 특별 처리
    if (field === "projectName") {
      console.log(`Returning project-name-cell for ${field}`);
      return "project-name-cell";
    }

    // 다른 컬럼들은 색상 기준에 따라 처리
    const result = getColorClass(field, value, colorSettings);
    console.log(`getCellClass result for ${field}: ${result}`);
    return result;
  };

  // 컬럼 정의
  const columnDefs = useMemo(
    () => [
      {
        headerName: "과제명",
        field: "projectName",
        pinned: "left",
        width: 200,
        cellRenderer: (params) => {
          console.log("과제명 컬럼 cellRenderer 호출됨:", params);
          return params.value;
        },
        cellClass: (params) => {
          console.log("과제명 컬럼 cellClass 함수 호출됨:", params);
          return "project-name-cell";
        },
      },
      {
        headerName: "Inline 합격률 (%)",
        field: "inlinePassRate",
        width: 160,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: (params) => {
          console.log("Inline 합격률 cellStyle 호출됨:", params);
          const field = params.column.colId;
          const value = params.value;

          if (field === "inlinePassRate") {
            const settings = colorSettings[field];
            if (settings) {
              const highThreshold = settings.high / 100;
              const lowThreshold = settings.low / 100;

              if (value >= highThreshold) {
                return { backgroundColor: "#e8f5e8" };
              } else if (value >= lowThreshold) {
                return { backgroundColor: "#fff3e0" };
              } else {
                return { backgroundColor: "#ffebee" };
              }
            }
          }
          return {};
        },
      },
      {
        headerName: "Elec 합격률 (%)",
        field: "elecPassRate",
        width: 160,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: (params) => {
          const field = params.column.colId;
          const value = params.value;

          if (field === "elecPassRate") {
            const settings = colorSettings[field];
            if (settings) {
              const highThreshold = settings.high / 100;
              const lowThreshold = settings.low / 100;

              if (value >= highThreshold) {
                return { backgroundColor: "#e8f5e8" };
              } else if (value >= lowThreshold) {
                return { backgroundColor: "#fff3e0" };
              } else {
                return { backgroundColor: "#ffebee" };
              }
            }
          }
          return {};
        },
      },
      {
        headerName: "Issue 대응지수 (%)",
        field: "issueResponseIndex",
        width: 170,
        cellRenderer: (params) => {
          return (
            <div className="flex items-center justify-between w-full">
              <span>{Math.round(params.value * 100)}%</span>
              <button
                className="issue-btn bg-blue-500 text-white border-none rounded px-1.5 py-0.5 text-xs cursor-pointer ml-2 min-w-8 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  const projectData = {
                    ...params.data,
                    projectId: params.data.projectId || params.data.id,
                    projectName: params.data.projectName,
                  };

                  if (!projectData.projectId) {
                    message.error("프로젝트 정보가 유효하지 않습니다.");
                    return;
                  }

                  setSelectedRowData(projectData);
                  openIssueModal(projectData);
                }}
              >
                🔧
              </button>
            </div>
          );
        },
        cellClass: (params) => getCellClass(params),
      },
      {
        headerName: "WIP 실적 달성률 (%)",
        field: "wipAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: (params) => getCellClass(params),
      },
      {
        headerName: "과제 납기달성률 (%)",
        field: "deadlineAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: (params) => getCellClass(params),
      },
      {
        headerName: "Final Score",
        field: "finalScore",
        width: 150,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellClass: (params) => getCellClass(params),
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
    console.log("Dashboard: Saving color settings:", values);
    setColorSettings(values);
    closeColorSettingsModal();
    message.success("색상 기준이 저장되었습니다!");
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
          <div className="flex items-center gap-2">
            <BarChartOutlined className="text-blue-500" />
            <span>프로젝트 관리 대시보드</span>
          </div>
        }
        className="mb-4"
      >
        {/* 통계 정보 */}
        <div className="flex justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">총 과제 수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {stats.win}%
            </div>
            <div className="text-xs text-gray-500">승률</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.draw}%
            </div>
            <div className="text-xs text-gray-500">무승부</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.lose}%</div>
            <div className="text-xs text-gray-500">패배률</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mb-4">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={addNewData}>
              새 데이터 생성
            </Button>

            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              데이터 새로고침
            </Button>
            <Button onClick={openColorSettingsModal} className="ml-2">
              색상 설정
            </Button>
          </Space>
        </div>

        {/* Ag-Grid */}
        <div className="ag-theme-alpine h-[500px] w-full border border-gray-200 rounded-lg">
          <AgGridReact
            key={JSON.stringify(colorSettings)} // colorSettings가 변경될 때 그리드 리렌더링
            modules={[
              ClientSideRowModelModule,
              CellStyleModule,
              ValidationModule,
            ]}
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={10}
            rowHeight={60}
            ref={gridRef}
            rowSelection="single"
            suppressRowClickSelection={false}
            defaultColDef={{}}
          />
        </div>
      </Card>

      {/* Issue Modal */}
      {isIssueModalVisible && selectedRowData && (
        <IssueModal
          isVisible={isIssueModalVisible}
          onClose={closeIssueModal}
          data={selectedRowData}
        />
      )}

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
