const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

// 认证中间件
const authMiddleware = (req, res, next) => {
  // 从请求头获取令牌
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'no access，please login first' });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // 从数据库获取用户信息
    const db = getDb();
    db.get('SELECT id, username FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'user not exist，please login again' });
      }
      
      // 将用户信息添加到请求对象
      req.user = user;
      req.userId = user.id;
      next();
    });
  } catch (error) {
    console.error('authentication error:', error);
    res.status(401).json({ message: 'token invalid，please login again' });
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