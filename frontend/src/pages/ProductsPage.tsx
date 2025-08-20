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
  Typography,
  Tag,
  Popconfirm,
  Card,
  InputNumber,
  Switch,
  DatePicker,
  Divider,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { categoriesApi, attributesApi, productsApi } from '../api/client';

const { Title } = Typography;
const { TextArea } = Input;

const ProductsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAttributeModalVisible, setIsAttributeModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: productsResponse, isLoading } = useQuery('products', 
    () => productsApi.getAll().then(res => res.data)
  );

  const { data: categories = [] } = useQuery('categories', 
    () => categoriesApi.getAll().then(res => res.data)
  );

  const { data: selectedProduct } = useQuery(
    ['product', selectedProductId],
    () => selectedProductId ? productsApi.getById(selectedProductId).then(res => res.data) : null,
    { enabled: !!selectedProductId }
  );

  const createMutation = useMutation(productsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      setIsModalVisible(false);
      form.resetFields();
      message.success('Product created successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setIsModalVisible(false);
        setEditingProduct(null);
        form.resetFields();
        message.success('Product updated successfully!');
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || 'Failed to update product');
      },
    }
  );

  const deleteMutation = useMutation(productsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      message.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  const activateMutation = useMutation(productsApi.activate, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      message.success('Product activated successfully!');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to activate product');
    },
  });

  const setAttributeValueMutation = useMutation(productsApi.setAttributeValue, {
    onSuccess: () => {
      queryClient.invalidateQueries(['product', selectedProductId]);
      queryClient.invalidateQueries('products');
      message.success('Attribute value set successfully!');
      attributeForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to set attribute value');
    },
  });

  const handleSubmit = (values: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      status: product.status,
    });
    setIsModalVisible(true);
  };

  const handleManageAttributes = (productId: string) => {
    setSelectedProductId(productId);
    setIsAttributeModalVisible(true);
  };

  const handleSetAttributeValue = (values: any) => {
    const attribute = selectedProduct?.category.attributes.find(
      (attr: any) => attr.id === values.categoryAttributeId
    );

    const data: any = {
      productId: selectedProductId,
      categoryAttributeId: values.categoryAttributeId,
    };

    switch (attribute?.dataType) {
      case 'TEXT':
        data.valueText = values.value;
        break;
      case 'NUMBER':
        data.valueNumber = values.value;
        break;
      case 'BOOLEAN':
        data.valueBool = values.value;
        break;
      case 'DATE':
        data.valueDate = values.value?.toISOString();
        break;
      case 'ENUM':
        data.optionId = values.value;
        break;
    }

    setAttributeValueMutation.mutate(data);
  };

  const renderAttributeInput = (attribute: any, existingValue: any) => {
    const currentValue = existingValue?.valueText || 
                        existingValue?.valueNumber || 
                        existingValue?.valueBool || 
                        existingValue?.valueDate || 
                        existingValue?.optionId;

    switch (attribute.dataType) {
      case 'TEXT':
        return (
          <Input
            placeholder={attribute.hint}
            maxLength={attribute.maxLength}
          />
        );
      case 'NUMBER':
        return (
          <InputNumber
            min={attribute.minNumber}
            max={attribute.maxNumber}
            placeholder={attribute.hint}
            style={{ width: '100%' }}
          />
        );
      case 'BOOLEAN':
        return <Switch />;
      case 'DATE':
        return <DatePicker style={{ width: '100%' }} />;
      case 'ENUM':
        return (
          <Select placeholder="Select option">
            {attribute.options?.map((option: any) => (
              <Select.Option key={option.id} value={option.id}>
                {option.value}
              </Select.Option>
            ))}
          </Select>
        );
      default:
        return <Input />;
    }
  };

  const products = productsResponse?.data || [];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: 'Category',
      key: 'category',
      render: (record: any) => (
        <Tag color="blue">{record.category?.name}</Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          DRAFT: 'orange',
          ACTIVE: 'green',
          INACTIVE: 'red',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      },
    },
    {
      title: 'Attributes',
      key: 'attributes',
      render: (record: any) => (
        <Tag>{record._count?.values || 0} set</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => handleManageAttributes(record.id)}
          >
            Attributes
          </Button>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => activateMutation.mutate(record.id)}
              loading={activateMutation.isLoading}
            >
              Activate
            </Button>
          )}
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
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
        <Title level={2}>Products</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Product
        </Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Create/Edit Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
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
            rules={[{ required: true, message: 'Please input product name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ required: true, message: 'Please input SKU!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="stockQuantity" label="Stock Quantity">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category!' }]}
          >
            <Select placeholder="Select category">
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="DRAFT">Draft</Select.Option>
              <Select.Option value="ACTIVE">Active</Select.Option>
              <Select.Option value="INACTIVE">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Manage Attributes Modal */}
      <Modal
        title={`Manage Attributes for "${selectedProduct?.name}"`}
        open={isAttributeModalVisible}
        onCancel={() => {
          setIsAttributeModalVisible(false);
          setSelectedProductId(null);
          attributeForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Space>
                <strong>Category:</strong>
                <Tag color="blue">{selectedProduct.category.name}</Tag>
                <strong>Current Status:</strong>
                <Tag color={selectedProduct.status === 'ACTIVE' ? 'green' : 'orange'}>
                  {selectedProduct.status}
                </Tag>
              </Space>
            </Card>

            <Form
              form={attributeForm}
              layout="vertical"
              onFinish={handleSetAttributeValue}
            >
              <Form.Item
                name="categoryAttributeId"
                label="Attribute"
                rules={[{ required: true, message: 'Please select attribute!' }]}
              >
                <Select
                  placeholder="Select attribute to set value"
                  onChange={() => attributeForm.setFieldsValue({ value: undefined })}
                >
                  {selectedProduct.category.attributes?.map((attr: any) => (
                    <Select.Option key={attr.id} value={attr.id}>
                      <Space>
                        {attr.name}
                        <Tag size="small">{attr.dataType}</Tag>
                        {attr.isRequired && <Tag size="small" color="red">Required</Tag>}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.categoryAttributeId !== currentValues.categoryAttributeId
                }
              >
                {({ getFieldValue }) => {
                  const attributeId = getFieldValue('categoryAttributeId');
                  const attribute = selectedProduct.category.attributes?.find(
                    (attr: any) => attr.id === attributeId
                  );
                  const existingValue = selectedProduct.values?.find(
                    (val: any) => val.categoryAttributeId === attributeId
                  );

                  if (attribute) {
                    return (
                      <Form.Item
                        name="value"
                        label={`Value for ${attribute.name}`}
                        rules={[{ required: true, message: 'Please input value!' }]}
                        valuePropName={attribute.dataType === 'BOOLEAN' ? 'checked' : 'value'}
                      >
                        {renderAttributeInput(attribute, existingValue)}
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={setAttributeValueMutation.isLoading}
                >
                  Set Value
                </Button>
              </Form.Item>
            </Form>

            <Divider />

            <div>
              <strong>Current Attribute Values:</strong>
              {selectedProduct.values?.length === 0 ? (
                <p><em>No attribute values set</em></p>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {selectedProduct.values?.map((value: any) => (
                    <div key={value.id} style={{ marginBottom: 8 }}>
                      <Space>
                        <Tag color="blue">{value.attribute.name}</Tag>
                        <span>
                          {value.valueText || 
                           value.valueNumber || 
                           (value.valueBool !== null ? value.valueBool.toString() : null) || 
                           value.valueDate || 
                           value.option?.value || 
                           <em>No value</em>}
                        </span>
                      </Space>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;
