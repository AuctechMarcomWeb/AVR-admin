/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Space, Popconfirm, Tag, ConfigProvider, Input, Descriptions, Badge,
} from 'antd'
import { DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useContact } from '../../Hooks/useContact'

const TABLE_HEADER_BG = '#042954'

const Contact = () => {
  const { data, loading, search, pagination, handleSearch, handlePageChange, markAsRead, deleteItem } = useContact()
  const [viewRecord, setViewRecord] = useState(null)

  const columns = [
    {
      title: 'Sr.No.',
      width: 70,
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    { title: 'Email', dataIndex: 'email', ellipsis: true },
    { title: 'Phone', dataIndex: 'phone', width: 130 },
    { title: 'Subject', dataIndex: 'subject', ellipsis: true },
    {
      title: 'Read',
      dataIndex: 'isRead',
      width: 90,
      render: (v) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Read' : 'Unread'}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 120,
      render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '—'),
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => setViewRecord(record)} />
          <Popconfirm title="Delete this contact?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Contact Enquiries</h4>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Search by name, email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8 }}
        />
      </div>

      <ConfigProvider theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff', headerSortActiveBg: '#021933', headerSortHoverBg: '#063a70' } } }}>
        <Table
          dataSource={Array.isArray(data) ? data : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange, showSizeChanger: false, responsive: true }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title="Contact Details"
        open={!!viewRecord}
        onCancel={() => setViewRecord(null)}
        footer={
          viewRecord && !viewRecord.isRead ? (
            <Button
              type="primary"
              style={{ background: '#042954' }}
              onClick={() => { markAsRead(viewRecord._id); setViewRecord(null) }}
            >
              Mark as Read
            </Button>
          ) : null
        }
        width="min(560px, 95vw)"
        destroyOnHidden
      >
        {viewRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 8 }}>
            <Descriptions.Item label="Name">{viewRecord.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewRecord.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{viewRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="Subject">{viewRecord.subject || '—'}</Descriptions.Item>
            <Descriptions.Item label="Message">{viewRecord.message}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status={viewRecord.isRead ? 'success' : 'warning'} text={viewRecord.isRead ? 'Read' : 'Unread'} />
            </Descriptions.Item>
            <Descriptions.Item label="Date">
              {viewRecord.createdAt ? dayjs(viewRecord.createdAt).format('DD MMM YYYY, hh:mm A') : '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Contact
