/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Space, Popconfirm, Tag, ConfigProvider, Input,
  Select, Descriptions, Badge,
} from 'antd'
import { DeleteOutlined, SearchOutlined, EyeOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useBookConsultation } from '../../Hooks/useBookConsultation'

const TABLE_HEADER_BG = '#042954'

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Cancelled']

const STATUS_COLORS = {
  Pending: 'orange',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
}

const BookConsultation = () => {
  const {
    data, loading, search, statusFilter, pagination,
    handleSearch, handleStatusChange, handlePageChange,
    updateStatus, deleteItem,
  } = useBookConsultation()

  const [viewRecord, setViewRecord] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const handleView = (record) => {
    setViewRecord(record)
    setNewStatus(record.status || 'Pending')
  }

  const handleStatusUpdate = async () => {
    if (viewRecord && newStatus && newStatus !== viewRecord.status) {
      await updateStatus(viewRecord._id, newStatus)
    }
    setViewRecord(null)
  }

  const columns = [
    {
      title: 'Sr.No.',
      width: 70,
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    {
      title: 'Contact',
      width: 220,
      render: (_, r) => (
        <div style={{ lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: '#042954', fontSize: 13 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#555' }}>
            <MailOutlined style={{ marginRight: 4, color: '#888' }} />
            {r.email}
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            <PhoneOutlined style={{ marginRight: 4, color: '#888' }} />
            {r.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 120,
      render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '—'),
    },
    { title: 'Slot', dataIndex: 'slot', width: 160 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (v) => <Tag color={STATUS_COLORS[v] || 'default'}>{v || 'Pending'}</Tag>,
    },
    {
      title: 'Actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Popconfirm title="Delete this booking?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Book Consultation</h4>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
       <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 20,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
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
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={{
              width: 280,
              borderRadius: 8,
            }}
          />
        </div>

        {/* Status */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <label
            style={{
              fontWeight: 600,
              color: '#333',
            }}
          >
            Select Status
          </label>

          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
           <Select
          allowClear
          placeholder="All statuses"
          style={{ width: 160 }}
          value={statusFilter || undefined}
          onChange={(val) => handleStatusChange(val || '')}
        >
          {STATUS_OPTIONS.map((s) => (
            <Select.Option key={s} value={s}>{s}</Select.Option>
          ))}
        </Select>
          </div>
        </div>
      </div>

       
       
      </div>

      <ConfigProvider theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff', headerSortActiveBg: '#021933', headerSortHoverBg: '#063a70' } } }}>
        <Table
          dataSource={Array.isArray(data) ? data : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange, showSizeChanger: false, responsive: true }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title="Booking Details"
        open={!!viewRecord}
        onOk={handleStatusUpdate}
        onCancel={() => setViewRecord(null)}
        okText="Update Status"
        okButtonProps={{ style: { background: '#042954' } }}
        width="min(580px, 95vw)"
        destroyOnHidden
      >
        {viewRecord && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginTop: 8, marginBottom: 16 }}>
              <Descriptions.Item label="Name">{viewRecord.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{viewRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{viewRecord.phone}</Descriptions.Item>
              <Descriptions.Item label="Date">{viewRecord.date ? dayjs(viewRecord.date).format('DD MMM YYYY') : '—'}</Descriptions.Item>
              <Descriptions.Item label="Slot">{viewRecord.slot}</Descriptions.Item>
              <Descriptions.Item label="Address">{viewRecord.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="Remarks">{viewRecord.remarks || '—'}</Descriptions.Item>
              <Descriptions.Item label="Current Status">
                <Badge color={STATUS_COLORS[viewRecord.status] || 'default'} text={viewRecord.status || 'Pending'} />
              </Descriptions.Item>
            </Descriptions>
            <div>
              <span style={{ marginRight: 8, fontWeight: 600 }}>Update Status:</span>
              <Select value={newStatus} onChange={setNewStatus} style={{ width: 160 }}>
                {STATUS_OPTIONS.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
              </Select>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default BookConsultation
