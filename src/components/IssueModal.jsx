import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Button,
  Tag,
  Table,
  Tabs,
  Drawer,
  Card,
  Space,
  Typography,
  Progress,
  Form,
  Row,
  Col,
  InputNumber,
  message,
  Collapse,
  Image,
} from "antd";
import GanttChart from "./GanttChart.jsx";
import GanttLegend from "./GanttLegend.jsx";
import DrawerContent from "./DrawerContent.jsx";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useIssues, useAddIssue, useUpdateIssue } from "../hooks/useIssues";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);
import { PlusOutlined } from "@ant-design/icons";

const IssueModal = ({ isVisible, onClose, data }) => {
  // React Query hooks
  const { data: issues = [], isLoading, refetch } = useIssues();
  const addIssueMutation = useAddIssue();
  const updateIssueMutation = useUpdateIssue();

  // 리치 에디터 설정
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "indent",
  ];
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const drawerRef = useRef(null);
  const gridRef = useRef(null);

  // props 변경 감지
  useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  // 드로워가 닫힐 때 자동 저장
  useEffect(() => {
    if (!isDrawerVisible && selectedRow && drawerRef.current) {
      const localData = drawerRef.current.getData();
      if (localData) {
        saveDrawerData(localData);
      }
    }
  }, [isDrawerVisible, selectedRow]);

  // 모달이 닫힐 때 onClose 호출
  const handleCancel = () => {
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  // 드로워에서 데이터 저장 함수
  const saveDrawerData = (localData) => {
    if (selectedRow && localData) {
      const updatedData = {
        detail: localData.issueContent,
        summary: localData.summaryContent,
        status: localData.currentStatus,
        img: localData.imageUrls, // 이미지 URL 배열 업데이트
        file: localData.fileUrls, // 첨부파일 URL 배열 업데이트
        start: localData.startDate, // 시작일 업데이트
        end: localData.endDate, // 종료일 업데이트
      };

      updateIssueMutation.mutate(
        { id: selectedRow.id, data: updatedData },
        {
          onSuccess: () => {
            message.success("변경사항이 저장되었습니다!");
            setIsDrawerVisible(false);
          },
          onError: () => {
            message.error("저장에 실패했습니다!");
          },
        }
      );
    }
  };

  // 날짜 기준으로 정렬된 데이터 생성 (마지막 날짜가 맨 위로)
  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      // end 날짜가 없으면 start 날짜로 비교
      const dateA = a.end || a.start;
      const dateB = b.end || b.start;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // dateA가 없으면 뒤로
      if (!dateB) return -1; // dateB가 없으면 뒤로

      // 날짜 문자열을 Date 객체로 변환하여 비교 (내림차순)
      return new Date(dateB) - new Date(dateA);
    });
  }, [issues]);

  // issues 데이터가 변경될 때 AG Grid 행 높이 재계산
  useEffect(() => {
    if (gridRef.current && gridRef.current.api && issues.length > 0) {
      setTimeout(() => {
        gridRef.current.api.resetRowHeights();
        gridRef.current.api.refreshCells();
      }, 100);
    }
  }, [issues.length]); // issues.length로 변경하여 배열 길이만 감지

  // 현재 월에 진행 중인지 확인하는 함수
  const isCurrentMonthActive = (item) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const endDate = item.end ? new Date(item.end) : null;
    const startDate = item.start ? new Date(item.start) : null;

    // 시작일이 없는 경우 완료된 것으로 간주
    if (!startDate) return false;

    // 종료일이 없는 경우 (아직 완료되지 않은 항목)
    if (!endDate) {
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      return (
        (startYear === currentYear && startMonth <= currentMonth) ||
        startYear < currentYear
      );
    }

    // 시작일~종료일 기간이 이번 달에 포함되는 경우
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    const startInCurrentOrBefore =
      (startDate.getFullYear() === currentYear &&
        startDate.getMonth() <= currentMonth) ||
      startDate.getFullYear() < currentYear;
    const endInCurrentOrAfter =
      (endYear === currentYear && endMonth >= currentMonth) ||
      endYear > currentYear;

    return startInCurrentOrBefore && endInCurrentOrAfter;
  };

  const handleOk = () => {
    // 데이터 저장 로직 (실제로는 API 호출 등)
    console.log("저장된 데이터:", rowData);
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  // 드로워 열기
  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  // 드로워 닫기
  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const addNewIssue = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD"); // 오늘부터 7일 후

    const newIssue = {
      issue: "새 이슈",
      summary: "",
      status: "pending",
      img: "", // 이미지 없음으로 시작
      detail: "새 이슈에 대한 상세 내용을 입력하세요.",
      start: today,
      end: nextWeek,
      file: "",
      progress: "계획 단계",
    };

    addIssueMutation.mutate(newIssue, {
      onSuccess: () => {
        message.success("새 이슈가 추가되었습니다!");
      },
      onError: () => {
        message.error("이슈 추가에 실패했습니다!");
      },
    });
  };

  // 이미지 표시 셀 렌더러 (읽기 전용)
  const ImageCell = (props) => {
    const imageData = props.value;

    // 이미지 데이터가 배열인지 문자열인지 확인
    const imageUrls = Array.isArray(imageData)
      ? imageData
      : imageData
      ? [imageData]
      : [];
    const firstImageUrl = imageUrls[0];

    if (!firstImageUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center p-2 text-gray-500 text-xs italic">
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
        {/* 여러 이미지가 있을 때 개수 표시 */}
        {imageUrls.length > 1 && (
          <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
            +{imageUrls.length - 1}
          </div>
        )}
      </div>
    );
  };

  // Start Date 셀 렌더러 (읽기 전용)
  const StartDateCell = (props) => {
    const currentRow = props.data;
    const startDate = currentRow?.start || "";

    return (
      <div
        className={`px-2 py-1 text-sm flex items-center h-full ${
          startDate ? "text-gray-700" : "text-gray-500 italic"
        }`}
      >
        {startDate || "미정"}
      </div>
    );
  };

  // End Date 셀 렌더러 (읽기 전용)
  const EndDateCell = (props) => {
    const currentRow = props.data;
    const endDate = currentRow?.end || "";

    return (
      <div
        className={`px-2 py-1 text-sm flex items-center h-full ${
          endDate ? "text-gray-700" : "text-gray-500 italic"
        }`}
      >
        {endDate || "미정"}
      </div>
    );
  };

  // Detail 컬럼 셀 렌더러 (읽기 전용)
  const DetailCell = (props) => {
    const currentRow = props.data;
    const detail = currentRow?.detail || "";

    // 여러줄 텍스트를 말머리 부호로 변환
    const formatDetailText = (text) => {
      if (!text) return "";
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      return lines.map((line, index) => (
        <div key={index} className="mb-0.5 leading-tight">
          • {line.trim()}
        </div>
      ));
    };

    return (
      <div
        className={`p-2 text-xs leading-relaxed max-h-15 overflow-hidden ${
          detail ? "text-gray-700" : "text-gray-500 italic"
        }`}
      >
        {detail ? formatDetailText(detail) : "내용 없음"}
      </div>
    );
  };

  // Progress 셀 렌더러 (읽기 전용)
  const ProgressCell = (props) => {
    const currentRow = props.data;
    const progress = currentRow?.progress || "";

    return (
      <div
        className={`p-2 text-xs leading-relaxed max-h-15 overflow-hidden flex items-center justify-center h-full ${
          progress ? "text-gray-700" : "text-gray-500 italic"
        }`}
      >
        {progress || "진행사항 없음"}
      </div>
    );
  };

  // File 셀 렌더러 (읽기 전용)
  const FileCell = (props) => {
    const fileData = props.value;

    // 파일 데이터가 배열인지 문자열인지 확인
    const files = Array.isArray(fileData)
      ? fileData
      : fileData
      ? [fileData]
      : [];
    const firstFile = files[0];

    if (!firstFile) {
      return (
        <div className="w-full h-full flex items-center justify-center p-2 text-gray-500 text-xs italic">
          파일 없음
        </div>
      );
    }

    const fileName = firstFile.name || firstFile || "파일";

    return (
      <div className="w-full h-full flex items-center justify-center p-1 relative">
        <div className="flex items-center gap-2 max-w-full">
          <span className="text-base text-blue-500">📄</span>
          <span className="text-xs text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-20">
            {fileName}
          </span>
        </div>
        {/* 여러 파일이 있을 때 개수 표시 */}
        {files.length > 1 && (
          <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">
            +{files.length - 1}
          </div>
        )}
      </div>
    );
  };

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 8,
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                padding: "2px 6px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: "bold",
                backgroundColor: color,
                color: "white",
                textAlign: "center",
                minWidth: 50,
                flexShrink: 0,
              }}
            >
              {statusLabel}
            </div>
            <div
              style={{ fontSize: 13, color: "#333", lineHeight: 1.3, flex: 1 }}
            >
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
            <div
              style={{
                color: "#999",
                fontStyle: "italic",
                padding: "8px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              내용 없음
            </div>
          );
        }

        // HTML 태그를 그대로 렌더링
        const createMarkup = (htmlContent) => {
          return { __html: htmlContent };
        };

        // 모든 경우에 스크롤로 표시
        return (
          <div className="p-1 px-2 text-sm leading-relaxed text-gray-700 text-left flex items-center justify-start h-full w-full overflow-auto">
            <div
              dangerouslySetInnerHTML={createMarkup(detail)}
              className="rich-text-preview w-full"
              style={{ maxHeight: "100%" }}
            />
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
            style={{
              padding: "4px 8px",
              fontSize: "13px",
              color: startDate ? "#333" : "#999",
              fontStyle: startDate ? "normal" : "italic",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
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
            style={{
              padding: "4px 8px",
              fontSize: "13px",
              color: endDate ? "#333" : "#999",
              fontStyle: endDate ? "normal" : "italic",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
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

  // 현재 월과 년도 가져오기
  const getCurrentMonthYear = () => {
    const now = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[now.getMonth()]} Issue Sheet`;
  };

  // Ag-Grid 이벤트 핸들러
  const onRowClicked = (params) => {
    setSelectedRow(params.data);
    setIsDrawerVisible(true);
  };

  return (
    <>
      <Modal
        title={
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1890ff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📊{" "}
            {data ? `${data.projectName} - 이슈 관리` : getCurrentMonthYear()}
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width="90vw"
        style={{
          top: 10,
          borderRadius: "12px",
          maxHeight: "90vh",
        }}
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
            style={{
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            닫기
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            style={{
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            확인
          </Button>,
        ]}
      >
        <Collapse defaultActiveKey={["2"]}>
          <Collapse.Panel
            key="1"
            header={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "600",
                }}
              >
                📊 Issue Schedule
              </div>
            }
          >
            <div>
              <div
                style={{
                  height: `${Math.max(sortedIssues.length * 28 + 80, 180)}px`,
                  minHeight: "180px",
                  maxHeight: "400px",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  📋 전체 이슈 목록 ({sortedIssues.length}개)
                </div>
                <Button
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation(); // Collapse 토글 방지
                    addNewIssue();
                  }}
                  icon={<span>➕</span>}
                  size="small"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  새 이슈 추가
                </Button>
              </div>
            }
          >
            <div
              className="ag-theme-alpine"
              style={{
                height: "calc(90vh - 250px)",
                minHeight: "500px",
                width: "100%",
              }}
            >
              <AgGridReact
                ref={gridRef}
                modules={[ClientSideRowModelModule]}
                columnDefs={columnDefs}
                rowData={sortedIssues}
                getRowHeight={(params) => {
                  const detail = params.data?.detail || "";
                  const summary = params.data?.summary || "";

                  if (!detail && !summary) return 80; // 기본 높이

                  // Rich text의 HTML 태그를 분석하여 줄 수 계산
                  const calculateRichTextLines = (htmlContent) => {
                    if (!htmlContent) return 0;

                    // 줄바꿈을 만드는 태그들을 찾아서 개수 세기
                    const lineBreakTags = [
                      "<p>",
                      "<li>",
                      "<br>",
                      "<div>",
                      "<h1>",
                      "<h2>",
                      "<h3>",
                      "<h4>",
                      "<h5>",
                      "<h6>",
                    ];
                    let lineCount = 0;

                    // 각 태그의 개수를 세기
                    lineBreakTags.forEach((tag) => {
                      const regex = new RegExp(tag, "gi");
                      const matches = htmlContent.match(regex);
                      if (matches) {
                        lineCount += matches.length;
                      }
                    });

                    // <br> 태그는 추가로 세기 (이미 위에서 세었지만 명확히 하기 위해)
                    const brMatches = htmlContent.match(/<br\s*\/?>/gi);
                    if (brMatches) {
                      lineCount += brMatches.length;
                    }

                    // 최소 1줄 보장
                    return Math.max(lineCount, 1);
                  };

                  // 상세 내용의 줄 수만 계산
                  const totalLines = calculateRichTextLines(detail);

                  // 10줄 이상일 때는 10줄로 고정
                  const displayLines = totalLines > 10 ? 10 : totalLines;

                  // 25px * 줄수 + 5px 패딩
                  const lineHeight = 25; // 한 줄 높이
                  const padding = 5; // 패딩
                  const finalHeight = lineHeight * displayLines + padding;

                  // 디버깅을 위한 콘솔 출력
                  console.log(`Row ${params.data?.id}:`, {
                    detail: detail.substring(0, 100) + "...",
                    totalLines,
                    displayLines,
                    finalHeight,
                    detailLength: detail.length,
                    isTruncated: totalLines > 10,
                  });

                  return Math.max(finalHeight, 80); // 최소 높이 보장
                }}
                getRowStyle={(params) => {
                  // 이번 달에 진행 중인 항목은 하얀색 배경
                  if (isCurrentMonthActive(params.data)) {
                    return { backgroundColor: "#ffffff" };
                  }
                  // 완료된 과거 항목은 회색 배경
                  return { backgroundColor: "#f5f5f5" };
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
          </Collapse.Panel>
        </Collapse>
      </Modal>

      {/* Drawer for 상세 정보 편집 */}
      <Drawer
        title={
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1890ff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📋 {selectedRow?.issue || "이슈 상세 정보 편집"}
          </div>
        }
        placement="right"
        width="66.67%"
        maskClosable={true}
        closable={true}
        onClose={() => {
          setIsDrawerVisible(false);
        }}
        open={isDrawerVisible}
        styles={{
          body: {
            padding: 0,
            height: "100%",
          },
        }}
      >
        <DrawerContent
          selectedRow={selectedRow}
          onSave={saveDrawerData}
          ref={drawerRef}
        />
      </Drawer>
    </>
  );
};

export default IssueModal;
