import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Button,
  Upload,
  DatePicker,
  Image,
  Input,
  Select,
  Space,
  message,
} from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";

const DrawerContent = forwardRef(({ selectedRow, onSave }, ref) => {
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

  // 로컬 상태 관리
  const [localIssueContent, setLocalIssueContent] = useState("");
  const [localSummaryContent, setLocalSummaryContent] = useState("");
  const [localCurrentStatus, setLocalCurrentStatus] = useState("pending");
  const [localImageUrls, setLocalImageUrls] = useState([]);
  const [localFileUrls, setLocalFileUrls] = useState([]);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  // 선택된 행이 변경될 때 상태 초기화
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

  // 부모 컴포넌트에서 호출할 수 있는 메서드들
  useImperativeHandle(ref, () => ({
    getData: () => ({
      issueContent: localIssueContent,
      summaryContent: localSummaryContent,
      currentStatus: localCurrentStatus,
      imageUrls: localImageUrls,
      fileUrls: localFileUrls,
      startDate: localStartDate,
      endDate: localEndDate,
    }),
  }));

  const handleSave = () => {
    onSave({
      issueContent: localIssueContent,
      summaryContent: localSummaryContent,
      currentStatus: localCurrentStatus,
      imageUrls: localImageUrls,
      fileUrls: localFileUrls,
      startDate: localStartDate,
      endDate: localEndDate,
    });
  };

  if (!selectedRow) {
    return <div>선택된 이슈가 없습니다.</div>;
  }

  return (
    <div style={{ padding: "20px", height: "100%", overflow: "auto" }}>
      {/* 상태 및 요약 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            color: "#333",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          📊 상태 및 요약
        </h3>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: "0 0 120px" }}>
            <Select
              value={localCurrentStatus}
              onChange={setLocalCurrentStatus}
              style={{ width: "100%" }}
            >
              <Select.Option value="pending">대기 중</Select.Option>
              <Select.Option value="in_progress">진행 중</Select.Option>
              <Select.Option value="completed">완료</Select.Option>
              <Select.Option value="blocked">차단됨</Select.Option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Input
              value={localSummaryContent}
              onChange={(e) => setLocalSummaryContent(e.target.value)}
              placeholder="Summary를 입력해주세요"
            />
          </div>
        </div>
      </div>

      {/* 날짜 설정 */}
      <div style={{ marginBottom: "20px" }}>
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
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <DatePicker
              value={localStartDate ? dayjs(localStartDate) : null}
              onChange={(date) =>
                setLocalStartDate(date ? date.format("YYYY-MM-DD") : "")
              }
              style={{ width: "100%" }}
              placeholder="시작일 선택"
            />
          </div>
          <div style={{ flex: 1 }}>
            <DatePicker
              value={localEndDate ? dayjs(localEndDate) : null}
              onChange={(date) =>
                setLocalEndDate(date ? date.format("YYYY-MM-DD") : "")
              }
              style={{ width: "100%" }}
              placeholder="종료일 선택"
            />
          </div>
        </div>
      </div>

      {/* 이슈 상세 내용 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            color: "#333",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          📝 Issue 상세내용
        </h3>
        <ReactQuill
          value={localIssueContent}
          onChange={setLocalIssueContent}
          modules={quillModules}
          formats={quillFormats}
          style={{
            height: "200px",
            marginBottom: "50px",
          }}
          placeholder="이슈 상세 내용을 입력하세요..."
        />
      </div>

      {/* 이미지 업로드 영역 */}
      <div style={{ marginBottom: "20px" }}>
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
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            backgroundColor: "#fff",
            transition: "all 0.3s",
            minHeight: "250px", // 최소 높이 고정
          }}
        >
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
              message.success(
                `${file.name} 이미지가 성공적으로 추가되었습니다.`
              );
              return false;
            }}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
            }}
          >
            {localImageUrls.length > 0 ? (
              <Image.PreviewGroup>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "8px",
                    width: "100%",
                  }}
                >
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
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation(); // 여기 중요!
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
              <div style={{ padding: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
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
            )}
          </Upload.Dragger>
        </div>
      </div>

      {/* 첨부 파일 영역 */}
      {/* 📄 첨부 파일 */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            marginBottom: "12px",
            color: "#333",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          📄 첨부 파일
        </h3>
        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "16px",
            backgroundColor: "#fff",
            minHeight: "180px",
          }}
        >
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
              message.success(`${file.name} 파일이 업로드되었습니다.`);
              return false;
            }}
            style={{ border: "none", background: "transparent" }}
          >
            {localFileUrls.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
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
                      border: "1px solid #eee",
                      borderRadius: "6px",
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
                          const link = document.createElement("a");
                          link.href = fileUrl.url || fileUrl;
                          link.download = fileUrl.name || `file_${index + 1}`;
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
                        style={{
                          borderRadius: "50%",
                          width: "28px",
                          height: "28px",
                          fontSize: "12px",
                          padding: 0,
                        }}
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
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
                <div
                  style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}
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
            )}
          </Upload.Dragger>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button type="primary" size="large" onClick={handleSave}>
          💾 저장
        </Button>
      </div>
    </div>
  );
});

export default DrawerContent;
