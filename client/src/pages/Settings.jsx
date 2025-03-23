import React, { useState } from 'react';
import { Card, Form, Switch, Select, Button, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useThemeStore } from '../stores/themeStore';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useThemeStore();

  // 保存设置
  const handleSave = async (values) => {
    setLoading(true);
    try {
      // 保存主题设置
      if (values.theme !== theme) {
        setTheme(values.theme);
      }
      
      // 这里可以添加其他设置的API调用
      console.log('save settings:', values);
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API延迟
      message.success('设置保存成功');
    } catch (error) {
      message.error('设置保存失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>application setting</Title>
      <Paragraph>customize your AI platform experience</Paragraph>
      
      <Card style={{ marginTop: 16 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            theme: theme,
            language: 'en_US',
            enableCloudSync: true,
            messageSound: true
          }}
          onFinish={handleSave}
        >
          <Form.Item name="theme" label="interface theme">
            <Select>
              <Option value="light">light</Option>
              <Option value="dark">dark</Option>
              <Option value="system">follow system</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="language" label="interface language">
            <Select>
              <Option value="zh_CN">简体中文</Option>
              <Option value="en_US">English</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="enableCloudSync" valuePropName="checked" label="enable cloud sync">
            <Switch />
          </Form.Item>
          
          <Form.Item name="messageSound" valuePropName="checked" label="message sound">
            <Switch />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
            >
              save setting
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;