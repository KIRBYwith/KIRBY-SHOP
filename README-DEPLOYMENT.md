# 🚀 KIRBY-SHOP Docker 배포 가이드

## 📋 생성된 파일 목록

✅ `Dockerfile.backend` - Backend Docker 이미지  
✅ `Dockerfile.frontend` - Frontend Docker 이미지  
✅ `docker-compose.yml` - 전체 서비스 오케스트레이션 (MySQL 포함)  
✅ `nginx.conf` - Nginx 리버스 프록시 설정  
✅ `.dockerignore` - Docker 빌드 제외 파일  
✅ `env.production` - 환경변수 (의도적 취약점 포함!)  

---

## 🎯 배포 전 필수 작업

### 1. docker-compose.yml 수정
```bash
# REPLACE_WITH_YOUR_IP를 실제 Lightsail 고정 IP로 변경
nano docker-compose.yml

# 찾기: REPLACE_WITH_YOUR_IP
# 바꾸기: 실제 IP (예: 3.35.123.45)
```

---

## 🚀 Lightsail 배포 단계

### 1단계: Lightsail 인스턴스 생성
```
- 플랜: $5/월 (1GB RAM)
- OS: Ubuntu 20.04 LTS
- 고정 IP 할당
- 방화벽: 22, 80, 3000, 8000, 3306 포트 열기
```

### 2단계: SSH 접속
```bash
# Mac/Linux
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@XX.XX.XX.XX

# Windows - Lightsail 콘솔에서 "SSH를 사용하여 연결" 클릭
```

### 3단계: Docker 설치
```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 확인
docker --version
docker-compose --version
```

### 4단계: 프로젝트 업로드

**방법 A: Git (권장)**
```bash
cd ~
git clone [GitHub 저장소 URL]
cd KIRBY-SHOP
```

**방법 B: SCP (Mac)**
```bash
# 로컬에서 실행
cd /Users/seungju/Desktop/GitHubDesktop
scp -r -i ~/Downloads/LightsailDefaultKey.pem KIRBY-SHOP ubuntu@XX.XX.XX.XX:~
```

**방법 C: WinSCP (Windows)**
```
1. WinSCP 다운로드
2. 호스트: XX.XX.XX.XX
3. 사용자: ubuntu
4. SSH 키 선택
5. 드래그&드롭으로 KIRBY-SHOP 폴더 업로드
```

### 5단계: 환경변수 설정
```bash
cd ~/KIRBY-SHOP

# docker-compose.yml 수정 (IP 변경)
nano docker-compose.yml
# REACT_APP_API_URL: http://REPLACE_WITH_YOUR_IP:8000
# → REACT_APP_API_URL: http://XX.XX.XX.XX:8000

# 저장: Ctrl+O, Enter, Ctrl+X
```

### 6단계: Docker 컨테이너 실행
```bash
# 빌드 및 실행 (5-10분 소요)
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# Ctrl+C로 로그 종료

# 컨테이너 상태 확인
docker-compose ps
```

### 7단계: 초기 데이터 생성
```bash
# 관리자 계정 생성
docker-compose exec backend python create_admin_user.py

# 샘플 쿠폰 생성
docker-compose exec backend python create_sample_coupons.py
```

### 8단계: 접속 확인
```
Frontend: http://XX.XX.XX.XX:3000
또는: http://XX.XX.XX.XX (Nginx 사용 시)

Backend API: http://XX.XX.XX.XX:8000/docs
Health Check: http://XX.XX.XX.XX:8000/health

MySQL: mysql -h XX.XX.XX.XX -u root -padmin123 kirby_shop
```

---

## 🛠️ 관리 명령어

### 서비스 제어
```bash
# 전체 시작
docker-compose up -d

# 전체 중지
docker-compose down

# 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart frontend

# 로그 확인
docker-compose logs -f [서비스명]
docker-compose logs -f backend
docker-compose logs -f mysql

# 상태 확인
docker-compose ps
```

### 데이터베이스 관리
```bash
# MySQL 접속
docker-compose exec mysql mysql -u root -padmin123 kirby_shop

# 백업
docker-compose exec mysql mysqldump -u root -padmin123 kirby_shop > backup.sql

# 복원
cat backup.sql | docker-compose exec -T mysql mysql -u root -padmin123 kirby_shop

# Volume 백업
docker run --rm -v kirby-shop_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

### 컨테이너 내부 접속
```bash
# Backend 컨테이너
docker-compose exec backend bash

# Frontend 컨테이너
docker-compose exec frontend sh

# MySQL 컨테이너
docker-compose exec mysql bash
```

---

## 🔓 의도적 취약점 목록 (OWASP Top 10)

### A01:2021 - Broken Access Control
- ✅ 소스코드 볼륨 마운트로 직접 접근 가능
- ✅ 관리자 API 권한 검증 부족

### A02:2021 - Cryptographic Failures
- ✅ 약한 JWT 시크릿 키: `kirby-shop-secret-123`
- ✅ 평문 비밀번호 노출: `env.production`
- ✅ API 키 노출

### A03:2021 - Injection
- ✅ SQL Injection 가능 엔드포인트 존재 가능
- ✅ XSS 취약점 (dangerouslySetInnerHTML 사용 권장)

### A05:2021 - Security Misconfiguration
- ✅ 디버그 모드 활성화
- ✅ MySQL 3306 포트 외부 노출
- ✅ CORS `*` 허용
- ✅ 보안 헤더 누락 (Nginx)
- ✅ 디렉토리 리스팅 허용
- ✅ Swagger UI 운영 환경 노출

### A07:2021 - Identification and Authentication Failures
- ✅ 약한 기본 비밀번호: `admin123`
- ✅ 토큰 만료 시간 과도하게 김 (24시간)
- ✅ 비밀번호 복잡도 검증 없음

### A09:2021 - Security Logging and Monitoring Failures
- ✅ 과도한 로깅으로 민감 정보 노출
- ✅ 에러 메시지에 상세 정보 포함

---

## 🎓 해킹 실습 시나리오

### 시나리오 1: 정보 수집
```bash
# Nmap 스캔
nmap -sV -p 80,3000,8000,3306 XX.XX.XX.XX

# 디렉토리 스캔
dirb http://XX.XX.XX.XX

# Git 저장소 확인
curl http://XX.XX.XX.XX/.git/config
curl http://XX.XX.XX.XX/env.production
```

### 시나리오 2: SQL Injection
```bash
# SQLMap 사용
sqlmap -u "http://XX.XX.XX.XX:8000/api/..." --dbs
```

### 시나리오 3: MySQL 직접 접근
```bash
# 외부에서 접속
mysql -h XX.XX.XX.XX -u root -padmin123 kirby_shop

# 데이터 탈취
SELECT * FROM users;
SELECT * FROM coupons;
```

### 시나리오 4: Burp Suite
```
1. Burp Suite 실행
2. 프록시 설정
3. 사이트 접속
4. 요청 캡처 및 분석
5. Intruder로 Brute Force
```

---

## 🛡️ 방어 방법 (패치 후)

```bash
# 1. MySQL 포트 제거
# docker-compose.yml에서 "3306:3306" 삭제

# 2. 환경변수 암호화
# env.production 삭제하고 .env로 변경 (.gitignore 추가)

# 3. 보안 헤더 추가
# nginx.conf에 CSP, X-Frame-Options 등 추가

# 4. 재빌드
docker-compose down
docker-compose up -d --build
```

---

## 📊 비용 요약

**총 비용: $5/월**
- Lightsail 인스턴스: $5/월
- MySQL: $0 (Docker 컨테이너)
- 고정 IP: $0 (포함)

---

## 🆘 문제 해결

```bash
# 포트 충돌
sudo lsof -i :3000
sudo lsof -i :8000

# 메모리 부족
free -h
docker stats

# 로그 확인
docker-compose logs --tail=100 [서비스명]

# 전체 재시작
docker-compose down
docker-compose up -d --build
```

---

## ✅ 배포 완료 후 확인 사항

- [ ] http://XX.XX.XX.XX:3000 접속 가능
- [ ] http://XX.XX.XX.XX:8000/docs API 문서 접속
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 관리자 로그인 (admin@kirby-shop.com / admin123)
- [ ] 쿠폰 등록 테스트
- [ ] MySQL 외부 접속 테스트 (취약점!)

---

**배포 준비 완료! 파일이 모두 생성되었습니다.** 🎉

