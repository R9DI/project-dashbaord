import React, { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";
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
  message,
} from "antd";
import {
  BarChartOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  IssuesCloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule]);
import IssueModal from "./IssueModal";

const { Text } = Typography;

const Dashboard = () => {
  const [rowData, setRowData] = useState([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const gridRef = useRef(null);
  const [colorSettings, setColorSettings] = useState({
    inlinePassRate: { high: 90, low: 70 },
    elecPassRate: { high: 90, low: 70 },
    issueResponseIndex: { high: 90, low: 70 },
    wipAchievementRate: { high: 90, low: 70 },
    deadlineAchievementRate: { high: 90, low: 70 },
    finalScore: { high: 90, low: 70 },
  });

  // 랜덤 값 생성 함수
  const generateRandomValue = (min, max) => {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  };

  // 랜덤 프로젝트명 생성
  const projectNames = [
    "5G 네트워크 최적화",
    "AI 기반 품질 검사",
    "IoT 센서 데이터 분석",
    "클라우드 마이그레이션",
    "보안 인증 시스템",
    "자율주행 알고리즘",
    "블록체인 거래 시스템",
    "머신러닝 모델 개발",
    "모바일 앱 최적화",
    "웹 서비스 확장",
    "데이터베이스 성능 개선",
    "API 게이트웨이 구축",
    "마이크로서비스 아키텍처",
    "DevOps 파이프라인 구축",
    "사용자 인터페이스 개선",
  ];

  const remarks = [
    "정상 진행 중",
    "일정 지연 발생",
    "테스트 완료",
    "기술적 난제 해결 중",
    "배포 준비 중",
    "품질 이슈 발생",
    "코드 리뷰 진행 중",
    "성능 최적화 중",
    "보안 검토 완료",
    "사용자 테스트 진행",
    "버그 수정 중",
    "문서화 작업 중",
    "팀 협업 진행",
    "외부 의존성 업데이트",
    "모니터링 시스템 구축",
  ];

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

  // 샘플 데이터 생성
  const generateSampleData = () => {
    const data = [];
    const numProjects = Math.floor(Math.random() * 5) + 4; // 4-8개 프로젝트

    for (let i = 1; i <= numProjects; i++) {
      const inlinePassRate = generateRandomValue(0.6, 0.98);
      const elecPassRate = generateRandomValue(0.6, 0.98);
      const issueResponseIndex = generateRandomValue(0.6, 0.98);
      const wipAchievementRate = generateRandomValue(0.6, 0.98);
      const deadlineAchievementRate = generateRandomValue(0.6, 0.98);
      const finalScore =
        inlinePassRate *
        elecPassRate *
        issueResponseIndex *
        wipAchievementRate *
        deadlineAchievementRate;

      data.push({
        id: i,
        projectName:
          projectNames[Math.floor(Math.random() * projectNames.length)],
        inlinePassRate,
        elecPassRate,
        issueResponseIndex,
        wipAchievementRate,
        deadlineAchievementRate,
        finalScore,
        remark: remarks[Math.floor(Math.random() * remarks.length)],
      });
    }

    return data;
  };

  // 셀 스타일 결정 함수
  const getCellClass = (params) => {
    const field = params.column.colId;
    const value = params.value;
    const settings = colorSettings[field];
    if (!settings) return "";
    const highThreshold = settings.high / 100;
    const lowThreshold = settings.low / 100;
    const compareValue = value;
    if (compareValue >= highThreshold) {
      return field === "finalScore" ? "cell-high-score" : "cell-high";
    } else if (compareValue >= lowThreshold) {
      return field === "finalScore" ? "cell-medium-score" : "cell-medium";
    } else {
      return field === "finalScore" ? "cell-low-score" : "cell-low";
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
                  setIsIssueModalVisible(true);
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
    setIsSettingsModalVisible(false);
  };

  // 새 데이터 추가
  const addNewData = () => {
    const newRow = generateEmptyRow();
    setRowData((prevData) => [...prevData, newRow]);
  };

  // 단일 행 삭제
  const deleteRow = (rowId) => {
    setRowData((prevData) => prevData.filter((row) => row.id !== rowId));
    message.success("행이 삭제되었습니다.");
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
