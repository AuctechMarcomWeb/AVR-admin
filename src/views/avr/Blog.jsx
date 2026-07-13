/* eslint-disable prettier/prettier */
import { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, Switch,
  Space, Popconfirm, Tag, Image, ConfigProvider, Checkbox,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useBlog } from '../../Hooks/useBlog'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#042954'

const Blog = () => {
  const {
    data, loading, search, activeOnly, pagination,
    handleSearch, handleActiveToggle, handlePageChange,
    addItem, updateItem, deleteItem,
  } = useBlog()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [details, setDetails] = useState('')
  const [form] = Form.useForm()

  const openAdd = () => {
    setEditRecord(null)
    setMainImageUrl('')
    setDetails('')
    form.resetFields()
    form.setFieldsValue({ isActive: true })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditRecord(record)
    setMainImageUrl(record.mainImage || '')
    setDetails(record.details || '')
    form.setFieldsValue({
      url: record.url,
      heading: record.heading,
      seoTitle: record.seoTitle,
      metaKeywords: record.metaKeywords,
      shortDescription: record.shortDescription,
      mainImageName: record.mainImageName,
      isActive: record.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(async (vals) => {
      setSubmitting(true)
      try {
        const payload = { ...vals, mainImage: mainImageUrl, details }
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
      dataIndex: 'mainImage',
      width: 90,
      render: (url) =>
        url ? <Image src={url} width={64} height={44} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '—',
    },
    { title: 'Heading', dataIndex: 'heading', ellipsis: true },
    { title: 'URL Slug', dataIndex: 'url', ellipsis: true, width: 140 },
    {
      title: 'Short Desc',
      dataIndex: 'shortDescription',
      ellipsis: true,
      render: (v) => v || '—',
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
          <Popconfirm title="Delete this blog?" onConfirm={() => deleteItem(record._id)} okText="Yes" cancelText="No">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ margin: 0, color: '#042954', fontWeight: 700 }}>Blogs</h4>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd} style={{ background: '#042954' }}>
          Add Blog
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
          scroll={{ x: 900 }}
          pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange, showSizeChanger: false, responsive: true }}
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Blog' : 'Add Blog'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="min(860px, 96vw)"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }} requiredMark={false}>

          {/* Row 1 — Heading + URL Slug */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item
              name="heading"
              label={<span>Heading <span style={{ color: 'red' }}>*</span></span>}
              rules={[{ required: true, message: 'Enter blog heading' }]}
              style={{ flex: 1, minWidth: 200, marginBottom: 10 }}
            >
              <Input placeholder="My First Blog" />
            </Form.Item>
            <Form.Item
              name="url"
              label={<span>URL Slug <span style={{ color: 'red' }}>*</span></span>}
              rules={[{ required: true, message: 'Enter URL slug' }]}
              style={{ flex: 1, minWidth: 180, marginBottom: 10 }}
            >
              <Input placeholder="my-first-blog" />
            </Form.Item>
          </div>

          {/* Row 2 — SEO Title + Meta Keywords */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Form.Item name="seoTitle" label="SEO Title" style={{ flex: 1, minWidth: 180, marginBottom: 10 }}>
              <Input placeholder="My First Blog | AVR" />
            </Form.Item>
            <Form.Item name="metaKeywords" label="Meta Keywords" style={{ flex: 1, minWidth: 180, marginBottom: 10 }}>
              <Input placeholder="blog, avr, design" />
            </Form.Item>
          </div>

          {/* Short Description */}
          <Form.Item name="shortDescription" label="Short Description" style={{ marginBottom: 10 }}>
            <Input.TextArea rows={2} placeholder="A short intro to this blog..." />
          </Form.Item>

          {/* Row 3 — Main Image Upload + Image Alt/Name side by side */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                label={<span>Main Image <span style={{ color: 'red' }}>*</span></span>}
                style={{ marginBottom: 0 }}
              >
                <SingleImageUpload value={mainImageUrl} onChange={setMainImageUrl} width="100%" height={104} />
              </Form.Item>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Form.Item
                name="mainImageName"
                label="Image Alt / Name"
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="sample-image" />
              </Form.Item>
            </div>
          </div>

          {/* Blog Content CKEditor */}
          <Form.Item
            label={<span>Blog Content <span style={{ color: 'red' }}>*</span></span>}
            style={{ marginBottom: 10 }}
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
              <CKEditor
                editor={ClassicEditor}
                data={details}
                onChange={(_, editor) => setDetails(editor.getData())}
                config={{
                  toolbar: ['heading', '|', 'bold', 'italic', 'underline', 'link', '|',
                    'bulletedList', 'numberedList', 'blockQuote', '|',
                    'insertTable', '|', 'undo', 'redo'],
                }}
              />
            </div>
          </Form.Item>

          {/* Status */}
          <Form.Item name="isActive" label="Status" valuePropName="checked" style={{ marginBottom: 12 }}>
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          {/* Footer buttons */}
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

export default Blog
