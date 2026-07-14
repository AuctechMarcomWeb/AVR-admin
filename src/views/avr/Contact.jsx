/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Space,
  Popconfirm,
  Tag,
  ConfigProvider,
  Input,
  Descriptions,
  Badge,
} from 'antd'
import {
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useContact } from '../../Hooks/useContact'

const TABLE_HEADER_BG = '#042954'

const Contact = () => {
  const {
    data,
    loading,
    search,
    pagination,
    handleSearch,
    handlePageChange,
    markAsRead,
    deleteItem,
  } = useContact()

  const [viewRecord, setViewRecord] = useState(null)

  const columns = [
    {
      title: 'Sr.No.',
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Contact',
      width: 240,
      render: (_, record) => (
        <div style={{ lineHeight: 1.6 }}>
          <div
            style={{
              fontWeight: 600,
              color: '#042954',
              fontSize: 13,
            }}
          >
            {record.name || '—'}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#555',
              wordBreak: 'break-word',
            }}
          >
            <MailOutlined
              style={{
                marginRight: 4,
                color: '#888',
              }}
            />

            {record.email || '—'}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#555',
            }}
          >
            <PhoneOutlined
              style={{
                marginRight: 4,
                color: '#888',
              }}
            />

            {record.phone || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
      render: (value) => value || '—',
    },
    {
      title: 'Read',
      dataIndex: 'isRead',
      width: 90,
      render: (value) => (
        <Tag color={value ? 'green' : 'orange'}>
          {value ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 130,
      render: (value) =>
        value ? dayjs(value).format('DD MMM YYYY') : '—',
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setViewRecord(record)}
          />

          <Popconfirm
            title="Delete this contact?"
            description="Are you sure you want to delete this contact?"
            onConfirm={() => deleteItem(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleMarkAsRead = async () => {
    if (!viewRecord?._id) return

    try {
      await markAsRead(viewRecord._id)
      setViewRecord(null)
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h4
          style={{
            margin: 0,
            color: '#042954',
            fontWeight: 700,
          }}
        >
          Contact Enquiries
        </h4>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 20,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <label
            style={{
              fontWeight: 600,
              color: '#333',
            }}
          >
            Search
          </label>

          <Input
            prefix={
              <SearchOutlined
                style={{
                  color: '#aaa',
                }}
              />
            }
            placeholder="Search name, email, phone or message..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            allowClear
            style={{
              width: 280,
              maxWidth: '100%',
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: TABLE_HEADER_BG,
              headerColor: '#fff',
              headerSortActiveBg: '#021933',
              headerSortHoverBg: '#063a70',
            },
          },
        }}
      >
        <Table
          dataSource={Array.isArray(data) ? data : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 750 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: false,
            responsive: true,
          }}
          size="middle"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </ConfigProvider>

      <Modal
        title="Contact Details"
        open={Boolean(viewRecord)}
        onCancel={() => setViewRecord(null)}
        footer={
          viewRecord && !viewRecord.isRead ? (
            <Button
              type="primary"
              style={{
                background: '#042954',
              }}
              onClick={handleMarkAsRead}
            >
              Mark as Read
            </Button>
          ) : null
        }
        width="min(560px, 95vw)"
        destroyOnHidden
      >
        {viewRecord && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{
              marginTop: 8,
            }}
          >
            <Descriptions.Item label="Name">
              {viewRecord.name || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Email">
              {viewRecord.email || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Phone">
              {viewRecord.phone || '—'}
            </Descriptions.Item>

            <Descriptions.Item label="Message">
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {viewRecord.message || '—'}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Badge
                status={viewRecord.isRead ? 'success' : 'warning'}
                text={viewRecord.isRead ? 'Read' : 'Unread'}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Date">
              {viewRecord.createdAt
                ? dayjs(viewRecord.createdAt).format(
                    'DD MMM YYYY, hh:mm A',
                  )
                : '—'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default Contact