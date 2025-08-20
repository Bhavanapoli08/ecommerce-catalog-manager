import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Switch,
  Typography,
  Tag,
  Popconfirm,
  Card,
  InputNumber,
  Divider,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { categoriesApi, attributesApi } from '../api/client';

const { Title } = Typography;
const { TextArea } = Input;

const AttributesPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [optionForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery('categories', 
    () => categoriesApi.getAll().then(res => res.data)
  );

  const { data: attributes = [], isLoading } = useQuery(
    ['attributes', selectedCategoryId],
    () => selectedCategoryId ? attributesApi.getByCategory(selectedCategoryId).then(res => res.data) : [],
    { enabled: !!selectedCategoryId }
  );

  const createAttributeMutation = useMutation(attributesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attributes', selectedCategoryId]);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Attribute created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create attribute');
    },
  });

  const createOptionMutation = useMutation(attributesApi.createOption, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attributes', selectedCategoryId]);
      setIsOptionModalVisible(false);
      optionForm.resetFields();
      message.success('Option created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create option');
    },
  });

  const deleteAttributeMutation = useMutation(attributesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries(['attributes', selectedCategoryId]);
      message.success('Attribute deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete attribute');
    },
  });

  const handleSubmit = (values: any) => {
    createAttributeMutation.mutate({
      ...values,
      categoryId: selectedCategoryId,
    });
  };

  const handleOptionSubmit = (values: any) => {
    createOptionMutation.mutate({
      ...values,
      categoryAttributeId: selectedAttributeId,
    });
  };

  const handleManageOptions = (attributeId: string) => {
    setSelectedAttributeId(attributeId);
    setIsOptionModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <strong>{text}</strong>
          {record.isRequired && <Tag color="red">Required</Tag>}
        </Space>
      ),
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      render: (dataType: string) => (
        <Tag color="blue">{dataType}</Tag>
      ),
    },
    {
      title: 'Constraints',
      key: 'constraints',
      render: (record: any) => {
        const constraints = [];
        if (record.minNumber !== null) constraints.push(`Min: ${record.minNumber}`);
        if (record.maxNumber !== null) constraints.push(`Max: ${record.maxNumber}`);
        if (record.maxLength) constraints.push(`Length: ${record.maxLength}`);
        if (record.regex) constraints.push('Pattern');
        
        return constraints.length > 0 ? constraints.join(', ') : <em>None</em>;
      },
    },
    {
      title: 'Options',
      key: 'options',
      render: (record: any) => {
        if (record.dataType === 'ENUM') {
          return (
            <Space>
              <Tag>{record.options?.length || 0} options</Tag>
              <Button
                type="link"
                size="small"
                icon={<SettingOutlined />}
                onClick={() => handleManageOptions(record.id)}
              >
                Manage
              </Button>
            </Space>
          );
        }
        return <em>N/A</em>;
      },
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: any) => (
        <Tag>{record._count?.values || 0} products</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Popconfirm
          title="Are you sure you want to delete this attribute?"
          onConfirm={() => deleteAttributeMutation.mutate(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            disabled={(record._count?.values || 0) > 0}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedAttribute = attributes.find(attr => attr.id === selectedAttributeId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>Attributes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!selectedCategoryId}
          onClick={() => setIsModalVisible(true)}
        >
          Add Attribute
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space>
          <strong>Category:</strong>
          <Select
            style={{ width: 300 }}
            placeholder="Select a category to manage attributes"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
          >
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {selectedCategoryId && (
        <Table
          dataSource={attributes}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Create Attribute Modal */}
      <Modal
        title="Create Attribute"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={createAttributeMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input attribute name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please input attribute slug!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dataType"
            label="Data Type"
            rules={[{ required: true, message: 'Please select data type!' }]}
          >
            <Select>
              <Select.Option value="TEXT">Text</Select.Option>
              <Select.Option value="NUMBER">Number</Select.Option>
              <Select.Option value="BOOLEAN">Boolean</Select.Option>
              <Select.Option value="DATE">Date</Select.Option>
              <Select.Option value="ENUM">Enum (Options)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="isRequired" label="Required" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="displayOrder" label="Display Order">
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="hint" label="Hint Text">
            <Input placeholder="Help text for users" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.dataType !== currentValues.dataType
            }
          >
            {({ getFieldValue }) => {
              const dataType = getFieldValue('dataType');
              
              if (dataType === 'TEXT') {
                return (
                  <>
                    <Form.Item name="maxLength" label="Max Length">
                      <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item name="regex" label="Regex Pattern">
                      <Input placeholder="e.g., ^[A-Za-z]+$" />
                    </Form.Item>
                  </>
                );
              }
              
              if (dataType === 'NUMBER') {
                return (
                  <>
                    <Form.Item name="minNumber" label="Minimum Value">
                      <InputNumber />
                    </Form.Item>
                    <Form.Item name="maxNumber" label="Maximum Value">
                      <InputNumber />
                    </Form.Item>
                  </>
                );
              }
              
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Options Modal */}
      <Modal
        title={`Manage Options for "${selectedAttribute?.name}"`}
        open={isOptionModalVisible}
        onCancel={() => {
          setIsOptionModalVisible(false);
          setSelectedAttributeId(null);
          optionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={optionForm}
          layout="inline"
          onFinish={handleOptionSubmit}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="value"
            rules={[{ required: true, message: 'Value required' }]}
          >
            <Input placeholder="Option value" />
          </Form.Item>
          <Form.Item name="code">
            <Input placeholder="Code (optional)" />
          </Form.Item>
          <Form.Item name="sortOrder">
            <InputNumber placeholder="Order" min={0} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createOptionMutation.isLoading}
            >
              Add Option
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div>
          <strong>Existing Options:</strong>
          {selectedAttribute?.options?.length === 0 ? (
            <p><em>No options yet</em></p>
          ) : (
            <div style={{ marginTop: 8 }}>
              {selectedAttribute?.options
                ?.sort((a, b) => a.sortOrder - b.sortOrder)
                .map(option => (
                  <Tag
                    key={option.id}
                    color={option.isDefault ? 'green' : 'default'}
                    style={{ marginBottom: 4 }}
                  >
                    {option.value} {option.code && `(${option.code})`}
                    {option.isDefault && ' - Default'}
                  </Tag>
                ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AttributesPage;
