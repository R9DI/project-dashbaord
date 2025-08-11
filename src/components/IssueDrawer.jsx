import React, { useState, useEffect, useMemo } from "react";
import {
  Drawer,
  Button,
  message,
  Modal,
  Tabs,
  Tooltip,
  Select,
  Input,
  DatePicker,
  Upload,
  Image,
} from "antd";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TurndownService from "turndown";
import dayjs from "dayjs";

const IssueDrawer = ({
  isVisible,
  onClose,
  selectedRow,
  projectId,
  onSave,
  isSaving,
}) => {
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

  // 드로워 내부 상태 관리
  const [localIssueContent, setLocalIssueContent] = useState("");
  const [localSummaryContent, setLocalSummaryContent] = useState("");
  const [localCurrentStatus, setLocalCurrentStatus] = useState("pending");
  const [localImageUrls, setLocalImageUrls] = useState([]);
  const [localFileUrls, setLocalFileUrls] = useState([]);
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

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
    if (!isVisible && selectedRow) {
      handleSave();
    }
  }, [isVisible, selectedRow]);

  // 저장 함수
  const handleSave = () => {
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

      onSave(selectedRow.id, updatedData);
    }
  };

  // 드로워 닫기
  const handleClose = () => {
    onClose();
  };

  return (
    <Drawer
      title={
        <div className="text-base font-semibold text-blue-500 flex items-center gap-2">
          📋 {selectedRow?.issue || "이슈 상세 정보 편집"}
          {projectId && (
            <span className="text-xs text-gray-500 ml-2">
              (프로젝트 {projectId})
            </span>
          )}
        </div>
      }
      placement="right"
      width="66.67%"
      maskClosable={true}
      closable={true}
      onClose={handleClose}
      open={isVisible}
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
                                navigator.clipboard.readText().then((text) => {
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
                                    message.info("클립보드에 HTML이 없습니다.");
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
                                const html = clipboardData.getData("text/html");
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
                                    setLocalIssueContent((prev) => prev + text);
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
            <Button
              type="primary"
              size="large"
              onClick={handleSave}
              loading={isSaving}
            >
              💾 저장
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default IssueDrawer;
