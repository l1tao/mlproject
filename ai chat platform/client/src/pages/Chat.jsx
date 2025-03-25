import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Typography, Spin, Empty, Divider, message } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState({ title: '新对话', model: 'default' });

  // 获取对话历史
  useEffect(() => {
    if (chatId) {
      setLoading(true);
      axios.get(`/api/chats/${chatId}`)
        .then(response => {
          setChatInfo(response.data.chat);
          setMessages(response.data.messages);
        })
        .catch(error => {
          message.error('获取对话历史失败');
          console.error('获取对话历史失败:', error);
          navigate('/chat');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 新对话
      setChatInfo({ title: '新对话', model: 'default' });
      setMessages([]);
    }
  }, [chatId, navigate]);

  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setSending(true);
    
    try {
      let response;
      if (chatId) {
        // 已有对话，添加消息
        response = await axios.post(`/api/chats/${chatId}/messages`, { content: input });
      } else {
        // 新建对话
        response = await axios.post('/api/chats', { message: input, model: chatInfo.model });
        // 更新URL以包含新创建的对话ID
        navigate(`/chat/${response.data.chatId}`);
      }
      
      // 添加AI回复
      setMessages([...newMessages, response.data.message]);
    } catch (error) {
      message.error('发送消息失败');
      console.error('发送消息失败:', error);
      // 移除用户消息
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  // 创建新对话
  const createNewChat = () => {
    navigate('/chat');
  };

  // 渲染消息内容，支持Markdown和代码高亮
  const renderMessageContent = (content) => (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="messages-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载对话历史...</div>
          </div>
        ) : messages.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="开始一个新的对话"
            style={{ margin: '100px 0' }}
          />
        ) : (
          messages.map((msg, index) => (
            <Card
              key={index}
              style={{
                marginBottom: 16,
                backgroundColor: msg.role === 'user' ? '#1f1f1f' : '#141414',
                borderColor: msg.role === 'user' ? '#303030' : '#1f1f1f',
              }}
              bodyStyle={{ padding: '12px 16px' }}
            >
              <div>
                <Text strong style={{ color: msg.role === 'user' ? '#1677ff' : '#10b981' }}>
                  {msg.role === 'user' ? '你' : 'AI'}
                </Text>
                <Divider type="vertical" />
                <Text type="secondary" style={{ fontSize: '0.85em' }}>
                  {new Date(msg.timestamp || Date.now()).toLocaleString()}
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                {renderMessageContent(msg.content)}
              </div>
            </Card>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="input-container">
        <div style={{ display: 'flex', marginBottom: 8 }}>
          <Button 
            icon={<PlusOutlined />} 
            onClick={createNewChat}
            style={{ marginRight: 8 }}
          >
            新对话
          </Button>
          <Text type="secondary" style={{ lineHeight: '32px' }}>
            当前模型: {chatInfo.model || 'default'}
          </Text>
        </div>
        
        <div style={{ display: 'flex' }}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 6 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={sending}
            style={{ marginLeft: 8 }}
          />
        </div>
        <Text type="secondary" style={{ fontSize: '0.8em', marginTop: 4 }}>
          按 Enter 发送，Shift + Enter 换行
        </Text>
      </div>
    </div>
  );
};

export default Chat;