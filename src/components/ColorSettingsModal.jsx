import React from "react";
import {
  Modal,
  Form,
  Row,
  Col,
  InputNumber,
  Typography,
  Tag,
  Button,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Text } = Typography;

// 색상 기준 설명
const colorSettingsDescription = {
  inlinePassRate: "Inline 합격률",
  elecPassRate: "Elec 합격률",
  issueResponseIndex: "Issue 대응지수",
  wipAchievementRate: "WIP 실적 달성률",
  deadlineAchievementRate: "과제 납기달성률",
  finalScore: "Final Score",
};

const ColorSettingsModal = ({
  isVisible,
  onCancel,
  onSave,
  initialValues,
  onOpen,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <>
      <Button type="primary" icon={<SettingOutlined />} onClick={onOpen}>
        색상 기준 설정
      </Button>

      <Modal
        title="색상 기준 설정"
        open={isVisible}
        onCancel={onCancel}
        onOk={handleOk}
        width={600}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} initialValues={initialValues} layout="vertical">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <Text strong>색상 기준:</Text>
            <div className="mt-2">
              <Tag color="green">녹색: 기준값 이상</Tag>
              <Tag color="gold">노란색: 낮은 기준값 ~ 높은 기준값</Tag>
              <Tag color="red">빨간색: 낮은 기준값 미만</Tag>
            </div>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="1st 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="2nd 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="1st 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="2nd 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="1st 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="2nd 경계"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="1st 경계"
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
                  className="w-full"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={colorSettingsDescription.deadlineAchievementRate}
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
                  className="w-full"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={colorSettingsDescription.finalScore}
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
                  className="w-full"
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
                  className="w-full"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ColorSettingsModal;
