# KIRBY-SHOP
KIRBY-SHOP is a virtual website created for penetration testing practice.   
KIRBY-SHOP은 모의해킹 프로젝트를 위해 가상으로 만든 웹사이트입니다.


# 🍓 Kirby Shop - 커비 굿즈 쇼핑몰

귀여운 커비와 함께하는 특별한 쇼핑 경험을 제공하는 풀스택 이커머스 플랫폼

## ✨ 주요 기능

### 🛍️ 쇼핑 기능
- **상품 브라우징**: 다양한 커비 굿즈 탐색
- **장바구니**: 실시간 장바구니 관리
- **위시리스트**: 관심 상품 저장
- **주문 관리**: 주문 내역 및 상태 추적

### 💵 결제 시스템
- **다중 결제 수단**: 카드, 계좌이체, 간편결제
- **토스페이먼츠 연동**: 안전한 온라인 결제
- **카카오페이 연동**: 간편한 모바일 결제
- **QR 코드 결제**: 오프라인 연동 가능

### 🎁 포인트 시스템
- **적립 포인트**: 구매 시 자동 적립
- **사용 포인트**: 현금처럼 사용 가능
- **포인트 히스토리**: 적립/사용 내역 관리
- **등급 시스템**: VIP 등급별 혜택

### 💿 사용자 관리
- **회원가입/로그인**: JWT 기반 인증
- **프로필 관리**: 개인정보 수정
- **주소 관리**: 배송지 관리
- **쿠폰 시스템**: 할인 쿠폰 발급/사용

### 🛠️ 관리자 기능
- **상품 관리**: 상품 등록/수정/삭제
- **주문 관리**: 주문 처리 및 배송 관리
- **사용자 관리**: 회원 정보 관리
- **통계 대시보드**: 매출 및 사용자 분석
- **시스템 설정**: 포인트 정책, 쿠폰 관리

### 📞고객 지원
- **Q&A 시스템**: 질문과 답변
- **리뷰 시스템**: 상품 후기 작성
- **실시간 채팅**: 커비봇과의 대화
- **공지사항**: 중요 알림 및 이벤트

## 🏗️ 기술 스택

### Frontend
- **React 18.2.0**: 사용자 인터페이스
- **React Router DOM 7.9.1**: 클라이언트 사이드 라우팅
- **Lucide React**: 아이콘 라이브러리
- **Axios**: HTTP 클라이언트
- **Recharts**: 데이터 시각화

### Backend
- **FastAPI 0.104.1**: 고성능 웹 API 프레임워크
- **SQLAlchemy 2.0.35**: ORM
- **Alembic**: 데이터베이스 마이그레이션
- **PyMySQL**: MySQL 데이터베이스 연결
- **JWT**: 인증 토큰 관리

### 결제 연동
- **토스페이먼츠 SDK**: 안전한 결제 처리
- **카카오페이 API**: 모바일 결제 연동
- **QR 코드**: 오프라인 결제 지원

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Pytest**: 백엔드 테스트
- **Uvicorn**: ASGI 서버

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js >= 16.0.0
- Python >= 3.8
- MySQL >= 8.0
- npm >= 8.0.0

### Frontend 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test

# 코드 린팅
npm run lint
npm run lint:fix

# 코드 포맷팅
npm run format
```

### Backend 설정

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 설정
python create_tables.py

# 샘플 데이터 생성
python seed_coupons.py

# 서버 실행
python run.py
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스
DATABASE_URL=mysql+pymysql://username:password@localhost/kirby_shop

# JWT 설정
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 결제 API
TOSS_CLIENT_KEY=your-toss-client-key
TOSS_SECRET_KEY=your-toss-secret-key
KAKAO_PAY_ADMIN_KEY=your-kakao-pay-admin-key

# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 📁 프로젝트 구조

```
kirby-shop/
├── public/                 # 정적 파일
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트
│   │   ├── auth/          # 인증 관련 컴포넌트
│   │   ├── cart/          # 장바구니 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── payment/       # 결제 관련 컴포넌트
│   │   └── product/       # 상품 관련 컴포넌트
│   ├── contexts/          # React Context
│   ├── hooks/             # 커스텀 훅
│   ├── pages/             # 페이지 컴포넌트
│   ├── styles/            # CSS 스타일
│   └── utils/             # 유틸리티 함수
└── kirby-shop-backend/
    ├── app/
    │   ├── api/           # API 엔드포인트
    │   ├── models/        # 데이터베이스 모델
    │   ├── schemas/       # Pydantic 스키마
    │   ├── services/      # 비즈니스 로직
    │   └── utils/         # 유틸리티 함수
    ├── requirements.txt   # Python 의존성
    └── run.py            # 서버 실행 파일
```

## 🔧 주요 API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 사용자 정보 조회

### 상품
- `GET /products` - 상품 목록 조회
- `GET /products/{id}` - 상품 상세 조회
- `POST /products` - 상품 등록 (관리자)
- `PUT /products/{id}` - 상품 수정 (관리자)

### 장바구니
- `GET /cart` - 장바구니 조회
- `POST /cart` - 장바구니 추가
- `PUT /cart/{id}` - 장바구니 수정
- `DELETE /cart/{id}` - 장바구니 삭제

### 주문
- `POST /orders` - 주문 생성
- `GET /orders` - 주문 내역 조회
- `GET /orders/{id}` - 주문 상세 조회
- `PUT /orders/{id}/status` - 주문 상태 변경

### 결제
- `POST /payments/toss` - 토스페이먼츠 결제
- `POST /payments/kakao` - 카카오페이 결제
- `POST /payments/qr` - QR 코드 결제

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **다크/라이트 모드**: 사용자 선호도에 따른 테마 변경
- **애니메이션**: 부드러운 전환 효과
- **접근성**: WCAG 가이드라인 준수
- **로딩 상태**: 사용자 경험 향상을 위한 로딩 인디케이터

## 🔒 보안 기능

- **JWT 인증**: 안전한 토큰 기반 인증
- **CORS 설정**: 크로스 오리진 요청 제어
- **입력 검증**: Pydantic을 통한 데이터 검증
- **SQL 인젝션 방지**: SQLAlchemy ORM 사용
- **XSS 방지**: 입력 데이터 이스케이핑

## 📊 성능 최적화

- **코드 스플리팅**: React.lazy를 통한 지연 로딩
- **이미지 최적화**: WebP 포맷 지원
- **캐싱**: Redis를 통한 데이터 캐싱
- **데이터베이스 최적화**: 인덱싱 및 쿼리 최적화
- **번들 최적화**: Webpack을 통한 번들 크기 최적화

## 🧪 테스트

```bash
# 프론트엔드 테스트
npm test

# 백엔드 테스트
pytest

# 통합 테스트
npm run test:integration
```

## 🚀 배포

### Frontend (Vercel/Netlify)
```bash
npm run build
# build 폴더를 배포 플랫폼에 업로드
```

### Backend (Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py"]
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

**🍓 Kirby Shop과 함께 특별한 쇼핑 경험을 즐겨보세요!**
