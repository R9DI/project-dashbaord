# 🚀 프로젝트 관리 대시보드

React로 개발된 프로젝트 관리 및 이슈 추적 대시보드입니다.

## 📋 기능

- 📊 **프로젝트 대시보드**: 성과 지표 및 통계
- 📅 **간트 차트**: 이슈 진행 상황 시각화
- 🎯 **이슈 관리**: 상세 이슈 추적 및 관리
- 🎨 **반응형 UI**: 다양한 화면 크기 지원

## 🛠️ 설치 및 실행

### 필수 요구사항

- **Node.js**: 16.0.0 이상
- **npm**: 8.0.0 이상

### 설치 방법

```bash
# 1. 저장소 클론
git clone https://github.com/R9DI/project-dashbaord.git
cd project-dashbaord

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm start
```

### 회사망 환경에서

```bash
# SSL 인증서 문제 해결
git config --global http.sslVerify false

# 의존성 설치 (오류 발생 시)
rm -rf node_modules
rm package-lock.json
npm install

# 개발 서버 실행
npm start
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Dashboard.js      # 메인 대시보드
│   ├── IssueModal.js     # 이슈 관리 모달
│   └── GanttChart.js     # 간트 차트
├── App.js               # 메인 앱 컴포넌트
└── index.js             # 앱 진입점
```

## 🚀 사용법

1. **대시보드 확인**: 메인 페이지에서 프로젝트 성과 지표 확인
2. **이슈 관리**: "Issue 대응지수" 버튼 클릭하여 이슈 모달 열기
3. **간트 차트**: 이슈 진행 상황을 시각적으로 확인
4. **새 이슈 추가**: "새 이슈 추가" 버튼으로 이슈 생성

## 🔧 문제 해결

### 의존성 설치 오류

```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 포트 충돌

```bash
# 다른 포트로 실행
PORT=3001 npm start
```

### SSL 인증서 오류

```bash
# Git SSL 검증 비활성화
git config --global http.sslVerify false
```

## 📝 기술 스택

- **React**: 18.2.0
- **Ant Design**: 5.26.6
- **Ag-Grid**: 24.0.0
- **Day.js**: 1.11.13
- **React Quill**: 2.0.0

## 🎯 주요 기능

- ✅ **프로젝트 성과 대시보드**
- ✅ **이슈 관리 시스템**
- ✅ **간트 차트 시각화**
- ✅ **반응형 디자인**
- ✅ **실시간 데이터 업데이트**
