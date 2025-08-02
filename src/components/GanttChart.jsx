import React, { useEffect, useRef } from "react";
import dayjs from "dayjs";

const GanttChart = ({ issueData = [] }) => {
  const svgRef = useRef(null);

  // 이슈 상태별 색상 결정 함수
  const getIssueStatusColor = (item) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = new Date(currentYear, currentMonth, 1);

    const endDate = item.hasEndDate ? new Date(item.end) : null;
    const startDate = item.start ? new Date(item.start) : null;

    // 미정인애들을 빨간색 (종료일이 안 적혀있는 경우) - 가장 먼저 체크
    if (!item.hasEndDate) {
      return "#ff4d4f"; // 빨간색
    }

    // 종료일이 이번달 전인건 찐한 회색
    if (endDate < currentDate) {
      return "#8c8c8c"; // 찐한 회색
    }

    // 시작부터 끝이 이번달 안에 포함되어있고 종료일이 오늘전이면 하늘색
    if (startDate && endDate) {
      const startInCurrentMonth =
        startDate.getFullYear() === currentYear &&
        startDate.getMonth() === currentMonth;
      const endInCurrentMonth =
        endDate.getFullYear() === currentYear &&
        endDate.getMonth() === currentMonth;
      const spansCurrentMonth =
        (startDate <= currentDate && endDate >= currentDate) ||
        startInCurrentMonth ||
        endInCurrentMonth;

      if (spansCurrentMonth && endDate < today) {
        return "#87ceeb"; // 하늘색
      }
    }

    // 진행중인걸 파란색 (이번달에 진행 중이고 아직 완료되지 않은 것)
    if (startDate && endDate >= today) {
      const startInCurrentMonth =
        startDate.getFullYear() === currentYear &&
        startDate.getMonth() === currentMonth;
      const endInCurrentMonth =
        endDate.getFullYear() === currentYear &&
        endDate.getMonth() === currentMonth;
      const spansCurrentMonth =
        (startDate <= currentDate && endDate >= currentDate) ||
        startInCurrentMonth ||
        endInCurrentMonth;

      if (spansCurrentMonth) {
        return "#1890ff"; // 파란색
      }
    }

    // 기본값: 파란색
    return "#1890ff";
  };

  // 카테고리별 색상 매핑 (기존 함수는 범례용으로 유지)
  const getCategoryColor = (category, isActive) => {
    // 현재 월 진행 중인 항목은 파란색 계열
    if (isActive) {
      const activeColorMap = {
        개발: "#1890ff", // 파란색
        디자인: "#40a9ff", // 밝은 파란색
        테스트: "#69c0ff", // 연한 파란색
        보안: "#91d5ff", // 매우 연한 파란색
        인프라: "#bae7ff", // 가장 연한 파란색
        "사용자 경험": "#e6f7ff", // 매우 연한 파란색
        "새 카테고리": "#f0f8ff", // 거의 흰색 파란색
      };
      return activeColorMap[category] || "#1890ff"; // 기본 파란색
    }

    // 완료된 항목은 회색 계열
    const inactiveColorMap = {
      개발: "#8c8c8c", // 진한 회색
      디자인: "#a6a6a6", // 중간 회색
      테스트: "#bfbfbf", // 연한 회색
      보안: "#d9d9d9", // 매우 연한 회색
      인프라: "#f0f0f0", // 거의 흰색 회색
      "사용자 경험": "#f5f5f5", // 매우 연한 회색
      "새 카테고리": "#fafafa", // 거의 흰색
    };
    return inactiveColorMap[category] || "#d9d9d9"; // 기본 회색
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
        // 종료일이 없는 경우 차트 끝까지 이어지도록 설정
        const hasEndDate = item.end && item.end.trim() !== "";
        const end = hasEndDate ? dayjs(item.end) : dayjs().add(30, "day"); // 30일 후까지 표시

        const isActive = isCurrentMonthActive(item);

        // 진행률 계산 (이슈 특성에 따른 현실적인 진행률)
        let progress = 0;
        if (item.detail) {
          // progress 대신 detail 사용
          const detailText = item.detail.toLowerCase();

          // 진행 상황에 따른 진행률 계산
          if (detailText.includes("완료") || detailText.includes("완료")) {
            progress = 100;
          } else if (
            detailText.includes("배포") ||
            detailText.includes("배포")
          ) {
            progress = 95;
          } else if (
            detailText.includes("테스트") ||
            detailText.includes("테스트")
          ) {
            progress = 80;
          } else if (
            detailText.includes("개발") ||
            detailText.includes("개발")
          ) {
            progress = 60;
          } else if (
            detailText.includes("분석") ||
            detailText.includes("분석")
          ) {
            progress = 40;
          } else if (
            detailText.includes("계획") ||
            detailText.includes("계획")
          ) {
            progress = 20;
          } else {
            // 기본값: 텍스트 길이 기반
            const detailLines = item.detail
              .split("\n")
              .filter((line) => line.trim() !== "");
            progress = Math.min(
              Math.round((detailLines.length / 3) * 100),
              100
            );
          }
        }

        return {
          id: index,
          name: item.issue,
          category: item.category || "기타",
          start: start,
          end: end,
          duration: end.diff(start, "day") + 1,
          progress: progress,
          isActive: isActive,
          hasEndDate: hasEndDate, // End 날짜 존재 여부
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

    console.log("=== 날짜 범위 계산 ===");
    console.log("minDate:", dayjs(minDate).format("YYYY-MM-DD"));
    console.log("maxDate:", dayjs(maxDate).format("YYYY-MM-DD"));
    console.log("totalDays:", totalDays);

    // SVG 크기 설정 - 안정적인 크기로 설정
    const svgWidth = containerWidth;
    const svgHeight = containerHeight;
    const margin = {
      top: Math.max(Math.round(containerHeight * 0.11), 30), // 최소 30px
      right: Math.max(Math.round(containerWidth * 0.02), 10), // 최소 10px
      bottom: Math.max(Math.round(containerHeight * 0.15), 50), // 범례를 위해 적절한 공간 확보
      left: Math.max(Math.round(containerWidth * 0.15), 100), // 최소 100px
    };

    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // 바 높이 계산 (이슈 개수에 따라 동적 조정)
    const barHeight = Math.max(
      Math.min(chartHeight / ganttData.length, 30),
      15
    ); // 최소 15px, 최대 30px
    const barSpacing = Math.max(barHeight * 0.3, 5); // 바 간격

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
          dividerLine.setAttribute("stroke", "#333"); // 검정색으로 변경
          dividerLine.setAttribute("stroke-width", "1"); // 얇게 변경
          dividerLine.setAttribute("stroke-dasharray", "5,3"); // 점선 간격 줄임
          dividerLine.setAttribute("opacity", "0.7"); // 투명도 조정
          svg.appendChild(dividerLine);

          // 월 이름 라벨 추가
          const monthLabel = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          monthLabel.setAttribute("x", xScale(nextMonth) + 5);
          monthLabel.setAttribute("y", margin.top - 5);
          monthLabel.setAttribute("text-anchor", "start");
          monthLabel.setAttribute(
            "font-size",
            Math.max(Math.round(containerWidth * 0.011), 11) // 9에서 11로 증가
          );
          monthLabel.setAttribute("fill", "#333");
          monthLabel.setAttribute("font-weight", "bold");
          monthLabel.textContent = dayjs(nextMonth).format("M월"); // YYYY년 M월에서 M월로 변경
          svg.appendChild(monthLabel);
        }

        // currentDate를 다음 달로 증가
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    };

    // 오늘 날짜 표시 함수
    const drawTodayLine = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

      // 오늘이 차트 범위 내에 있는지 확인
      if (today >= minDate && today <= maxDate) {
        const todayLine = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        todayLine.setAttribute("x1", xScale(today));
        todayLine.setAttribute("y1", margin.top);
        todayLine.setAttribute("x2", xScale(today));
        todayLine.setAttribute("y2", margin.top + chartHeight);
        todayLine.setAttribute("stroke", "#52c41a"); // 초록색
        todayLine.setAttribute("stroke-width", "2");
        todayLine.setAttribute("stroke-dasharray", "8,4"); // 점선
        todayLine.setAttribute("opacity", "0.8");
        svg.appendChild(todayLine);

        // 오늘 라벨 추가
        const todayLabel = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        todayLabel.setAttribute("x", xScale(today) + 5);
        todayLabel.setAttribute("y", margin.top - 15); // -5에서 -15로 변경
        todayLabel.setAttribute("text-anchor", "start");
        todayLabel.setAttribute(
          "font-size",
          Math.max(Math.round(containerWidth * 0.01), 10) // 8에서 10으로 증가
        );
        todayLabel.setAttribute("fill", "#52c41a"); // 초록색
        todayLabel.setAttribute("font-weight", "bold");
        todayLabel.textContent = "오늘";
        svg.appendChild(todayLabel);
      }
    };

    // 스케일 계산
    const xScale = (date) => {
      const daysFromStart = dayjs(date).diff(dayjs(minDate), "day");
      const result = margin.left + (daysFromStart / totalDays) * chartWidth;
      console.log(
        `xScale - date: ${dayjs(date).format(
          "YYYY-MM-DD"
        )}, daysFromStart: ${daysFromStart}, result: ${result}`
      );
      return result;
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

      // 날짜 라벨만 표시 (그리드 라인 제거)
      const date = dayjs(minDate).add(i, "day");
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", x);
      text.setAttribute("y", margin.top - 25);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute(
        "font-size",
        Math.max(Math.round(containerWidth * 0.012), 12)
      );
      text.setAttribute("fill", "#666");
      text.textContent = date.format("MM/DD");
      gridGroup.appendChild(text);
    }

    svg.appendChild(gridGroup);

    // 이슈 바 렌더링
    ganttData.forEach((item, index) => {
      console.log(`\n=== 이슈 ${index + 1}: ${item.name} ===`);
      console.log("시작일:", item.start.format("YYYY-MM-DD"));
      console.log("종료일:", item.end.format("YYYY-MM-DD"));
      console.log("hasEndDate:", item.hasEndDate);

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "task-group");

      // 이슈 이름과 범주
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

      // 범주 표시
      if (item.category) {
        const categoryText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        categoryText.setAttribute("x", margin.left - 15);
        categoryText.setAttribute("y", yScale(index) + barHeight / 2 + 15);
        categoryText.setAttribute("text-anchor", "end");
        categoryText.setAttribute(
          "font-size",
          Math.max(Math.round(containerWidth * 0.008), 8)
        );
        categoryText.setAttribute("fill", item.isActive ? "#666" : "#ccc");
        categoryText.setAttribute("dominant-baseline", "middle");
        categoryText.textContent = `[${item.category}]`;
        group.appendChild(categoryText);
      }

      // 진행 바 배경
      const backgroundRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      const startX = xScale(item.start.toDate());
      const endX = xScale(item.end.toDate());
      const barWidth = endX - startX;

      console.log("startX:", startX);
      console.log("endX:", endX);
      console.log("barWidth:", barWidth);
      console.log("chartWidth:", chartWidth);
      console.log("totalDays:", totalDays);

      backgroundRect.setAttribute("x", startX);
      backgroundRect.setAttribute("y", yScale(index));
      backgroundRect.setAttribute("width", barWidth);
      backgroundRect.setAttribute("height", barHeight);
      // 배경을 투명하게 설정
      backgroundRect.setAttribute("fill", "transparent");
      backgroundRect.setAttribute("rx", "3");
      group.appendChild(backgroundRect);

      // 진행 바
      const progressRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      progressRect.setAttribute("x", startX);
      progressRect.setAttribute("y", yScale(index));
      progressRect.setAttribute("width", barWidth * (item.progress / 100));
      progressRect.setAttribute("height", barHeight);
      // 새로운 색상 로직 사용
      const barColor = getIssueStatusColor(item);
      progressRect.setAttribute("fill", barColor);
      progressRect.setAttribute("rx", "3");
      group.appendChild(progressRect);

      // 진행률 텍스트
      if (item.progress > 0) {
        const progressText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        progressText.setAttribute("x", startX + barWidth / 2);
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
    drawTodayLine(); // 오늘 날짜 표시

    // 범례 렌더링 함수
    const drawLegend = (
      svg,
      margin,
      chartHeight,
      containerWidth,
      ganttData
    ) => {
      const legendGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      legendGroup.setAttribute("class", "legend");

      // 상태별 범례만 표시 (간단하게)
      const statusLegend = [
        { label: "완료됨", color: "#8c8c8c" },
        { label: "진행 중", color: "#1890ff" },
        { label: "이번달 완료", color: "#87ceeb" },
        { label: "미정", color: "#ff4d4f" },
      ];

      // 범례 아이템 간격 계산
      const legendItemWidth = Math.min(
        100,
        (containerWidth - margin.left - margin.right) / 4
      );
      const legendStartY = margin.top + chartHeight + 10;

      statusLegend.forEach((status, index) => {
        const legendItem = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g"
        );

        const legendRect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        legendRect.setAttribute("x", margin.left + index * legendItemWidth);
        legendRect.setAttribute("y", legendStartY);
        legendRect.setAttribute("width", 12);
        legendRect.setAttribute("height", 12);
        legendRect.setAttribute("fill", status.color);
        legendRect.setAttribute("rx", "2");
        legendItem.appendChild(legendRect);

        const legendText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        legendText.setAttribute(
          "x",
          margin.left + index * legendItemWidth + 16
        );
        legendText.setAttribute("y", legendStartY + 9);
        legendText.setAttribute(
          "font-size",
          Math.max(Math.round(containerWidth * 0.009), 9)
        );
        legendText.setAttribute("fill", "#333");
        legendText.textContent = status.label;
        legendItem.appendChild(legendText);

        legendGroup.appendChild(legendItem);
      });

      svg.appendChild(legendGroup);
    };

    drawLegend(svg, margin, chartHeight, containerWidth, ganttData);
  };

  // 차트 렌더링
  useEffect(() => {
    renderGanttChart();
  }, [issueData]);

  return (
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
  );
};

export default GanttChart;
