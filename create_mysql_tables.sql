-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS kirby_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kirby_shop;

-- 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'kirby_user'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON kirby_shop.* TO 'kirby_user'@'localhost';
FLUSH PRIVILEGES;

-- 1. users 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    grade VARCHAR(50) DEFAULT '신규회원',
    points INT DEFAULT 2000,
    order_count INT DEFAULT 0,
    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_image VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- 2. products 테이블
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    original_price INT,
    discount INT DEFAULT 0,
    category VARCHAR(100),
    image VARCHAR(500),
    images JSON,
    stock INT DEFAULT 0,
    is_new BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_limited BOOLEAN DEFAULT FALSE,
    tags JSON,
    specs JSON,
    rating FLOAT DEFAULT 0.0,
    review_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_title (title),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_rating (rating),
    INDEX idx_is_new (is_new),
    INDEX idx_is_best_seller (is_best_seller)
);

-- 3. orders 테이블
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount INT NOT NULL,
    discount_amount INT DEFAULT 0,
    shipping_fee INT DEFAULT 3000,
    final_amount INT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    receiver_address TEXT NOT NULL,
    receiver_address_detail TEXT,
    receiver_zip VARCHAR(10) NOT NULL,
    request_message TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_status (payment_status)
);

-- 4. order_items 테이블
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price INT NOT NULL,
    selected_option VARCHAR(100),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- 5. cart_items 테이블
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    selected_option VARCHAR(100),
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_guest BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_added_at (added_at)
);

-- 6. wishlist_items 테이블
CREATE TABLE wishlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY idx_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id)
);

-- 7. reviews 테이블
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id VARCHAR(50),
    rating INT NOT NULL,
    title VARCHAR(200),
    content TEXT,
    images TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_helpful INT DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_user_review (user_id, created_at),
    INDEX idx_product_review (product_id, created_at),
    INDEX idx_product_rating (product_id, rating),
    INDEX idx_order_review (order_id),
    INDEX idx_status (status)
);

-- 8. review_helpful 테이블
CREATE TABLE review_helpful (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY idx_review_user (review_id, user_id),
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
);

-- 9. qnas 테이블
CREATE TABLE qnas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    is_private BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_qna (user_id, created_at),
    INDEX idx_product_qna (product_id, created_at),
    INDEX idx_status_qna (status, created_at)
);

-- 10. qna_answers 테이블
CREATE TABLE qna_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    qna_id INT NOT NULL,
    admin_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (qna_id) REFERENCES qnas(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_qna_id (qna_id),
    INDEX idx_admin_id (admin_id)
);

-- 11. coupons 테이블
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount INT DEFAULT 0,
    max_discount_amount INT,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    user_limit INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_is_active (is_active),
    INDEX idx_valid_period (valid_from, valid_until)
);

-- 12. user_coupons 테이블
CREATE TABLE user_coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT NOT NULL,
    used_at DATETIME,
    order_id VARCHAR(50),
    is_used BOOLEAN DEFAULT FALSE,
    obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_user_coupon (user_id, coupon_id),
    INDEX idx_user_obtained (user_id, obtained_at),
    INDEX idx_is_used (is_used)
);

-- 13. payments 테이블
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50),
    amount INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    payment_key VARCHAR(100),
    approved_at DATETIME,
    failed_reason TEXT,
    refund_amount INT DEFAULT 0,
    refund_reason TEXT,
    refunded_at DATETIME,
    payment_metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_payment (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_key (payment_key),
    INDEX idx_status_payment (status, created_at)
);

-- 14. payment_methods 테이블
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    name VARCHAR(100),
    masked_info VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    method_metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_payment_method (user_id, is_active),
    INDEX idx_is_default (is_default)
);

-- 관리자 계정 생성
INSERT INTO users (email, password_hash, name, phone, role, is_active) VALUES 
('admin@kirby-shop.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4QjJ8QjJ8Q', '관리자', '010-0000-0000', 'admin', TRUE);

-- 테스트 데이터 삽입
INSERT INTO products (title, description, price, category, stock, is_new, is_best_seller) VALUES 
('커비 인형 (대형)', '귀여운 커비 대형 인형입니다', 25000, '인형', 15, TRUE, TRUE),
('커비 후드티', '편안한 커비 후드티입니다', 35000, '의류', 8, TRUE, FALSE),
('커비 램프', '밤에 빛나는 커비 램프입니다', 45000, '액세서리', 0, FALSE, TRUE),
('커비 티셔츠', '심플한 커비 티셔츠입니다', 20000, '의류', 25, FALSE, FALSE),
('커비 시계', '정확한 커비 시계입니다', 55000, '액세서리', 12, TRUE, FALSE);

-- 테스트 쿠폰 생성
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, usage_limit, valid_from, valid_until) VALUES 
('WELCOME10', '신규회원 할인', '신규회원 10% 할인', 'percentage', 10.00, 0, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FREESHIP', '무료배송', '무료배송 쿠폰', 'fixed_amount', 3000.00, 0, 50, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('BULK20', '대량구매 할인', '대량구매 20% 할인', 'percentage', 20.00, 50000, 30, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- 시스템 설정 테이블
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

-- 기본 설정값 삽입
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- 사이트 기본 설정
('site_name', '커비샵', 'string', 'site', '사이트 이름'),
('site_description', '커비 굿즈 전문 쇼핑몰', 'string', 'site', '사이트 설명'),
('site_tagline', '귀여운 커비와 함께하는 특별한 쇼핑', 'string', 'site', '사이트 태그라인'),
('company_name', '커비샵 주식회사', 'string', 'company', '회사명'),
('ceo_name', '김커비', 'string', 'company', '대표자명'),
('business_number', '123-45-67890', 'string', 'company', '사업자등록번호'),
('company_address', '서울특별시 강남구 테헤란로 123', 'string', 'company', '회사 주소'),
('customer_phone', '1588-1234', 'string', 'company', '고객센터 전화번호'),
('admin_email', 'admin@kirby-shop.com', 'string', 'company', '관리자 이메일'),

-- 운영 설정
('operating_hours_start', '09:00', 'string', 'operation', '운영 시작 시간'),
('operating_hours_end', '18:00', 'string', 'operation', '운영 종료 시간'),
('default_language', 'ko', 'string', 'operation', '기본 언어'),
('default_region', 'KR', 'string', 'operation', '기본 지역'),
('maintenance_mode', 'false', 'boolean', 'operation', '점검 모드'),

-- 회원 관리 설정
('allow_signup', 'true', 'boolean', 'member', '회원 가입 허용'),
('email_verification', 'true', 'boolean', 'member', '이메일 인증 필수'),
('phone_verification', 'false', 'boolean', 'member', '휴대폰 인증 필수'),
('member_level_normal_discount', '0', 'number', 'member', '일반회원 할인율'),
('member_level_vip_discount', '5', 'number', 'member', 'VIP회원 할인율'),
('member_level_vvip_discount', '10', 'number', 'member', 'VVIP회원 할인율'),

-- 관리자 권한 설정
('user_management', 'true', 'boolean', 'admin', '사용자 관리 권한'),
('product_management', 'true', 'boolean', 'admin', '상품 관리 권한'),
('order_management', 'true', 'boolean', 'admin', '주문 관리 권한'),
('system_settings', 'true', 'boolean', 'admin', '시스템 설정 권한'),

-- 접근 제어 설정
('blocked_ips', '', 'string', 'security', '차단할 IP 주소'),
('allowed_countries', '["KR"]', 'json', 'security', '허용할 국가'),
('block_vpn', 'false', 'boolean', 'security', 'VPN 접근 차단'),

-- 디자인 설정
('site_theme', 'kirby-pink', 'string', 'design', '사이트 테마'),
('main_color', '#ff69b4', 'string', 'design', '메인 컬러'),
('secondary_color', '#ff1493', 'string', 'design', '보조 컬러'),
('show_hero_banner', 'true', 'boolean', 'design', '히어로 배너 표시'),
('show_promo_banner', 'true', 'boolean', 'design', '프로모션 배너 표시'),
('products_per_page', '24', 'number', 'design', '상품 표시 개수'),
('sort_by', 'newest', 'string', 'design', '정렬 기준'),

-- 게시판 설정
('posts_per_page', '20', 'number', 'board', '페이지당 글 개수'),
('allow_comments', 'true', 'boolean', 'board', '댓글 허용'),
('require_login', 'false', 'boolean', 'board', '글쓰기 로그인 필수'),
('auto_approve', 'true', 'boolean', 'board', '자동 승인'),

-- 결제 설정
('pg_provider', 'toss', 'string', 'payment', 'PG사'),
('merchant_id', '', 'string', 'payment', '가맹점 ID'),
('merchant_key', '', 'string', 'payment', '가맹점 키'),
('test_mode', 'true', 'boolean', 'payment', '테스트 모드'),

-- 도메인 설정
('default_domain', 'kirby-shop.com', 'string', 'domain', '기본 도메인'),
('sub_domain', '', 'string', 'domain', '서브 도메인'),
('ssl_enabled', 'true', 'boolean', 'domain', 'SSL 인증서 활성화'),
('www_redirect', 'false', 'boolean', 'domain', 'www 자동 리다이렉트'),

-- 서비스 연동 설정
('email_service', 'smtp', 'string', 'service', '이메일 서비스'),
('google_login', 'false', 'boolean', 'service', '구글 로그인'),
('kakao_login', 'true', 'boolean', 'service', '카카오 로그인'),
('naver_login', 'false', 'boolean', 'service', '네이버 로그인'),
('chat_service', 'kakao', 'string', 'service', '실시간 채팅'),

-- 보안 설정
('captcha_enabled', 'false', 'boolean', 'security', '캡차 사용'),
('session_timeout', '24', 'number', 'security', '세션 만료 시간(시간)'),
('two_factor_auth', 'false', 'boolean', 'security', '2단계 인증'),
('login_logging', 'true', 'boolean', 'security', '로그인 로그 기록'),
('password_policy', 'true', 'boolean', 'security', '강력한 비밀번호 정책'),

-- 백업 설정
('backup_schedule', 'weekly', 'string', 'backup', '자동 백업 주기'),
('backup_retention', '30', 'number', 'backup', '백업 보관 기간(일)'),

-- 모니터링 설정
('server_monitoring', 'true', 'boolean', 'monitoring', '서버 상태 모니터링'),
('traffic_monitoring', 'true', 'boolean', 'monitoring', '트래픽 모니터링'),
('error_alerts', 'true', 'boolean', 'monitoring', '오류 알림'),
('alert_email', 'admin@kirby-shop.com', 'string', 'monitoring', '알림 이메일');

-- 완료 메시지
SELECT 'MySQL 테이블 생성 완료!' as message;

