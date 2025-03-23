const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

// 认证中间件
const authMiddleware = (req, res, next) => {
  // 从请求头获取令牌
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '无访问权限，请先登录' });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // 从数据库获取用户信息
    const db = getDb();
    db.get('SELECT id, username FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      
      if (!user) {
        return res.status(401).json({ message: '用户不存在，请重新登录' });
      }
      
      // 将用户信息添加到请求对象
      req.user = user;
      req.userId = user.id;
      next();
    });
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ message: '令牌无效，请重新登录' });
  }
};

// 可选的管理员权限中间件
const adminMiddleware = (req, res, next) => {
  // 这里可以添加管理员权限检查逻辑
  // 例如检查用户是否有admin角色
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};