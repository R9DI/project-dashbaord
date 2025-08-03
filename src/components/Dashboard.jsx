import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Row,
  Col,
  InputNumber,
} from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  IssuesCloseOutlined,
} from "@ant-design/icons";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import IssueModal from "./IssueModal";

const { Text } = Typography;

const Dashboard = () => {
  const [rowData, setRowData] = useState([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const gridRef = useRef(null);
  const [colorSettings, setColorSettings] = useState({
    inlinePassRate: { high: 90, low: 70 },
    elecPassRate: { high: 90, low: 70 },
    issueResponseIndex: { high: 90, low: 70 },
    wipAchievementRate: { high: 90, low: 70 },
    deadlineAchievementRate: { high: 90, low: 70 },
    finalScore: { high: 90, low: 70 },
  });

  // 샘플 데이터 생성
  const generateSampleData = () => {
    return [
      {
        id: 1,
        projectName: "5G 네트워크 최적화",
        inlinePassRate: 0.95,
        elecPassRate: 0.88,
        issueResponseIndex: 0.92,
        wipAchievementRate: 0.87,
        deadlineAchievementRate: 0.85,
        finalScore: 0.95 * 0.88 * 0.92 * 0.87 * 0.85,
        remark: "정상 진행 중",
      },
      {
        id: 2,
        projectName: "AI 기반 품질 검사",
        inlinePassRate: 0.78,
        elecPassRate: 0.82,
        issueResponseIndex: 0.75,
        wipAchievementRate: 0.8,
        deadlineAchievementRate: 0.72,
        finalScore: 0.78 * 0.82 * 0.75 * 0.8 * 0.72,
        remark: "일정 지연 발생",
      },
      {
        id: 3,
        projectName: "IoT 센서 데이터 분석",
        inlinePassRate: 0.92,
        elecPassRate: 0.95,
        issueResponseIndex: 0.89,
        wipAchievementRate: 0.93,
        deadlineAchievementRate: 0.9,
        finalScore: 0.92 * 0.95 * 0.89 * 0.93 * 0.9,
        remark: "테스트 완료",
      },
      {
        id: 4,
        projectName: "클라우드 마이그레이션",
        inlinePassRate: 0.85,
        elecPassRate: 0.79,
        issueResponseIndex: 0.83,
        wipAchievementRate: 0.76,
        deadlineAchievementRate: 0.78,
        finalScore: 0.85 * 0.79 * 0.83 * 0.76 * 0.78,
        remark: "기술적 난제 해결 중",
      },
      {
        id: 5,
        projectName: "보안 인증 시스템",
        inlinePassRate: 0.98,
        elecPassRate: 0.96,
        issueResponseIndex: 0.97,
        wipAchievementRate: 0.95,
        deadlineAchievementRate: 0.94,
        finalScore: 0.98 * 0.96 * 0.97 * 0.95 * 0.94,
        remark: "배포 준비 중",
      },
      {
        id: 6,
        projectName: "자율주행 알고리즘",
        inlinePassRate: 0.72,
        elecPassRate: 0.68,
        issueResponseIndex: 0.7,
        wipAchievementRate: 0.65,
        deadlineAchievementRate: 0.6,
        finalScore: 0.72 * 0.68 * 0.7 * 0.65 * 0.6,
        remark: "품질 이슈 발생",
      },
    ];
  };

  // 셀 스타일 결정 함수
  const getCellStyle = (params) => {
    const field = params.column.colId;
    const value = params.value;
    const settings = colorSettings[field];

    console.log("getCellStyle called:", { field, value, settings });

    if (!settings) return {};

    // 퍼센트 기준값을 소수값으로 변환
    const highThreshold = settings.high / 100;
    const lowThreshold = settings.low / 100;

    // 모든 값이 소수값이므로 그대로 비교
    const compareValue = value;

    console.log("Color calculation:", {
      field,
      compareValue,
      highThreshold,
      lowThreshold,
    });

    if (compareValue >= highThreshold) {
      return {
        backgroundColor: field === "finalScore" ? "#4CAF50" : "#E8F5E8",
      };
    } else if (compareValue >= lowThreshold) {
      return {
        backgroundColor: field === "finalScore" ? "#FF9800" : "#FFF3E0",
      };
    } else {
      return {
        backgroundColor: field === "finalScore" ? "#F44336" : "#FFEBEE",
      };
    }
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
        cellStyle: getCellStyle,
      },
      {
        headerName: "Elec 합격률 (%)",
        field: "elecPassRate",
        width: 160,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: getCellStyle,
      },
      {
        headerName: "Issue 대응지수 (%)",
        field: "issueResponseIndex",
        width: 170,
        cellRenderer: (params) => {
          const projectId = params.data.id;
          return `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <span>${Math.round(params.value * 100)}%</span>
            <button 
              class="issue-btn" 
              data-project-id="${projectId}"
              style="
                background: #1890ff; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                padding: 2px 6px; 
                font-size: 12px; 
                cursor: pointer; 
                margin-left: 8px;
                min-width: 32px;
                height: 24px;
              "
            >
              🔧
            </button>
          </div>
        `;
        },
        cellStyle: getCellStyle,
        onCellClicked: (params) => {
          // 버튼 클릭 이벤트 처리
          const target = params.event.target;
          if (target.classList.contains("issue-btn")) {
            setSelectedRowData(params.data);
            setIsIssueModalVisible(true);
          }
        },
      },
      {
        headerName: "WIP 실적 달성률 (%)",
        field: "wipAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: getCellStyle,
      },
      {
        headerName: "과제 납기달성률 (%)",
        field: "deadlineAchievementRate",
        width: 190,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: getCellStyle,
      },
      {
        headerName: "Final Score",
        field: "finalScore",
        width: 150,
        cellRenderer: (params) => `${Math.round(params.value * 100)}%`,
        cellStyle: getCellStyle,
      },
      {
        headerName: "Remark",
        field: "remark",
        width: 150,
      },
    ],
    [colorSettings]
  ); // colorSettings가 변경될 때마다 columnDefs 재생성

  // 설정 저장
  const handleSettingsSave = (values) => {
    console.log("Settings saved:", values);
    setColorSettings(values);
    setIsSettingsModalVisible(false);
  };

  // 데이터 새로고침
  const refreshData = () => {
    const newData = generateSampleData();
    setRowData(newData);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initialData = generateSampleData();
    setRowData(initialData);
  }, []);

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
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={refreshData}
            >
              새 데이터 생성
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refreshData}>
              데이터 새로고침
            </Button>
            <Button
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => setIsSettingsModalVisible(true)}
            >
              색상 기준 설정
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
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={10}
            rowHeight={60}
            ref={gridRef}
          />
        </div>
      </Card>

      {/* 색상 기준 설정 모달 */}
      <Modal
        title="색상 기준 설정"
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          initialValues={colorSettings}
          onFinish={handleSettingsSave}
          layout="vertical"
        >
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#f0f8ff",
              borderRadius: "8px",
            }}
          >
            <Text strong>색상 기준:</Text>
            <div style={{ marginTop: "8px" }}>
              <Tag color="green">녹색: 기준값 이상</Tag>
              <Tag color="gold">노란색: 낮은 기준값 ~ 높은 기준값</Tag>
              <Tag color="red">빨간색: 낮은 기준값 미만</Tag>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Inline 합격률"
                name={["inlinePassRate", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["inlinePassRate", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Elec 합격률"
                name={["elecPassRate", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["elecPassRate", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Issue 대응지수"
                name={["issueResponseIndex", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["issueResponseIndex", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="WIP 실적 달성률"
                name={["wipAchievementRate", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["wipAchievementRate", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="과제 납기달성률"
                name={["deadlineAchievementRate", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["deadlineAchievementRate", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Final Score"
                name={["finalScore", "high"]}
                rules={[
                  { required: true, message: "높은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="높은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label=" "
                name={["finalScore", "low"]}
                rules={[
                  { required: true, message: "낮은 기준값을 입력하세요" },
                ]}
              >
                <InputNumber
                  placeholder="낮은 기준값"
                  min={0}
                  max={100}
                  step={1}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right", marginTop: "16px" }}>
            <Space>
              <Button onClick={() => setIsSettingsModalVisible(false)}>
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                저장
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Issue Modal */}
      <IssueModal
        isVisible={isIssueModalVisible}
        onClose={() => setIsIssueModalVisible(false)}
        data={selectedRowData} // Pass selectedRowData to the modal
      />
    </>
  );
};

export default Dashboard;
