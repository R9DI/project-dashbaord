import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Button,
  Upload,
  message,
  DatePicker,
  Image,
  Tag,
  Table,
  Tabs,
  Input,
  Select,
  Drawer,
} from "antd";
import GanttChart from "./GanttChart.jsx";
import { AgGridReact } from "ag-grid-react";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

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

  // props 변경 감지
  useEffect(() => {
    setIsModalVisible(isVisible);
  }, [isVisible]);

  // 모달이 닫힐 때 onClose 호출
  const handleCancel = () => {
    setIsModalVisible(false);
    if (onClose) onClose();
  };

  const initialData = [
    {
      id: 1,
      category: "개발",
      issue: "로그인 기능 오류",
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
      category: "디자인",
      issue: "UI 반응형 개선",
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
      category: "테스트",
      issue: "성능 테스트 필요",
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
      category: "보안",
      issue: "XSS 취약점 패치",
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
      category: "인프라",
      issue: "서버 확장성 개선",
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
      category: "사용자 경험",
      issue: "페이지 로딩 속도 개선",
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
  const [selectedRow, setSelectedRow] = useState(null); // 선택된 행 데이터

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

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setSelectedRow(null);
  };

  const addNewIssue = () => {
    const newId = Math.max(...rowData.map((row) => row.id), 0) + 1;
    const today = dayjs().format("YYYY-MM-DD");
    const nextWeek = dayjs().add(7, "day").format("YYYY-MM-DD");

    const newIssue = {
      id: newId,
      category: "새 카테고리",
      issue: "새 이슈",
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

  // 이미지 업로드/표시 셀 렌더러
  const ImageCell = (props) => {
    const imageUrl = props.value;
    const rowId = props.data.id;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);

    // 이미지 업로드 처리
    const handleImageUpload = (info) => {
      // 파일이 선택되면 즉시 처리
      if (info.fileList && info.fileList.length > 0) {
        const file = info.fileList[0];

        // 파일 크기 제한 (5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error("이미지는 5MB보다 작아야 합니다!");
          return;
        }

        // 이미지 파일인지 확인
        if (!file.type.startsWith("image/")) {
          message.error("이미지 파일만 업로드 가능합니다!");
          return;
        }

        message.success(`${file.name} 이미지가 성공적으로 업로드되었습니다.`);

        // 이미지 URL을 데이터에 저장
        const uploadedImageUrl = URL.createObjectURL(file);
        setRowData((prevData) =>
          prevData.map((row) =>
            row.id === rowId ? { ...row, img: uploadedImageUrl } : { ...row }
          )
        );
      }
    };

    const uploadProps = {
      name: "image",
      accept: "image/*",
      showUploadList: false,
      onChange: handleImageUpload,
      beforeUpload: () => false, // 자동 업로드 방지
    };

    // 이미지가 없을 때 업로드 버튼 표시
    if (!imageUrl) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
          }}
        >
          <Upload {...uploadProps}>
            <Button
              type="dashed"
              size="small"
              icon={<UploadOutlined />}
              style={{
                fontSize: "12px",
                width: "100%",
                height: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <div>이미지 업로드</div>
              <div style={{ fontSize: "10px", color: "#999" }}>
                클릭하여 선택
              </div>
            </Button>
          </Upload>
        </div>
      );
    }

    if (imageError) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "8px",
          }}
        >
          <span style={{ color: "#ff4d4f", fontSize: "12px" }}>
            이미지 로드 실패
          </span>
          <Upload {...uploadProps}>
            <Button size="small" type="primary">
              다시 업로드
            </Button>
          </Upload>
        </div>
      );
    }

    const handleImageLoad = (e) => {
      const img = e.target;
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);

      // 이미지 로드 후 그리드 리사이즈 트리거
      setTimeout(() => {
        if (props.api) {
          props.api.resetRowHeights();
        }
      }, 100);
    };

    // 이미지 비율 계산
    const getImageStyle = () => {
      if (!imageLoaded || !imageSize.width || !imageSize.height) {
        return {
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain",
        };
      }

      // 실제 컨테이너 크기 가져오기
      const container = containerRef.current;
      const containerWidth = container ? container.offsetWidth - 8 : 180; // 패딩 고려
      const containerHeight = container ? container.offsetHeight - 8 : 80; // 패딩 고려

      const imageRatio = imageSize.width / imageSize.height;
      const containerRatio = containerWidth / containerHeight;

      let finalWidth, finalHeight;

      if (imageRatio > containerRatio) {
        // 이미지가 가로로 긴 경우 - 가로를 컨테이너에 맞춤
        finalWidth = containerWidth;
        finalHeight = containerWidth / imageRatio;
      } else {
        // 이미지가 세로로 긴 경우 - 세로를 컨테이너에 맞춤
        finalHeight = containerHeight;
        finalWidth = containerHeight * imageRatio;
      }

      return {
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
        objectFit: "contain",
      };
    };

    return (
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          minHeight: "80px",
          minWidth: "180px",
          padding: "4px",
          boxSizing: "border-box",
          flexShrink: 0,
          flexGrow: 1,
          position: "relative",
        }}
      >
        {!imageLoaded && (
          <div style={{ color: "#999", fontSize: "12px" }}>로딩중...</div>
        )}
        <Image
          src={imageUrl}
          alt="이슈 이미지"
          style={{
            ...getImageStyle(),
            display: imageLoaded ? "block" : "none",
            margin: "0 auto",
            borderRadius: "4px",
            border: "1px solid #e8e8e8",
            flexShrink: 0,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          preview={{
            mask: "클릭하여 확대",
            maskClassName: "custom-mask",
          }}
          onLoad={handleImageLoad}
          onError={() => setImageError(true)}
        />

        {/* 이미지 교체 버튼 (호버 시 표시) */}
        <div
          style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            opacity: 0,
            transition: "opacity 0.2s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0)}
        >
          <Upload {...uploadProps}>
            <Button
              size="small"
              type="primary"
              style={{
                minWidth: "auto",
                padding: "2px 6px",
                fontSize: "10px",
                borderRadius: "12px",
              }}
            >
              교체
            </Button>
          </Upload>
        </div>
      </div>
    );
  };

  // Start Date 셀 렌더러
  const StartDateCell = (props) => {
    const currentRow = props.data;
    const startDate = currentRow?.start || "";
    const rowId = currentRow?.id;

    const handleStartChange = (date, dateString) => {
      setRowData((prevData) =>
        prevData.map((row) =>
          row.id === rowId ? { ...row, start: dateString } : { ...row }
        )
      );
    };

    return (
      <DatePicker
        size="small"
        value={startDate && startDate !== "" ? dayjs(startDate) : null}
        onChange={handleStartChange}
        format="YYYY-MM-DD"
        style={{ width: "100%" }}
        placeholder="시작일"
      />
    );
  };

  // End Date 셀 렌더러
  const EndDateCell = (props) => {
    const currentRow = props.data;
    const endDate = currentRow?.end || "";
    const rowId = currentRow?.id;

    const handleEndChange = (date, dateString) => {
      setRowData((prevData) =>
        prevData.map((row) =>
          row.id === rowId ? { ...row, end: dateString } : { ...row }
        )
      );
    };

    return (
      <DatePicker
        size="small"
        value={endDate && endDate !== "" ? dayjs(endDate) : null}
        onChange={handleEndChange}
        format="YYYY-MM-DD"
        style={{ width: "100%" }}
        placeholder="종료일"
        allowClear={true}
      />
    );
  };

  // Detail 컬럼 셀 렌더러 (간단한 버전)
  const DetailCell = (props) => {
    const currentRow = props.data;
    const detail = currentRow?.detail || "";
    const rowId = currentRow?.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(detail);

    const handleDoubleClick = () => {
      setIsEditing(true);
      setEditValue(detail);
    };

    const handleSave = () => {
      setRowData((prevData) =>
        prevData.map((row) =>
          row.id === rowId ? { ...row, detail: editValue } : { ...row }
        )
      );
      setIsEditing(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        // Shift + Enter: 새 줄 추가 (기본 동작 허용)
        return;
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Enter만: 저장
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        // Escape: 취소
        e.preventDefault();
        setIsEditing(false);
        setEditValue(detail);
      }
    };

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

    if (isEditing) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "8px",
              resize: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "1.2",
              boxSizing: "border-box",
            }}
            autoFocus
          />
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
          cursor: "pointer",
          textAlign: "left",
          padding: "4px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
        onDoubleClick={handleDoubleClick}
      >
        {formatDetailText(detail)}
      </div>
    );
  };

  // 진행사항 셀 렌더러
  const ProgressCell = (props) => {
    const progress = props.value || "";
    const rowId = props.data.id;
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(progress);

    const handleDoubleClick = () => {
      setIsEditing(true);
      setEditValue(progress);
    };

    const handleSave = () => {
      setRowData((prevData) =>
        prevData.map((row) => {
          if (row.id === rowId) {
            return { ...row, progress: editValue };
          }
          return row;
        })
      );
      setIsEditing(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        // Shift + Enter: 새 줄 추가 (기본 동작 허용)
        return;
      } else if (e.key === "Enter" && !e.shiftKey) {
        // Enter만: 저장
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        // Escape: 취소
        e.preventDefault();
        setIsEditing(false);
        setEditValue(progress);
      }
    };

    if (isEditing) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            style={{
              width: "100%",
              height: "100%",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              padding: "6px",
              resize: "none",
              fontFamily: "inherit",
              fontSize: "12px",
              lineHeight: "1.3",
              boxSizing: "border-box",
            }}
            autoFocus
            placeholder="진행사항을 입력하세요..."
          />
        </div>
      );
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100%",
          cursor: "pointer",
          padding: "4px 6px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          fontSize: "12px",
          lineHeight: "1.3",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          color: progress ? "#333" : "#999",
        }}
        onDoubleClick={handleDoubleClick}
      >
        {progress || "진행사항 입력..."}
      </div>
    );
  };

  // 파일 업로드/다운로드 셀 렌더러
  const FileCell = (props) => {
    const fileData = props.value;
    const rowId = props.data.id;

    const handleUpload = (info) => {
      if (info.file.status === "done") {
        message.success(
          `${info.file.name} 파일이 성공적으로 업로드되었습니다.`
        );

        // 파일 정보를 데이터에 저장
        setRowData((prevData) =>
          prevData.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  file: info.file.name,
                  fileUrl: info.file.response?.url,
                }
              : { ...row }
          )
        );
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
      }
    };

    const uploadProps = {
      name: "file",
      action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188", // 임시 업로드 URL
      headers: {
        authorization: "authorization-text",
      },
      onChange: handleUpload,
      showUploadList: false,
    };

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Upload {...uploadProps}>
          <Button
            type="primary"
            size="small"
            icon={<UploadOutlined />}
            style={{ fontSize: "12px" }}
          >
            업로드
          </Button>
        </Upload>
        {fileData && (
          <Button
            type="link"
            size="small"
            onClick={() => {
              // 파일 다운로드 로직
              console.log("파일 다운로드:", fileData);
              message.info(`${fileData} 파일을 다운로드합니다.`);
            }}
            style={{ fontSize: "12px", padding: "0 4px" }}
          >
            📄 {fileData}
          </Button>
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
      },
    },
    {
      field: "category",
      headerName: "Category",
      editable: true,
      width: 120,
      cellStyle: {
        fontWeight: "bold",
        textAlign: "left",
        justifyContent: "flex-start",
      },
    },
    {
      field: "img",
      headerName: "Image",
      editable: false,
      minWidth: 200,
      maxWidth: 250,
      cellRendererFramework: ImageCell,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        height: "100%",
        minWidth: "200px",
        overflow: "visible",
      },
    },
    {
      field: "detail",
      headerName: "이슈",
      editable: false,
      minWidth: 300,
      flex: 1,
      cellRendererFramework: DetailCell,
      cellStyle: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        textAlign: "left",
        padding: "8px",
        height: "100%",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      },
    },

    {
      field: "start",
      headerName: "Start",
      editable: false,
      minWidth: 120,
      cellRendererFramework: StartDateCell,
      cellStyle: { padding: "4px" },
    },
    {
      field: "end",
      headerName: "End",
      editable: false,
      minWidth: 120,
      cellRendererFramework: EndDateCell,
      cellStyle: { padding: "4px" },
    },
    {
      field: "file",
      headerName: "File",
      editable: false,
      minWidth: 150,
      cellRendererFramework: FileCell,
    },
  ];

  // 선택된 행의 상세 정보 컴포넌트
  const SelectedRowDetail = ({ rowData }) => {
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
          📋 이슈를 선택하면 상세 정보가 여기에 표시됩니다
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
        {/* 헤더 영역 - 한 줄로 통합 */}
        <div
          style={{
            marginBottom: "12px",
            padding: "12px 16px",
            backgroundColor: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: "8px",
            fontWeight: "600",
            color: "#1890ff",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "16px" }}>
              {rowData.issue}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
              }}
            >
              <span>
                📂 <strong>{rowData.category}</strong>
              </span>
              <span>
                📅 <strong>{rowData.start || "미정"}</strong>
              </span>
              <span>
                ⏰ <strong>{rowData.end || "미정"}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 이슈 상세 영역 */}
        <div style={{ marginBottom: "24px", height: "400px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              color: "#333",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            📝 이슈 상세
          </h3>
          <div>
            {rowData.detail ? (
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  border: "1px solid #e8e8e8",
                }}
              >
                <Tabs
                  type="card"
                  size="small"
                  style={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "6px",
                    overflow: "hidden",
                    margin: 0,
                  }}
                  items={rowData.detail
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((line, index) => ({
                      key: index.toString(),
                      label: (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#1890ff",
                              backgroundColor: "#e6f7ff",
                              padding: "2px 6px",
                              borderRadius: "12px",
                              minWidth: "20px",
                              textAlign: "center",
                            }}
                          >
                            {index + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              maxWidth: "100px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontWeight: "500",
                            }}
                          >
                            {line.trim().substring(0, 15)}
                            {line.trim().length > 15 ? "..." : ""}
                          </span>
                        </div>
                      ),
                      children: (
                        <div
                          style={{
                            padding: "16px",
                            backgroundColor: "#fafafa",
                            borderRadius: "0 0 6px 6px",
                            height: "270px",
                            overflow: "auto",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* 상단: 상태 선택 영역 */}
                            <div style={{ marginBottom: "12px" }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                📊 상태
                              </div>
                              <Select
                                defaultValue="pending"
                                style={{ width: "200px" }}
                                size="middle"
                                options={[
                                  { value: "pending", label: "대기중" },
                                  { value: "in-progress", label: "진행중" },
                                  { value: "completed", label: "완료" },
                                  { value: "blocked", label: "차단됨" },
                                ]}
                              />
                            </div>

                            {/* 하단: 텍스트 입력 영역 */}
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  marginBottom: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                📝 상세 내용
                              </div>
                              <ReactQuill
                                theme="snow"
                                value={line.trim()}
                                onChange={(content) => {
                                  // 리치 에디터의 내용이 변경될 때 처리
                                  console.log("Content changed:", content);
                                }}
                                modules={quillModules}
                                formats={quillFormats}
                                placeholder="내용을 입력하세요..."
                                style={{
                                  height: "170px",
                                  fontSize: "14px",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    }))}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#999",
                  minHeight: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                상세 내용이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 첨부 이미지 영역 */}
        {rowData.img && (
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
                textAlign: "center",
                padding: "16px",
                backgroundColor: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "6px",
              }}
            >
              <img
                src={rowData.img}
                alt="이슈 이미지"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  borderRadius: "6px",
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>
        )}

        {/* 첨부 파일 영역 */}
        {rowData.file && (
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
                padding: "16px",
                backgroundColor: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  color: "#1890ff",
                }}
              >
                📄
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                {rowData.file}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        }}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            style={{ borderRadius: "6px" }}
          >
            닫기
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            style={{ borderRadius: "6px" }}
          >
            저장
          </Button>,
        ]}
      >
        {/* 간트 차트 */}
        <div style={{ height: "40%", marginBottom: "16px" }}>
          <GanttChart issueData={rowData} />
        </div>

        {/* 전체 이슈 목록 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "60%",
          }}
        >
          <div
            style={{
              marginBottom: "12px",
              padding: "12px 16px",
              backgroundColor: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: "8px",
              fontWeight: "600",
              color: "#1890ff",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              📋 전체 이슈 목록 ({rowData.length}개)
            </div>
            <Button
              type="primary"
              onClick={addNewIssue}
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
          <div className="ag-theme-alpine" style={{ flex: 1, width: "100%" }}>
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
                  alignItems: "center",
                  padding: "8px",
                },
              }}
              pagination={true}
              paginationPageSize={10}
              suppressRowClickSelection={false}
              rowSelection="single"
              animateRows={true}
              onRowClicked={(event) => {
                setSelectedRow(event.data);
                showDrawer();
              }}
              // 기본 정렬 설정
              defaultSortModel={[
                { colId: "end", sort: "desc" }, // 종료일 기준 내림차순 (늦을수록 위로, 없으면 최상단)
                { colId: "start", sort: "desc" }, // 시작일 기준 내림차순 (늦을수록 위로)
                { colId: "category", sort: "asc" }, // 카테고리 기준 오름차순
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* Drawer for 상세 정보 */}
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
            📋 이슈 상세 정보
          </div>
        }
        placement="right"
        width={600}
        onClose={closeDrawer}
        open={isDrawerVisible}
        bodyStyle={{
          padding: "20px",
          backgroundColor: "#fafafa",
        }}
        headerStyle={{
          backgroundColor: "#e6f7ff",
          borderBottom: "1px solid #91d5ff",
        }}
      >
        <SelectedRowDetail rowData={selectedRow} />
      </Drawer>
    </>
  );
};

export default IssueModal;
