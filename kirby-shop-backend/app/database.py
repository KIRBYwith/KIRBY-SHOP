"""
데이터베이스 연결 및 세션 관리
SQLAlchemy를 사용한 데이터베이스 설정 (AWS RDS MySQL 지원)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from app.config import settings
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database_engine():
    """데이터베이스 엔진 생성 (AWS RDS 최적화)"""
    
    # MySQL 연결 인수 설정
    connect_args = {}
    
    # SQLite가 아닌 경우 (MySQL/RDS)
    if "sqlite" not in settings.DATABASE_URL.lower():
        connect_args = {
            "charset": "utf8mb4",
            "autocommit": False,
            "connect_timeout": 10,
            "read_timeout": 30,
            "write_timeout": 30
        }
    
    # 연결 풀 설정 (AWS RDS 최적화)
    pool_kwargs = {}
    if "mysql" in settings.DATABASE_URL.lower():
        pool_kwargs = {
            "poolclass": QueuePool,
            "pool_size": 10,          # 기본 연결 풀 크기
            "max_overflow": 20,       # 추가 연결 허용
            "pool_pre_ping": True,    # 연결 상태 확인
            "pool_recycle": 3600,     # 1시간마다 연결 재생성
            "echo": False              # SQL 쿼리 로깅 (개발 시에만 True)
        }
    
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args=connect_args,
            **pool_kwargs
        )
        
        # 연결 테스트
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        
        logger.info("✅ 데이터베이스 연결 성공")
        logger.info(f"   📊 데이터베이스: {settings.DB_NAME}")
        logger.info(f"   🌐 호스트: {settings.DB_HOST}")
        
        return engine
        
    except Exception as e:
        logger.error(f"❌ 데이터베이스 연결 실패: {e}")
        raise

# 데이터베이스 엔진 생성
engine = create_database_engine()

# 세션 팩토리 생성
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine,
    expire_on_commit=False  # 객체 만료 방지
)

# 베이스 클래스 생성
Base = declarative_base()

def get_db():
    """
    데이터베이스 세션 의존성 함수
    FastAPI의 Depends와 함께 사용됩니다.
    AWS RDS 연결 풀링을 활용합니다.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"데이터베이스 세션 오류: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def test_database_connection():
    """데이터베이스 연결 테스트 함수"""
    try:
        with engine.connect() as conn:
            result = conn.execute("SELECT 1 as test")
            test_value = result.fetchone()[0]
            
        if test_value == 1:
            logger.info("✅ 데이터베이스 연결 테스트 성공")
            return True
        else:
            logger.error("❌ 데이터베이스 연결 테스트 실패")
            return False
            
    except Exception as e:
        logger.error(f"❌ 데이터베이스 연결 테스트 오류: {e}")
        return False

def get_database_info():
    """데이터베이스 정보 조회"""
    try:
        with engine.connect() as conn:
            # MySQL 버전 조회
            if "mysql" in settings.DATABASE_URL.lower():
                version_result = conn.execute("SELECT VERSION()")
                version = version_result.fetchone()[0]
                
                # 테이블 수 조회
                tables_result = conn.execute("SHOW TABLES")
                tables = tables_result.fetchall()
                
                return {
                    "type": "MySQL",
                    "version": version,
                    "host": settings.DB_HOST,
                    "database": settings.DB_NAME,
                    "table_count": len(tables)
                }
            else:
                return {
                    "type": "SQLite",
                    "database": settings.DB_NAME
                }
                
    except Exception as e:
        logger.error(f"데이터베이스 정보 조회 오류: {e}")
        return None
