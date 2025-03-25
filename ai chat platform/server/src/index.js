require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { setupDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const modelRoutes = require('./routes/models');
const { errorHandler } = require('./middleware/errorHandler');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件设置
app.use(helmet()); // 安全头
app.use(cors()); // 跨域支持
app.use(express.json()); // JSON解析
app.use(morgan('dev')); // 日志

// 初始化数据库
setupDatabase();

// API路由
app.use('/auth', authRoutes);
app.use('/chats', chatRoutes);
app.use('/models', modelRoutes);

// 静态文件服务（生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

module.exports = app; // 用于测试