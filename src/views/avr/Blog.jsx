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
  Image,
  ConfigProvider,
  Checkbox,
  Select,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useBlog } from '../../Hooks/useBlog'
import SingleImageUpload from '../../components/SingleImageUpload'

const TABLE_HEADER_BG = '#042954'

const Blog = () => {
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
    toggleStatus,
  } = useBlog()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState('')
  const [details, setDetails] = useState('')

  const [form] = Form.useForm()

  const resetModal = () => {
    setEditRecord(null)
    setMainImageUrl('')
    setDetails('')
    form.resetFields()
  }

  const closeModal = () => {
    if (submitting) return

    setModalOpen(false)
    resetModal()
  }

  const openAdd = () => {
    resetModal()

    form.setFieldsValue({
      isActive: true,
    })

    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditRecord(record)
    setMainImageUrl(record.mainImage || '')
    setDetails(record.details || '')

    form.setFieldsValue({
      url: record.url || '',
      heading: record.heading || '',
      seoTitle: record.seoTitle || '',
      metaKeywords: record.metaKeywords || '',
      shortDescription: record.shortDescription || '',
      mainImageName: record.mainImageName || '',
      isActive: record.isActive ?? true,
      tags: Array.isArray(record.tags) ? record.tags : [],
    })

    setModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      setSubmitting(true)

      const payload = {
        ...values,
        url: values.url?.trim() || '',
        heading: values.heading?.trim() || '',
        seoTitle: values.seoTitle.trim(),
        metaKeywords: values.metaKeywords?.trim() || '',
        shortDescription: values.shortDescription?.trim() || '',
        mainImage: mainImageUrl || '',
        mainImageName: values.mainImageName?.trim() || '',
        details: details || '',
        isActive: values.isActive ?? true,
        tags: Array.isArray(values.tags) ? values.tags : [],
      }

      if (editRecord?._id) {
        await updateItem(editRecord._id, payload)
      } else {
        await addItem(payload)
      }

      setModalOpen(false)
      resetModal()
    } catch (error) {
      // Ant Design validation errors par toast ki zarurat nahi
      if (error?.errorFields) return
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      title: 'Sr.No.',
      width: 75,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: 'Image',
      dataIndex: 'mainImage',
      width: 90,
      render: (url, record) =>
        url ? (
          <Image
            src={url}
            alt={record.mainImageName || record.heading}
            width={64}
            height={44}
            fallback=""
            style={{
              objectFit: 'cover',
              borderRadius: 4,
            }}
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Heading',
      dataIndex: 'heading',
      ellipsis: true,
      render: (value, record) => value || record.seoTitle || '—',
    },
    {
      title: 'URL Slug',
      dataIndex: 'url',
      ellipsis: true,
      width: 150,
      render: (value) => value || '—',
    },
    {
      title: 'Short Desc',
      dataIndex: 'shortDescription',
      ellipsis: true,
      render: (value) => value || '—',
    },
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
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />

          <Popconfirm
            title="Delete this blog?"
            description="Related comments will also be deleted."
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
        <h4
          style={{
            margin: 0,
            color: '#042954',
            fontWeight: 700,
          }}
        >
          Blogs
        </h4>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          style={{ background: '#042954' }}
        >
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
            placeholder="Search heading, SEO title, URL..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            allowClear
            style={{
              width: 280,
              borderRadius: 8,
            }}
          />
        </div>

        <div
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Checkbox
            checked={activeOnly}
            onChange={(event) => handleActiveToggle(event.target.checked)}
          >
            Active only
          </Checkbox>
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
          scroll={{ x: 1050 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: false,
            responsive: true,
            showTotal: (total) => `Total ${total} blogs`,
          }}
          size="middle"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Blog' : 'Add Blog'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width="min(860px, 96vw)"
        destroyOnHidden
        maskClosable={!submitting}
        closable={!submitting}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 8 }}
          requiredMark={false}
          initialValues={{
            isActive: true,
          }}
        >
          {/* Heading and URL are optional in backend */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Form.Item
              name="heading"
              label="Heading"
              style={{
                flex: 1,
                minWidth: 200,
                marginBottom: 10,
              }}
            >
              <Input placeholder="My First Blog" />
            </Form.Item>

            <Form.Item
              name="url"
              label="URL Slug"
              rules={[
                {
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: 'Use lowercase letters, numbers and hyphens only',
                },
              ]}
              style={{
                flex: 1,
                minWidth: 180,
                marginBottom: 10,
              }}
            >
              <Input placeholder="my-first-blog" />
            </Form.Item>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Form.Item
              name="seoTitle"
              label={
                <span>
                  SEO Title <span style={{ color: 'red' }}>*</span>
                </span>
              }
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Enter SEO title',
                },
              ]}
              style={{
                flex: 1,
                minWidth: 180,
                marginBottom: 10,
              }}
            >
              <Input placeholder="My First Blog | AVR" />
            </Form.Item>

            <Form.Item
              name="metaKeywords"
              label="Meta Keywords"
              style={{
                flex: 1,
                minWidth: 180,
                marginBottom: 10,
              }}
            >
              <Input placeholder="blog, avr, design" />
            </Form.Item>
          </div>

          <Form.Item name="shortDescription" label="Short Description" style={{ marginBottom: 10 }}>
            <Input.TextArea
              rows={2}
              maxLength={500}
              showCount
              placeholder="A short intro to this blog..."
            />
          </Form.Item>

          <Row
            gutter={[14, 12]}
            align="top"
            style={{
              marginBottom: 10,
            }}
          >
            {/* Main Image */}
            <Col xs={24} sm={7} md={5}>
              <Form.Item
                label="Thumbnail Image"
                style={{
                  marginBottom: 0,
                }}
              >
                <SingleImageUpload
                  value={mainImageUrl}
                  onChange={setMainImageUrl}
                  width={104}
                  height={104}
                />
              </Form.Item>
            </Col>

            {/* Image Alt */}
            <Col xs={24} sm={17} md={7}>
              <Form.Item
                name="mainImageName"
                label="Image Keywords"
                style={{
                  marginBottom: 0,
                }}
              >
                <Input placeholder="e.g., Modern home interior" maxLength={150} />
              </Form.Item>
            </Col>

            {/* Tags */}
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="tags"
                label="Tags"
                style={{
                  marginBottom: 0,
                }}
              >
                <Select
                  mode="tags"
                  placeholder="Select or type a tag and press Enter"
                  tokenSeparators={[',']}
                  allowClear
                  maxTagCount="responsive"
                  style={{
                    width: '100%',
                  }}
                  options={[
                    {
                      value: 'Interior Design',
                      label: 'Interior Design',
                    },
                    {
                      value: 'Interior Decor',
                      label: 'Interior Decor',
                    },
                    {
                      value: 'Vastu Consultancy',
                      label: 'Vastu Consultancy',
                    },
                    {
                      value: 'Architectural',
                      label: 'Architectural',
                    },
                    {
                      value: 'Project Planning',
                      label: 'Project Planning',
                    },
                    {
                      value: 'Space Planning',
                      label: 'Space Planning',
                    },
                    {
                      value: 'Home Renovation',
                      label: 'Home Renovation',
                    },
                    {
                      value: 'Modern Design',
                      label: 'Modern Design',
                    },
                    {
                      value: 'Luxury Interiors',
                      label: 'Luxury Interiors',
                    },
                    {
                      value: 'Vastu Tips',
                      label: 'Vastu Tips',
                    },
                    {
                      value: 'Office Design',
                      label: 'Office Design',
                    },
                    {
                      value: 'Residential Design',
                      label: 'Residential Design',
                    },
                    {
                      value: 'Commercial Design',
                      label: 'Commercial Design',
                    },
                    {
                      value: 'Consultancy',
                      label: 'Consultancy',
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Blog Content" style={{ marginBottom: 20 }}>
            <div
              className="blog-editor-wrapper"
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <CKEditor
                editor={ClassicEditor}
                data={details}
                onChange={(_, editor) => {
                  setDetails(editor.getData())
                }}
                config={{
                  toolbar: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
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

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
            style={{ marginBottom: 12 }}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              style={{
                background: '#042954',
                minWidth: 90,
              }}
            >
              {editRecord ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Blog
