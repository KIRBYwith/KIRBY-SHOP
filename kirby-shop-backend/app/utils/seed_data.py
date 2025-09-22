"""
데이터베이스 초기 데이터 생성 스크립트
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, Product, CartItem, Order, OrderItem
from app.utils.auth import get_password_hash
from datetime import datetime, date

def create_sample_data():
    """샘플 데이터 생성"""
    # 테이블 생성
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 샘플 사용자 생성
        sample_users = [
            {
                "email": "test@123.com",
                "password": "test",
                "name": "테스트유저",
                "phone": "010-1234-5678",
                "birth_date": date(1990, 1, 1),
                "address": "서울시 강남구 테헤란로 123",
                "grade": "VIP",
                "points": 50000,
                "order_count": 25,
                "role": "user"
            },
            {
                "email": "admin@kirbyshop.com",
                "password": "admin123",
                "name": "관리자",
                "phone": "010-9999-9999",
                "grade": "관리자",
                "points": 0,
                "order_count": 0,
                "role": "admin"
            }
        ]
        
        for user_data in sample_users:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                user = User(
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    name=user_data["name"],
                    phone=user_data["phone"],
                    birth_date=user_data.get("birth_date"),
                    address=user_data.get("address"),
                    grade=user_data["grade"],
                    points=user_data["points"],
                    order_count=user_data["order_count"],
                    role=user_data["role"]
                )
                db.add(user)
        
        # 샘플 상품 생성
        sample_products = [
            {
                "title": "커비 클래식 플러시 인형",
                "description": "부드럽고 포근한 커비의 대표 플러시 인형입니다. 완벽한 크기와 촉감으로 모든 연령대가 좋아할 수 있어요.",
                "price": 28000,
                "original_price": 35000,
                "discount": 20,
                "category": "인형/피규어",
                "image": "/kirby_images/kirby_001.jpg",
                "images": ["/kirby_images/kirby_001.jpg", "/kirby_images/kirby_002.jpg", "/kirby_images/kirby_003.jpg"],
                "stock": 25,
                "is_new": True,
                "is_best_seller": True,
                "tags": ["플러시", "인형", "클래식", "핑크"],
                "specs": {"크기": "20cm × 18cm × 15cm", "재질": "폴리에스터 100%", "제조국": "한국", "연령": "전연령"},
                "rating": 4.8,
                "review_count": 152
            },
            {
                "title": "커비 머그컵",
                "description": "아침을 상쾌하게 시작할 수 있는 귀여운 커비 머그컵. 용량도 넉넉하고 보온성도 뛰어납니다.",
                "price": 18000,
                "category": "생활용품",
                "image": "/kirby_images/kirby_010.jpg",
                "images": ["/kirby_images/kirby_010.jpg", "/kirby_images/kirby_011.jpg"],
                "stock": 67,
                "tags": ["머그컵", "생활용품", "커피", "차"],
                "specs": {"용량": "350ml", "재질": "세라믹", "크기": "직경 8cm × 높이 9.5cm", "전자레인지": "사용 가능"},
                "rating": 4.5,
                "review_count": 89
            },
            {
                "title": "커비 후드티",
                "description": "편안하고 따뜻한 커비 후드티. 고품질 원단으로 제작되어 세탁 후에도 모양이 변하지 않습니다.",
                "price": 42000,
                "original_price": 52000,
                "discount": 19,
                "category": "패션/액세서리",
                "image": "/kirby_images/kirby_018.jpg",
                "images": ["/kirby_images/kirby_018.jpg", "/kirby_images/kirby_019.jpg"],
                "stock": 34,
                "is_new": True,
                "tags": ["후드티", "패션", "편안함", "캐주얼"],
                "specs": {"사이즈": "S, M, L, XL", "재질": "면 80%, 폴리에스터 20%", "색상": "핑크, 화이트", "관리": "찬물 기계세탁"},
                "rating": 4.6,
                "review_count": 91
            },
            {
                "title": "커비 키링",
                "description": "가방이나 열쇠에 달고 다닐 수 있는 작고 귀여운 커비 키링. 내구성이 뛰어나고 색상이 선명합니다.",
                "price": 8000,
                "category": "생활용품",
                "image": "/kirby_images/kirby_016.jpg",
                "images": ["/kirby_images/kirby_016.jpg", "/kirby_images/kirby_017.png"],
                "stock": 156,
                "is_best_seller": True,
                "tags": ["키링", "액세서리", "휴대용", "선물"],
                "specs": {"크기": "6cm × 5cm × 3cm", "재질": "PVC, 메탈", "중량": "15g", "고리": "스테인레스"},
                "rating": 4.4,
                "review_count": 203
            },
            {
                "title": "커비 휴대폰 케이스",
                "description": "스마트폰을 귀엽게 꾸며줄 커비 휴대폰 케이스. 충격 보호 기능도 뛰어납니다.",
                "price": 18000,
                "category": "디지털/게임",
                "image": "/kirby_images/kirby_006.jpg",
                "images": ["/kirby_images/kirby_006.jpg"],
                "stock": 78,
                "is_best_seller": True,
                "tags": ["휴대폰케이스", "보호", "액세서리", "스마트폰"],
                "specs": {"호환": "iPhone, Galaxy 시리즈", "재질": "TPU + PC", "기능": "충격 흡수, 먼지 방지", "색상": "핑크, 블루"},
                "rating": 4.5,
                "review_count": 156
            }
        ]
        
        for product_data in sample_products:
            existing_product = db.query(Product).filter(Product.title == product_data["title"]).first()
            if not existing_product:
                product = Product(**product_data)
                db.add(product)
        
        db.commit()
        print("✅ 샘플 데이터가 성공적으로 생성되었습니다!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 샘플 데이터 생성 중 오류 발생: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
