#!/bin/bash

# kirbyshop.store 도메인 설정 완료 스크립트

echo "=== kirbyshop.store 도메인 설정 시작 ==="

# 1. 현재 IP 확인
CURRENT_IP=$(curl -s ifconfig.me)
echo "현재 서버 IP: $CURRENT_IP"

# 2. .env 파일 생성
echo "=== .env 파일 설정 ==="
cat > .env << EOF
MYSQL_ROOT_PASSWORD=KirbyShop2025!SecurePassword
JWT_SECRET_KEY=kirby-jwt-secret-super-secure-key-12345678
ALLOWED_ORIGINS=http://kirbyshop.store:3000,https://kirbyshop.store
REACT_APP_API_URL=https://kirbyshop.store
EOF
echo ".env 파일 생성 완료"

# 3. SSL 인증서 생성
echo "=== SSL 인증서 생성 ==="
mkdir -p ssl

# 기존 인증서 백업
if [ -f ssl/cert.pem ]; then
    cp ssl/cert.pem ssl/cert.pem.backup
    echo "기존 SSL 인증서 백업 완료"
fi

# kirbyshop.store용 SSL 인증서 생성
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=KirbyShop/OU=IT/CN=kirbyshop.store"

chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
echo "SSL 인증서 생성 완료"

# 4. Docker Compose 재시작
echo "=== Docker Compose 재시작 ==="
docker-compose down
echo "기존 컨테이너 중지 완료"

docker-compose up -d
echo "컨테이너 재시작 완료"

# 5. 상태 확인
echo "=== 상태 확인 ==="
sleep 10
docker-compose ps

# 6. 최종 확인
echo ""
echo "=== 설정 완료! ==="
echo "도메인: https://kirbyshop.store"
echo "www 도메인: https://www.kirbyshop.store"
echo "서버 IP: $CURRENT_IP"
echo ""
echo "가비아에서 DNS 설정을 확인하세요:"
echo "A 레코드: kirbyshop.store -> $CURRENT_IP"
echo "A 레코드: www.kirbyshop.store -> $CURRENT_IP"
echo ""
echo "DNS 전파는 최대 24시간이 소요될 수 있습니다."
echo "브라우저에서 https://kirbyshop.store 접속 테스트하세요!"
