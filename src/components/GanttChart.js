import React, { useEffect, useRef } from "react";
import { Card } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const GanttChart = ({ issueData = [] }) => {
  const svgRef = useRef(null);

  // 카테고리별 색상 매핑
  const getCategoryColor = (category) => {
    const colorMap = {
      개발: "#1890ff",
      디자인: "#52c41a",
      테스트: "#faad14",
      보안: "#f5222d",
      인프라: "#722ed1",
      "사용자 경험": "#13c2c2",
      "새 카테고리": "#eb2f96",
    };
    return colorMap[category] || "#d9d9d9";
  };

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

  // 간트 차트 데이터 변환
  const convertToGanttData = (data) => {
    if (!data || data.length === 0) return [];

    return data
      .filter((item) => item.start) // 시작일이 있는 항목만
      .map((item, index) => {
        const start = dayjs(item.start);
        const end = item.end ? dayjs(item.end) : dayjs().add(7, "day");
        const isActive = isCurrentMonthActive(item);

        // 진행률 계산 (이슈 특성에 따른 현실적인 진행률)
        let progress = 0;
        if (item.progress) {
          const progressText = item.progress.toLowerCase();

          // 진행 상황에 따른 진행률 계산
          if (progressText.includes("완료") || progressText.includes("완료")) {
            progress = 100;
          } else if (
            progressText.includes("배포") ||
            progressText.includes("배포")
          ) {
            progress = 95;
          } else if (
            progressText.includes("테스트") ||
            progressText.includes("테스트")
          ) {
            progress = 80;
          } else if (
            progressText.includes("개발") ||
            progressText.includes("개발")
          ) {
            progress = 60;
          } else if (
            progressText.includes("분석") ||
            progressText.includes("분석")
          ) {
            progress = 40;
          } else if (
            progressText.includes("계획") ||
            progressText.includes("계획")
          ) {
            progress = 20;
          } else {
            // 기본값: 텍스트 길이 기반
            const progressLines = item.progress
              .split("\n")
              .filter((line) => line.trim() !== "");
            progress = Math.min(
              Math.round((progressLines.length / 3) * 100),
              100
            );
          }
        }

        return {
          id: index,
          name: item.issue,
          category: item.category,
          start: start,
          end: end,
          duration: end.diff(start, "day") + 1,
          progress: progress,
          isActive: isActive,
        };
      });
  };

  // SVG 간트 차트 렌더링
  const renderGanttChart = () => {
    if (!svgRef.current) return;

    const ganttData = convertToGanttData(issueData);
    if (ganttData.length === 0) return;

    // 컨테이너 크기 가져오기 (안정성을 위해 최소값 설정)
    const container = svgRef.current.parentElement;
    const containerWidth = Math.max(container?.clientWidth || 800, 600);
    const containerHeight = Math.max(container?.clientHeight || 300, 250);

    // 날짜 범위 계산
    const allDates = [];
    ganttData.forEach((item) => {
      allDates.push(item.start.toDate());
      allDates.push(item.end.toDate());
    });

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    const totalDays = dayjs(maxDate).diff(dayjs(minDate), "day") + 1;

    // SVG 크기 설정 - 안정적인 크기로 설정
    const svgWidth = containerWidth;
    const svgHeight = containerHeight;
    const margin = {
      top: Math.max(Math.round(containerHeight * 0.11), 30), // 최소 30px
      right: Math.max(Math.round(containerWidth * 0.02), 10), // 최소 10px
      bottom: Math.max(Math.round(containerHeight * 0.34), 80), // 최소 80px
      left: Math.max(Math.round(containerWidth * 0.15), 100), // 최소 100px
    };
    const chartWidth = Math.max(svgWidth - margin.left - margin.right, 200);
    const chartHeight = Math.max(svgHeight - margin.top - margin.bottom, 100);
    const barHeight = Math.max(Math.round(containerHeight * 0.07), 20); // 최소 20px
    const barSpacing = Math.max(Math.round(containerHeight * 0.02), 5); // 최소 5px

    // SVG 초기화
    const svg = svgRef.current;
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);

    // 기존 내용 모두 제거
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 월별 구분선 그리기 함수
    const drawMonthDividers = () => {
      const startDate = new Date(minDate);
      const endDate = new Date(maxDate);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);

        // 월 경계가 차트 범위 내에 있는지 확인
        if (nextMonth >= minDate && nextMonth <= endDate) {
          const dividerLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          dividerLine.setAttribute("x1", xScale(nextMonth));
          dividerLine.setAttribute("y1", margin.top);
          dividerLine.setAttribute("x2", xScale(nextMonth));
          dividerLine.setAttribute("y2", margin.top + chartHeight);
          dividerLine.setAttribute("stroke", "#1890ff"); // 파란색으로 변경
          dividerLine.setAttribute("stroke-width", "3"); // 2에서 3으로 증가
          dividerLine.setAttribute("stroke-dasharray", "10,6"); // 8,4에서 10,6으로 변경
          dividerLine.setAttribute("opacity", "0.9"); // 0.8에서 0.9로 증가
          svg.appendChild(dividerLine);
        }

        // currentDate를 다음 달로 증가
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    };

    // 스케일 계산
    const xScale = (date) => {
      const daysFromStart = dayjs(date).diff(dayjs(minDate), "day");
      return margin.left + (daysFromStart / totalDays) * chartWidth;
    };

    const yScale = (index) => {
      return margin.top + index * (barHeight + barSpacing);
    };

    // 배경 그리드
    const gridGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    gridGroup.setAttribute("class", "grid");

    // 주별 그리드 라인
    for (let i = 0; i <= totalDays; i += 7) {
      const x = margin.left + (i / totalDays) * chartWidth;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line.setAttribute("x1", x);
      line.setAttribute("y1", margin.top);
      line.setAttribute("x2", x);
      line.setAttribute("y2", margin.top + chartHeight);
      line.setAttribute("stroke", "#e8e8e8");
      line.setAttribute("stroke-width", "1");
      gridGroup.appendChild(line);

      // 날짜 라벨
      const date = dayjs(minDate).add(i, "day");
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x);
      text.setAttribute("y", margin.top - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute(
        "font-size",
        Math.max(Math.round(containerWidth * 0.008), 8)
      ); // 최소 8px
      text.setAttribute("fill", "#666");
      text.textContent = date.format("MM/DD");
      gridGroup.appendChild(text);
    }

    svg.appendChild(gridGroup);

    // 이슈 바 렌더링
    ganttData.forEach((item, index) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "task-group");

      // 이슈 이름
      const nameText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      nameText.setAttribute("x", margin.left - 10);
      nameText.setAttribute("y", yScale(index) + barHeight / 2);
      nameText.setAttribute("text-anchor", "end");
      nameText.setAttribute(
        "font-size",
        Math.max(Math.round(containerWidth * 0.01), 10)
      ); // 최소 10px
      nameText.setAttribute("fill", item.isActive ? "#333" : "#999"); // 활성 상태에 따라 텍스트 색상 변경
      nameText.setAttribute("dominant-baseline", "middle");
      nameText.textContent =
        item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name;
      group.appendChild(nameText);

      // 진행 바 배경
      const backgroundRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      backgroundRect.setAttribute("x", xScale(item.start.toDate()));
      backgroundRect.setAttribute("y", yScale(index));
      backgroundRect.setAttribute(
        "width",
        (item.duration / totalDays) * chartWidth
      );
      backgroundRect.setAttribute("height", barHeight);
      backgroundRect.setAttribute(
        "fill",
        item.isActive ? "#f8f9fa" : "#e8e8e8"
      ); // 활성 상태에 따라 배경색 변경
      backgroundRect.setAttribute("rx", "3");
      group.appendChild(backgroundRect);

      // 진행 바
      const progressRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      progressRect.setAttribute("x", xScale(item.start.toDate()));
      progressRect.setAttribute("y", yScale(index));
      progressRect.setAttribute(
        "width",
        (item.duration / totalDays) * chartWidth * (item.progress / 100)
      );
      progressRect.setAttribute("height", barHeight);
      // 활성 상태에 따라 색상 변경
      const barColor = item.isActive
        ? getCategoryColor(item.category)
        : "#999999";
      progressRect.setAttribute("fill", barColor);
      progressRect.setAttribute("rx", "3");
      group.appendChild(progressRect);

      // 진행률 텍스트
      if (item.progress > 0) {
        const progressText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        progressText.setAttribute(
          "x",
          xScale(item.start.toDate()) +
            ((item.duration / totalDays) * chartWidth) / 2
        );
        progressText.setAttribute("y", yScale(index) + barHeight / 2);
        progressText.setAttribute("text-anchor", "middle");
        progressText.setAttribute(
          "font-size",
          Math.max(Math.round(containerWidth * 0.008), 8)
        ); // 최소 8px
        progressText.setAttribute("fill", "#fff");
        progressText.setAttribute("dominant-baseline", "middle");
        progressText.textContent = `${item.progress}%`;
        group.appendChild(progressText);
      }

      // 클릭 이벤트
      group.addEventListener("click", () => {
        console.log("Task clicked:", item);
      });

      svg.appendChild(group);
    });

    // 월별 구분선 그리기
    drawMonthDividers();

    // 카테고리별 범례
    const categories = [...new Set(ganttData.map((item) => item.category))];
    const legendGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    legendGroup.setAttribute("class", "legend");

    categories.forEach((category, index) => {
      const legendItem = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

      const legendRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      legendRect.setAttribute("x", margin.left + index * 120);
      legendRect.setAttribute("y", margin.top + chartHeight + 60); // 40에서 60으로 증가
      legendRect.setAttribute("width", 15);
      legendRect.setAttribute("height", 15);
      legendRect.setAttribute("fill", getCategoryColor(category));
      legendRect.setAttribute("rx", "2");
      legendItem.appendChild(legendRect);

      const legendText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      legendText.setAttribute("x", margin.left + index * 120 + 20);
      legendText.setAttribute("y", margin.top + chartHeight + 72);
      legendText.setAttribute(
        "font-size",
        Math.max(Math.round(containerWidth * 0.01), 10)
      ); // 최소 10px
      legendText.setAttribute("fill", "#333");
      legendText.textContent = category;
      legendItem.appendChild(legendText);

      legendGroup.appendChild(legendItem);
    });

    svg.appendChild(legendGroup);
  };

  // 차트 렌더링
  useEffect(() => {
    renderGanttChart();
  }, [issueData]);

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>프로젝트 간트 차트</span>
        </div>
      }
      style={{ marginBottom: 16, height: "100%" }}
      bodyStyle={{ padding: "16px", height: "calc(100% - 57px)" }}
    >
      {/* 간트 차트 컨테이너 */}
      <div
        style={{
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          overflow: "auto",
          backgroundColor: "#fff",
          height: "100%",
        }}
      >
        {convertToGanttData(issueData).length > 0 ? (
          <svg
            ref={svgRef}
            style={{
              display: "block",
              margin: "0 auto",
            }}
          />
        ) : (
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "16px",
              backgroundColor: "#fafafa",
            }}
          >
            진행 중인 이슈가 없습니다
          </div>
        )}
      </div>
    </Card>
  );
};

export default GanttChart;
