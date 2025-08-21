import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Modal, Button, message, Collapse, Image } from "antd";
import GanttChart from "./GanttChart.jsx";
import GanttLegend from "./GanttLegend.jsx";
import IssueDrawer from "./IssueDrawer.jsx";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  useIssuesByProject,
  useCreateIssue,
  useUpdateIssue,
} from "../../hooks/useIssues";
import { useModalStore } from "../../stores/modalStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const IssueModal = () => {
  const { isIssueModalVisible, selectedRowData, closeIssueModal } =
    useModalStore();

  if (!selectedRowData || !selectedRowData.projectId) {
    console.warn("IssueModal - 유효하지 않은 데이터:", selectedRowData);
    return null;
  }

  const projectId = useMemo(() => {
    if (!selectedRowData || !selectedRowData.projectId) return null;
    return selectedRowData.projectId;
  }, [selectedRowData]);

  const {
    data: projectIssues = [],
    isLoading: projectLoading,
    refetch: refetchProject,
  } = useIssuesByProject(projectId);

  const issues = projectIssues;
  const isLoading = projectLoading;
  const refetch = refetchProject;

  const createIssueMutation = useCreateIssue(projectId);
  const updateIssueMutation = useUpdateIssue(projectId);

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const gridRef = useRef(null);

  const handleCancel = useCallback(() => {
    closeIssueModal();
  }, [closeIssueModal]);

  const handleSaveDrawerData = useCallback((issueId, updatedData) => {
    if (!issueId) {
      message.error("이슈 ID가 없습니다!");
      return;
    }

    if (!projectId) {
      message.error("프로젝트 ID가 없습니다!");
      return;
    }

    // 업데이트할 데이터에 필수 필드 추가
    const dataToUpdate = {
      ...updatedData,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    updateIssueMutation.mutate(
      { id: issueId, data: dataToUpdate },
      {
        onSuccess: (updatedIssue) => {
          message.success("변경사항이 저장되었습니다!");
          setIsDrawerVisible(false);

          // 선택된 행을 업데이트된 데이터로 갱신
          setSelectedRow(updatedIssue);

          // 캐시는 React Query가 자동으로 업데이트하므로 refetch 불필요
          // refetch();
        },
        onError: (error) => {
          console.error("이슈 업데이트 실패:", error);
          message.error("저장에 실패했습니다!");
        },
      }
    );
  }, [projectId, updateIssueMutation, setIsDrawerVisible, setSelectedRow]);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      const dateA = a.end || a.start;
      const dateB = b.end || b.start;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateB) - new Date(dateA);
    });
  }, [issues]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api && issues.length > 0) {
      setTimeout(() => {
        gridRef.current.api.resetRowHeights();
        gridRef.current.api.refreshCells();
      }, 100);
    }
  }, [issues.length]);

  const addNewIssue = useCallback(() => {
    const today = dayjs().format("YYYY-MM-DD");
    const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD");

    const newIssue = {
      issue: "새 이슈",
      summary: "",
      status: "pending",
      img: "",
      detail: `# 새 이슈

## 📋 요약
여기에 이슈에 대한 간단한 요약을 작성하세요.

## 🔍 상세 내용
여기에 이슈에 대한 상세한 내용을 작성하세요.

## ✅ 체크리스트
- [ ] 첫 번째 작업
- [ ] 두 번째 작업
- [ ] 세 번째 작업

## 📅 일정
- **시작일**: ${today}
- **예상 완료일**: ${nextWeek}
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 
- **담당자**: 
- **카테고리**: 

## 📎 첨부파일
업로드된 파일과 이미지가 여기에 표시됩니다.

## 📝 참고사항
추가적인 메모나 참고사항을 여기에 작성하세요.`,
      start: today,
      end: nextWeek,
      file: "",
      progress: "계획 단계",
    };

    createIssueMutation.mutate(newIssue, {
      onSuccess: (data) => {
        message.success("새 이슈가 추가되었습니다!");
        refetch();

        setTimeout(() => {
          setSelectedRow(data);
          setIsDrawerVisible(true);
        }, 100);
      },
      onError: () => {
        message.error("이슈 추가에 실패했습니다!");
      },
    });
  }, [createIssueMutation, refetch, setSelectedRow, setIsDrawerVisible]);

  const columnDefs = [
    {
      field: "issue",
      headerName: "아이템",
      editable: true,
      width: 150,
      cellRenderer: (params) => {
        const issue = params.value || "";
        return (
          <div className="w-full h-full flex items-center justify-center p-2 text-blue-500 font-bold text-sm">
            {issue || "제목 없음"}
          </div>
        );
      },
      cellStyle: {
        color: "#1890ff",
        fontWeight: "bold",
        fontSize: "13px",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    {
      field: "img",
      headerName: "Image",
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const imageData = params.value;
        const imageUrls = Array.isArray(imageData)
          ? imageData
          : imageData
          ? [imageData]
          : [];
        const firstImageUrl = imageUrls[0];

        if (!firstImageUrl) {
          return (
            <div className="w-full h-full flex items-center justify-center p-2 text-gray-400 text-xs italic">
              이미지 없음
            </div>
          );
        }

        return (
          <div className="w-full h-full flex items-center justify-center p-1 relative">
            <Image.PreviewGroup>
              <Image
                src={firstImageUrl}
                alt="이슈 이미지"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded border border-gray-200"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </Image.PreviewGroup>
            {imageUrls.length > 1 && (
              <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
                +{imageUrls.length - 1}
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status & Summary",
      editable: false,
      width: 200,
      cellRenderer: (params) => {
        const status = params.data.status || "pending";
        const summary = params.data.summary || "";
        const statusLabels = {
          pending: "대기중",
          "in-progress": "진행중",
          completed: "완료",
          blocked: "차단됨",
        };
        const statusLabel = statusLabels[status] || "대기중";
        const statusColors = {
          pending: "#faad14",
          "in-progress": "#1890ff",
          completed: "#52c41a",
          blocked: "#ff4d4f",
        };
        const color = statusColors[status] || "#faad14";
        const displayText = summary || "내용 없음";
        const truncatedText =
          displayText.length > 30
            ? displayText.substring(0, 30) + "..."
            : displayText;
        return (
          <div className="flex items-center justify-center gap-2 p-2 w-full h-full">
            <div
              className="px-1.5 py-0.5 rounded-lg text-xs font-bold text-white text-center min-w-12 flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {statusLabel}
            </div>
            <div className="text-sm text-gray-700 leading-relaxed flex-1">
              {truncatedText}
            </div>
          </div>
        );
      },
      cellStyle: {
        padding: "8px",
        display: "flex",
        alignItems: "center",
      },
    },
    {
      field: "detail",
      headerName: "이슈 상세",
      editable: false,
      minWidth: 300,
      flex: 1,
      cellRenderer: (params) => {
        const detail = params.value || "";
        if (!detail) {
          return (
            <div className="text-gray-400 italic p-2 text-sm flex items-center justify-center h-full w-full">
              내용 없음
            </div>
          );
        }

        // 마크다운을 렌더링
        return (
          <div className="p-1 px-2 text-sm leading-relaxed text-gray-700 text-left flex items-center justify-start h-full w-full overflow-auto">
            <div className="markdown-preview w-full max-h-full break-words overflow-y-auto leading-relaxed text-sm prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // 헤더 크기 제한
                  h1: ({ node, ...props }) => (
                    <h1 className="text-lg font-bold mb-1" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-base font-bold mb-1" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-sm font-bold mb-1" {...props} />
                  ),
                  // 리스트 스타일링
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside mb-1" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside mb-1" {...props} />
                  ),
                  // 코드 블록 스타일링
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-100 p-2 rounded text-xs font-mono my-1"
                        {...props}
                      />
                    ),
                  // 링크 스타일링
                  a: ({ node, ...props }) => (
                    <a className="text-blue-500 hover:underline" {...props} />
                  ),
                  // 단락 스타일링 - 줄바꿈 처리 개선
                  p: ({ node, ...props }) => (
                    <p className="mb-1 whitespace-pre-wrap" {...props} />
                  ),
                }}
              >
                {detail}
              </ReactMarkdown>
            </div>
          </div>
        );
      },
      cellStyle: {
        padding: "8px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    },
    {
      field: "start",
      headerName: "Start",
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const currentRow = params.data;
        const startDate = currentRow?.start || "";

        return (
          <div
            className={`px-2 py-1 text-sm flex items-center justify-center h-full ${
              startDate ? "text-gray-700" : "text-gray-400 italic"
            }`}
          >
            {startDate || "미정"}
          </div>
        );
      },
      cellStyle: {
        padding: "8px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    },
    {
      field: "end",
      headerName: "End",
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const currentRow = params.data;
        const endDate = currentRow?.end || "";

        return (
          <div
            className={`px-2 py-1 text-sm flex items-center justify-center h-full ${
              endDate ? "text-gray-700" : "text-gray-400 italic"
            }`}
          >
            {endDate || "미정"}
          </div>
        );
      },
      cellStyle: {
        padding: "8px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    },
  ];

  // Ag-Grid 이벤트 핸들러
  const onRowClicked = useCallback((params) => {
    setSelectedRow(params.data);
    setIsDrawerVisible(true);
  }, [setSelectedRow, setIsDrawerVisible]);

  // 드로워 닫기 핸들러
  const handleCloseDrawer = useCallback(() => {
    setIsDrawerVisible(false);
  }, [setIsDrawerVisible]);

  return (
    <>
      <Modal
        title={
          <div className="text-lg font-semibold text-blue-500 flex items-center gap-2">
            📊{" "}
            {selectedRowData && selectedRowData.projectName
              ? `${selectedRowData.projectName} - 이슈 관리`
              : projectId
              ? `프로젝트 ${projectId} - 이슈 관리`
              : "이슈 관리"}
          </div>
        }
        open={isIssueModalVisible}
        onCancel={handleCancel}
        width="90vw"
        className="top-2.5 rounded-xl max-h-[90vh]"
        styles={{
          body: {
            height: "calc(90vh - 120px)",
            padding: "0px",
            backgroundColor: "#fafafa",
            overflow: "auto",
          },
        }}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            className="rounded-md font-medium"
          >
            닫기
          </Button>,
        ]}
      >
        <Collapse defaultActiveKey={["2"]}>
          <Collapse.Panel
            key="1"
            header={
              <div className="flex items-center gap-2 font-semibold">
                📊 Issue Schedule
              </div>
            }
          >
            <div>
              <div
                className="min-h-[180px] max-h-[400px]"
                style={{
                  height: `${Math.max(sortedIssues.length * 28 + 80, 180)}px`,
                }}
              >
                <GanttChart issueData={sortedIssues} />
              </div>
              <GanttLegend />
            </div>
          </Collapse.Panel>
          <Collapse.Panel
            key="2"
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 font-semibold">
                  📋 전체 이슈 목록 ({issues.length}개)
                  {isLoading && (
                    <span className="text-blue-500 text-sm">로딩 중...</span>
                  )}
                </div>
                <Button
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation(); // Collapse 토글 방지
                    addNewIssue();
                  }}
                  icon={<span>➕</span>}
                  size="small"
                  className="flex items-center gap-1 font-semibold rounded-md shadow-md"
                  loading={createIssueMutation.isPending}
                  disabled={!projectId}
                  title={
                    !projectId
                      ? "프로젝트 ID가 없어 이슈를 추가할 수 없습니다."
                      : "새 이슈 추가"
                  }
                >
                  새 이슈 추가
                </Button>
              </div>
            }
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-2xl mb-2">⏳</div>
                  <div className="text-gray-600">
                    이슈 목록을 불러오는 중...
                  </div>
                </div>
              </div>
            ) : !projectId ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚫</div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    프로젝트를 선택해주세요
                  </div>
                  <div className="text-gray-500 mb-4">
                    이슈를 보려면 먼저 프로젝트를 선택해야 합니다.
                  </div>
                  <div className="text-xs text-gray-400">
                    projectId: {projectId || "N/A"}
                  </div>
                  <Button
                    type="primary"
                    onClick={closeIssueModal}
                    className="mt-4"
                  >
                    모달 닫기
                  </Button>
                </div>
              </div>
            ) : projectId && issues.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    {data?.projectName
                      ? `${data.projectName} 프로젝트에는`
                      : projectId
                      ? `프로젝트 ${projectId}에는`
                      : "이 프로젝트에는"}{" "}
                    아직 이슈가 없습니다.
                  </div>
                  <div className="text-gray-500 mb-4">
                    새 이슈를 추가하여 시작해보세요!
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    프로젝트 ID: {projectId || "N/A"}
                    {data?.projectName && (
                      <span className="ml-2">({data.projectName})</span>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={addNewIssue}
                    icon={<span>➕</span>}
                    size="large"
                  >
                    첫 번째 이슈 추가
                  </Button>
                </div>
              </div>
            ) : (
              <div className="ag-theme-alpine w-full min-h-[500px] h-[calc(90vh-250px)]">
                <AgGridReact
                  ref={gridRef}
                  modules={[ClientSideRowModelModule]}
                  columnDefs={columnDefs}
                  rowData={sortedIssues}
                  getRowHeight={(params) => {
                    const detail = params.data?.detail || "";
                    const summary = params.data?.summary || "";

                    if (!detail && !summary) return 80; // 기본 높이

                    // 마크다운 텍스트의 줄 수 계산
                    const calculateMarkdownLines = (markdownContent) => {
                      if (!markdownContent) return 0;

                      // 줄바꿈 개수 세기
                      const lineBreaks = (markdownContent.match(/\n/g) || [])
                        .length;

                      // 마크다운 헤더, 리스트, 코드 블록 등을 고려한 추가 줄 수
                      const headers = (
                        markdownContent.match(/^#{1,6}\s/gm) || []
                      ).length;
                      const listItems = (
                        markdownContent.match(/^[\s]*[-*+]\s/gm) || []
                      ).length;
                      const codeBlocks = (
                        markdownContent.match(/```[\s\S]*?```/g) || []
                      ).length;

                      // 각 코드 블록은 최소 3줄로 계산
                      const codeBlockLines = codeBlocks * 3;

                      // 총 줄 수 계산 (줄바꿈 + 헤더 + 리스트 아이템 + 코드 블록)
                      const totalLines =
                        lineBreaks + headers + listItems + codeBlockLines;

                      // 최소 1줄 보장
                      return Math.max(totalLines, 1);
                    };

                    // 상세 내용의 줄 수만 계산
                    const totalLines = calculateMarkdownLines(detail);

                    // 10줄 이상일 때는 10줄로 고정
                    const displayLines = totalLines > 10 ? 10 : totalLines;

                    // 25px * 줄수 + 5px 패딩
                    const lineHeight = 25; // 한 줄 높이
                    const padding = 5; // 패딩
                    const finalHeight = lineHeight * displayLines + padding;

                    return Math.max(finalHeight, 80); // 최소 높이 보장
                  }}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    editable: false,
                    cellStyle: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      padding: "4px",
                    },
                  }}
                  pagination={true}
                  paginationPageSize={10}
                  suppressRowClickSelection={false}
                  rowSelection="single"
                  animateRows={true}
                  suppressRowHeightResize={false}
                  onRowDoubleClicked={onRowClicked}
                  onRowDataUpdated={() => {
                    // 데이터 업데이트 후 행 높이 재계산
                    setTimeout(() => {
                      if (gridRef.current && gridRef.current.api) {
                        gridRef.current.api.resetRowHeights();
                      }
                    }, 100);
                  }}
                  onGridReady={() => {
                    // 그리드가 준비되면 행 높이 재계산
                    setTimeout(() => {
                      if (gridRef.current && gridRef.current.api) {
                        gridRef.current.api.resetRowHeights();
                      }
                    }, 100);
                  }}
                  // 기본 정렬 설정
                  defaultSortModel={[
                    { colId: "end", sort: "desc" }, // 종료일 기준 내림차순 (늦을수록 위로, 없으면 최상단)
                    { colId: "start", sort: "desc" }, // 시작일 기준 내림차순 (늦을수록 위로)
                    { colId: "category", sort: "asc" }, // 카테고리 기준 오름차순
                  ]}
                />
              </div>
            )}
          </Collapse.Panel>
        </Collapse>
      </Modal>

      {/* IssueDrawer 컴포넌트 사용 */}
      <IssueDrawer
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
        selectedRow={selectedRow}
        projectId={projectId}
        onSave={handleSaveDrawerData}
        isSaving={updateIssueMutation.isPending}
      />
    </>
  );
};

export default IssueModal;
