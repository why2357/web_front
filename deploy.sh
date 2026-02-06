#!/bin/bash
# 一键部署脚本
# 使用方法: ./deploy.sh [环境] [备注]
# 示例: ./deploy.sh prod "修复了音色预览延迟"

set -e  # 遇到错误立即退出

# 配置信息
SERVER="172.28.104.54"
USER="root"  # 如果不是 root 用户，请修改
REMOTE_PATH="/opt/1panel/www/sites"
LOCAL_DIST="./dist"
BUILD_ENV=${1:-"prod"}
COMMIT_MSG=${2:-"自动部署 $(date '+%Y-%m-%d %H:%M:%S')"}

echo "=========================================="
echo "  开始部署"
echo "=========================================="
echo "环境: $BUILD_ENV"
echo "备注: $COMMIT_MSG"
echo ""

# 1. 构建项目
echo "📦 正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，部署中止"
    exit 1
fi

echo "✅ 构建成功"

# 2. 备份远程文件（可选，安全起见）
echo "📦 正在备份远程文件..."
ssh $USER@$SERVER "cd $REMOTE_PATH && cp -r index index.backup.$(date +%Y%m%d_%H%M%S) || echo '跳过备份'"

# 3. 上传文件
echo "📤 正在上传文件到服务器..."
# 使用 scp 上传 dist 目录内容到服务器的 index 目录
scp -r $LOCAL_DIST/* $USER@$SERVER:$REMOTE_PATH/index/

if [ $? -eq 0 ]; then
    echo "✅ 上传成功"

    # 4. 清理缓存（可选）
    echo "🧹 正在清理缓存..."
    ssh $USER@$SERVER "cd $REMOTE_PATH && rm -rf index/_cache || echo '跳过缓存清理'"

    echo "=========================================="
    echo "  ✅ 部署完成！"
    echo "  访问地址: http://$SERVER"
    echo "=========================================="
else
    echo "❌ 上传失败"
    exit 1
fi
