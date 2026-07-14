/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Tag, Image, ConfigProvider, Checkbox, Select,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { useAVRGallery } from '../../Hooks/useAVRGallery'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#042954'
const SERVICE_TYPES = ['Interior', 'Exterior', 'Commercial', 'Residential', 'Furniture', 'Other']

const AVRGallery = () => {
  const {
    data, loading, search, activeOnly, serviceTypeFilter, pagination,
    handleSearch, handleActiveToggle, handleServiceTypeChange, handlePageChange,
    addItem, updateItem, deleteItem,
  } = useAVRGallery()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditRecord(null)
    setImageUrl('')
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditRecord(record)
    setImageUrl(record.url || '')
    form.setFieldsValue({
      title: record.title,
      serviceType: record.serviceType,
      isActive: record.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(async (vals) => {
      setSubmitting(true)
      try {
        const payload = { ...vals, url: imageUrl }
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
      title: 'Image',
      dataIndex: 'url',
      width: 100,
      render: (url) =>
        url ? <Image src={url} width={72} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '—',
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
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
          <Popconfirm title="Delete this gallery item?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Gallery</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#042954' }}>
          Add Gallery
        </Button>
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
          </label>

          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox
              checked={activeOnly}
              onChange={(e) => handleActiveToggle(e.target.checked)}
            >
              Active
            </Checkbox>
          </div>
        </div>
      </div>

      <ConfigProvider theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff', headerSortActiveBg: '#021933', headerSortHoverBg: '#063a70' } } }}>
        <Table
          dataSource={Array.isArray(data) ? data : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 700 }}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange, showSizeChanger: false, responsive: true }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Gallery Item' : 'Add Gallery Item'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="min(480px, 95vw)"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>
          <Form.Item
            name="title"
            label={<span>Title </span>}
            // rules={[{ required: true, message: 'Enter title' }]}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="Enter Title" />
          </Form.Item>

          <Form.Item
            label={<span>Image <span style={{ color: 'red' }}>*</span></span>}
            style={{ marginBottom: 10 }}
          >
            <SingleImageUpload value={imageUrl} onChange={setImageUrl} />
          </Form.Item>


          {/* <Form.Item
            name="serviceType"
            label={<span>Service Type <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Select service type' }]}
            style={{ marginBottom: 10 }}
          >
            <Select placeholder="Select service type">
              {SERVICE_TYPES.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
            </Select>
          </Form.Item> */}

          <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{ background: '#042954', minWidth: 90 }}
            >
              {submitting ? 'Saving...' : editRecord ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default AVRGallery
