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
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoriesApi } from '../api/client';

const { Title } = Typography;
const { TextArea } = Input;

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  isActive: boolean;
  _count: {
    attributes: number;
    products: number;
  };
}

const CategoriesPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery('categories', 
    () => categoriesApi.getAll().then(res => res.data)
  );

  const createMutation = useMutation(categoriesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      setIsModalVisible(false);
      form.resetFields();
      message.success('Category created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => categoriesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
        message.success('Category updated successfully!');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to update category');
      },
    }
  );

  const deleteMutation = useMutation(categoriesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      message.success('Category deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleSubmit = (values: any) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Space>
          <strong>{text}</strong>
          {record.parent && <Tag color="blue">Child of {record.parent.name}</Tag>}
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || <em>No description</em>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (record: Category) => (
        <Space>
          <Tag>{record._count.attributes} attributes</Tag>
          <Tag>{record._count.products} products</Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Category) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record._count.products > 0 || record._count.attributes > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}>Categories</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please input category slug!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <Select
              placeholder="Select parent category (optional)"
              allowClear
            >
              {categories
                .filter(cat => cat.id !== editingCategory?.id)
                .map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
