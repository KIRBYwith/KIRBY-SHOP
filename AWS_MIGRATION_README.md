# 🍓 Kirby Shop - AWS 기반 이커머스 플랫폼

Kirby Shop은 AWS 클라우드 인프라를 활용한 현대적인 이커머스 플랫폼입니다. FastAPI 백엔드와 React 프론트엔드로 구성되어 있으며, AWS RDS, S3, ElastiCache 등의 서비스를 활용합니다.

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI       │    │   AWS Services  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│                 │
│                 │    │                 │    │ • RDS MySQL     │
│ • Product UI    │    │ • REST API      │    │ • S3 Storage    │
│ • User Auth     │    │ • JWT Auth      │    │ • ElastiCache   │
│ • Payment       │    │ • File Upload   │    │ • CloudWatch    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 주요 기능

### 백엔드 (FastAPI)
- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **상품 관리**: 상품 CRUD, 이미지 업로드, 카테고리 관리
- **주문 시스템**: 장바구니, 주문 처리, 결제 연동
- **쿠폰 시스템**: 쿠폰 생성, 발급, 사용 관리
- **관리자 기능**: 대시보드, 사용자 관리, 통계

### 프론트엔드 (React)
- **반응형 UI**: 모바일/데스크톱 최적화
- **사용자 경험**: 직관적인 인터페이스, 실시간 업데이트
- **결제 연동**: 토스페이먼츠, 카카오페이 지원
- **이미지 처리**: S3 기반 이미지 업로드/표시

### AWS 서비스
- **RDS MySQL**: 안정적인 데이터 저장
- **S3**: 이미지 및 파일 저장
- **ElastiCache**: 세션 및 캐시 관리
- **CloudWatch**: 모니터링 및 로깅

## 📋 사전 요구사항

### 개발 환경
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- AWS CLI

### AWS 서비스
- RDS MySQL 인스턴스
- S3 버킷
- ElastiCache Redis 클러스터
- ECR (Elastic Container Registry)
- ECS (Elastic Container Service)

## 🛠️ 설치 및 설정

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/kirby-shop.git
cd kirby-shop
```

### 2. 백엔드 설정

#### 환경 변수 설정
```bash
cd kirby-shop-backend
cp env.example .env
```

`.env` 파일을 편집하여 실제 AWS 설정값을 입력하세요:
```env
# 데이터베이스 설정 (AWS RDS)
DATABASE_URL=mysql+pymysql://admin:password@your-rds-endpoint:3306/kirby_shop
DB_HOST=your-rds-endpoint.ap-northeast-2.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=kirby_shop

# AWS 설정
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=kirby-shop-images
S3_BUCKET_URL=https://kirby-shop-images.s3.ap-northeast-2.amazonaws.com

# 기타 설정...
```

#### 의존성 설치 및 실행
```bash
# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. 프론트엔드 설정

#### 환경 변수 설정
```bash
cd kirby-shop
cp env.example .env
```

`.env` 파일을 편집하세요:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_S3_BUCKET_URL=https://kirby-shop-images.s3.ap-northeast-2.amazonaws.com
REACT_APP_TOSS_CLIENT_KEY=your-toss-client-key
REACT_APP_KAKAO_PAY_KEY=your-kakao-pay-key
```

#### 의존성 설치 및 실행
```bash
npm install
npm start
```

## 🐳 Docker를 사용한 실행

### 개발 환경
```bash
cd kirby-shop-backend
docker-compose up -d
```

### 프로덕션 배포
```bash
# 이미지 빌드 및 푸시
./deploy.sh deploy
```

## 🧪 테스트

### AWS 연결 테스트
```bash
cd kirby-shop-backend
python test_aws_connections.py
```

### API 테스트
```bash
# Swagger UI 접속
http://localhost:8000/docs
```

## 📁 프로젝트 구조

```
kirby-shop/
├── kirby-shop-backend/          # FastAPI 백엔드
│   ├── app/
│   │   ├── api/                 # API 라우터
│   │   ├── models/              # 데이터베이스 모델
│   │   ├── schemas/             # Pydantic 스키마
│   │   ├── services/            # 비즈니스 로직
│   │   ├── utils/               # 유틸리티 함수
│   │   ├── config.py            # 설정 관리
│   │   └── database.py          # 데이터베이스 연결
│   ├── requirements.txt         # Python 의존성
│   ├── Dockerfile              # Docker 설정
│   ├── docker-compose.yml     # Docker Compose 설정
│   ├── deploy.sh              # 배포 스크립트
│   └── test_aws_connections.py # AWS 연결 테스트
│
└── kirby-shop/                 # React 프론트엔드
    ├── src/
    │   ├── components/         # React 컴포넌트
    │   ├── pages/              # 페이지 컴포넌트
    │   ├── hooks/              # 커스텀 훅
    │   ├── contexts/           # React Context
    │   ├── styles/             # CSS 스타일
    │   └── utils/              # 유틸리티 함수
    ├── public/                 # 정적 파일
    └── package.json           # Node.js 의존성
```

## 🔧 주요 설정

### AWS RDS 설정
- **엔진**: MySQL 8.0
- **인스턴스 클래스**: db.t3.micro (개발), db.t3.small (프로덕션)
- **스토리지**: 20GB GP2
- **백업**: 7일 보관
- **멀티 AZ**: 프로덕션 환경에서 활성화

### S3 버킷 설정
- **버킷명**: kirby-shop-images
- **리전**: ap-northeast-2
- **접근 권한**: 퍼블릭 읽기, 인증된 사용자 쓰기
- **CORS**: 프론트엔드 도메인 허용

### ElastiCache 설정
- **엔진**: Redis 7.x
- **노드 타입**: cache.t3.micro
- **포트**: 6379
- **보안**: VPC 내부 접근만 허용

## 🚀 배포

### AWS ECS 배포
```bash
# 배포 스크립트 실행
./deploy.sh deploy

# 롤백
./deploy.sh rollback

# 헬스체크
./deploy.sh health
```

### 수동 배포
```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드 및 푸시
docker build -t kirby-shop-api .
docker tag kirby-shop-api:latest 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/kirby-shop-api:latest
docker push 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/kirby-shop-api:latest

# ECS 서비스 업데이트
aws ecs update-service --cluster kirby-shop-cluster --service kirby-shop-service --force-new-deployment
```

## 📊 모니터링

### CloudWatch 메트릭
- **API 응답 시간**
- **데이터베이스 연결 수**
- **S3 요청 수**
- **에러율**

### 로깅
- **애플리케이션 로그**: CloudWatch Logs
- **액세스 로그**: ALB 로그
- **데이터베이스 로그**: RDS 로그

## 🔒 보안

### 데이터 보호
- **암호화**: 전송 중 및 저장 시 암호화
- **접근 제어**: IAM 역할 기반 권한 관리
- **네트워크 보안**: VPC, 보안 그룹 설정

### 인증 및 권한
- **JWT 토큰**: 사용자 인증
- **API 키**: 서비스 간 인증
- **CORS**: 허용된 도메인만 접근

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 다음을 통해 연락해주세요:

- **이슈 트래커**: GitHub Issues
- **이메일**: support@kirby-shop.com
- **문서**: [Wiki 페이지](https://github.com/your-username/kirby-shop/wiki)

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [AWS SDK](https://aws.amazon.com/sdk/)
- [SQLAlchemy](https://www.sqlalchemy.org/)

---

**Made with ❤️ by Kirby Shop Team**

