/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Tag, Image, ConfigProvider, Spin, Checkbox, Select,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { usePortfolio } from '../../Hooks/usePortfolio'
import { uploadService } from '../../services/upload.service'

const TABLE_HEADER_BG = '#042954'
const CATEGORIES = ['Residential', 'Commercial', 'Office', 'Hospitality', 'Retail', 'Other']

const Portfolio = () => {
  const {
    data, loading, search, activeOnly, categoryFilter, pagination,
    handleSearch, handleActiveToggle, handleCategoryChange, handlePageChange,
    addItem, updateItem, deleteItem,
  } = usePortfolio()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [thumbUploading, setThumbUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [galleryImages, setGalleryImages] = useState([])
  const [description, setDescription] = useState('')
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditRecord(null)
    setThumbnailUrl('')
    setBannerUrl('')
    setGalleryImages([])
    setDescription('')
    form.resetFields()
    form.setFieldsValue({ isActive: true, featured: false, order: 1 })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditRecord(record)
    setThumbnailUrl(record.thumbnailImage || '')
    setBannerUrl(record.bannerImage || '')
    setGalleryImages(record.galleryImages || [])
    setDescription(record.description || '')
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      category: record.category,
      clientName: record.clientName,
      location: record.location,
      duration: record.duration,
      shortDescription: record.shortDescription,
      featured: record.featured,
      activeStatus: record.activeStatus,
      order: record.order,
    })
    setModalOpen(true)
  }

  const handleThumbUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbUploading(true)
    try {
      const res = await uploadService.uploadImage(file)
      setThumbnailUrl(res.data.data.imageUrl)
    } finally { setThumbUploading(false) }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    try {
      const res = await uploadService.uploadImage(file)
      setBannerUrl(res.data.data.imageUrl)
    } finally { setBannerUploading(false) }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setGalleryUploading(true)
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const res = await uploadService.uploadImage(file)
        return res.data.data.imageUrl
      }))
      setGalleryImages((prev) => [...prev, ...urls])
    } finally { setGalleryUploading(false) }
  }

  const removeGalleryImage = (idx) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const isUploading = thumbUploading || bannerUploading || galleryUploading

  const handleSubmit = () => {
    form.validateFields().then(async (vals) => {
      setSubmitting(true)
      try {
        const payload = {
          ...vals,
          thumbnailImage: thumbnailUrl,
          bannerImage: bannerUrl,
          galleryImages,
          description,
        }
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
      title: 'Thumbnail',
      dataIndex: 'thumbnailImage',
      width: 90,
      render: (url) =>
        url ? <Image src={url} width={64} height={44} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '—',
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
    { title: 'Category', dataIndex: 'category', width: 120 },
    { title: 'Client', dataIndex: 'clientName', ellipsis: true, width: 130 },
    { title: 'Location', dataIndex: 'location', ellipsis: true, width: 120 },
    {
      title: 'Featured',
      dataIndex: 'featured',
      width: 90,
      render: (v) => <Tag color={v ? 'gold' : 'default'}>{v ? 'Yes' : 'No'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'activeStatus',
      width: 90,
      render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this portfolio?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Portfolio</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#042954' }}>
          Add Portfolio
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Search by title..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
          style={{ width: 260, borderRadius: 8 }}
        />
        <Select
          allowClear
          placeholder="All categories"
          style={{ width: 180 }}
          value={categoryFilter || undefined}
          onChange={(val) => handleCategoryChange(val || '')}
        >
          {CATEGORIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
        </Select>
        <Checkbox checked={activeOnly} onChange={(e) => handleActiveToggle(e.target.checked)}>Active</Checkbox>
      </div>

      <ConfigProvider theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff', headerSortActiveBg: '#021933', headerSortHoverBg: '#063a70' } } }}>
        <Table
          dataSource={Array.isArray(data) ? data : []}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange, showSizeChanger: false, responsive: true }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Portfolio' : 'Add Portfolio'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editRecord ? 'Update' : 'Add'}
        okButtonProps={{ style: { background: '#042954' }, loading: submitting || isUploading, disabled: isUploading }}
        width="min(900px, 96vw)"
        destroyOnHidden
      >
        <Spin spinning={submitting || isUploading} tip={isUploading ? 'Uploading...' : 'Saving...'}>
          <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Form.Item name="title" label={<span>Title <span style={{ color: 'red' }}>*</span></span>} rules={[{ required: true, message: 'Enter title' }]} style={{ flex: 1, minWidth: 200 }}>
                <Input placeholder="Modern Villa Design" />
              </Form.Item>
              <Form.Item name="slug" label={<span>Slug <span style={{ color: 'red' }}>*</span></span>} rules={[{ required: true, message: 'Enter slug' }]} style={{ flex: 1, minWidth: 180 }}>
                <Input placeholder="modern-villa-design" />
              </Form.Item>
              <Form.Item name="category" label={<span>Category <span style={{ color: 'red' }}>*</span></span>} rules={[{ required: true, message: 'Select category' }]} style={{ width: 160 }}>
                <Select placeholder="Select">
                  {CATEGORIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Form.Item name="clientName" label="Client Name" style={{ flex: 1, minWidth: 160 }}>
                <Input placeholder="Mr. Sharma" />
              </Form.Item>
              <Form.Item name="location" label="Location" style={{ flex: 1, minWidth: 160 }}>
                <Input placeholder="Mumbai" />
              </Form.Item>
              <Form.Item name="duration" label="Duration" style={{ flex: 1, minWidth: 120 }}>
                <Input placeholder="3 months" />
              </Form.Item>
            </div>
            <Form.Item name="shortDescription" label="Short Description">
              <Input.TextArea rows={2} placeholder="A luxury villa interior..." />
            </Form.Item>
            {/* Images */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <Form.Item label={<span>Thumbnail Image <span style={{ color: 'red' }}>*</span></span>} style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={handleThumbUpload} />
                {thumbnailUrl && <img src={thumbnailUrl} alt="thumb" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4, marginTop: 6 }} />}
              </Form.Item>
              <Form.Item label={<span>Banner Image <span style={{ color: 'red' }}>*</span></span>} style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={handleBannerUpload} />
                {bannerUrl && <img src={bannerUrl} alt="banner" style={{ width: 120, height: 60, objectFit: 'cover', borderRadius: 4, marginTop: 6 }} />}
              </Form.Item>
            </div>
            <Form.Item label="Gallery Images (Multiple)">
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {galleryImages.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={url} alt={`gallery-${idx}`} style={{ width: 60, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, lineHeight: '18px', textAlign: 'center', padding: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            </Form.Item>
            <Form.Item label={<span>Description <span style={{ color: 'red' }}>*</span></span>}>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
                <CKEditor
                  editor={ClassicEditor}
                  data={description}
                  onChange={(_, editor) => setDescription(editor.getData())}
                />
              </div>
            </Form.Item>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <Form.Item name="featured" label="Featured" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
              <Form.Item name="activeStatus" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default Portfolio
