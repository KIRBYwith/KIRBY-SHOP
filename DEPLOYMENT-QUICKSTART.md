# ⚡ KIRBY-SHOP 빠른 배포 가이드

## ✅ 생성 완료된 파일

```
KIRBY-SHOP/
├── Dockerfile.backend          ✅ 생성됨
├── Dockerfile.frontend         ✅ 생성됨  
├── docker-compose.yml          ✅ 생성됨
├── nginx.conf                  ✅ 생성됨
├── .dockerignore              ✅ 생성됨
├── env.production             ✅ 생성됨 (의도적 취약점!)
└── README-DEPLOYMENT.md       ✅ 생성됨 (상세 가이드)
```

---

## 🚀 3분 만에 배포하기

### 1️⃣ Lightsail 인스턴스 생성 (AWS Console)
```
1. AWS Lightsail 접속
2. "인스턴스 생성"
3. Ubuntu 20.04 LTS 선택
4. $5/월 플랜 선택
5. 고정 IP 할당
6. 방화벽: 22, 80, 3000, 8000, 3306 열기
```

### 2️⃣ SSH 접속 (브라우저 SSH 사용!)
```
Lightsail 콘솔 → 인스턴스 → "SSH를 사용하여 연결" 클릭
```

### 3️⃣ Docker 설치 (서버에서)
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
newgrp docker

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4️⃣ 프로젝트 업로드
```bash
# GitHub에서 클론
cd ~
git clone https://github.com/YOUR_USERNAME/KIRBY-SHOP.git
cd KIRBY-SHOP

# 또는 SCP로 업로드 (로컬에서):
# scp -r -i ~/Downloads/LightsailKey.pem KIRBY-SHOP ubuntu@XX.XX.XX.XX:~
```

### 5️⃣ IP 주소 변경 (필수!)
```bash
# docker-compose.yml 수정
nano docker-compose.yml

# 찾기: REPLACE_WITH_YOUR_IP
# 바꾸기: 실제 Lightsail 고정 IP

# 예: http://3.35.123.45:8000
# Ctrl+O (저장), Enter, Ctrl+X (종료)
```

### 6️⃣ 실행 (한 번에!)
```bash
docker-compose up -d --build
```

### 7️⃣ 초기 데이터 생성
```bash
docker-compose exec backend python create_admin_user.py
docker-compose exec backend python create_sample_coupons.py
```

### 8️⃣ 접속 확인
```
✅ Frontend: http://XX.XX.XX.XX:3000
✅ Backend API: http://XX.XX.XX.XX:8000/docs
✅ Nginx: http://XX.XX.XX.XX

로그인:
- 이메일: admin@kirby-shop.com
- 비밀번호: admin123
```

---

## 🔥 해킹 실습 취약점

### 즉시 공격 가능한 취약점:

1. **MySQL 외부 노출**
   ```bash
   mysql -h XX.XX.XX.XX -u root -padmin123 kirby_shop
   ```

2. **환경변수 파일 노출**
   ```bash
   curl http://XX.XX.XX.XX:8000/.env
   cat env.production  # Git 저장소에서 확인 가능
   ```

3. **Swagger UI 노출**
   ```
   http://XX.XX.XX.XX:8000/docs
   ```

4. **디버그 모드 활성화**
   - 에러 메시지에서 스택 트레이스 노출

5. **CORS `*` 허용**
   - 모든 도메인에서 API 호출 가능

---

## 🛠️ 관리 명령어

```bash
# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f backend

# 재시작
docker-compose restart

# 중지
docker-compose down

# 전체 삭제 (데이터 포함!)
docker-compose down -v
```

---

## 💰 비용

**총 월 비용: $5**
- Lightsail 인스턴스: $5/월
- MySQL: $0 (컨테이너)
- Nginx: $0 (컨테이너)
- 고정 IP: $0 (포함)

---

## 📞 문제 발생 시

```bash
# 메모리 확인
docker stats

# 디스크 확인
df -h

# 포트 확인
sudo netstat -tulpn | grep -E '3000|8000|3306|80'

# 전체 재시작
docker-compose down && docker-compose up -d --build
```

---

**배포 준비 완료! 🎉**

상세 가이드: `README-DEPLOYMENT.md` 참고

