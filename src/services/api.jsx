// 실제 API 호출을 시뮬레이션하는 함수들
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 로컬 프로젝트 데이터 저장소
let localProjects = null;

// 로컬 이슈 데이터 저장소
let localIssues = null;

// 이슈 데이터 API
export const issueApi = {
  // 이슈 목록 가져오기 (전체)
  getIssues: async () => {
    await delay(500); // 실제 API 호출 시뮬레이션

    // 로컬 이슈 데이터가 있으면 반환
    if (localIssues) {
      return localIssues;
    }

    // 초기 이슈 데이터 (프로젝트별로 2-3개씩 구성)
    const initialIssues = [
      // 프로젝트 1: 5G 네트워크 최적화 (3개)
      {
        id: 1,
        projectId: 1,
        issue: "5G 신호 강도 최적화",
        summary: "5G 기지국 신호 강도 개선 필요",
        status: "in-progress",
        img: "https://dummyimage.com/800x300/4A90E2/FFFFFF.png&text=5G+Signal+Optimization",
        detail: `# 5G 신호 강도 최적화

## 📋 요약
5G 기지국 신호 강도가 일부 지역에서 불안정하여 사용자 경험 저하

## 🔍 상세 내용
- 신호 강도 측정 결과: -85dBm ~ -95dBm (목표: -70dBm 이하)
- 건물 내부 신호 감쇠 현상 발생
- 간섭 신호로 인한 통신 품질 저하

## ✅ 체크리스트
- [x] 신호 강도 측정 및 분석
- [x] 간섭 신호 소스 파악
- [ ] 안테나 각도 조정
- [ ] 전력 출력 최적화
- [ ] 사용자 피드백 수집

## 📅 일정
- **시작일**: 2025-01-15
- **예상 완료일**: 2025-02-28
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 김네트워크
- **카테고리**: 인프라`,
        start: "2025-01-15",
        end: "2025-02-28",
        file: "5g_signal_optimization.pdf",
        progress: "신호 강도 측정 및 분석 완료, 간섭 신호 소스 파악 완료",
      },
      {
        id: 2,
        projectId: 1,
        issue: "네트워크 지연 시간 개선",
        summary: "5G 네트워크 지연 시간 10ms 이하 달성",
        status: "pending",
        img: "https://dummyimage.com/300x800/50C878/FFFFFF.png&text=Network+Latency",
        detail: `# 네트워크 지연 시간 개선

## 📋 요약
5G 네트워크 지연 시간을 10ms 이하로 개선하여 실시간 서비스 품질 향상

## 🔍 상세 내용
- 현재 평균 지연 시간: 15ms
- 목표 지연 시간: 10ms 이하
- 핵심 네트워크 노드 최적화 필요
- 라우팅 알고리즘 개선 검토

## ✅ 체크리스트
- [ ] 현재 지연 시간 측정
- [ ] 병목 구간 분석
- [ ] 라우팅 알고리즘 개선
- [ ] 네트워크 토폴로지 최적화
- [ ] 성능 테스트 실행

## 📅 일정
- **시작일**: 2025-02-01
- **예상 완료일**: 2025-03-15
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 중간
- **담당자**: 박성능
- **카테고리**: 성능`,
        start: "2025-02-01",
        end: "2025-03-15",
        file: "network_latency_improvement.pdf",
        progress: "프로젝트 계획 수립 완료, 팀 구성 완료",
      },
      {
        id: 3,
        projectId: 1,
        issue: "5G 슬라이싱 기술 적용",
        summary: "네트워크 슬라이싱으로 서비스별 QoS 보장",
        status: "completed",
        img: "https://dummyimage.com/400x600/FF8C00/FFFFFF.png&text=Network+Slicing",
        detail: `# 5G 슬라이싱 기술 적용

## 📋 요약
네트워크 슬라이싱 기술을 적용하여 서비스별로 차별화된 QoS 제공

## 🔍 상세 내용
- eMBB, URLLC, mMTC 서비스별 슬라이스 구성
- 각 슬라이스별 대역폭 및 지연 시간 보장
- 동적 슬라이스 리소스 할당 구현
- 모니터링 및 관리 시스템 구축

## ✅ 체크리스트
- [x] 슬라이스 아키텍처 설계
- [x] 리소스 할당 알고리즘 개발
- [x] 모니터링 시스템 구축
- [x] 테스트 및 검증 완료
- [x] 운영 환경 배포

## 📅 일정
- **시작일**: 2024-11-01
- **예상 완료일**: 2025-01-15
- **실제 완료일**: 2025-01-10

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 이슬라이싱
- **카테고리**: 신기술`,
        start: "2024-11-01",
        end: "2025-01-10",
        file: "5g_slicing_implementation.pdf",
        progress: "모든 작업 완료, 운영 환경에서 안정적으로 동작 중",
      },

      // 프로젝트 2: AI 기반 품질 검사 (2개)
      {
        id: 4,
        projectId: 2,
        issue: "AI 모델 정확도 향상",
        summary: "품질 검사 AI 모델 정확도를 95% 이상으로 개선",
        status: "in-progress",
        img: "https://dummyimage.com/600x200/9B59B6/FFFFFF.png&text=AI+Model+Accuracy",
        detail: `# AI 모델 정확도 향상

## 📋 요약
품질 검사 AI 모델의 정확도를 현재 88%에서 95% 이상으로 개선

## 🔍 상세 내용
- 현재 모델 정확도: 88%
- 목표 정확도: 95% 이상
- 오검출률(FPR) 3% 이하 달성
- 미검출률(FNR) 2% 이하 달성
- 데이터 증강 및 전처리 기법 적용

## ✅ 체크리스트
- [x] 현재 모델 성능 분석
- [x] 데이터 품질 개선
- [ ] 데이터 증강 기법 적용
- [ ] 모델 아키텍처 최적화
- [ ] 하이퍼파라미터 튜닝
- [ ] 검증 데이터셋으로 테스트

## 📅 일정
- **시작일**: 2025-01-10
- **예상 완료일**: 2025-03-20
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 최AI
- **카테고리**: AI/ML`,
        start: "2025-01-10",
        end: "2025-03-20",
        file: "ai_model_accuracy_improvement.pdf",
        progress: "현재 모델 성능 분석 완료, 데이터 품질 개선 완료",
      },
      {
        id: 5,
        projectId: 2,
        issue: "실시간 처리 속도 개선",
        summary: "품질 검사 처리 속도를 초당 100개로 향상",
        status: "blocked",
        img: "https://dummyimage.com/100x100/FF6B6B/FFFFFF.png&text=Real-time+Processing",
        detail: `# 실시간 처리 속도 개선

## 📋 요약
품질 검사 AI 시스템의 처리 속도를 초당 100개로 향상하여 생산성 증대

## 🔍 상세 내용
- 현재 처리 속도: 초당 60개
- 목표 처리 속도: 초당 100개
- GPU 메모리 부족 문제 발생
- 병렬 처리 최적화 필요
- 배치 크기 조정 검토

## ✅ 체크리스트
- [x] 현재 성능 측정
- [x] 병목 구간 분석
- [ ] GPU 메모리 확장
- [ ] 병렬 처리 최적화
- [ ] 배치 크기 최적화
- [ ] 성능 테스트

## 📅 일정
- **시작일**: 2025-01-20
- **예상 완료일**: 2025-03-30
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 중간
- **담당자**: 정성능
- **카테고리**: 성능`,
        start: "2025-01-20",
        end: "2025-03-30",
        file: "real_time_processing_improvement.pdf",
        progress:
          "현재 성능 측정 완료, 병목 구간 분석 완료, GPU 메모리 확장 대기 중",
      },

      // 프로젝트 3: IoT 센서 데이터 분석 (2개)
      {
        id: 6,
        projectId: 3,
        issue: "센서 데이터 수집 시스템 구축",
        summary: "IoT 센서에서 실시간 데이터 수집 시스템 구축",
        status: "completed",
        img: "https://dummyimage.com/800x300/4A90E2/FFFFFF.png&text=Sensor+Data+Collection",
        detail: `# 센서 데이터 수집 시스템 구축

## 📋 요약
IoT 센서에서 실시간으로 데이터를 수집하고 저장하는 시스템 구축 완료

## 🔍 상세 내용
- 다양한 IoT 센서 지원 (온도, 습도, 압력, 진동 등)
- 실시간 데이터 스트리밍 구현
- 데이터베이스 스키마 설계 및 구축
- 데이터 무결성 보장
- 확장 가능한 아키텍처 구현

## ✅ 체크리스트
- [x] 센서 통신 프로토콜 구현
- [x] 데이터베이스 스키마 설계
- [x] 실시간 스트리밍 구현
- [x] 데이터 검증 로직 구현
- [x] 모니터링 시스템 구축
- [x] 테스트 및 검증 완료

## 📅 일정
- **시작일**: 2024-10-01
- **예상 완료일**: 2024-12-31
- **실제 완료일**: 2024-12-20

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 박IoT
- **카테고리**: IoT`,
        start: "2024-10-01",
        end: "2024-12-20",
        file: "sensor_data_collection_system.pdf",
        progress: "모든 작업 완료, 운영 환경에서 안정적으로 동작 중",
      },
      {
        id: 7,
        projectId: 3,
        issue: "데이터 분석 알고리즘 개발",
        summary: "수집된 센서 데이터를 분석하는 ML 알고리즘 개발",
        status: "in-progress",
        img: "https://dummyimage.com/300x800/50C878/FFFFFF.png&text=Data+Analysis+Algorithm",
        detail: `# 데이터 분석 알고리즘 개발

## 📋 요약
수집된 IoT 센서 데이터를 분석하여 패턴을 발견하고 예측 모델을 개발

## 🔍 상세 내용
- 시계열 데이터 분석 기법 적용
- 이상치 탐지 알고리즘 개발
- 예측 모델 개발 (온도, 습도 등)
- 데이터 시각화 대시보드 구축
- 실시간 분석 결과 제공

## ✅ 체크리스트
- [x] 데이터 탐색 및 전처리
- [x] 시계열 분석 기법 연구
- [ ] 이상치 탐지 알고리즘 개발
- [ ] 예측 모델 개발
- [ ] 시각화 대시보드 구축
- [ ] 성능 테스트 및 최적화

## 📅 일정
- **시작일**: 2025-01-01
- **예상 완료일**: 2025-04-15
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 이데이터
- **카테고리**: AI/ML`,
        start: "2025-01-01",
        end: "2025-04-15",
        file: "data_analysis_algorithm_development.pdf",
        progress: "데이터 탐색 및 전처리 완료, 시계열 분석 기법 연구 완료",
      },

      // 프로젝트 4: 클라우드 마이그레이션 (2개)
      {
        id: 8,
        projectId: 4,
        issue: "온프레미스 서버 마이그레이션",
        summary: "기존 온프레미스 서버를 클라우드로 마이그레이션",
        status: "in-progress",
        img: "https://dummyimage.com/600x200/9B59B6/FFFFFF.png&text=Cloud+Migration",
        detail: `# 온프레미스 서버 마이그레이션

## 📋 요약
기존 온프레미스 환경의 서버들을 AWS 클라우드로 단계적 마이그레이션

## 🔍 상세 내용
- 50대 서버 중 20대 마이그레이션 완료
- 데이터베이스 마이그레이션 진행 중
- 네트워크 설정 및 보안 그룹 구성
- 모니터링 및 로깅 시스템 구축
- 백업 및 재해 복구 전략 수립

## ✅ 체크리스트
- [x] 클라우드 아키텍처 설계
- [x] 20대 서버 마이그레이션
- [ ] 데이터베이스 마이그레이션
- [ ] 나머지 30대 서버 마이그레이션
- [ ] 성능 테스트 및 최적화
- [ ] 운영 환경 안정화

## 📅 일정
- **시작일**: 2024-12-01
- **예상 완료일**: 2025-05-31
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 김클라우드
- **카테고리**: 인프라`,
        start: "2024-12-01",
        end: "2025-05-31",
        file: "cloud_migration_plan.pdf",
        progress: "클라우드 아키텍처 설계 완료, 20대 서버 마이그레이션 완료",
      },
      {
        id: 9,
        projectId: 4,
        issue: "클라우드 비용 최적화",
        summary: "클라우드 사용 비용을 30% 절감",
        status: "pending",
        img: "https://dummyimage.com/400x600/FF8C00/FFFFFF.png&text=Cost+Optimization",
        detail: `# 클라우드 비용 최적화

## 📋 요약
클라우드 리소스 사용량을 최적화하여 월 사용 비용을 30% 절감

## 🔍 상세 내용
- 현재 월 사용 비용: $15,000
- 목표 비용: $10,500 (30% 절감)
- 사용하지 않는 리소스 정리
- 예약 인스턴스 및 스팟 인스턴스 활용
- 자동 스케일링 정책 최적화

## ✅ 체크리스트
- [ ] 현재 리소스 사용량 분석
- [ ] 사용하지 않는 리소스 정리
- [ ] 예약 인스턴스 전략 수립
- [ ] 자동 스케일링 정책 최적화
- [ ] 비용 모니터링 대시보드 구축
- [ ] 정기적인 비용 검토 프로세스 수립

## 📅 일정
- **시작일**: 2025-03-01
- **예상 완료일**: 2025-05-31
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 중간
- **담당자**: 박비용
- **카테고리**: 운영`,
        start: "2025-03-01",
        end: "2025-05-31",
        file: "cloud_cost_optimization.pdf",
        progress: "프로젝트 계획 수립 완료, 팀 구성 완료",
      },

      // 프로젝트 5: 보안 인증 시스템 (2개)
      {
        id: 10,
        projectId: 5,
        issue: "다중 인증 시스템 구축",
        summary: "2FA, 생체인식 등 다중 인증 시스템 구축",
        status: "in-progress",
        img: "https://dummyimage.com/800x300/4A90E2/FFFFFF.png&text=Multi+Factor+Authentication",
        detail: `# 다중 인증 시스템 구축

## 📋 요약
사용자 보안 강화를 위한 2FA, 생체인식 등 다중 인증 시스템 구축

## 🔍 상세 내용
- SMS, 이메일 기반 2FA 구현
- 지문, 얼굴인식 생체인식 지원
- 하드웨어 토큰 지원 (YubiKey 등)
- 백업 코드 시스템 구현
- 사용자 교육 및 가이드 제공

## ✅ 체크리스트
- [x] 2FA 시스템 설계
- [x] SMS/이메일 인증 구현
- [ ] 생체인식 시스템 연동
- [ ] 하드웨어 토큰 지원
- [ ] 백업 코드 시스템 구현
- [ ] 보안 테스트 및 검증

## 📅 일정
- **시작일**: 2025-01-05
- **예상 완료일**: 2025-04-30
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 높음
- **담당자**: 이보안
- **카테고리**: 보안`,
        start: "2025-01-05",
        end: "2025-04-30",
        file: "multi_factor_authentication.pdf",
        progress: "2FA 시스템 설계 완료, SMS/이메일 인증 구현 완료",
      },
      {
        id: 11,
        projectId: 5,
        issue: "보안 정책 및 가이드라인 수립",
        summary: "다중 인증 시스템 운영을 위한 보안 정책 수립",
        status: "pending",
        img: "https://dummyimage.com/300x800/50C878/FFFFFF.png&text=Security+Policy",
        detail: `# 보안 정책 및 가이드라인 수립

## 📋 요약
다중 인증 시스템 운영을 위한 보안 정책, 절차, 가이드라인 수립

## 🔍 상세 내용
- 다중 인증 필수 적용 대상 정의
- 인증 방법별 보안 수준 분류
- 예외 상황 처리 절차 수립
- 사용자 교육 자료 작성
- 정기적인 보안 점검 계획 수립

## ✅ 체크리스트
- [ ] 보안 정책 초안 작성
- [ ] 이해관계자 검토 및 승인
- [ ] 운영 절차 문서화
- [ ] 사용자 교육 자료 작성
- [ ] 정책 시행 및 모니터링
- [ ] 정기적인 정책 검토 및 업데이트

## 📅 일정
- **시작일**: 2025-03-15
- **예상 완료일**: 2025-05-31
- **실제 완료일**: 

## 🏷️ 태그
- **우선순위**: 중간
- **담당자**: 김정책
- **카테고리**: 정책`,
        start: "2025-03-15",
        end: "2025-05-31",
        file: "security_policy_guidelines.pdf",
        progress: "프로젝트 계획 수립 완료, 팀 구성 완료",
      },
    ];

    // 로컬 데이터에 저장
    localIssues = initialIssues;
    return localIssues;
  },

  // 프로젝트별 이슈 목록 가져오기 (새로 추가)
  getIssuesByProject: async (projectId) => {
    console.log("API - getIssuesByProject 호출됨 - projectId:", projectId);
    console.log("API - projectId 타입:", typeof projectId);
    console.log("API - localIssues 존재 여부:", !!localIssues);

    await delay(300); // 실제 API 호출 시뮬레이션

    // projectId가 null이나 undefined인 경우에만 빈 배열 반환 (0은 유효한 ID)
    if (projectId === null || projectId === undefined) {
      console.log("프로젝트 ID가 제공되지 않아 빈 배열을 반환합니다.");
      return [];
    }

    // 프로젝트 ID로 이슈 필터링 (숫자 비교를 위해 타입 변환)
    if (localIssues) {
      console.log("API - 전체 이슈 개수:", localIssues.length);
      console.log(
        "API - 전체 이슈 projectId 목록:",
        localIssues.map((issue) => issue.projectId)
      );

      const filteredIssues = localIssues.filter(
        (issue) => Number(issue.projectId) === Number(projectId)
      );

      console.log(
        `프로젝트 ID ${projectId}에 대한 이슈 ${filteredIssues.length}개 조회:`,
        filteredIssues.map((issue) => ({
          id: issue.id,
          issue: issue.issue,
          projectId: issue.projectId,
        }))
      );
      return filteredIssues;
    }

    // 초기 데이터가 없으면 전체 이슈를 가져와서 필터링
    console.log("API - localIssues가 없어 전체 이슈를 가져옵니다.");
    const allIssues = await issueApi.getIssues();
    const filteredIssues = allIssues.filter(
      (issue) => Number(issue.projectId) === Number(projectId)
    );

    console.log(
      `프로젝트 ID ${projectId}에 대한 이슈 ${filteredIssues.length}개 조회:`,
      filteredIssues.map((issue) => ({
        id: issue.id,
        issue: issue.issue,
        projectId: issue.projectId,
      }))
    );
    return filteredIssues;
  },

  // 이슈 업데이트
  updateIssue: async (id, data) => {
    await delay(300);

    // 로컬 데이터에서 해당 이슈 찾아서 업데이트
    if (localIssues) {
      const index = localIssues.findIndex((issue) => issue.id === id);
      if (index !== -1) {
        localIssues[index] = { ...localIssues[index], ...data };
        console.log(`이슈 ${id} 업데이트 완료:`, localIssues[index]);
      }
    }

    // 업데이트된 데이터를 반환하여 캐시에 즉시 반영
    return { id, ...data };
  },

  // 새 이슈 생성
  createIssue: async (data) => {
    await delay(300);

    // 고유 ID 생성 (기존 ID들과 중복되지 않도록)
    const newId =
      Math.max(...(localIssues?.map((issue) => issue.id) || [0])) + 1;

    const newIssue = {
      id: newId,
      ...data,
      // 프로젝트 ID가 없으면 기본값 설정 (실제로는 필수)
      projectId: data.projectId || 1,
      // 생성 시간 추가
      createdAt: new Date().toISOString(),
    };

    // 로컬 데이터에 새 이슈 추가
    if (localIssues) {
      localIssues.push(newIssue);
    } else {
      localIssues = [newIssue];
    }

    console.log("새 이슈 생성 완료:", newIssue);
    return newIssue;
  },
};

// 프로젝트 데이터 API
export const projectApi = {
  // 프로젝트 목록 가져오기
  getProjects: async () => {
    await delay(500);

    // 이미 로컬 데이터가 있으면 반환
    if (localProjects) {
      return localProjects;
    }

    // 고정된 프로젝트 목록 (이슈 데이터와 일치, ID 순서대로 정렬)
    const projectData = [
      {
        id: 1,
        projectName: "5G 네트워크 최적화",
        inlinePassRate: 0.95,
        elecPassRate: 0.92,
        issueResponseIndex: 0.88,
        wipAchievementRate: 0.85,
        deadlineAchievementRate: 0.9,
        finalScore: 0.95 * 0.92 * 0.88 * 0.85 * 0.9,
        remark: "정상 진행 중",
      },
      {
        id: 2,
        projectName: "AI 기반 품질 검사",
        inlinePassRate: 0.88,
        elecPassRate: 0.85,
        issueResponseIndex: 0.82,
        wipAchievementRate: 0.78,
        deadlineAchievementRate: 0.85,
        finalScore: 0.88 * 0.85 * 0.82 * 0.78 * 0.85,
        remark: "일정 지연 발생",
      },
      {
        id: 3,
        projectName: "IoT 센서 데이터 분석",
        inlinePassRate: 0.92,
        elecPassRate: 0.9,
        issueResponseIndex: 0.95,
        wipAchievementRate: 0.88,
        deadlineAchievementRate: 0.92,
        finalScore: 0.92 * 0.9 * 0.95 * 0.88 * 0.92,
        remark: "테스트 완료",
      },
      {
        id: 4,
        projectName: "클라우드 마이그레이션",
        inlinePassRate: 0.85,
        elecPassRate: 0.82,
        issueResponseIndex: 0.78,
        wipAchievementRate: 0.75,
        deadlineAchievementRate: 0.8,
        finalScore: 0.85 * 0.82 * 0.78 * 0.75 * 0.8,
        remark: "기술적 난제 해결 중",
      },
      {
        id: 5,
        projectName: "보안 인증 시스템",
        inlinePassRate: 0.9,
        elecPassRate: 0.88,
        issueResponseIndex: 0.85,
        wipAchievementRate: 0.82,
        deadlineAchievementRate: 0.88,
        finalScore: 0.9 * 0.88 * 0.85 * 0.82 * 0.88,
        remark: "보안 검토 완료",
      },
    ];

    // ID 순서대로 정렬하여 일정하게 표시 (이미 정렬되어 있음)
    const sortedProjects = projectData.sort((a, b) => a.id - b.id);

    // 로컬 데이터에 저장
    localProjects = sortedProjects;
    return localProjects;
  },

  // 프로젝트 추가
  addProject: async (data) => {
    await delay(300);
    const newProject = { id: Date.now(), ...data };

    // 로컬 데이터에 새 프로젝트 추가
    if (localProjects) {
      localProjects.push(newProject);
    } else {
      localProjects = [newProject];
    }

    return newProject;
  },
};
