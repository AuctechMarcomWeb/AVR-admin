/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Image, ConfigProvider, Checkbox,
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
} from '@ant-design/icons'
import { useHomeSlider } from '../../Hooks/useHomeSlider'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#000000'

// ─── Main Page ──────────────────────────────────────────────────────────────
const HomeSlider = () => {
  const {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem, toggleStatus,
  } = useHomeSlider()

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
    setImageUrl(record.image || '')
    form.setFieldsValue({
      title: record.title,
      heading: record.heading,
      subHeading: record.subHeading,
      isActive: record.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(async (vals) => {
      setSubmitting(true)
      try {
        const payload = { ...vals, image: imageUrl }
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
      width: 75,
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 100,
      render: (url) =>
        url ? (
          <Image src={url} width={72} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : '—',
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
    { title: 'Heading', dataIndex: 'heading', ellipsis: true },
    { title: 'Sub Heading', dataIndex: 'subHeading', ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 110,
      render: (val, record) => (
        <Switch
          checked={val}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={() => toggleStatus(record._id, val)}
        />
      ),
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this slider?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#000000', fontWeight: 700 }}>Home Slider</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#000000', color: '#ffffff' }}>
          Add Slider
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

      
      {/* Table */}
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

      {/* Modal */}
      <Modal
        title={editRecord ? 'Edit Slider' : 'Add Slider'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 8 }}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label={<span>Title <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter title' }]}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="Beautiful Interiors" />
          </Form.Item>

          <Form.Item
            name="heading"
            label={<span>Heading <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter heading' }]}
            style={{ marginBottom: 10 }}
          >
            <Input placeholder="Design Your Space" />
          </Form.Item>

          <Form.Item name="subHeading" label="Sub Heading" style={{ marginBottom: 10 }}>
            <Input placeholder="Premium interior design solutions" />
          </Form.Item>

          <Form.Item
            label={<span>Slider Image <span style={{ color: 'red' }}>*</span></span>}
            style={{ marginBottom: 10 }}
          >
            <SingleImageUpload value={imageUrl} onChange={setImageUrl} />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          {/* Footer Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 4,
            }}
          >
            <Button
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{
                background: '#000000', color: '#ffffff',
                minWidth: 90,
              }}
            >
              {submitting
                ? 'Saving...'
                : editRecord
                  ? 'Update'
                  : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default HomeSlider
