/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Tag, Image, ConfigProvider, Spin, Checkbox, Rate,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useTestimonial } from '../../Hooks/useTestimonial'
import { uploadService } from '../../services/upload.service'

const TABLE_HEADER_BG = '#042954'

const Testimonials = () => {
  const {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem,
  } = useTestimonial()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadService.uploadImage(file)
      setProfileImageUrl(res.data.data.imageUrl)
    } catch {
      // error handled in service
    } finally {
      setUploading(false)
    }
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
      width: 80,
      render: (url) =>
        url ? (
          <Image src={url} width={44} height={44} style={{ objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          '—'
        ),
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      render: (v) => v || '—',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 130,
      render: (v) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} />,
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
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Testimonials</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#042954' }}>
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
        title={editRecord ? 'Edit Testimonial' : 'Add Testimonial'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editRecord ? 'Update' : 'Add'}
        okButtonProps={{ style: { background: '#042954' }, loading: submitting || uploading }}
        width="min(500px, 95vw)"
        destroyOnHidden
      >
        <Spin spinning={submitting || uploading} tip={uploading ? 'Uploading...' : 'Saving...'}>
          <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>
            <Form.Item label="Profile Image">
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: 8 }} />
              {profileImageUrl && (
                <img src={profileImageUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%', marginTop: 8 }} />
              )}
            </Form.Item>
            <Form.Item name="title" label={<span>Title / Name <span style={{ color: 'red' }}>*</span></span>} rules={[{ required: true, message: 'Enter title' }]}>
              <Input placeholder="e.g. Amazing Work!" />
            </Form.Item>
            <Form.Item name="description" label={<span>Description <span style={{ color: 'red' }}>*</span></span>} rules={[{ required: true, message: 'Enter description' }]}>
              <Input.TextArea rows={3} placeholder="Client feedback..." />
            </Form.Item>
            <Form.Item name="rating" label="Rating">
              <Rate />
            </Form.Item>
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default Testimonials
