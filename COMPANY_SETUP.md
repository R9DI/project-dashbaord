# 🏢 회사 환경 설정 가이드

## 📋 필수 버전 정보

### 현재 개발 환경

- **Node.js**: v22.11.0 (회사: v22.17.1)
- **npm**: v10.9.0 (회사: v10.9.2)
- **React**: 18.2.0
- **Create React App**: 5.0.1

### 회사 환경

- **Node.js**: v22.17.1
- **npm**: v10.9.2

## 🛠️ 회사에서 설치해야 할 것들

### 1. Node.js 설치

```bash
# 버전 확인 (16.0.0 이상 필요)
node --version

# 만약 설치 안되어 있다면:
# Windows: https://nodejs.org/ 에서 LTS 버전 다운로드
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

### 2. npm 버전 확인

```bash
npm --version
# 8.0.0 이상이어야 함
```

## 🚀 프로젝트 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/R9DI/project-dashbaord.git
cd project-dashbaord
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm start
```

## 🔧 회사망 환경 대응

### SSL 인증서 문제

```bash
git config --global http.sslVerify false
```

### 프록시 설정 (필요시)

```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### 회사 내부 npm registry (필요시)

```bash
npm config set registry http://npm.company.com/
```

## 📝 문제 해결

### 의존성 설치 오류

```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules
rm package-lock.json
npm install
```

### 포트 충돌

```bash
# 다른 포트로 실행
set PORT=3001 && npm start  # Windows
PORT=3001 npm start         # macOS/Linux
```

### 권한 문제 (Windows)

관리자 권한으로 명령 프롬프트 실행

## 🎯 권장 사항

1. **Node.js LTS 버전 사용** (안정성)
2. **회사 보안 정책 확인** (프록시, 방화벽)
3. **개발 도구 통일** (VS Code, WebStorm 등)
4. **Git 설정 확인** (사용자 정보, SSL 설정)

## 📞 지원

문제 발생 시 다음 정보를 포함하여 문의:

- OS 버전
- Node.js 버전
- npm 버전
- 오류 메시지 전체
- 회사 네트워크 환경 (프록시 사용 여부)
