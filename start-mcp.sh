#!/bin/bash

# Yapi MCP 服务器启动脚本

# 项目目录
PROJECT_DIR="/Users/xiaogaiguo/Yapi-MCP/Yapi-MCP"
PID_FILE="$PROJECT_DIR/yapi-mcp.pid"
LOG_FILE="$PROJECT_DIR/yapi-mcp.log"

# 函数：启动服务
start() {
    echo "正在启动 Yapi MCP 服务器..."
    cd "$PROJECT_DIR"
    
    # 检查是否已经在运行
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "服务器已经在运行 (PID: $PID)"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    # 启动服务器
    nohup node dist/index.js > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    echo "Yapi MCP 服务器已启动 (PID: $PID)"
    echo "日志文件: $LOG_FILE"
    echo "SSE 端点: http://localhost:3388/sse"
}

# 函数：停止服务
stop() {
    echo "正在停止 Yapi MCP 服务器..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            rm -f "$PID_FILE"
            echo "服务器已停止"
        else
            echo "服务器未运行"
            rm -f "$PID_FILE"
        fi
    else
        echo "PID 文件不存在，服务器可能未运行"
    fi
}

# 函数：检查状态
status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "Yapi MCP 服务器正在运行 (PID: $PID)"
            echo "SSE 端点: http://localhost:3388/sse"
            return 0
        else
            echo "服务器未运行（PID 文件存在但进程不存在）"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo "服务器未运行"
        return 1
    fi
}

# 函数：重启服务
restart() {
    stop
    sleep 2
    start
}

# 函数：查看日志
logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -f "$LOG_FILE"
    else
        echo "日志文件不存在"
    fi
}

# 主逻辑
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "命令说明:"
        echo "  start   - 启动服务器"
        echo "  stop    - 停止服务器"
        echo "  restart - 重启服务器"
        echo "  status  - 检查服务器状态"
        echo "  logs    - 查看实时日志"
        exit 1
        ;;
esac 