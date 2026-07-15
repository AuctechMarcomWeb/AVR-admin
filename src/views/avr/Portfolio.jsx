/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Popconfirm,
  Tag,
  Image,
  ConfigProvider,
  Checkbox,
  Upload,
  Progress,
  Row,
  Col,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  LoadingOutlined,
  EyeOutlined,
  DeleteFilled,
} from '@ant-design/icons'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { usePortfolio } from '../../Hooks/usePortfolio'
import { uploadService } from '../../services/upload.service'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#042954'
const IMAGE_CARD_SIZE = 104
// ─── Multi Image Upload (gallery images) ────────────────────────────────────
const MultiImageUpload = ({
  images = [],
  onChange,
  width = IMAGE_CARD_SIZE,
  height = IMAGE_CARD_SIZE,
  maxCount = 20,
}) => {
  const [uploadingCount, setUploadingCount] = useState(0)
  const [percent, setPercent] = useState(0)

  const safeImages = Array.isArray(images) ? images : []
  const isUploading = uploadingCount > 0

  const handleChange = async ({ fileList }) => {
    const availableSlots = maxCount - safeImages.length

    if (availableSlots <= 0) return

    const newFiles = fileList
      .filter((file) => file.originFileObj && !file.url)
      .slice(0, availableSlots)

    if (!newFiles.length) return

    setUploadingCount(newFiles.length)
    setPercent(10)

    const timer = setInterval(() => {
      setPercent((current) => (current < 85 ? current + 10 : current))
    }, 200)

    try {
      const urls = await Promise.all(
        newFiles.map((file) =>
          uploadService
            .uploadImage(file.originFileObj)
            .then((response) => response?.data?.data?.imageUrl),
        ),
      )

      clearInterval(timer)
      setPercent(100)

      const validUrls = urls.filter(Boolean)

      onChange([...safeImages, ...validUrls].slice(0, maxCount))
    } catch (error) {
      clearInterval(timer)
      setPercent(0)

      console.error('Gallery upload error:', error)
    } finally {
      setTimeout(() => {
        setUploadingCount(0)
        setPercent(0)
      }, 400)
    }
  }

  const removeImage = (index) => {
    onChange(safeImages.filter((_, imageIndex) => imageIndex !== index))
  }

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
      }}
    >
      <style>
        {`
          .portfolio-gallery-card:hover .portfolio-gallery-overlay {
            opacity: 1 !important;
          }
        `}
      </style>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, ${width}px)`,
          gap: 8,
          width: '100%',
          minWidth: 0,
          alignItems: 'start',
          justifyContent: 'start',
        }}
      >
        {safeImages.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="portfolio-gallery-card"
            style={{
              position: 'relative',
              width,
              height,
              border: '1px solid #d9d9d9',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#fafafa',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={url}
              alt={`gallery-${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <div
              className="portfolio-gallery-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <DeleteFilled
                onClick={() => removeImage(index)}
                style={{
                  color: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        ))}

        {safeImages.length < maxCount && (
          <Upload
            accept="image/*"
            showUploadList={false}
            multiple
            beforeUpload={() => false}
            onChange={handleChange}
            disabled={isUploading}
          >
            <div
              style={{
                width,
                height,
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#fafafa',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                boxSizing: 'border-box',
              }}
            >
              {isUploading ? (
                <LoadingOutlined
                  style={{
                    fontSize: 20,
                    color: '#1677ff',
                  }}
                />
              ) : (
                <PlusOutlined
                  style={{
                    fontSize: 18,
                    color: '#555',
                  }}
                />
              )}

              <span
                style={{
                  fontSize: 12,
                  color: '#555',
                  textAlign: 'center',
                }}
              >
                {isUploading ? `${uploadingCount} uploading` : 'Add'}
              </span>
            </div>
          </Upload>
        )}
      </div>

      {isUploading && (
        <Progress
          percent={percent}
          showInfo={false}
          size="small"
          style={{
            maxWidth: 220,
            marginTop: 8,
            marginBottom: 0,
          }}
        />
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const Portfolio = () => {
  const {
    data,
    loading,
    search,
    activeOnly,
    pagination,
    handleSearch,
    handleActiveToggle,
    handlePageChange,
    addItem,
    updateItem,
    deleteItem,
  } = usePortfolio()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
    form.setFieldsValue({ activeStatus: true, featured: false })
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
    })
    setModalOpen(true)
  }

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
      width: 75,
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnailImage',
      width: 90,
      render: (url) =>
        url ? (
          <Image src={url} width={64} height={44} style={{ objectFit: 'cover', borderRadius: 4 }} />
        ) : (
          '—'
        ),
    },
    { title: 'Title', dataIndex: 'title', ellipsis: true },
    { title: 'Category', dataIndex: 'category', width: 130 },
    { title: 'Client', dataIndex: 'clientName', ellipsis: true, width: 120 },
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
          <Popconfirm
            title="Delete this portfolio?"
            onConfirm={() => deleteItem(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Portfolio</h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ background: '#042954' }}
        >
          Add Portfolio
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
          ></label>

          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox checked={activeOnly} onChange={(e) => handleActiveToggle(e.target.checked)}>
              Active
            </Checkbox>
          </div>
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
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: false,
            responsive: true,
          }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Portfolio' : 'Add Portfolio'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={750}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>
          {/* Row 1 — Title + Slug + Category */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item
              name="title"
              label={
                <span>
                  Title <span style={{ color: 'red' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: 'Enter title' }]}
              style={{ flex: 1, minWidth: 160, marginBottom: 10 }}
            >
              <Input placeholder="Modern Villa Design" />
            </Form.Item>
            <Form.Item
              name="slug"
              label={
                <span>
                  Slug <span style={{ color: 'red' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: 'Enter slug' }]}
              style={{ flex: 1, minWidth: 160, marginBottom: 10 }}
            >
              <Input placeholder="modern-villa-design" />
            </Form.Item>
            <Form.Item
              name="category"
              label={
                <span>
                  Category <span style={{ color: 'red' }}>*</span>
                </span>
              }
              rules={[{ required: true, message: 'Enter category' }]}
              style={{ flex: 1, minWidth: 140, marginBottom: 10 }}
            >
              <Input placeholder="e.g. Residential" />
            </Form.Item>
          </div>

          {/* Row 2 — Client + Location + Duration */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item
              name="clientName"
              label="Client Name"
              style={{ flex: 1, minWidth: 140, marginBottom: 10 }}
            >
              <Input placeholder="Mr. Sharma" />
            </Form.Item>
            <Form.Item
              name="location"
              label="Location"
              style={{ flex: 1, minWidth: 140, marginBottom: 10 }}
            >
              <Input placeholder="Mumbai" />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Duration"
              style={{ flex: 1, minWidth: 120, marginBottom: 10 }}
            >
              <Input placeholder="3 months" />
            </Form.Item>
          </div>

          {/* Short Description */}
          <Form.Item name="shortDescription" label="Short Description" style={{ marginBottom: 10 }}>
            <Input.TextArea rows={2} placeholder="A luxury villa interior..." />
          </Form.Item>

          {/* Row 3 — Thumbnail + Banner (SingleImageUpload) */}
          {/* <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                label={
                  <span>
                    Thumbnail Image <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <SingleImageUpload
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  width="100%"
                  height={104}
                />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                label={
                  <span>
                    Banner Image <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <SingleImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  width="100%"
                  height={104}
                />
              </Form.Item>
            </div>
          </div> */}

          {/* Gallery Images — multi upload */}
          {/* <Form.Item label="Gallery Images" style={{ marginBottom: 10 }}>
            <MultiImageUpload images={galleryImages} onChange={setGalleryImages} />
          </Form.Item> */}

          {/* Thumbnail + Banner + Gallery Images */}
          <Row gutter={[16, 14]} align="top" style={{ marginBottom: 12 }}>
            <Col xs={24} sm={12} md={5}>
              <Form.Item
                label={
                  <span>
                    Thumbnail Image <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <SingleImageUpload
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  width={IMAGE_CARD_SIZE}
                  height={IMAGE_CARD_SIZE}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Form.Item
                label={
                  <span>
                    Banner Image <span style={{ color: 'red' }}>*</span>
                  </span>
                }
                style={{ marginBottom: 0 }}
              >
                <SingleImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  width={IMAGE_CARD_SIZE}
                  height={IMAGE_CARD_SIZE}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              sm={24}
              md={14}
              style={{
                minWidth: 0,
              }}
            >
              <Form.Item label="Gallery Images" style={{ marginBottom: 0 }}>
                <MultiImageUpload
                  images={galleryImages}
                  onChange={setGalleryImages}
                  width={IMAGE_CARD_SIZE}
                  height={IMAGE_CARD_SIZE}
                  maxCount={20}
                />
              </Form.Item>
            </Col>
          </Row>
          {/* CKEditor */}
          <Form.Item
            label={
              <span>
                Description <span style={{ color: 'red' }}>*</span>
              </span>
            }
            style={{ marginBottom: 10 }}
          >
            <div
              className="blog-editor-wrapper"
              style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}
            >
              <CKEditor
                editor={ClassicEditor}
                data={description}
                onChange={(_, editor) => setDescription(editor.getData())}
                config={{
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'link',
                    '|',
                    'bulletedList',
                    'numberedList',
                    'blockQuote',
                    '|',
                    'insertTable',
                    '|',
                    'undo',
                    'redo',
                  ],
                }}
              />
            </div>
          </Form.Item>

          {/* Featured + Status */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
            <Form.Item
              name="featured"
              label="Featured"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
            <Form.Item
              name="activeStatus"
              label="Status"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
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

export default Portfolio
