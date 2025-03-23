import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Typography, Table, Space, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { modelService } from '../services/modelService';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ModelConfig = () => {
  const [form] = Form.useForm();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const modelData = await modelService.getAllModels();
        // 转换后端数据格式为前端格式
        const formattedModels = modelData.map(model => ({
          id: model.id,
          name: model.name,
          provider: model.api_type,
          apiEndpoint: model.model_name,
          isDefault: model.is_default === 1
        }));
        setModels(formattedModels);
      } catch (error) {
        console.error('获取模型列表失败:', error);
        message.error('获取模型列表失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, []);

  const handleAddModel = () => {
    setEditingModel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditModel = (model) => {
    setEditingModel(model);
    form.setFieldsValue({
      name: model.name,
      provider: model.provider,
      apiEndpoint: model.apiEndpoint,
      apiKey: '', // 出于安全考虑，不回显API密钥
      isDefault: model.isDefault
    });
    setModalVisible(true);
  };

  const handleDeleteModel = (modelId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模型配置吗？',
      onOk: () => {
        // 这里应该是实际的API调用
        setModels(models.filter(model => model.id !== modelId));
        message.success('模型已删除');
      }
    });
  };

  const handleSaveModel = async (values) => {
    setLoading(true);
    try {
      // 这里应该是实际的API调用
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟API延迟
      
      if (editingModel) {
        // 更新现有模型
        const updatedModels = models.map(model => 
          model.id === editingModel.id ? { ...model, ...values } : model
        );
        setModels(updatedModels);
        message.success('模型已更新');
      } else {
        // 添加新模型
        const newModel = {
          id: Date.now().toString(),
          ...values
        };
        setModels([...models, newModel]);
        message.success('模型已添加');
      }
      
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: 'API端点',
      dataIndex: 'apiEndpoint',
      key: 'apiEndpoint',
      ellipsis: true,
    },
    {
      title: '默认模型',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: isDefault => isDefault ? '是' : '否',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditModel(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteModel(record.id)}
            disabled={record.isDefault}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>模型配置</Title>
      <Paragraph>管理您的AI模型API配置</Paragraph>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={handleAddModel}
        style={{ marginBottom: 16 }}
      >
        添加模型
      </Button>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={models} 
          rowKey="id" 
          pagination={false}
        />
      </Card>
      
      <Modal
        title={editingModel ? '编辑模型' : '添加模型'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveModel}
          initialValues={{
            provider: 'openai',
            isDefault: false
          }}
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：GPT-3.5-Turbo" />
          </Form.Item>
          
          <Form.Item
            name="provider"
            label="提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select>
              <Option value="openai">OpenAI</Option>
              <Option value="azure">Azure OpenAI</Option>
              <Option value="anthropic">Anthropic</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="apiEndpoint"
            label="API端点"
            rules={[{ required: true, message: '请输入API端点' }]}
          >
            <Input placeholder="例如：https://api.openai.com/v1/chat/completions" />
          </Form.Item>
          
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: !editingModel, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="输入您的API密钥" />
          </Form.Item>
          
          <Form.Item
            name="isDefault"
            valuePropName="checked"
            label="设为默认模型"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
              block
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelConfig;