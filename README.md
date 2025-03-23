# 内网AI大模型对话平台

## 项目概述

这是一个部署在内网环境的AI大模型对话平台，具有以下特点：

- 用户友好的Web应用界面
- 支持配置多种不同的AI模型API
- 本地保存对话历史记录
- 支持联网时云端同步对话历史
- 用户名密码认证系统

## 技术栈

- 前端：React.js + Vite + Ant Design
- 后端：Node.js + Express.js
- 数据库：SQLite (本地存储) + 可选MongoDB (云端存储)
- 认证：JWT (JSON Web Tokens)
- API集成：OpenAI、Azure OpenAI、Anthropic Claude等

## 项目结构

```
├── client/                 # 前端React应用
├── server/                 # 后端Express应用
├── docs/                   # 文档
└── README.md               # 项目说明
```

## 安装步骤

### 前提条件

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本

### 安装和运行

1. 克隆仓库

```bash
git clone [仓库URL]
cd ai-chat-platform
```

2. 安装前端依赖并运行

```bash
cd client
npm install
npm run dev
```

3. 安装后端依赖并运行

```bash
cd ../server
npm install
npm run dev
```

4. 访问应用

打开浏览器访问 `http://localhost:5173`

## 配置

### 环境变量

在server目录下创建`.env`文件：

```
PORT=3000
JWT_SECRET=your_jwt_secret
DB_PATH=./data/chat.db
MONGO_URI=mongodb://username:password@host:port/database (可选)
```

### AI模型配置

在应用的管理员界面中可以配置不同的AI模型API密钥和端点。

## 功能特点

- 多模型支持：可配置多种AI大模型API
- 会话管理：创建、保存、导出会话
- 用户认证：基于JWT的安全认证系统
- 本地存储：使用SQLite存储对话历史
- 云同步：可选的MongoDB云端同步功能
- 响应式设计：适配桌面和移动设备的界面

## 许可证

MIT