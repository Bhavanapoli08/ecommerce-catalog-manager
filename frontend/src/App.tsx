import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { ShopOutlined, TagsOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import CategoriesPage from './pages/CategoriesPage';
import AttributesPage from './pages/AttributesPage';
import ProductsPage from './pages/ProductsPage';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white', padding: '0 24px' }}>
        <Title level={3} style={{ color: 'white', margin: '16px 0' }}>
          🛍️ eCommerce Catalog Tool
        </Title>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['categories']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="categories" icon={<AppstoreOutlined />}>
              <Link to="/categories">Categories</Link>
            </Menu.Item>
            <Menu.Item key="attributes" icon={<TagsOutlined />}>
              <Link to="/attributes">Attributes</Link>
            </Menu.Item>
            <Menu.Item key="products" icon={<ShopOutlined />}>
              <Link to="/products">Products</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/" element={<CategoriesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/attributes" element={<AttributesPage />} />
              <Route path="/products" element={<ProductsPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
