// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  
  // 设置默认状态码和错误消息
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';
  
  // 返回JSON格式的错误响应
  res.status(statusCode).json({
    message,
    // 在开发环境中返回错误堆栈
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  errorHandler
};