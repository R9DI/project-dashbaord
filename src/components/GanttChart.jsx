import React, { useRef, useEffect, useMemo } from "react";
import dayjs from "dayjs";

const GanttChart = ({ issueData = [] }) => {
  const svgRef = useRef(null);

  // 간트차트 데이터 변환
  const ganttData = useMemo(() => {
    if (!issueData || issueData.length === 0) return [];

    return issueData
      .filter((item) => item.start) // 시작일이 있는 항목만
      .map((item, index) => {
        // 시작일 처리
        const startDate = dayjs(item.start).isValid()
          ? dayjs(item.start)
          : dayjs();

        // 종료일 처리
        const hasEndDate =
          item.end &&
          item.end.trim() !== "" &&
          item.end !== "미정" &&
          dayjs(item.end).isValid();
        const endDate = hasEndDate ? dayjs(item.end) : dayjs().add(30, "day");

        return {
          id: item.id || index,
          name: item.issue || item.item || `이슈 ${index + 1}`,
          start: startDate,
          end: endDate,
          hasEndDate,
          category: item.category || "기타",
          status: item.status || "pending",
        };
      });
  }, [issueData]);

  // 이슈 상태에 따른 색상 결정
  const getIssueColor = (item) => {
    const today = dayjs();
    const currentMonth = today.month();
    const currentYear = today.year();

    // 종료일이 없는 경우 (미정)
    if (!item.hasEndDate) {
      return "#ff4d4f"; // 빨간색
    }

    // 종료일이 현재 월 이전인 경우 (완료됨)
    if (
      item.end.year() < currentYear ||
      (item.end.year() === currentYear && item.end.month() < currentMonth)
    ) {
      return "#8c8c8c"; // 진한 회색
    }

    // 종료일이 현재 월에 있고, 오늘 이전인 경우 (이번달 완료)
    if (
      item.end.year() === currentYear &&
      item.end.month() === currentMonth &&
      item.end.isBefore(today)
    ) {
      return "#87ceeb"; // 하늘색
    }

    // 진행 중인 경우
    return "#1890ff"; // 파란색
  };

  // 간트차트 렌더링
  const renderGanttChart = () => {
    if (!svgRef.current || ganttData.length === 0) return;

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

    // 최소 14일 범위 보장
    const minRangeDays = 14;
    const actualDays = dayjs(maxDate).diff(dayjs(minDate), "day") + 1;
    const totalDays = Math.max(actualDays, minRangeDays);

    // 마진 설정
    const margin = {
      top: 60,
      right: 20,
      bottom: 60,
      left: 120,
    };

    // 바 높이 계산 (임시 차트 높이 사용)
    const tempChartHeight = containerHeight - margin.top - margin.bottom;
    const barHeight = Math.max(
      Math.min(tempChartHeight / ganttData.length, 25),
      15
    );
    const barSpacing = 8;

    // 실제 차트 높이 계산 (이슈 개수에 따라)
    const actualChartHeight =
      ganttData.length * (barHeight + barSpacing) - barSpacing;
    const finalChartHeight = Math.max(actualChartHeight, tempChartHeight);

    // SVG 크기 설정
    const svgWidth = containerWidth;
    const svgHeight = Math.max(
      containerHeight,
      margin.top + finalChartHeight + margin.bottom
    );

    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // SVG 초기화
    const svg = svgRef.current;
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);

    // 기존 내용 제거
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // X축 스케일 함수
    const xScale = (date) => {
      const daysFromStart = dayjs(date).diff(dayjs(minDate), "day");
      return margin.left + (daysFromStart / totalDays) * chartWidth;
    };

    // Y축 스케일 함수
    const yScale = (index) => {
      return margin.top + index * (barHeight + barSpacing);
    };

    // 배경 그리드 그리기
    const drawGrid = () => {
      const gridGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

      // 주별 그리드 라인
      for (let i = 0; i <= totalDays; i += 7) {
        const x = margin.left + (i / totalDays) * chartWidth;

        // 그리드 라인
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", x);
        line.setAttribute("y1", margin.top);
        line.setAttribute("x2", x);
        line.setAttribute("y2", margin.top + finalChartHeight);
        line.setAttribute("stroke", "#f0f0f0");
        line.setAttribute("stroke-width", "1");
        gridGroup.appendChild(line);

        // 날짜 라벨
        const date = dayjs(minDate).add(i, "day");
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", x);
        text.setAttribute("y", margin.top - 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "11px");
        text.setAttribute("fill", "#666");
        text.textContent = date.format("MM/DD");
        gridGroup.appendChild(text);
      }

      svg.appendChild(gridGroup);
    };

    // 월별 구분선 그리기
    const drawMonthDividers = () => {
      const startDate = new Date(minDate);
      const endDate = new Date(maxDate);
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);

        if (nextMonth >= minDate && nextMonth <= endDate) {
          // 월 구분선
          const dividerLine = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          dividerLine.setAttribute("x1", xScale(nextMonth));
          dividerLine.setAttribute("y1", margin.top);
          dividerLine.setAttribute("x2", xScale(nextMonth));
          dividerLine.setAttribute("y2", margin.top + finalChartHeight);
          dividerLine.setAttribute("stroke", "#333");
          dividerLine.setAttribute("stroke-width", "2");
          dividerLine.setAttribute("stroke-dasharray", "5,3");
          svg.appendChild(dividerLine);

          // 월 라벨
          const monthLabel = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          monthLabel.setAttribute("x", xScale(nextMonth) + 5);
          monthLabel.setAttribute("y", margin.top - 35);
          monthLabel.setAttribute("text-anchor", "start");
          monthLabel.setAttribute("font-size", "12px");
          monthLabel.setAttribute("font-weight", "bold");
          monthLabel.setAttribute("fill", "#333");
          monthLabel.textContent = dayjs(nextMonth).format("M월");
          svg.appendChild(monthLabel);
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
      }
    };

    // 오늘 날짜 라인 그리기
    const drawTodayLine = () => {
      const today = dayjs();
      if (today.isAfter(minDate) && today.isBefore(maxDate)) {
        const todayX = xScale(today.toDate());

        // 오늘 라인
        const todayLine = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        todayLine.setAttribute("x1", todayX);
        todayLine.setAttribute("y1", margin.top);
        todayLine.setAttribute("x2", todayX);
        todayLine.setAttribute("y2", margin.top + finalChartHeight);
        todayLine.setAttribute("stroke", "#52c41a");
        todayLine.setAttribute("stroke-width", "2");
        todayLine.setAttribute("stroke-dasharray", "8,4");
        svg.appendChild(todayLine);

        // 오늘 라벨
        const todayLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        todayLabel.setAttribute("x", todayX + 5);
        todayLabel.setAttribute("y", margin.top - 25);
        todayLabel.setAttribute("text-anchor", "start");
        todayLabel.setAttribute("font-size", "11px");
        todayLabel.setAttribute("font-weight", "bold");
        todayLabel.setAttribute("fill", "#52c41a");
        todayLabel.textContent = "오늘";
        svg.appendChild(todayLabel);
      }
    };

    // 이슈 바 그리기
    const drawIssueBars = () => {
      ganttData.forEach((item, index) => {
        const group = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );
        group.setAttribute("class", "task-group");

        // 이슈 이름
        const nameText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        nameText.setAttribute("x", margin.left - 10);
        nameText.setAttribute("y", yScale(index) + barHeight / 2);
        nameText.setAttribute("text-anchor", "end");
        nameText.setAttribute("font-size", "11px");
        nameText.setAttribute("fill", "#333");
        nameText.setAttribute("dominant-baseline", "middle");
        nameText.textContent =
          item.name.length > 12
            ? item.name.substring(0, 12) + "..."
            : item.name;
        group.appendChild(nameText);

        // 이슈 바
        const startX = xScale(item.start.toDate());
        const endX = xScale(item.end.toDate());
        const barWidth = Math.max(endX - startX, 2); // 최소 2px

        const bar = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        bar.setAttribute("x", startX);
        bar.setAttribute("y", yScale(index));
        bar.setAttribute("width", barWidth);
        bar.setAttribute("height", barHeight);
        bar.setAttribute("fill", getIssueColor(item));
        bar.setAttribute("rx", "3");
        bar.setAttribute("ry", "3");
        group.appendChild(bar);

        // 호버 이벤트
        group.addEventListener("mouseenter", () => {
          bar.setAttribute("opacity", "0.8");
        });

        group.addEventListener("mouseleave", () => {
          bar.setAttribute("opacity", "1");
        });

        svg.appendChild(group);
      });
    };

    // 범례 그리기
    const drawLegend = () => {
      const legendGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const legendItems = [
        { color: "#1890ff", label: "진행 중" },
        { color: "#87ceeb", label: "이번달 완료" },
        { color: "#8c8c8c", label: "완료됨" },
        { color: "#ff4d4f", label: "미정" },
      ];

      legendItems.forEach((item, index) => {
        const legendItem = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );

        // 색상 박스
        const colorBox = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        colorBox.setAttribute("x", margin.left + index * 100);
        colorBox.setAttribute("y", margin.top + chartHeight + 20);
        colorBox.setAttribute("width", "12");
        colorBox.setAttribute("height", "12");
        colorBox.setAttribute("fill", item.color);
        colorBox.setAttribute("rx", "2");
        legendItem.appendChild(colorBox);

        // 라벨
        const label = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        label.setAttribute("x", margin.left + index * 100 + 18);
        label.setAttribute("y", margin.top + chartHeight + 30);
        label.setAttribute("font-size", "10px");
        label.setAttribute("fill", "#666");
        label.textContent = item.label;
        legendItem.appendChild(label);

        legendGroup.appendChild(legendItem);
      });

      svg.appendChild(legendGroup);
    };

    // 차트 요소들 그리기
    drawGrid();
    drawMonthDividers();
    drawTodayLine();
    drawIssueBars();
  };

  // 리사이즈 이벤트 처리
  useEffect(() => {
    const handleResize = () => {
      renderGanttChart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 데이터 변경 시 차트 다시 그리기
  useEffect(() => {
    renderGanttChart();
  }, [ganttData]);

  if (ganttData.length === 0) {
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
        📊 진행 중인 이슈가 없습니다
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default GanttChart;
