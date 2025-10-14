#!/bin/bash

# kirbyshop.store 도메인용 SSL 인증서 설정 스크립트

echo "=== kirbyshop.store 도메인 SSL 설정 시작 ==="

# SSL 디렉토리 생성
mkdir -p ssl

# 기존 인증서 백업
if [ -f ssl/cert.pem ]; then
    cp ssl/cert.pem ssl/cert.pem.backup
    echo "기존 SSL 인증서 백업 완료"
fi

if [ -f ssl/key.pem ]; then
    cp ssl/key.pem ssl/key.pem.backup
    echo "기존 SSL 키 백업 완료"
fi

# kirbyshop.store용 SSL 인증서 생성
echo "kirbyshop.store용 SSL 인증서 생성 중..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=KirbyShop/OU=IT/CN=kirbyshop.store"

# 권한 설정
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "SSL 인증서 생성 완료!"
echo "인증서 정보:"
openssl x509 -in ssl/cert.pem -text -noout | grep -E "(Subject:|Not Before:|Not After:|DNS:)"

echo "=== SSL 설정 완료 ==="
