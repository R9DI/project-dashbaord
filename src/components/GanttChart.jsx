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

    // 오늘 날짜를 중심으로 한 날짜 범위 계산
    const today = dayjs();
    const todayDate = today.toDate();

    // 모든 이슈의 시작일과 종료일 수집
    const allDates = [];
    ganttData.forEach((item) => {
      allDates.push(item.start.toDate());
      allDates.push(item.end.toDate());
    });

    // 기존 최소/최대 날짜 계산
    const originalMinDate = new Date(Math.min(...allDates));
    const originalMaxDate = new Date(Math.max(...allDates));

    // 오늘을 중심으로 한 범위 계산 (최소 30일)
    const minRangeDays = 30;
    const daysBeforeToday = Math.max(
      dayjs(today).diff(dayjs(originalMinDate), "day"),
      Math.floor(minRangeDays / 2)
    );
    const daysAfterToday = Math.max(
      dayjs(originalMaxDate).diff(dayjs(today), "day"),
      Math.floor(minRangeDays / 2)
    );

    // 최소/최대 날짜 재계산 (오늘 중심)
    const minDate = dayjs(today).subtract(daysBeforeToday, "day").toDate();
    const maxDate = dayjs(today).add(daysAfterToday, "day").toDate();

    const totalDays = dayjs(maxDate).diff(dayjs(minDate), "day") + 1;

    // 마진 설정
    const margin = {
      top: 80,
      right: 20,
      bottom: 60,
      left: 120,
    };

    // 바 높이 계산 (고정 높이 사용)
    const barHeight = 20;
    const barSpacing = 8;

    // 실제 차트 높이 계산 (이슈 개수에 따라)
    const actualChartHeight =
      ganttData.length * (barHeight + barSpacing) - barSpacing;
    const finalChartHeight = Math.max(actualChartHeight, 100); // 최소 100px로 줄임

    // SVG 크기 설정
    const svgWidth = containerWidth;
    const svgHeight = margin.top + finalChartHeight + margin.bottom;

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
        text.setAttribute("y", margin.top - 45);
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
          dividerLine.setAttribute("stroke-width", "1");
          dividerLine.setAttribute("stroke-dasharray", "5,3");
          dividerLine.setAttribute("opacity", "0.7");
          svg.appendChild(dividerLine);

          // 월 라벨
          const monthLabel = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          monthLabel.setAttribute("x", xScale(nextMonth) + 5);
          monthLabel.setAttribute("y", margin.top - 8);
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
        todayLine.setAttribute("opacity", "0.7");
        svg.appendChild(todayLine);

        // 오늘 라벨
        const todayLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        todayLabel.setAttribute("x", todayX + 5);
        todayLabel.setAttribute("y", margin.top - 22);
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
        group.addEventListener("mouseenter", (event) => {
          bar.setAttribute("opacity", "0.8");

          // 툴팁 생성
          const tooltip = document.createElement("div");
          tooltip.setAttribute("class", "gantt-tooltip");
          tooltip.className =
            "absolute bg-black bg-opacity-90 text-white p-2 px-3 rounded text-xs font-sans pointer-events-none z-50 whitespace-nowrap shadow-lg max-w-64";

          const startDate = item.start.format("YYYY-MM-DD");
          const endDate = item.hasEndDate
            ? item.end.format("YYYY-MM-DD")
            : "미정";
          const status = item.status || "pending";

          tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${item.name}</div>
            <div style="font-size: 11px; line-height: 1.4;">
              <div>시작일: ${startDate}</div>
              <div>종료일: ${endDate}</div>
              <div>상태: ${status}</div>
            </div>
          `;

          document.body.appendChild(tooltip);

          // 툴팁 위치 설정
          const rect = event.target.getBoundingClientRect();
          tooltip.style.left =
            rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + "px";
          tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + "px";

          // 마우스 아웃 시 툴팁 제거
          group.addEventListener(
            "mouseleave",
            () => {
              bar.setAttribute("opacity", "1");
              if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
              }
            },
            { once: true }
          );
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

    // 차트 요소들 그리기 (점선들을 맨 위로 올리기 위해 순서 조정)
    drawGrid();
    drawIssueBars();
    drawMonthDividers();
    drawTodayLine();
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
      <div className="h-full flex items-center justify-center text-gray-400 text-base bg-gray-50 border border-gray-200 rounded-lg">
        📊 진행 중인 이슈가 없습니다
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      <svg ref={svgRef} className="w-full min-h-full bg-white" />
    </div>
  );
};

export default GanttChart;
