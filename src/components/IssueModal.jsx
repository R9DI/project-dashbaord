import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Button,
  Upload,
  DatePicker,
  Image,
  Tag,
  Table,
  Tabs,
  Input,
  Select,
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
} from "antd";
import GanttChart from "./GanttChart.jsx";
import { AgGridReact } from "ag-grid-react";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { PlusOutlined } from "@ant-design/icons";

const IssueModal = ({ isVisible, onClose, data }) => {
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
  const [issueContent, setIssueContent] = useState("");
  const [summaryContent, setSummaryContent] = useState("");
  const [currentStatus, setCurrentStatus] = useState("pending");
  const drawerRef = useRef(null);

  // props 변경 감지
  useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  // 모달이 닫힐 때 onClose 호출
  const handleCancel = () => {
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  // 드로워에서 데이터 저장 함수
  const saveDrawerData = (localData) => {
    if (selectedRow && localData) {
      setRowData((prevData) =>
        prevData.map((row) =>
          row.id === selectedRow.id
            ? {
                ...row,
                detail: localData.issueContent,
                summary: localData.summaryContent,
                status: localData.currentStatus,
                img: localData.imageUrl, // 이미지 URL 업데이트
                file: localData.fileUrl, // 첨부파일 URL 업데이트
                start: localData.startDate, // 시작일 업데이트
                end: localData.endDate, // 종료일 업데이트
              }
            : row
        )
      );
    }
  };

  const initialData = [
    {
      id: 1,
      issue: "로그인 기능 오류",
      summary: "로그인 시 500 에러 발생",
      status: "in-progress",
      img: "https://dummyimage.com/800x300/4A90E2/FFFFFF.png&text=Login+Error", // 가로가 매우 긴 이미지
      detail: "500 에러 발생\n데이터베이스 연결 문제\n인증 시스템 불안정",
      start: "2025-06-01",
      end: "2025-06-05",
      file: "login_bug_report.pdf",
      progress:
        "로그인 오류 수정 완료\n데이터베이스 연결 문제 해결\n사용자 인증 시스템 안정화 완료",
    },
    {
      id: 2,
      issue: "UI 반응형 개선",
      summary: "모바일 메뉴 표시 문제",
      status: "pending",
      img: "https://dummyimage.com/300x800/50C878/FFFFFF.png&text=UI+Design", // 세로가 매우 긴 이미지
      detail: "모바일 메뉴 표시 오류\nCSS 미디어 쿼리 수정\n일관된 UI 제공",
      start: "2025-06-03",
      end: "2025-07-08",
      file: "ui_improvement.pdf",
      progress:
        "모바일 메뉴 디자인 개선 중\nCSS 미디어 쿼리 수정 진행\n다양한 디바이스 테스트 예정",
    },
    {
      id: 3,
      issue: "성능 테스트 필요",
      summary: "대용량 데이터 처리 속도 저하",
      status: "blocked",
      img: "https://dummyimage.com/100x100/FF6B6B/FFFFFF.png&text=Test", // 정사각형 이미지
      detail: "대용량 데이터 처리 속도 저하\n쿼리 최적화 필요\n캐싱 전략 검토",
      start: "2025-06-05",
      end: "2025-07-12",
      file: "performance_test.pdf",
      progress:
        "성능 테스트 계획 수립 중\n테스트 환경 구성 검토\n테스트 케이스 작성 진행",
    },
    {
      id: 4,
      issue: "XSS 취약점 패치",
      summary: "XSS 공격 취약점 발견",
      status: "completed",
      img: "https://dummyimage.com/400x600/FF8C00/FFFFFF.png&text=Security", // 세로가 긴 이미지
      detail: "XSS 공격 취약점\n입력값 검증 강화\nHTML 인코딩 적용",
      start: "2025-06-10",
      end: "2025-07-15",
      file: "security_patch.pdf",
      progress:
        "XSS 취약점 분석 완료\n입력값 검증 로직 개발 중\n보안 테스트 계획 수립",
    },
    {
      id: 5,
      issue: "서버 확장성 개선",
      summary: "서버 부하 문제 해결",
      status: "in-progress",
      img: "https://dummyimage.com/600x200/9B59B6/FFFFFF.png&text=Infrastructure", // 가로가 긴 이미지
      detail: "서버 부하 문제\n로드 밸런서 도입\nCDN 검토",
      start: "2025-06-12",
      end: "2025-07-20",
      file: "infrastructure_upgrade.pdf",
      progress:
        "서버 부하 분석 완료\n로드 밸런서 도입 계획 수립\nCDN 서비스 비교 검토 중",
    },
    {
      id: 6,
      issue: "페이지 로딩 속도 개선",
      summary: "페이지 로딩 3초 초과 문제",
      status: "pending",
      img: "https://dummyimage.com/200x400/3498DB/FFFFFF.png&text=UX+Speed", // 세로가 긴 이미지
      detail: "페이지 로딩 3초 초과\n이미지 최적화\n웹팩 설정 최적화",
      start: "2025-07-01",
      end: "2025-07-25",
      file: "performance_optimization.pdf",
      progress:
        "페이지 로딩 속도 측정 완료\n이미지 최적화 작업 시작\n웹팩 설정 분석 중",
    },
  ];

  // 날짜 기준으로 정렬된 데이터 생성 (마지막 날짜가 맨 위로)
  const sortedData = [...initialData].sort((a, b) => {
    // end 날짜가 없으면 start 날짜로 비교
    const dateA = a.end || a.start;
    const dateB = b.end || b.start;

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // dateA가 없으면 뒤로
    if (!dateB) return -1; // dateB가 없으면 뒤로

    // 날짜 문자열을 Date 객체로 변환하여 비교 (내림차순)
    return new Date(dateB) - new Date(dateA);
  });

  const [rowData, setRowData] = useState(sortedData);
  const [originalData] = useState(sortedData); // 원본 데이터 보존

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

  // 선택된 행이 변경될 때 상태 업데이트
  useEffect(() => {
    if (selectedRow) {
      setIssueContent(selectedRow.detail || "");
      setSummaryContent(selectedRow.summary || "");
      setCurrentStatus(selectedRow.status || "pending");
    }
  }, [selectedRow]);

  const addNewIssue = () => {
    const newId = Math.max(...rowData.map((row) => row.id), 0) + 1;
    const today = dayjs().format("YYYY-MM-DD");
    const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD");

    const newIssue = {
      id: newId,
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
    setRowData((prevData) => [newIssue, ...prevData]);
    message.success("새 이슈가 추가되었습니다!");
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
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            color: "#999",
            fontSize: "12px",
            fontStyle: "italic",
          }}
        >
          이미지 없음
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          position: "relative",
        }}
      >
        <Image.PreviewGroup>
          <Image
            src={firstImageUrl}
            alt="이슈 이미지"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "4px",
              border: "1px solid #e8e8e8",
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        </Image.PreviewGroup>
        {/* 여러 이미지가 있을 때 개수 표시 */}
        {imageUrls.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              backgroundColor: "#1890ff",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              border: "2px solid white",
            }}
          >
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
        style={{
          padding: "4px 8px",
          fontSize: "13px",
          color: startDate ? "#333" : "#999",
          fontStyle: startDate ? "normal" : "italic",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
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
        style={{
          padding: "4px 8px",
          fontSize: "13px",
          color: endDate ? "#333" : "#999",
          fontStyle: endDate ? "normal" : "italic",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
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
        <div key={index} style={{ marginBottom: "2px", lineHeight: "1.2" }}>
          • {line.trim()}
        </div>
      ));
    };

    return (
      <div
        style={{
          padding: "8px",
          fontSize: "12px",
          lineHeight: "1.4",
          color: detail ? "#333" : "#999",
          fontStyle: detail ? "normal" : "italic",
          maxHeight: "60px",
          overflow: "hidden",
        }}
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
        style={{
          padding: "8px",
          fontSize: "12px",
          lineHeight: "1.4",
          color: progress ? "#333" : "#999",
          fontStyle: progress ? "normal" : "italic",
          maxHeight: "60px",
          overflow: "hidden",
        }}
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
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            color: "#999",
            fontSize: "12px",
            fontStyle: "italic",
          }}
        >
          파일 없음
        </div>
      );
    }

    const fileName = firstFile.name || firstFile || "파일";

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "100%",
          }}
        >
          <span style={{ fontSize: "16px", color: "#1890ff" }}>📄</span>
          <span
            style={{
              fontSize: "12px",
              color: "#333",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "80px",
            }}
          >
            {fileName}
          </span>
        </div>
        {/* 여러 파일이 있을 때 개수 표시 */}
        {files.length > 1 && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              backgroundColor: "#1890ff",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              border: "2px solid white",
            }}
          >
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
      cellStyle: {
        color: "#1890ff",
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "center",
        fontWeight: "bold",
        fontSize: "13px",
        padding: "8px",
        display: "flex",
      },
    },
    {
      field: "img",
      headerName: "Image",
      editable: false,
      width: 120,
      cellRendererFramework: ImageCell,
      cellStyle: {
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "center !important",
        padding: "8px !important",
        height: "100% !important",
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

        return `
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            width: 100%;
          ">
            <div style="
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: bold;
              background-color: ${color};
              color: white;
              text-align: center;
              display: inline-block;
              min-width: 50px;
              flex-shrink: 0;
            ">${statusLabel}</div>
            <div style="
              font-size: 13px;
              color: #333;
              line-height: 1.3;
              flex: 1;
            ">${truncatedText}</div>
          </div>
        `;
      },
      cellStyle: {
        display: "flex !important",
        alignItems: "center !important",
        justifyContent: "flex-start !important",
        padding: "8px !important",
        height: "100% !important",
      },
    },
    {
      field: "detail",
      headerName: "이슈 상세",
      editable: false,
      minWidth: 300,
      flex: 1,
      cellRendererFramework: (params) => {
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
                height: "100%",
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

        return (
          <div
            style={{
              padding: "8px",
              fontSize: "13px",
              lineHeight: "1.0",
              color: "#333",
              maxHeight: "60px",
              overflow: "hidden",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <div
              dangerouslySetInnerHTML={createMarkup(detail)}
              className="rich-text-preview"
            />
          </div>
        );
      },
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "8px",
        height: "100%",
      },
    },
    {
      field: "start",
      headerName: "Start",
      editable: false,
      width: 120,
      cellRendererFramework: StartDateCell,
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
      cellRendererFramework: EndDateCell,
      cellStyle: {
        padding: "8px",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
      },
    },
  ];

  // 선택된 행의 상세 정보 컴포넌트
  const SelectedRowDetail = React.forwardRef(({ rowData }, ref) => {
    const [localIssueContent, setLocalIssueContent] = useState(
      rowData?.detail || ""
    );
    const [localSummaryContent, setLocalSummaryContent] = useState(
      rowData?.summary || ""
    );
    const [localCurrentStatus, setLocalCurrentStatus] = useState(
      rowData?.status || "pending"
    );
    const [localImageUrls, setLocalImageUrls] = useState(
      rowData?.img
        ? Array.isArray(rowData.img)
          ? rowData.img
          : [rowData.img]
        : []
    );
    const [localFileUrls, setLocalFileUrls] = useState(
      rowData?.file
        ? Array.isArray(rowData.file)
          ? rowData.file
          : [rowData.file]
        : []
    );
    const [localStartDate, setLocalStartDate] = useState(rowData?.start || "");
    const [localEndDate, setLocalEndDate] = useState(rowData?.end || "");

    // rowData가 변경될 때 로컬 상태 업데이트
    useEffect(() => {
      setLocalIssueContent(rowData?.detail || "");
      setLocalSummaryContent(rowData?.summary || "");
      setLocalCurrentStatus(rowData?.status || "pending");
      setLocalImageUrls(
        rowData?.img
          ? Array.isArray(rowData.img)
            ? rowData.img
            : [rowData.img]
          : []
      );
      setLocalFileUrls(
        rowData?.file
          ? Array.isArray(rowData.file)
            ? rowData.file
            : [rowData.file]
          : []
      );
      setLocalStartDate(rowData?.start || "");
      setLocalEndDate(rowData?.end || "");
    }, [rowData]);

    // ref를 통해 로컬 데이터를 외부로 전달
    React.useImperativeHandle(ref, () => ({
      getLocalData: () => ({
        issueContent: localIssueContent,
        summaryContent: localSummaryContent,
        currentStatus: localCurrentStatus,
        imageUrl: localImageUrls, // 이미지 URL 배열 전달
        fileUrl: localFileUrls, // 첨부파일 URL 배열 전달
        startDate: localStartDate, // 시작일 전달
        endDate: localEndDate, // 종료일 전달
      }),
    }));

    if (!rowData) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: "16px",
            backgroundColor: "#fafafa",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
          }}
        >
          📋 이슈를 선택하면 상세 정보를 편집할 수 있습니다
        </div>
      );
    }

    return (
      <div
        style={{
          height: "100%",
          padding: "20px",
          backgroundColor: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          overflow: "auto",
        }}
      >
        {/* 상태와 Summary 영역 */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
          >
            {/* 상태 선택 */}
            <div style={{ flex: "0 0 150px" }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                📊 상태
              </h3>
              <Select
                value={localCurrentStatus}
                onChange={(value) => setLocalCurrentStatus(value)}
                style={{ width: "100%" }}
                size="large"
                options={[
                  { value: "pending", label: "대기중" },
                  { value: "in-progress", label: "진행중" },
                  { value: "completed", label: "완료" },
                  { value: "blocked", label: "차단됨" },
                ]}
              />
            </div>

            {/* Summary 입력 */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  color: "#333",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                📝 Summary
              </h3>
              <Input
                value={localSummaryContent}
                onChange={(e) => setLocalSummaryContent(e.target.value)}
                placeholder="이슈에 대한 간단한 요약을 입력하세요..."
                style={{ width: "100%" }}
                size="large"
              />
            </div>
          </div>
        </div>

        {/* 날짜 설정 영역 */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            📅 날짜 설정
          </h3>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                시작일
              </div>
              <DatePicker
                value={localStartDate ? dayjs(localStartDate) : null}
                onChange={(date, dateString) => {
                  setLocalStartDate(dateString);
                }}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                size="large"
                placeholder="시작일 선택"
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                종료일
              </div>
              <DatePicker
                value={localEndDate ? dayjs(localEndDate) : null}
                onChange={(date, dateString) => {
                  setLocalEndDate(dateString);
                }}
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                size="large"
                placeholder="종료일 선택"
              />
            </div>
          </div>
        </div>

        {/* Issue 상세내용 리치 에디터 */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            📋 Issue 상세내용
          </h3>
          <div
            style={{
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <ReactQuill
              theme="snow"
              value={localIssueContent}
              onChange={setLocalIssueContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="이슈에 대한 상세 내용을 입력하세요..."
              style={{ height: "200px" }}
            />
          </div>
        </div>

        {/* 첨부 이미지 영역 */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            🖼️ 첨부 이미지
          </h3>
          <div
            style={{
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              transition: "all 0.3s",
            }}
          >
            {localImageUrls.length > 0 ? (
              <div>
                {/* 이미지 그리드 */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <Image.PreviewGroup>
                    {localImageUrls.map((imageUrl, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          border: "1px solid #e8e8e8",
                          borderRadius: "8px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={`이슈 이미지 ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            display: "block",
                          }}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                        />
                        <Button
                          type="primary"
                          danger
                          size="small"
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            padding: 0,
                          }}
                          onClick={() => {
                            setLocalImageUrls((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>

                {/* 추가 업로드 버튼 */}
                <Upload.Dragger
                  name="image"
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // 파일 크기 제한 (5MB)
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error("이미지는 5MB보다 작아야 합니다!");
                      return false;
                    }

                    // 이미지 파일인지 확인
                    if (!file.type.startsWith("image/")) {
                      message.error("이미지 파일만 업로드 가능합니다!");
                      return false;
                    }

                    // 이미지 URL을 로컬 상태에 추가
                    const uploadedImageUrl = URL.createObjectURL(file);
                    setLocalImageUrls((prev) => [...prev, uploadedImageUrl]);

                    message.success(
                      `${file.name} 이미지가 성공적으로 추가되었습니다.`
                    );
                    return false; // 자동 업로드 방지
                  }}
                  style={{
                    border: "2px dashed #d9d9d9",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                    transition: "all 0.3s",
                  }}
                >
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      ➕
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "4px",
                      }}
                    >
                      추가 이미지 업로드
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      클릭하거나 드래그하여 추가
                    </div>
                  </div>
                </Upload.Dragger>
              </div>
            ) : (
              <Upload.Dragger
                name="image"
                accept="image/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  // 파일 크기 제한 (5MB)
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error("이미지는 5MB보다 작아야 합니다!");
                    return false;
                  }

                  // 이미지 파일인지 확인
                  if (!file.type.startsWith("image/")) {
                    message.error("이미지 파일만 업로드 가능합니다!");
                    return false;
                  }

                  // 이미지 URL을 로컬 상태에 저장
                  const uploadedImageUrl = URL.createObjectURL(file);
                  setLocalImageUrls([uploadedImageUrl]); // 로컬 상태만 업데이트

                  message.success(
                    `${file.name} 이미지가 성공적으로 업로드되었습니다.`
                  );
                  return false; // 자동 업로드 방지
                }}
                style={{
                  border: "none",
                  background: "transparent",
                }}
              >
                <div style={{ padding: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    📁
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#333",
                    }}
                  >
                    이미지를 드래그하여 업로드
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "16px",
                    }}
                  >
                    또는 클릭하여 파일 선택
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    지원 형식: JPG, PNG, GIF (최대 5MB)
                  </div>
                </div>
              </Upload.Dragger>
            )}
          </div>
        </div>

        {/* 첨부 파일 영역 */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            📄 첨부 파일
          </h3>
          <div
            style={{
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              backgroundColor: "#fafafa",
              transition: "all 0.3s",
            }}
          >
            {localFileUrls.length > 0 ? (
              <div>
                {/* 파일 목록 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  {localFileUrls.map((fileUrl, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        backgroundColor: "#fff",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        <span style={{ fontSize: "20px", color: "#1890ff" }}>
                          📄
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#333",
                            wordBreak: "break-all",
                          }}
                        >
                          {fileUrl.name || `파일 ${index + 1}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            // 파일 다운로드
                            const link = document.createElement("a");
                            link.href = fileUrl;
                            link.download = fileUrl.name || `파일_${index + 1}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          style={{ padding: "4px 8px" }}
                        >
                          📥 다운로드
                        </Button>
                        <Button
                          type="primary"
                          danger
                          size="small"
                          onClick={() => {
                            setLocalFileUrls((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          style={{
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            padding: 0,
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 추가 업로드 버튼 */}
                <Upload.Dragger
                  name="file"
                  accept="*/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    // 파일 크기 제한 (10MB)
                    const isLt10M = file.size / 1024 / 1024 < 10;
                    if (!isLt10M) {
                      message.error("파일은 10MB보다 작아야 합니다!");
                      return false;
                    }

                    // 파일 URL을 로컬 상태에 추가
                    const uploadedFileUrl = URL.createObjectURL(file);
                    const fileWithName = {
                      url: uploadedFileUrl,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                    };
                    setLocalFileUrls((prev) => [...prev, fileWithName]);

                    message.success(
                      `${file.name} 파일이 성공적으로 추가되었습니다.`
                    );
                    return false; // 자동 업로드 방지
                  }}
                  style={{
                    border: "2px dashed #d9d9d9",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                    transition: "all 0.3s",
                  }}
                >
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                      ➕
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "4px",
                      }}
                    >
                      추가 파일 업로드
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      클릭하거나 드래그하여 추가
                    </div>
                  </div>
                </Upload.Dragger>
              </div>
            ) : (
              <Upload.Dragger
                name="file"
                accept="*/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  // 파일 크기 제한 (10MB)
                  const isLt10M = file.size / 1024 / 1024 < 10;
                  if (!isLt10M) {
                    message.error("파일은 10MB보다 작아야 합니다!");
                    return false;
                  }

                  // 파일 URL을 로컬 상태에 저장
                  const uploadedFileUrl = URL.createObjectURL(file);
                  const fileWithName = {
                    url: uploadedFileUrl,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  };
                  setLocalFileUrls([fileWithName]);

                  message.success(
                    `${file.name} 파일이 성공적으로 업로드되었습니다.`
                  );
                  return false; // 자동 업로드 방지
                }}
                style={{
                  border: "none",
                  background: "transparent",
                }}
              >
                <div style={{ padding: "20px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    📁
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#333",
                    }}
                  >
                    파일을 드래그하여 업로드
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "16px",
                    }}
                  >
                    또는 클릭하여 파일 선택
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    모든 파일 형식 지원 (최대 10MB)
                  </div>
                </div>
              </Upload.Dragger>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              // 데이터 업데이트 로직
              setRowData((prevData) =>
                prevData.map((row) =>
                  row.id === rowData.id
                    ? {
                        ...row,
                        detail: localIssueContent,
                        summary: localSummaryContent,
                        status: localCurrentStatus,
                        img: localImageUrls, // 이미지 URL 배열 업데이트
                        file: localFileUrls, // 첨부파일 URL 배열 업데이트
                        start: localStartDate, // 시작일 업데이트
                        end: localEndDate, // 종료일 업데이트
                      }
                    : row
                )
              );
              message.success("변경사항이 저장되었습니다!");
              // 드로워만 닫기
              setIsDrawerVisible(false);
            }}
          >
            💾 저장
          </Button>
        </div>
      </div>
    );
  });

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

  // 선택된 행이 변경될 때 상태 업데이트
  useEffect(() => {
    if (selectedRow) {
      setIssueContent(selectedRow.detail || "");
      setSummaryContent(selectedRow.summary || "");
      setCurrentStatus(selectedRow.status || "pending");
    }
  }, [selectedRow]);

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
        }}
        bodyStyle={{
          height: "85vh",
          padding: "24px",
          backgroundColor: "#fafafa",
          overflow: "auto",
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
        <Collapse
          defaultActiveKey={["2"]} // 기본적으로 전체 이슈 목록이 열려있음
          items={[
            {
              key: "1",
              label: (
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
              ),
              children: (
                <div style={{ height: "350px", minHeight: "350px" }}>
                  <GanttChart issueData={rowData} />
                </div>
              ),
            },
            {
              key: "2",
              label: (
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
                    📋 전체 이슈 목록 ({rowData.length}개)
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
              ),
              children: (
                <div
                  className="ag-theme-alpine"
                  style={{ height: "600px", minHeight: "600px", width: "100%" }}
                >
                  <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    rowHeight={80}
                    getRowHeight={(params) => {
                      const detail = params.data?.detail || "";
                      const lines = detail
                        .split("\n")
                        .filter((line) => line.trim() !== "");
                      const baseHeight = 80;
                      const lineHeight = 16;
                      // 3줄까지는 기본 높이, 4줄부터 추가 높이
                      const extraLines = Math.max(0, lines.length - 3);
                      const extraHeight = extraLines * lineHeight;
                      return baseHeight + extraHeight;
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
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        padding: "4px",
                      },
                    }}
                    pagination={true}
                    paginationPageSize={10}
                    suppressRowClickSelection={false}
                    rowSelection="single"
                    animateRows={true}
                    onRowDoubleClicked={onRowClicked}
                    // 기본 정렬 설정
                    defaultSortModel={[
                      { colId: "end", sort: "desc" }, // 종료일 기준 내림차순 (늦을수록 위로, 없으면 최상단)
                      { colId: "start", sort: "desc" }, // 시작일 기준 내림차순 (늦을수록 위로)
                      { colId: "category", sort: "asc" }, // 카테고리 기준 오름차순
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
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
        onClose={() => {
          // 드로워 닫을 때 자동 저장
          if (selectedRow && drawerRef.current) {
            const localData = drawerRef.current.getLocalData();
            if (localData) {
              saveDrawerData(localData);
            }
          }
          setIsDrawerVisible(false);
        }}
        open={isDrawerVisible}
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        <SelectedRowDetail rowData={selectedRow} ref={drawerRef} />
      </Drawer>
    </>
  );
};

export default IssueModal;
