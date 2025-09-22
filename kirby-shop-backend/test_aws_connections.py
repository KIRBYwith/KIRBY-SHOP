#!/usr/bin/env python3
"""
AWS 서비스 연결 테스트 스크립트
RDS MySQL과 S3 버킷 연결을 테스트합니다.
"""

import pymysql
import boto3
import os
import sys
from botocore.exceptions import ClientError, NoCredentialsError
from app.config import settings

def test_rds_connection():
    """RDS MySQL 연결 테스트"""
    print("🔍 RDS MySQL 연결 테스트 중...")
    
    try:
        connection = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            charset='utf8mb4',
            connect_timeout=10
        )

        with connection.cursor() as cursor:
            # 기본 연결 테스트
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
            # 데이터베이스 정보 조회
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            
            # 테이블 목록 조회
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

        connection.close()
        
        print("✅ RDS 연결 성공!")
        print(f"   📊 데이터베이스: {settings.DB_NAME}")
        print(f"   🌐 호스트: {settings.DB_HOST}")
        print(f"   🔢 포트: {settings.DB_PORT}")
        print(f"   👤 사용자: {settings.DB_USER}")
        print(f"   📝 MySQL 버전: {version[0] if version else 'Unknown'}")
        print(f"   📋 테이블 수: {len(tables)}")
        
        return True

    except pymysql.Error as e:
        print(f"❌ RDS 연결 실패: {e}")
        return False
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        return False

def test_s3_connection():
    """S3 버킷 연결 테스트"""
    print("\n🔍 S3 버킷 연결 테스트 중...")
    
    try:
        # S3 클라이언트 생성
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        
        # 버킷 존재 확인
        s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        
        # 버킷 정보 조회
        response = s3_client.get_bucket_location(Bucket=settings.S3_BUCKET_NAME)
        location = response.get('LocationConstraint', 'us-east-1')
        
        # 버킷 ACL 확인
        try:
            acl_response = s3_client.get_bucket_acl(Bucket=settings.S3_BUCKET_NAME)
            acl_count = len(acl_response.get('Grants', []))
        except:
            acl_count = 0
        
        print("✅ S3 연결 성공!")
        print(f"   🪣 버킷명: {settings.S3_BUCKET_NAME}")
        print(f"   🌍 리전: {settings.AWS_REGION}")
        print(f"   📍 버킷 위치: {location}")
        print(f"   🔗 버킷 URL: {settings.S3_BUCKET_URL}")
        print(f"   🔐 ACL 규칙 수: {acl_count}")
        
        return True

    except NoCredentialsError:
        print("❌ AWS 자격 증명을 찾을 수 없습니다.")
        print("   AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 확인하세요.")
        return False
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NoSuchBucket':
            print(f"❌ 버킷 '{settings.S3_BUCKET_NAME}'이 존재하지 않습니다.")
        elif error_code == 'AccessDenied':
            print(f"❌ 버킷 '{settings.S3_BUCKET_NAME}'에 접근 권한이 없습니다.")
        else:
            print(f"❌ S3 연결 실패: {e}")
        return False
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        return False

def test_s3_upload():
    """S3 파일 업로드 테스트"""
    print("\n🔍 S3 파일 업로드 테스트 중...")
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        
        # 테스트 파일 내용
        test_content = "Kirby Shop AWS 테스트 파일입니다."
        test_key = "test/connection-test.txt"
        
        # 파일 업로드
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=test_key,
            Body=test_content.encode('utf-8'),
            ContentType='text/plain'
        )
        
        # 파일 다운로드 확인
        response = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=test_key
        )
        
        downloaded_content = response['Body'].read().decode('utf-8')
        
        # 테스트 파일 삭제
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=test_key
        )
        
        if downloaded_content == test_content:
            print("✅ S3 업로드/다운로드 테스트 성공!")
            print(f"   📁 테스트 파일: {test_key}")
            print(f"   📝 파일 내용 확인: OK")
            return True
        else:
            print("❌ 업로드된 파일 내용이 일치하지 않습니다.")
            return False
            
    except Exception as e:
        print(f"❌ S3 업로드 테스트 실패: {e}")
        return False

def test_redis_connection():
    """Redis 연결 테스트"""
    print("\n🔍 Redis 연결 테스트 중...")
    
    try:
        import redis
        
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        
        # 연결 테스트
        redis_client.ping()
        
        # 테스트 데이터 저장/조회
        test_key = "kirby_shop_test"
        test_value = "AWS 연결 테스트"
        
        redis_client.set(test_key, test_value, ex=60)  # 60초 후 만료
        retrieved_value = redis_client.get(test_key)
        
        # 테스트 데이터 삭제
        redis_client.delete(test_key)
        
        if retrieved_value == test_value:
            print("✅ Redis 연결 성공!")
            print(f"   🌐 호스트: {settings.REDIS_HOST}")
            print(f"   🔢 포트: {settings.REDIS_PORT}")
            print(f"   🗄️ 데이터베이스: {settings.REDIS_DB}")
            print(f"   📝 테스트 데이터 확인: OK")
            return True
        else:
            print("❌ Redis 테스트 데이터가 일치하지 않습니다.")
            return False
            
    except ImportError:
        print("❌ Redis 모듈이 설치되지 않았습니다. 'pip install redis'를 실행하세요.")
        return False
    except Exception as e:
        print(f"❌ Redis 연결 실패: {e}")
        return False

def main():
    """메인 테스트 함수"""
    print("🚀 Kirby Shop AWS 서비스 연결 테스트")
    print("=" * 50)
    
    # 환경 변수 확인
    print("🔧 환경 변수 확인 중...")
    required_vars = [
        'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
        'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not getattr(settings, var, None):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ 필수 환경 변수가 설정되지 않았습니다: {', '.join(missing_vars)}")
        print("   .env 파일을 확인하고 필요한 변수를 설정하세요.")
        return False
    
    print("✅ 필수 환경 변수 확인 완료")
    
    # 각 서비스 테스트
    tests = [
        ("RDS MySQL", test_rds_connection),
        ("S3 버킷", test_s3_connection),
        ("S3 업로드", test_s3_upload),
        ("Redis", test_redis_connection)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} 테스트 중 오류 발생: {e}")
            results.append((test_name, False))
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 테스트 결과 요약")
    print("=" * 50)
    
    success_count = 0
    for test_name, result in results:
        status = "✅ 성공" if result else "❌ 실패"
        print(f"   {test_name}: {status}")
        if result:
            success_count += 1
    
    print(f"\n🎯 전체 결과: {success_count}/{len(results)} 성공")
    
    if success_count == len(results):
        print("🎉 모든 AWS 서비스 연결이 성공했습니다!")
        print("   이제 Kirby Shop을 AWS 환경에서 실행할 수 있습니다.")
        return True
    else:
        print("💥 일부 서비스 연결에 실패했습니다.")
        print("   실패한 서비스를 확인하고 설정을 점검하세요.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

