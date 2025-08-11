# Project Issue Management System

React 기반의 프로젝트 이슈 관리 및 성능 추적 대시보드 시스템입니다.

## 🚀 주요 기능

### 📊 대시보드 (Dashboard)

- **프로젝트 성능 지표 관리**: Inline/Elec 합격률, Issue 대응지수, WIP 실적 달성률, 납기달성률
- **실시간 통계**: 승률, 무승부, 패배률 계산 및 시각화
- **동적 색상 설정**: Zustand를 통한 색상 임계값 관리
- **데이터 관리**: React Query를 통한 프로젝트 CRUD 작업

### 🔧 이슈 관리 (Issue Modal)

- **이슈 목록 관리**: React Query를 통한 이슈 데이터 관리
- **간트 차트**: 이슈 스케줄 시각화
- **상세 편집**: 드로워를 통한 이슈 상세 정보 편집
- **이미지/파일 첨부**: 다중 이미지 및 파일 업로드 지원
- **상태 관리**: pending, in-progress, completed, blocked 상태 추적

## 🛠 기술 스택

- **Frontend**: React 18, Vite
- **UI Framework**: Ant Design 5
- **Data Grid**: AG Grid Community
- **State Management**:
  - **Zustand**: 모달 상태, 색상 설정 관리
  - **React Query**: 서버 상태 관리 및 캐싱
- **Charts**: Custom Gantt Chart Component
- **Date Handling**: Day.js
- **Rich Text Editor**: React Quill

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트 통합 관리
│   ├── index.jsx       # 컴포넌트 통합 export
│   ├── Dashboard/       # 대시보드 관련 컴포넌트 그룹
│   │   ├── index.jsx   # 메인 대시보드 컴포넌트
│   │   └── ColorSettingsModal.jsx  # 색상 설정 모달
│   └── IssueModal/     # 이슈 관리 관련 컴포넌트 그룹
│       ├── index.jsx   # 이슈 관리 모달
│       ├── IssueDrawer.jsx       # 이슈 상세 편집 드로워
│       ├── GanttChart.jsx        # 간트 차트 컴포넌트
│       └── GanttLegend.jsx       # 간트 차트 범례
├── hooks/              # Custom React Hooks
│   ├── useProjects.jsx # 프로젝트 관련 React Query hooks
│   └── useIssues.jsx   # 이슈 관련 React Query hooks
├── services/           # API 서비스
│   └── api.jsx         # API 호출 함수들
├── stores/             # Zustand 스토어
│   ├── colorSettingsStore.jsx  # 색상 설정 상태 관리
│   └── modalStore.jsx          # 모달 상태 관리
└── utils/              # 유틸리티 함수
    └── colorUtils.jsx  # 색상 관련 유틸리티
```

## 🔄 상태 관리 아키텍처

### React Query (서버 상태)

- **프로젝트 데이터**: `useProjects`, `useAddProject`, `useDeleteProject`
- **이슈 데이터**: `useIssues`, `useAddIssue`, `useUpdateIssue`, `useDeleteIssue`
- **캐싱 전략**: 5분 stale time, 10분 cache time
- **자동 재시도**: 실패 시 1회 재시도

### Zustand (클라이언트 상태)

- **colorSettingsStore**: 색상 임계값 설정 관리
- **modalStore**: 모달 열기/닫기 상태 관리

## 🎨 주요 UI/UX 특징

- **반응형 디자인**: 다양한 화면 크기 지원
- **동적 행 높이**: 내용에 따른 자동 높이 조정
- **실시간 색상 변경**: 성능 지표에 따른 동적 색상 적용
- **직관적인 네비게이션**: 모달과 드로워를 통한 계층적 UI
- **시각적 피드백**: 로딩 상태, 성공/실패 메시지

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 📊 데이터 플로우

1. **초기 로드**: React Query가 프로젝트 및 이슈 데이터를 자동으로 가져옴
2. **상태 업데이트**: 사용자 액션에 따라 Zustand 스토어 업데이트
3. **데이터 변경**: React Query mutation을 통한 서버 상태 업데이트
4. **캐시 무효화**: 변경 후 관련 쿼리 자동 무효화 및 재조회

## 🔧 커스터마이징

### 색상 설정

- 대시보드의 "색상 설정" 버튼을 통해 각 지표별 임계값 조정 가능
- 설정은 Zustand 스토어에 저장되어 세션 동안 유지

### 이슈 관리

- 이슈 추가/수정/삭제 기능
- 드로워를 통한 상세 정보 편집
- 이미지 및 파일 첨부 지원

## 📝 라이선스

MIT License
