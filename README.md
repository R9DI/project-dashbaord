# Project Dashboard

프로젝트 관리 대시보드 애플리케이션입니다.

## 🚀 기술 스택

### Frontend

- React 18
- Vite
- Tailwind CSS
- Ant Design
- AG Grid
- React Query (TanStack Query)

### Backend

- Flask (Python)
- MongoDB (PyMongo)
- React Query for state management

## 📁 프로젝트 구조

```
shop/
├── src/                    # React 프론트엔드
│   ├── components/        # React 컴포넌트
│   ├── hooks/            # Custom hooks (React Query)
│   ├── stores/           # Zustand 상태 관리
│   ├── services/         # API 서비스
│   └── utils/            # 유틸리티 함수
├── app.py                 # Flask 메인 애플리케이션 (MongoDB)
├── run_server.py          # Flask 서버 실행 스크립트
├── requirements.txt       # Python 패키지 의존성
└── .env                   # 환경 변수 설정 (MongoDB 연결 정보)
```

## 🛠️ 설치 및 실행

### 1. MongoDB 설치 및 실행

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# MongoDB Community Server 다운로드 및 설치
# MongoDB 서비스 시작
```

### 2. Frontend (React)

```bash
# 의존성 설치
npm install
# 또는
pnpm install

# 개발 서버 실행
npm run dev
# 또는
pnpm dev
```

### 3. Backend (Flask)

```bash
# Python 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate     # Windows

# Python 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
export MONGO_URI="mongodb://localhost:27017/"
export DB_NAME="dashboard_db"

# Flask 서버 실행
python run_server.py
```

## 🌐 API 엔드포인트

### 프로젝트 관리

- `GET /api/projects` - 모든 프로젝트 조회
- `POST /api/projects` - 새 프로젝트 생성
- `PUT /api/projects/<id>` - 프로젝트 수정
- `DELETE /api/projects/<id>` - 프로젝트 삭제

### 이슈 관리

- `GET /api/issues` - 모든 이슈 조회
- `POST /api/issues` - 새 이슈 생성
- `PUT /api/issues/<id>` - 이슈 수정
- `DELETE /api/issues/<id>` - 이슈 삭제
- `GET /api/projects/<id>/issues` - 프로젝트별 이슈 조회

### 색상 설정

- `GET /api/color-settings` - 색상 기준 설정 조회
- `PUT /api/color-settings` - 색상 기준 설정 업데이트

### 통계

- `GET /api/statistics` - 프로젝트 통계 조회

### 서버 상태

- `GET /api/health` - 서버 상태 확인

## 🗄️ 데이터베이스 (MongoDB)

### Collections

#### projects

```json
{
  "_id": "ObjectId",
  "project_id": "P001",
  "project_name": "5G 네트워크 최적화",
  "inline_pass_rate": 0.95,
  "elec_pass_rate": 0.92,
  "issue_response_index": 0.88,
  "wip_achievement_rate": 0.85,
  "deadline_achievement_rate": 0.9,
  "final_score": 0.9,
  "remark": "프로젝트 설명",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### issues

```json
{
  "_id": "ObjectId",
  "project_id": "ObjectId",
  "issue_title": "이슈 제목",
  "summary": "이슈 요약",
  "status": "pending|in-progress|completed|blocked",
  "img_url": "이미지 URL",
  "detail": "상세 내용 (Markdown)",
  "start_date": "2025-01-01",
  "end_date": "2025-02-01",
  "file_name": "첨부파일명",
  "progress": "진행 상황",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### color_settings

```json
{
  "_id": "ObjectId",
  "field_name": "finalScore",
  "high_threshold": 90.0,
  "low_threshold": 70.0,
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## 🔧 환경 변수

`.env` 파일을 생성하여 다음 환경 변수를 설정할 수 있습니다:

```bash
# MongoDB 연결 정보
MONGO_URI=mongodb://localhost:27017/
DB_NAME=dashboard_db

# Flask 설정
SECRET_KEY=your-super-secret-key
FLASK_ENV=development
FLASK_DEBUG=true
HOST=0.0.0.0
PORT=5000
```

## 🚀 배포

### Docker 사용

```bash
# Docker 이미지 빌드
docker build -t project-dashboard .

# Docker 컨테이너 실행 (MongoDB 연결 필요)
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/ \
  -e DB_NAME=dashboard_db \
  project-dashboard
```

### 직접 배포

```bash
# 프로덕션 모드로 실행
export FLASK_ENV=production
export MONGO_URI=mongodb://your-mongo-server:27017/
export DB_NAME=dashboard_db
python app.py
```

## 📝 개발 가이드

### 새 API 엔드포인트 추가

1. `app.py`에 새로운 라우트 함수 추가
2. 필요한 MongoDB 컬렉션 정의
3. 프론트엔드에서 React Query hooks 사용

### React Query 사용법

```javascript
import { useProjects, useCreateProject } from "../hooks/useReactQuery";

function MyComponent() {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();

  const handleCreate = () => {
    createProject.mutate({
      projectId: "P006",
      projectName: "새 프로젝트",
    });
  };
}
```

### 데이터베이스 연결 확인

```bash
# MongoDB 연결 테스트
python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
print('MongoDB 연결 성공:', client.server_info())
"
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
