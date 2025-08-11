import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Button,
  Tag,
  Drawer,
  Space,
  Typography,
  message,
  Collapse,
  Image,
  Upload,
  DatePicker,
  Input,
  Select,
  Tabs,
  Tooltip,
} from "antd";
import GanttChart from "./GanttChart.jsx";
import GanttLegend from "./GanttLegend.jsx";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
import dayjs from "dayjs";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { useIssues, useAddIssue, useUpdateIssue } from "../hooks/useIssues";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MDEditor from "@uiw/react-md-editor";
import TurndownService from "turndown";
import {
  PlusOutlined,
  BoldOutlined,
  ItalicOutlined,
  LinkOutlined,
  PictureOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  CodeOutlined,
} from "@ant-design/icons";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const IssueModal = ({ isVisible, onClose, data }) => {
  // React Query hooks
  const { data: issues = [], isLoading, refetch } = useIssues();
  const addIssueMutation = useAddIssue();
  const updateIssueMutation = useUpdateIssue();

  // Turndown 서비스 초기화 (HTML to Markdown 변환)
  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });

    // 코드 블록 보존
    service.addRule("codeBlocks", {
      filter: ["pre"],
      replacement: function (content, node) {
        const code = node.querySelector("code");
        if (code) {
          const language = code.className?.replace("language-", "") || "";
          return `\n\`\`\`${language}\n${code.textContent}\n\`\`\`\n`;
        }
        return content;
      },
    });

    return service;
  }, []);

  // 마크다운 에디터 설정
  const markdownPlaceholder = `# 이슈 제목

## 상세 내용
여기에 이슈에 대한 상세한 내용을 작성하세요.

### 체크리스트
- [ ] 첫 번째 작업
- [ ] 두 번째 작업
- [ ] 세 번째 작업

### 코드 예시
\`\`\`javascript
console.log("Hello World");
\`\`\`

**굵은 텍스트**와 *기울임 텍스트*도 사용할 수 있습니다.`;

  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const gridRef = useRef(null);

  // 드로워 내부 상태 관리
  const [localIssueContent, setLocalIssueContent] = useState("");
  const [localSummaryContent, setLocalSummaryContent] = useState("");
  const [localCurrentStatus, setLocalCurrentStatus] = useState("pending");
  const [localImageUrls, setLocalImageUrls] = useState([]);
  const [localFileUrls, setLocalFileUrls] = useState([]);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  // props 변경 감지
  useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  // 선택된 행이 변경될 때 드로워 상태 초기화
  useEffect(() => {
    if (selectedRow) {
      setLocalIssueContent(selectedRow.detail || "");
      setLocalSummaryContent(selectedRow.summary || "");
      setLocalCurrentStatus(selectedRow.status || "pending");

      // 이미지 URL 배열 안전하게 처리
      const imageData = selectedRow.img;
      if (Array.isArray(imageData)) {
        setLocalImageUrls(imageData);
      } else if (imageData && typeof imageData === "string") {
        setLocalImageUrls([imageData]);
      } else {
        setLocalImageUrls([]);
      }

      // 파일 URL 배열 안전하게 처리
      const fileData = selectedRow.file;
      if (Array.isArray(fileData)) {
        setLocalFileUrls(fileData);
      } else if (fileData && typeof fileData === "string") {
        setLocalFileUrls([fileData]);
      } else {
        setLocalFileUrls([]);
      }

      setLocalStartDate(selectedRow.start || "");
      setLocalEndDate(selectedRow.end || "");
    }
  }, [selectedRow]);

  // 드로워가 닫힐 때 자동 저장
  useEffect(() => {
    if (!isDrawerVisible && selectedRow) {
      saveDrawerData();
    }
  }, [isDrawerVisible, selectedRow]);

  // 모달이 닫힐 때 onClose 호출
  const handleCancel = () => {
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  // 드로워에서 데이터 저장 함수
  const saveDrawerData = () => {
    if (selectedRow) {
      const updatedData = {
        detail: localIssueContent,
        summary: localSummaryContent,
        status: localCurrentStatus,
        img: localImageUrls,
        file: localFileUrls,
        start: localStartDate,
        end: localEndDate,
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

  const addNewIssue = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD"); // 오늘부터 7일 후

    const newIssue = {
      issue: "새 이슈",
      summary: "",
      status: "pending",
      img: "", // 이미지 없음으로 시작
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

## �� 첨부파일
업로드된 파일과 이미지가 여기에 표시됩니다.

## 📝 참고사항
추가적인 메모나 참고사항을 여기에 작성하세요.`,
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
          <div className="text-lg font-semibold text-blue-500 flex items-center gap-2">
            📊{" "}
            {data ? `${data.projectName} - 이슈 관리` : getCurrentMonthYear()}
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
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
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="rounded-md font-medium"
          >
            확인
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
                  className="flex items-center gap-1 font-semibold rounded-md shadow-md"
                >
                  새 이슈 추가
                </Button>
              </div>
            }
          >
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
                    const headers = (markdownContent.match(/^#{1,6}\s/gm) || [])
                      .length;
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
          <div className="text-base font-semibold text-blue-500 flex items-center gap-2">
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
        className="p-0 h-full"
        styles={{
          body: {
            padding: 0,
            height: "100%",
          },
        }}
      >
        {selectedRow && (
          <div className="p-5 h-full overflow-auto">
            {/* 상태 및 요약 */}
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-gray-700 text-base font-semibold">
                📊 상태 및 요약
              </h3>
              <div className="flex gap-4">
                <div className="flex-none w-30">
                  <Select
                    value={localCurrentStatus}
                    onChange={setLocalCurrentStatus}
                    className="w-full"
                  >
                    <Select.Option value="pending">대기 중</Select.Option>
                    <Select.Option value="in_progress">진행 중</Select.Option>
                    <Select.Option value="completed">완료</Select.Option>
                    <Select.Option value="blocked">차단됨</Select.Option>
                  </Select>
                </div>
                <div className="flex-1">
                  <Input
                    value={localSummaryContent}
                    onChange={(e) => setLocalSummaryContent(e.target.value)}
                    placeholder="Summary를 입력해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 날짜 설정 */}
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-gray-700 text-base font-semibold">
                📅 날짜 설정
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <DatePicker
                    value={localStartDate ? dayjs(localStartDate) : null}
                    onChange={(date) =>
                      setLocalStartDate(date ? date.format("YYYY-MM-DD") : "")
                    }
                    className="w-full"
                    placeholder="시작일 선택"
                  />
                </div>
                <div className="flex-1">
                  <DatePicker
                    value={localEndDate ? dayjs(localEndDate) : null}
                    onChange={(date) =>
                      setLocalEndDate(date ? date.format("YYYY-MM-DD") : "")
                    }
                    className="w-full"
                    placeholder="종료일 선택"
                  />
                </div>
              </div>
            </div>

            {/* 이슈 상세 내용 */}
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-gray-700 text-base font-semibold">
                📝 Issue 상세내용
              </h3>

              {/* 에디터 모드 선택 */}
              <div className="mb-3">
                <Tabs
                  defaultActiveKey="wysiwyg"
                  items={[
                    {
                      key: "wysiwyg",
                      label: "WYSIWYG 편집",
                      children: (
                        <div className="space-y-3">
                          <div className="flex gap-2 mb-2">
                            <Tooltip title="HTML 붙여넣기 (Word, Quill 등)">
                              <Button
                                size="small"
                                onClick={() => {
                                  navigator.clipboard
                                    .readText()
                                    .then((text) => {
                                      if (
                                        text.includes("<") &&
                                        text.includes(">")
                                      ) {
                                        try {
                                          const markdown =
                                            turndownService.turndown(text);
                                          setLocalIssueContent(markdown);
                                          message.success(
                                            "HTML이 마크다운으로 변환되었습니다!"
                                          );
                                        } catch (error) {
                                          message.error(
                                            "HTML 변환에 실패했습니다."
                                          );
                                        }
                                      } else {
                                        message.info(
                                          "클립보드에 HTML이 없습니다."
                                        );
                                      }
                                    });
                                }}
                              >
                                📋 HTML 변환
                              </Button>
                            </Tooltip>
                            <Tooltip title="마크다운 가이드">
                              <Button
                                size="small"
                                onClick={() => {
                                  const guide = `# 마크다운 가이드

## 기본 문법
**굵은 텍스트**와 *기울임 텍스트*

### 리스트
- [ ] 체크리스트
- [x] 완료된 항목

### 코드
\`\`\`javascript
console.log("Hello World");
\`\`\`

### 링크
[링크 텍스트](https://example.com)

### 이미지
![이미지 설명](이미지URL)`;
                                  setLocalIssueContent(guide);
                                }}
                              >
                                📖 가이드
                              </Button>
                            </Tooltip>
                          </div>

                          <MDEditor
                            value={localIssueContent}
                            onChange={setLocalIssueContent}
                            preview="edit"
                            height={300}
                            className="font-mono text-sm"
                            textareaProps={{
                              placeholder: markdownPlaceholder,
                              onPaste: (e) => {
                                // HTML 붙여넣기 자동 감지 및 변환
                                const clipboardData = e.clipboardData;
                                if (clipboardData) {
                                  const html =
                                    clipboardData.getData("text/html");
                                  if (html && html.includes("<")) {
                                    e.preventDefault();
                                    try {
                                      const markdown =
                                        turndownService.turndown(html);
                                      setLocalIssueContent(
                                        (prev) => prev + markdown
                                      );
                                      message.success(
                                        "HTML이 마크다운으로 자동 변환되었습니다!"
                                      );
                                    } catch (error) {
                                      // 변환 실패 시 일반 텍스트로 붙여넣기
                                      const text =
                                        clipboardData.getData("text/plain");
                                      setLocalIssueContent(
                                        (prev) => prev + text
                                      );
                                    }
                                  }
                                }
                              },
                            }}
                          />
                        </div>
                      ),
                    },
                    {
                      key: "markdown",
                      label: "마크다운 직접 편집",
                      children: (
                        <Input.TextArea
                          value={localIssueContent}
                          onChange={(e) => setLocalIssueContent(e.target.value)}
                          placeholder={markdownPlaceholder}
                          rows={15}
                          className="font-mono text-sm"
                          style={{ resize: "vertical" }}
                        />
                      ),
                    },
                    {
                      key: "preview",
                      label: "미리보기",
                      children: (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[300px]">
                          <div className="prose prose-sm max-w-none text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {localIssueContent ||
                                "*내용을 입력하면 여기에 미리보기가 표시됩니다.*"}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            {/* 이미지 업로드 영역 */}
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-gray-700 text-base font-semibold">
                🖼️ 첨부 이미지
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 text-center bg-white transition-all duration-300 min-h-64">
                <div className="flex gap-2 mb-3 justify-center">
                  <Tooltip title="현재 커서 위치에 이미지 마크다운 삽입">
                    <Button
                      size="small"
                      onClick={() => {
                        if (localImageUrls.length > 0) {
                          const imageMarkdown = localImageUrls
                            .map((url) => `![이미지](${url})`)
                            .join("\n");
                          setLocalIssueContent(
                            (prev) => prev + "\n\n" + imageMarkdown
                          );
                          message.success(
                            "이미지 마크다운이 에디터에 삽입되었습니다!"
                          );
                        } else {
                          message.info("삽입할 이미지가 없습니다.");
                        }
                      }}
                    >
                      📝 에디터에 삽입
                    </Button>
                  </Tooltip>
                </div>
                <Upload.Dragger
                  name="image"
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error("이미지는 5MB보다 작아야 합니다!");
                      return false;
                    }
                    if (!file.type.startsWith("image/")) {
                      message.error("이미지 파일만 업로드 가능합니다!");
                      return false;
                    }
                    const uploadedImageUrl = URL.createObjectURL(file);
                    setLocalImageUrls((prev) => [...prev, uploadedImageUrl]);

                    // 자동으로 마크다운 삽입 옵션
                    Modal.confirm({
                      title: "이미지 마크다운 삽입",
                      content:
                        "에디터에 이미지 마크다운을 자동으로 삽입하시겠습니까?",
                      onOk: () => {
                        const imageMarkdown = `![${file.name}](${uploadedImageUrl})`;
                        setLocalIssueContent(
                          (prev) => prev + "\n\n" + imageMarkdown
                        );
                        message.success(
                          "이미지 마크다운이 자동으로 삽입되었습니다!"
                        );
                      },
                    });

                    message.success(
                      `${file.name} 이미지가 성공적으로 추가되었습니다.`
                    );
                    return false;
                  }}
                  className="border-none bg-transparent p-0"
                >
                  {localImageUrls.length > 0 ? (
                    <Image.PreviewGroup>
                      <div
                        className="grid grid-cols-auto-fill gap-2 w-full"
                        style={{
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                        }}
                      >
                        {localImageUrls.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative border border-gray-200 rounded-lg overflow-hidden bg-white"
                          >
                            <Image
                              src={imageUrl}
                              alt={`이슈 이미지 ${index + 1}`}
                              className="w-full h-36 object-cover"
                            />
                            <Button
                              type="primary"
                              danger
                              size="small"
                              className="absolute top-2 right-2 rounded-full w-7 h-7 flex items-center justify-center text-xs p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocalImageUrls((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  ) : (
                    <div className="p-5">
                      <div className="text-5xl mb-4">📁</div>
                      <div className="text-base font-semibold mb-2 text-gray-700">
                        이미지를 드래그하여 업로드
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        또는 클릭하여 파일 선택
                      </div>
                      <div className="text-xs text-gray-400">
                        지원 형식: JPG, PNG, GIF (최대 5MB)
                      </div>
                    </div>
                  )}
                </Upload.Dragger>
              </div>
            </div>

            {/* 첨부 파일 영역 */}
            <div className="mb-5">
              <h3 className="m-0 mb-3 text-gray-700 text-base font-semibold">
                📄 첨부 파일
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-44">
                <div className="flex gap-2 mb-3 justify-center">
                  <Tooltip title="현재 커서 위치에 파일 링크 마크다운 삽입">
                    <Button
                      size="small"
                      onClick={() => {
                        if (localFileUrls.length > 0) {
                          const fileMarkdown = localFileUrls
                            .map(
                              (file) => `[${file.name || "파일"}](${file.url})`
                            )
                            .join("\n");
                          setLocalIssueContent(
                            (prev) => prev + "\n\n" + fileMarkdown
                          );
                          message.success(
                            "파일 링크 마크다운이 에디터에 삽입되었습니다!"
                          );
                        } else {
                          message.info("삽입할 파일이 없습니다.");
                        }
                      }}
                    >
                      📝 에디터에 삽입
                    </Button>
                  </Tooltip>
                </div>
                <Upload.Dragger
                  name="file"
                  accept="*/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isLt10M = file.size / 1024 / 1024 < 10;
                    if (!isLt10M) {
                      message.error("파일은 10MB보다 작아야 합니다!");
                      return false;
                    }
                    const uploadedFileUrl = URL.createObjectURL(file);
                    const fileWithName = {
                      url: uploadedFileUrl,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    };
                    setLocalFileUrls((prev) => [...prev, fileWithName]);

                    // 자동으로 마크다운 삽입 옵션
                    Modal.confirm({
                      title: "파일 링크 마크다운 삽입",
                      content:
                        "에디터에 파일 링크 마크다운을 자동으로 삽입하시겠습니까?",
                      onOk: () => {
                        const fileMarkdown = `[${file.name}](${uploadedFileUrl})`;
                        setLocalIssueContent(
                          (prev) => prev + "\n\n" + fileMarkdown
                        );
                        message.success(
                          "파일 링크 마크다운이 자동으로 삽입되었습니다!"
                        );
                      },
                    });

                    message.success(`${file.name} 파일이 업로드되었습니다.`);
                    return false;
                  }}
                  className="border-none bg-transparent"
                >
                  {localFileUrls.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {localFileUrls.map((fileUrl, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl text-blue-500">📄</span>
                            <span className="text-sm font-medium text-gray-700 break-all">
                              {fileUrl.name || `파일 ${index + 1}`}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="link"
                              size="small"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = fileUrl.url || fileUrl;
                                link.download =
                                  fileUrl.name || `file_${index + 1}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              다운로드
                            </Button>
                            <Button
                              danger
                              size="small"
                              className="rounded-full w-7 h-7 text-xs p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocalFileUrls((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl mb-4">📁</div>
                      <div className="text-base font-semibold text-gray-700">
                        파일을 드래그하여 업로드
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        또는 클릭하여 파일 선택
                      </div>
                      <div className="text-xs text-gray-400">
                        모든 파일 형식 지원 (최대 10MB)
                      </div>
                    </div>
                  )}
                </Upload.Dragger>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="text-center mt-5">
              <Button type="primary" size="large" onClick={saveDrawerData}>
                💾 저장
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default IssueModal;
