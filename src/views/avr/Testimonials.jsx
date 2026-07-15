/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Tag, Image, ConfigProvider, Checkbox, InputNumber,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StarFilled } from '@ant-design/icons'
import { useTestimonial } from '../../Hooks/useTestimonial'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#000000'

// ─── Decimal Star Display ────────────────────────────────────────────────────
// Shows filled/partial/empty stars for decimal ratings like 3.7, 4.2
const StarRating = ({ value = 0, max = 5, size = 16 }) => {
  const clamped = Math.min(Math.max(Number(value) || 0, 0), max)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = clamped - i          // > 1 = full, 0-1 = partial, < 0 = empty
        const pct = Math.min(Math.max(filled, 0), 1) * 100
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
            {/* Empty star */}
            <StarFilled style={{ fontSize: size, color: '#e0e0e0', position: 'absolute', top: 0, left: 0 }} />
            {/* Filled clip */}
            <span style={{ position: 'absolute', top: 0, left: 0, width: `${pct}%`, overflow: 'hidden', display: 'inline-block' }}>
              <StarFilled style={{ fontSize: size, color: '#faad14' }} />
            </span>
          </span>
        )
      })}
      <span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>{clamped.toFixed(1)}</span>
    </span>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const Testimonials = () => {
  const {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem,
  } = useTestimonial()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditRecord(null)
    setProfileImageUrl('')
    form.resetFields()
    form.setFieldsValue({ isActive: true, rating: 5 })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditRecord(record)
    setProfileImageUrl(record.profileImage || '')
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      rating: record.rating,
      isActive: record.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(async (vals) => {
      setSubmitting(true)
      try {
        const payload = { ...vals, profileImage: profileImageUrl }
        await (editRecord ? updateItem(editRecord._id, payload) : addItem(payload))
        setModalOpen(false)
      } finally {
        setSubmitting(false)
      }
    })
  }

  const columns = [
    {
      title: 'Sr.No.',
      width: 70,
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    {
      title: 'Profile',
      dataIndex: 'profileImage',
      width: 72,
      render: (url) =>
        url ? (
          <Image src={url} width={44} height={44} style={{ objectFit: 'cover', borderRadius: '50%' }} />
        ) : '—',
    },
    { title: 'Title / Name', dataIndex: 'title', ellipsis: true },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (v) => v || '—',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 160,
      render: (v) => <StarRating value={v} />,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 90,
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this testimonial?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#000000', fontWeight: 700 }}>Testimonials</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#000000', color: '#ffffff' }}>
          Add Testimonial
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Search by title..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 280, borderRadius: 8 }}
        />
        <Checkbox checked={activeOnly} onChange={(e) => handleActiveToggle(e.target.checked)}>Active</Checkbox>
      </div>

      <ConfigProvider theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#ffffff', headerSortActiveBg: '#1a1a1a', headerSortHoverBg: '#333333' } } }}>
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
        title={editRecord ? 'Edit Testimonial' : 'Add Testimonial'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="min(500px, 95vw)"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>

          {/* Profile Image */}
          <Form.Item label="Profile Image" style={{ marginBottom: 10 }}>
            <SingleImageUpload value={profileImageUrl} onChange={setProfileImageUrl} />
          </Form.Item>

          {/* Title */}
          <Form.Item
            name="title"
            label={<span>Title / Name <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter title' }]}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="e.g. Amazing Work!" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label={<span>Description <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter description' }]}
            style={{ marginBottom: 10 }}
          >
            <Input.TextArea rows={3} placeholder="Client feedback..." />
          </Form.Item>

          {/* Rating — decimal input with live star preview */}
          <Form.Item
            name="rating"
            label="Rating (0 – 5)"
            rules={[
              { required: true, message: 'Enter rating' },
              {
                validator: (_, v) =>
                  v === undefined || v === null || (v >= 0 && v <= 5)
                    ? Promise.resolve()
                    : Promise.reject(new Error('Rating must be between 0 and 5')),
              },
            ]}
            style={{ marginBottom: 10 }}
          >
            <Form.Item name="rating" noStyle>
              {/* Wrap to get live value for preview */}
              <InputNumber
                min={0}
                max={5}
                step={0.1}
                precision={1}
                placeholder="e.g. 4.5"
                style={{ width: '100%' }}
                onChange={(val) => form.setFieldValue('rating', val)}
              />
            </Form.Item>
          </Form.Item>

          {/* Live star preview */}
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.rating !== curr.rating}>
            {({ getFieldValue }) => {
              const val = getFieldValue('rating')
              return val !== undefined && val !== null ? (
                <div style={{ marginBottom: 10 }}>
                  <StarRating value={val} size={20} />
                </div>
              ) : null
            }}
          </Form.Item>

          {/* Status */}
          <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{ background: '#000000', minWidth: 90 }}
            >
              {submitting ? 'Saving...' : editRecord ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Testimonials
