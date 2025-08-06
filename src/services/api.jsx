// 실제 API 호출을 시뮬레이션하는 함수들
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 이슈 데이터 API
export const issueApi = {
  // 이슈 목록 가져오기
  getIssues: async () => {
    await delay(500); // 실제 API 호출 시뮬레이션

    return [
      {
        id: 1,
        issue: "로그인 기능 오류",
        summary: "로그인 시 500 에러 발생",
        status: "in-progress",
        img: "https://dummyimage.com/800x300/4A90E2/FFFFFF.png&text=Login+Error",
        detail: "500 에러 발생\n데이터베이스 연결 문제\n인증 시스템 불안정",
        start: "2025-06-01",
        end: "2025-06-05",
        file: "login_bug_report.pdf",
        progress:
          "로그인 오류 수정 완료\n데이터베이스 연결 문제 해결\n사용자 인증 시스템 안정화 완료",
      },
      {
        id: 2,
        issue: "UI 반응형 개선",
        summary: "모바일 메뉴 표시 문제",
        status: "pending",
        img: "https://dummyimage.com/300x800/50C878/FFFFFF.png&text=UI+Design",
        detail: "모바일 메뉴 표시 오류\nCSS 미디어 쿼리 수정\n일관된 UI 제공",
        start: "2025-06-03",
        end: "2025-07-08",
        file: "ui_improvement.pdf",
        progress:
          "모바일 메뉴 디자인 개선 중\nCSS 미디어 쿼리 수정 진행\n다양한 디바이스 테스트 예정",
      },
      {
        id: 3,
        issue: "성능 테스트 필요",
        summary: "대용량 데이터 처리 속도 저하",
        status: "blocked",
        img: "https://dummyimage.com/100x100/FF6B6B/FFFFFF.png&text=Test",
        detail:
          "대용량 데이터 처리 속도 저하\n쿼리 최적화 필요\n캐싱 전략 검토",
        start: "2025-06-05",
        end: "2025-07-12",
        file: "performance_test.pdf",
        progress:
          "성능 테스트 계획 수립 중\n테스트 환경 구성 검토\n테스트 케이스 작성 진행",
      },
      {
        id: 4,
        issue: "XSS 취약점 패치",
        summary: "XSS 공격 취약점 발견",
        status: "completed",
        img: "https://dummyimage.com/400x600/FF8C00/FFFFFF.png&text=Security",
        detail: "XSS 공격 취약점\n입력값 검증 강화\nHTML 인코딩 적용",
        start: "2025-06-10",
        end: "2025-07-15",
        file: "security_patch.pdf",
        progress:
          "XSS 취약점 분석 완료\n입력값 검증 로직 개발 중\n보안 테스트 계획 수립",
      },
      {
        id: 5,
        issue: "서버 확장성 개선",
        summary: "서버 부하 문제 해결",
        status: "in-progress",
        img: "https://dummyimage.com/600x200/9B59B6/FFFFFF.png&text=Infrastructure",
        detail: "서버 부하 문제\n로드 밸런서 도입\nCDN 검토",
        start: "2025-06-12",
        end: "2025-07-20",
        file: "infrastructure_upgrade.pdf",
        progress:
          "서버 부하 분석 완료\n로드 밸런서 도입 계획 수립\nCDN 서비스 비교 검토 중",
      },
      {
        id: 6,
        issue: "페이지 로딩 속도 개선",
        summary: "페이지 로딩 3초 초과 문제",
        status: "pending",
        img: "https://dummyimage.com/200x400/3498DB/FFFFFF.png&text=UX+Speed",
        detail: "페이지 로딩 3초 초과\n이미지 최적화\n웹팩 설정 최적화",
        start: "2025-07-01",
        end: "2025-07-25",
        file: "performance_optimization.pdf",
        progress:
          "페이지 로딩 속도 측정 완료\n이미지 최적화 작업 시작\n웹팩 설정 분석 중",
      },
    ];
  },

  // 이슈 업데이트
  updateIssue: async (id, data) => {
    await delay(300);
    // 업데이트된 데이터를 반환하여 캐시에 즉시 반영
    return { id, ...data };
  },

  // 새 이슈 생성
  createIssue: async (data) => {
    await delay(300);
    return { id: Date.now(), ...data };
  },

  // 이슈 삭제
  deleteIssue: async (id) => {
    await delay(200);
  },
};

// 프로젝트 데이터 API
export const projectApi = {
  // 프로젝트 목록 가져오기
  getProjects: async () => {
    await delay(500);

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
    ];

    const generateRandomValue = (min, max) => {
      return Math.round((Math.random() * (max - min) + min) * 100) / 100;
    };

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
  },

  // 프로젝트 추가
  addProject: async (data) => {
    await delay(300);
    return { id: Date.now(), ...data };
  },

  // 프로젝트 삭제
  deleteProject: async (id) => {
    await delay(200);
  },
};
