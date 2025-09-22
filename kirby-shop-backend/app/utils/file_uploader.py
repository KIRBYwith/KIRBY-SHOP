"""
S3 파일 업로드 유틸리티
AWS S3를 사용한 파일 업로드 및 관리 기능을 제공합니다.
"""

import boto3
from botocore.exceptions import ClientError
from app.config import settings
from typing import Optional
import mimetypes
import os

class FileUploader:
    """S3 파일 업로드 클래스"""
    
    def __init__(self):
        """S3 클라이언트 초기화"""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self.bucket_url = settings.S3_BUCKET_URL

    def upload_file(self, file, folder: str = "images", filename: Optional[str] = None) -> Optional[str]:
        """
        파일을 S3에 업로드
        
        Args:
            file: 업로드할 파일 객체
            folder: S3 버킷 내 폴더 경로
            filename: 파일명 (지정하지 않으면 원본 파일명 사용)
            
        Returns:
            업로드된 파일의 URL 또는 None
        """
        try:
            if not filename:
                filename = f"{folder}/{file.filename}"
            else:
                filename = f"{folder}/{filename}"

            # Content-Type 자동 감지
            content_type = file.content_type
            if not content_type:
                content_type, _ = mimetypes.guess_type(file.filename)
                if not content_type:
                    content_type = 'application/octet-stream'

            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                filename,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read'
                }
            )

            file_url = f"{self.bucket_url}/{filename}"
            return file_url

        except ClientError as e:
            print(f"Error uploading file: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error uploading file: {e}")
            return None

    def upload_multiple_files(self, files, folder: str = "images") -> list[str]:
        """
        여러 파일을 S3에 업로드
        
        Args:
            files: 업로드할 파일 객체들의 리스트
            folder: S3 버킷 내 폴더 경로
            
        Returns:
            업로드된 파일들의 URL 리스트
        """
        uploaded_urls = []
        
        for file in files:
            url = self.upload_file(file, folder)
            if url:
                uploaded_urls.append(url)
        
        return uploaded_urls

    def delete_file(self, filename: str) -> bool:
        """
        S3에서 파일 삭제
        
        Args:
            filename: 삭제할 파일명 (전체 경로)
            
        Returns:
            삭제 성공 여부
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=filename
            )
            return True
        except ClientError as e:
            print(f"Error deleting file: {e}")
            return False
        except Exception as e:
            print(f"Unexpected error deleting file: {e}")
            return False

    def delete_files(self, filenames: list[str]) -> dict[str, bool]:
        """
        여러 파일을 S3에서 삭제
        
        Args:
            filenames: 삭제할 파일명들의 리스트
            
        Returns:
            파일명별 삭제 성공 여부 딕셔너리
        """
        results = {}
        
        for filename in filenames:
            results[filename] = self.delete_file(filename)
        
        return results

    def get_file_url(self, filename: str) -> str:
        """
        파일의 공개 URL 생성
        
        Args:
            filename: 파일명 (전체 경로)
            
        Returns:
            파일의 공개 URL
        """
        return f"{self.bucket_url}/{filename}"

    def check_file_exists(self, filename: str) -> bool:
        """
        파일이 S3에 존재하는지 확인
        
        Args:
            filename: 확인할 파일명 (전체 경로)
            
        Returns:
            파일 존재 여부
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=filename)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            else:
                print(f"Error checking file existence: {e}")
                return False
        except Exception as e:
            print(f"Unexpected error checking file existence: {e}")
            return False

    def list_files(self, folder: str = "", max_keys: int = 1000) -> list[str]:
        """
        S3 버킷의 파일 목록 조회
        
        Args:
            folder: 조회할 폴더 경로
            max_keys: 최대 조회할 파일 수
            
        Returns:
            파일명 리스트
        """
        try:
            prefix = f"{folder}/" if folder else ""
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append(obj['Key'])
            
            return files
            
        except ClientError as e:
            print(f"Error listing files: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error listing files: {e}")
            return []

# 전역 파일 업로더 인스턴스
file_uploader = FileUploader()

