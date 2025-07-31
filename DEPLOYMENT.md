# 🚀 프로젝트 관리 대시보드 배포 가이드

## 📋 개요

이 프로젝트는 React로 개발된 프로젝트 관리 대시보드입니다.

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 16+
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/yourusername/project-dashboard.git
cd project-dashboard

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

## 🚀 배포 방법

### 방법 1: 로컬 빌드 및 서빙

```bash
# 프로덕션 빌드
npm run build

# 빌드된 파일 서빙
npm run serve
```

### 방법 2: Docker 배포

```bash
# Docker 이미지 빌드
docker build -t project-dashboard .

# 컨테이너 실행
docker run -p 80:80 project-dashboard
```

### 방법 3: 정적 파일 서버 배포

빌드된 `build` 폴더를 회사 웹 서버에 업로드

## 🔧 환경 설정

### 개발 환경

- 포트: 3000
- 환경: development

### 프로덕션 환경

- 포트: 80 (Docker) 또는 3000 (serve)
- 환경: production

## 📝 주의사항

- 회사망에서는 외부 npm 패키지 설치가 제한될 수 있음
- 필요한 경우 npm registry를 회사 내부 저장소로 변경
- 보안 정책에 따라 일부 기능이 제한될 수 있음
