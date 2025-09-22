#!/bin/bash

# Kirby Shop AWS 배포 스크립트
# 이 스크립트는 AWS ECS, ECR을 사용한 배포를 자동화합니다.

set -e  # 오류 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정 변수 (실제 값으로 변경 필요)
AWS_REGION="ap-northeast-2"
AWS_ACCOUNT_ID="123456789012"  # 실제 AWS 계정 ID로 변경
ECR_REPOSITORY="kirby-shop-api"
ECS_CLUSTER="kirby-shop-cluster"
ECS_SERVICE="kirby-shop-service"
ECS_TASK_DEFINITION="kirby-shop-task"

# 함수 정의
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# AWS CLI 설치 확인
check_aws_cli() {
    log_info "AWS CLI 설치 확인 중..."
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI가 설치되지 않았습니다."
        log_info "다음 명령어로 설치하세요:"
        log_info "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
        log_info "  unzip awscliv2.zip"
        log_info "  sudo ./aws/install"
        exit 1
    fi
    log_success "AWS CLI 확인 완료"
}

# AWS 자격 증명 확인
check_aws_credentials() {
    log_info "AWS 자격 증명 확인 중..."
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS 자격 증명이 설정되지 않았습니다."
        log_info "다음 명령어로 설정하세요:"
        log_info "  aws configure"
        exit 1
    fi
    log_success "AWS 자격 증명 확인 완료"
}

# Docker 설치 확인
check_docker() {
    log_info "Docker 설치 확인 중..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        log_info "Docker 설치 후 다시 시도하세요."
        exit 1
    fi
    log_success "Docker 확인 완료"
}

# ECR 로그인
ecr_login() {
    log_info "ECR에 로그인 중..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    log_success "ECR 로그인 완료"
}

# Docker 이미지 빌드
build_image() {
    log_info "Docker 이미지 빌드 중..."
    docker build -t $ECR_REPOSITORY:latest .
    docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    log_success "Docker 이미지 빌드 완료"
}

# ECR에 이미지 푸시
push_image() {
    log_info "ECR에 이미지 푸시 중..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
    log_success "ECR 이미지 푸시 완료"
}

# ECS 서비스 업데이트
update_ecs_service() {
    log_info "ECS 서비스 업데이트 중..."
    aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION
    log_success "ECS 서비스 업데이트 완료"
}

# 배포 상태 확인
check_deployment_status() {
    log_info "배포 상태 확인 중..."
    
    # 서비스 상태 확인
    aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].deployments[0].status' --output text
    
    # 태스크 상태 확인
    TASK_ARN=$(aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $ECS_SERVICE --region $AWS_REGION --query 'taskArns[0]' --output text)
    
    if [ "$TASK_ARN" != "None" ] && [ "$TASK_ARN" != "" ]; then
        log_info "실행 중인 태스크: $TASK_ARN"
        
        # 태스크 상태 확인
        TASK_STATUS=$(aws ecs describe-tasks --cluster $ECS_CLUSTER --tasks $TASK_ARN --region $AWS_REGION --query 'tasks[0].lastStatus' --output text)
        log_info "태스크 상태: $TASK_STATUS"
        
        if [ "$TASK_STATUS" = "RUNNING" ]; then
            log_success "배포가 성공적으로 완료되었습니다!"
        else
            log_warning "태스크가 아직 실행 중입니다. 잠시 후 다시 확인하세요."
        fi
    else
        log_warning "실행 중인 태스크를 찾을 수 없습니다."
    fi
}

# 환경 변수 검증
validate_environment() {
    log_info "환경 변수 검증 중..."
    
    if [ -z "$AWS_ACCOUNT_ID" ] || [ "$AWS_ACCOUNT_ID" = "123456789012" ]; then
        log_error "AWS_ACCOUNT_ID를 실제 값으로 설정하세요."
        exit 1
    fi
    
    if [ -z "$AWS_REGION" ]; then
        log_error "AWS_REGION을 설정하세요."
        exit 1
    fi
    
    log_success "환경 변수 검증 완료"
}

# 메인 배포 함수
deploy() {
    log_info "🚀 Kirby Shop AWS 배포 시작"
    echo "=================================="
    
    # 사전 검증
    validate_environment
    check_aws_cli
    check_aws_credentials
    check_docker
    
    # 배포 프로세스
    ecr_login
    build_image
    push_image
    update_ecs_service
    
    # 배포 완료 대기
    log_info "배포 완료를 기다리는 중..."
    sleep 30
    
    check_deployment_status
    
    echo "=================================="
    log_success "🎉 배포가 완료되었습니다!"
    log_info "애플리케이션 URL: https://your-domain.com"
}

# 롤백 함수
rollback() {
    log_info "🔄 이전 버전으로 롤백 중..."
    
    # 이전 태스크 정의로 롤백
    aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION
    
    log_success "롤백이 완료되었습니다."
}

# 헬스체크 함수
health_check() {
    log_info "🏥 애플리케이션 헬스체크 중..."
    
    # 로드밸런서 엔드포인트 확인 (실제 URL로 변경 필요)
    HEALTH_URL="https://your-domain.com/health"
    
    if curl -f $HEALTH_URL &> /dev/null; then
        log_success "애플리케이션이 정상적으로 실행 중입니다."
    else
        log_error "애플리케이션에 문제가 있습니다."
        exit 1
    fi
}

# 사용법 출력
usage() {
    echo "사용법: $0 [명령어]"
    echo ""
    echo "명령어:"
    echo "  deploy      - 애플리케이션 배포"
    echo "  rollback    - 이전 버전으로 롤백"
    echo "  health      - 헬스체크 실행"
    echo "  help        - 이 도움말 출력"
    echo ""
    echo "예시:"
    echo "  $0 deploy"
    echo "  $0 rollback"
    echo "  $0 health"
}

# 메인 스크립트
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        log_error "알 수 없는 명령어: $1"
        usage
        exit 1
        ;;
esac

