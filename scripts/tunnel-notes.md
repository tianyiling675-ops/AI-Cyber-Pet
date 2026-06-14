# Tunnel 备用方案

优先使用本机局域网：

```text
Backend: http://电脑局域网IP:8000
Web:     http://电脑局域网IP:5173/mobile
Demo:    http://电脑局域网IP:5173/demo
```

如果现场 Wi-Fi 禁止局域网互访，再启用 tunnel。

## ngrok

```powershell
ngrok http 5173
ngrok http 8000
```

前端需要设置：

```text
VITE_API_BASE=https://后端ngrok域名
VITE_WS_BASE=wss://后端ngrok域名去掉https前缀
```

## Cloudflare Tunnel

```powershell
cloudflared tunnel --url http://localhost:5173
cloudflared tunnel --url http://localhost:8000
```

建议答辩前提前测试二维码和 WebSocket。
