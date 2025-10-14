# 🗄️ Kirby Shop 데이터베이스 명령어 가이드

## 📋 목차
1. [MySQL 서비스 관리](#mysql-서비스-관리)
2. [데이터베이스 생성 및 설정](#데이터베이스-생성-및-설정)
3. [테이블 생성 및 관리](#테이블-생성-및-관리)
4. [백엔드 서버 관리](#백엔드-서버-관리)
5. [프론트엔드 서버 관리](#프론트엔드-서버-관리)
6. [데이터 시드 및 관리](#데이터-시드-및-관리)
7. [프로세스 관리](#프로세스-관리)
8. [문제 해결](#문제-해결)

---

## 🚀 MySQL 서비스 관리

### MySQL 서비스 시작/중지/재시작
```bash
# MySQL 서비스 시작
brew services start mysql

# MySQL 서비스 중지
brew services stop mysql

# MySQL 서비스 재시작
brew services restart mysql

# MySQL 서비스 상태 확인
brew services list | grep mysql
```

### MySQL 접속
```bash
# MySQL 루트 계정으로 접속 (비밀번호: admin123)
mysql -u root -p
# 비밀번호 입력: admin123

# 특정 데이터베이스 접속
mysql -u root -p kirby_shop
```

---

## 🗃️ 데이터베이스 생성 및 설정

### 데이터베이스 생성
```sql
-- MySQL 접속 후 실행
CREATE DATABASE IF NOT EXISTS kirby_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kirby_shop;
```

### 사용자 계정 생성 및 권한 부여
```sql
-- 관리자 계정 생성
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON kirby_shop.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;

-- 애플리케이션 계정 생성
CREATE USER 'kirby_user'@'localhost' IDENTIFIED BY 'kirby123';
GRANT SELECT, INSERT, UPDATE, DELETE ON kirby_shop.* TO 'kirby_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 테이블 생성 및 관리

### 테이블 생성 (전체 스키마)
```bash
# SQL 파일 실행
mysql -u root -p kirby_shop < create_mysql_tables.sql
```

### 주요 테이블 구조

#### 1. 사용자 테이블 (users)
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('user', 'seller', 'manager', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);
```

#### 2. 상품 테이블 (products)
```sql
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    images JSON,
    image_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_active (is_active)
);
```

#### 3. 쿠폰 테이블 (coupons)
```sql
CREATE TABLE IF NOT EXISTS coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    user_limit INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until)
);
```

#### 4. 시스템 설정 테이블 (system_settings)
```sql
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);
```

---

## 🖥️ 백엔드 서버 관리

### 가상환경 설정
```bash
# 백엔드 디렉토리로 이동
cd kirby-shop-backend

# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt
```

### 백엔드 서버 실행
```bash
# 개발 서버 실행
python run.py

# 또는 직접 실행
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 백엔드 서버 중지
```bash
# Ctrl+C로 중지하거나
# 프로세스 강제 종료
pkill -f "uvicorn"
```

---

## 🌐 프론트엔드 서버 관리

### 프론트엔드 서버 실행
```bash
# 프론트엔드 디렉토리로 이동
cd kirby-shop

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

### 프론트엔드 서버 중지
```bash
# Ctrl+C로 중지하거나
# 프로세스 강제 종료
pkill -f "react-scripts"
```

---

## 🌱 데이터 시드 및 관리

### 관리자 계정 생성
```bash
# 백엔드 디렉토리에서 실행
python create_admin_user.py
```

### 기본 쿠폰 생성
```bash
# 백엔드 디렉토리에서 실행
python create_default_coupons.py
```

### 테이블 생성 (Python)
```bash
# 백엔드 디렉토리에서 실행
python create_tables.py
```

### 데이터베이스 초기화
```bash
# MySQL 접속 후 실행
DROP DATABASE IF EXISTS kirby_shop;
CREATE DATABASE kirby_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kirby_shop;
SOURCE create_mysql_tables.sql;
```

---

## ⚙️ 프로세스 관리

### 모든 서버 프로세스 종료
```bash
# MySQL 프로세스 종료
brew services stop mysql

# 백엔드 프로세스 종료
pkill -f "uvicorn"
pkill -f "python.*run.py"

# 프론트엔드 프로세스 종료
pkill -f "react-scripts"
pkill -f "npm.*start"

# 포트 사용 확인
lsof -i :3000  # 프론트엔드
lsof -i :8000  # 백엔드
lsof -i :3306  # MySQL
```

### 포트 강제 해제
```bash
# 특정 포트 강제 해제
sudo lsof -ti:3000 | xargs kill -9  # 프론트엔드
sudo lsof -ti:8000 | xargs kill -9  # 백엔드
sudo lsof -ti:3306 | xargs kill -9  # MySQL
```

---

## 🔧 문제 해결

### 일반적인 문제들

#### 1. MySQL 연결 오류
```bash
# MySQL 서비스 상태 확인
brew services list | grep mysql

# MySQL 재시작
brew services restart mysql

# 연결 테스트
mysql -u root -p -e "SELECT 1;"
```

#### 2. 포트 충돌 오류
```bash
# 포트 사용 프로세스 확인
lsof -i :3000
lsof -i :8000
lsof -i :3306

# 프로세스 강제 종료
sudo kill -9 <PID>
```

#### 3. 가상환경 문제
```bash
# 가상환경 재생성
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. 의존성 문제
```bash
# 프론트엔드 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 백엔드 의존성 재설치
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### 로그 확인
```bash
# MySQL 로그
tail -f /usr/local/var/mysql/*.err

# 백엔드 로그 (터미널에서 확인)
# 프론트엔드 로그 (브라우저 개발자 도구에서 확인)
```

---

## 📝 유용한 명령어 모음

### 전체 시스템 재시작
```bash
# 1. 모든 프로세스 종료
brew services stop mysql
pkill -f "uvicorn"
pkill -f "react-scripts"

# 2. MySQL 시작
brew services start mysql

# 3. 백엔드 시작
cd kirby-shop-backend
source venv/bin/activate
python run.py &

# 4. 프론트엔드 시작
cd ../kirby-shop
npm start &
```

### 데이터베이스 백업
```bash
# 전체 데이터베이스 백업
mysqldump -u root -p kirby_shop > kirby_shop_backup_$(date +%Y%m%d_%H%M%S).sql

# 특정 테이블 백업
mysqldump -u root -p kirby_shop users products coupons > tables_backup.sql
```

### 데이터베이스 복원
```bash
# 백업 파일로 복원
mysql -u root -p kirby_shop < kirby_shop_backup_20241215_143000.sql
```

---

## 🎯 개발 환경 설정 체크리스트

- [ ] MySQL 서비스 실행 중
- [ ] 데이터베이스 `kirby_shop` 생성됨
- [ ] 테이블 생성 완료
- [ ] 관리자 계정 생성됨
- [ ] 백엔드 가상환경 활성화됨
- [ ] 백엔드 의존성 설치됨
- [ ] 프론트엔드 의존성 설치됨
- [ ] 백엔드 서버 실행 중 (포트 8000)
- [ ] 프론트엔드 서버 실행 중 (포트 3000)

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 모든 서비스가 실행 중인지 확인
2. 포트 충돌이 없는지 확인
3. 데이터베이스 연결이 정상인지 확인
4. 로그 파일에서 오류 메시지 확인

**마지막 업데이트**: 2024년 12월 15일

