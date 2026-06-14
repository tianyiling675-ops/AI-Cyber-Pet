# CyberPet 黑客松 Demo

软硬件一体 AI 赛博宠物 MVP。当前目标是稳定演示链路：

```text
模拟器 / BLE Bridge -> FastAPI -> WebSocket -> Electron 桌宠 + 手机 H5 -> AI 对话 / 回忆档案
```

## 目录

```text
backend/     FastAPI + SQLite + WebSocket
web/         React + Vite，手机 H5 / 回忆 / Demo 控制台 / Eval 展示
desktop/     Electron 桌面宠物窗口
simulator/   状态模拟器脚本
docs/        接口协议和演示说明
scripts/     本机启动脚本
```

## 本机运行

1. 安装后端依赖：

```powershell
cd cyberpet\backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

如果这台机器没有系统 Python，可以使用 Codex 内置 Python 创建环境：

```powershell
& 'C:\Users\林恬伊\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -m venv --system-site-packages .venv
```

2. 安装前端和桌面端依赖：

```powershell
cd cyberpet\web
npm install
cd ..\desktop
npm install
```

3. 启动：

```powershell
cd cyberpet
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
```

停止本项目相关开发进程：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev.ps1
```

默认地址：

```text
Backend: http://localhost:8000
Web:     http://localhost:5173
Mobile:  http://localhost:5173/mobile
Demo:    http://localhost:5173/demo
Eval:    http://localhost:5173/eval
Desktop: Electron 加载 http://localhost:5173/desktop
```

## AI 模式

后端支持三种模式：

```text
mock    本地模板回复，默认兜底
cached  固定演示问题的高质量缓存回复
zhipu   智谱 API
```

配置 `backend/.env`：

```text
ZHIPUAI_API_KEY=你的智谱APIKey
AI_MODE=mock
```

## BLE 接入原则

后端不直接处理 BLE。硬件侧或本机桥接程序负责把 BLE 数据转换为统一 HTTP 事件：

```text
BLE -> bridge -> POST /api/device/events
```

协议见 [docs/api-contract.md](docs/api-contract.md)。

## 桌面端打包

默认构建生成未签名的 unpacked exe：

```powershell
cd cyberpet\desktop
npm run build
```

输出：

```text
cyberpet\desktop\dist\win-unpacked\CyberPet.exe
```
