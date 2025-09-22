# Kirby Shop Backend

Kirby Shop의 백엔드 API 서버입니다. FastAPI를 기반으로 구축되었습니다.

## 🚀 시작하기

### 필수 요구사항

- Python 3.8 이상
- pip (Python 패키지 관리자)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   pip install -r requirements.txt
   ```

2. **환경변수 설정**
   ```bash
   cp env.example .env
   # .env 파일을 편집하여 필요한 설정값들을 입력하세요
   ```

3. **샘플 데이터 생성 (선택사항)**
   ```bash
   python app/utils/seed_data.py
   ```

4. **서버 실행**
   ```bash
   python run.py
   # 또는
   uvicorn app.main:app --reload
   ```

5. **API 문서 확인**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 📁 프로젝트 구조

```
kirby-shop-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 앱 진입점
│   ├── config.py            # 설정 관리
│   ├── database.py          # DB 연결
│   ├── models/              # SQLAlchemy 모델
│   ├── schemas/             # Pydantic 스키마
│   ├── api/                 # API 라우터
│   ├── services/            # 비즈니스 로직
│   └── utils/               # 유틸리티
├── requirements.txt
└── README.md
```

## 🔧 주요 기능

### ✅ 구현 완료 (1단계)
- **사용자 인증**: JWT 기반 인증 시스템
- **상품 관리**: 상품 CRUD, 검색, 필터링
- **장바구니**: 장바구니 추가/삭제/수정
- **기본 주문**: 주문 생성 및 관리

### 🚧 구현 예정 (2단계)
- **결제 연동**: 결제 시스템 연동
- **쿠폰 시스템**: 할인 쿠폰 관리
- **Q&A**: 문의사항 관리
- **리뷰 시스템**: 상품 리뷰 관리

## 📡 API 엔드포인트

### 🔐 인증 API (`/api/auth`)
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회
- `PUT /api/auth/profile` - 프로필 수정
- `DELETE /api/auth/account` - 회원 탈퇴

### 📦 상품 API (`/api/products`)
- `GET /api/products` - 상품 목록 (검색, 필터링, 정렬)
- `GET /api/products/{id}` - 상품 상세
- `GET /api/products/category/{category}` - 카테고리별 상품
- `GET /api/products/bestsellers` - 베스트셀러
- `GET /api/products/new` - 신상품
- `GET /api/products/discounted` - 할인 상품
- `GET /api/products/categories/list` - 카테고리 목록

### 🛒 장바구니 API (`/api/cart`)
- `GET /api/cart` - 장바구니 조회
- `POST /api/cart/add` - 장바구니 추가
- `PUT /api/cart/{id}` - 장바구니 수정
- `DELETE /api/cart/{id}` - 장바구니에서 제거
- `DELETE /api/cart` - 장바구니 비우기
- `GET /api/cart/summary` - 장바구니 요약

### 📋 주문 API (`/api/orders`)
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록
- `GET /api/orders/{id}` - 주문 상세
- `PUT /api/orders/{id}/status` - 주문 상태 수정
- `POST /api/orders/{id}/cancel` - 주문 취소

## 🛠️ 개발 환경 설정

### 데이터베이스

기본적으로 SQLite를 사용합니다. PostgreSQL이나 MySQL을 사용하려면 `config.py`에서 `DATABASE_URL`을 수정하세요.

### 환경변수

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
DATABASE_URL=sqlite:///./kirby_shop.db
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=["http://localhost:3000"]
```

## 📝 API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 테스트

```bash
pytest
```

## 📦 배포

### Docker 사용

```bash
docker build -t kirby-shop-backend .
docker run -p 8000:8000 kirby-shop-backend
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
