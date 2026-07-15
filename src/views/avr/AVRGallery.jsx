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
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import toast from 'react-hot-toast'
import { useAVRGallery } from '../../Hooks/useAVRGallery'
import MultipleImageUpload from '../../components/MultipleImageUpload'

const TABLE_HEADER_BG = '#042954'

const normalizeImageUrls = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim() !== '')
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return [value.trim()]
  }

  return []
}

const AVRGallery = () => {
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
    uploadImage,
  } = useAVRGallery()

  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  // Backend ke url array ko store karega
  const [imageUrls, setImageUrls] = useState([])
  const [form] = Form.useForm()

  const closeModal = () => {
    if (submitting) return
    setModalOpen(false)
    setEditRecord(null)
    setImageUrls([])
    form.resetFields()
  }

  const openAdd = () => {
    setEditRecord(null)
    setImageUrls([])

    form.resetFields()

    form.setFieldsValue({
      title: '',
      isActive: true,
    })

    setModalOpen(true)
  }

  // const openEdit = (record) => {
  //   setEditRecord(record)

  //   // Purana string URL bhi support karega
  //   setImageUrls(normalizeImageUrls(record?.url))

  //   form.setFieldsValue({
  //     title: record?.title || '',
  //     isActive: record?.isActive !== undefined ? record.isActive : true,
  //   })

  //   setModalOpen(true)
  // }

  const openEdit = (record) => {
    setEditRecord(record)

    const existingImages = Array.isArray(record?.url) ? record.url : record?.url ? [record.url] : []

    setImageUrls(existingImages)

    form.setFieldsValue({
      title: record?.title || '',
      isActive: record?.isActive !== undefined ? record.isActive : true,
    })

    setModalOpen(true)
  }

  // const handleSubmit = async () => {
  //   try {
  //     const values = await form.validateFields()

  //     const finalUrls = normalizeImageUrls(imageUrls)

  //     if (finalUrls.length === 0) {
  //       toast.error('Please upload at least one gallery image')
  //       return
  //     }

  //     setSubmitting(true)

  //     const payload = {
  //       title: values.title?.trim(),
  //       url: finalUrls,
  //       isActive: values.isActive,
  //     }

  //     if (editRecord) {
  //       await updateItem(editRecord._id, payload)
  //     } else {
  //       await addItem(payload)
  //     }

  //     setModalOpen(false)
  //     setEditRecord(null)
  //     setImageUrls([])
  //     form.resetFields()
  //   } catch (error) {
  //     // Ant Design validation error ko ignore karega
  //     if (error?.errorFields) return
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const finalImageUrls = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : []

      if (finalImageUrls.length === 0) {
        toast.error('Please upload at least one image')
        return
      }

      setSubmitting(true)

      const payload = {
        title: values.title?.trim(),
        url: finalImageUrls,
        isActive: values.isActive,
      }

      if (editRecord) {
        await updateItem(editRecord._id, payload)
      } else {
        await addItem(payload)
      }

      setModalOpen(false)
      setEditRecord(null)
      setImageUrls([])
      form.resetFields()
    } catch (error) {
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
      title: 'Images',
      dataIndex: 'url',
      width: 235,
      render: (url) => {
        const images = normalizeImageUrls(url)

        if (images.length === 0) {
          return '—'
        }

        const visibleImages = images.slice(0, 3)
        const remainingCount = images.length - visibleImages.length

        return (
          <Image.PreviewGroup>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {visibleImages.map((imageUrl, index) => (
                <Image
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  width={58}
                  height={46}
                  fallback="/images/image-placeholder.png"
                  style={{
                    objectFit: 'cover',
                    borderRadius: 5,
                    border: '1px solid #e5e7eb',
                  }}
                />
              ))}

              {remainingCount > 0 && (
                <Tag
                  icon={<PictureOutlined />}
                  color="blue"
                  style={{
                    marginInlineEnd: 0,
                    cursor: 'default',
                  }}
                >
                  +{remainingCount}
                </Tag>
              )}
            </div>
          </Image.PreviewGroup>
        )
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
      render: (title) => title || '—',
    },
    {
      title: 'Total Images',
      dataIndex: 'url',
      width: 120,
      align: 'center',
      render: (url) => {
        const totalImages = normalizeImageUrls(url).length

        return (
          <Tag icon={<PictureOutlined />} color="geekblue">
            {totalImages}
          </Tag>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (value) => <Tag color={value ? 'green' : 'red'}>{value ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      width: 105,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit gallery">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>

          <Popconfirm
            title="Delete this gallery item?"
            description="All images inside this gallery item will be deleted."
            onConfirm={() => deleteItem(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete gallery">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
        <div>
          <h4
            style={{
              margin: 0,
              color: '#042954',
              fontWeight: 700,
            }}
          >
            Gallery
          </h4>

          <div
            style={{
              color: '#777',
              fontSize: 13,
              marginTop: 3,
            }}
          >
            Create a gallery title and add multiple images inside it.
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAdd}
          style={{
            background: '#042954',
          }}
        >
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
            placeholder="Search by gallery title..."
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
            Status
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
              onChange={(event) => handleActiveToggle(event.target.checked)}
            >
              Active only
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
          scroll={{ x: 850 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: false,
            responsive: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} galleries`,
          }}
          size="middle"
          style={{
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </ConfigProvider>

      <Modal
        title={editRecord ? 'Edit Gallery' : 'Add Gallery'}
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width="min(650px, 95vw)"
        destroyOnHidden
        maskClosable={!submitting}
        closable={!submitting}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }} requiredMark={false}>
          <Form.Item
            name="title"
            label={<span>Gallery Title</span>}
            // rules={[
            //   {
            //     required: true,
            //     whitespace: true,
            //     message: 'Please enter gallery title',
            //   },
            //   {
            //     min: 2,
            //     message: 'Title must contain at least 2 characters',
            //   },
            // ]}
            style={{ marginBottom: 14 }}
          >
            <Input
              placeholder="Enter Title "
              // maxLength={150}
              // showCount
              disabled={submitting}
            />
          </Form.Item>

          <Form.Item
            label={
              <span>
                Gallery Images <span style={{ color: 'red' }}>*</span>
              </span>
            }
            style={{ marginBottom: 14 }}
          >
            <MultipleImageUpload
              value={imageUrls}
              onChange={setImageUrls}
              uploadImage={uploadImage}
              maxCount={10}
              disabled={submitting}
            />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
            style={{ marginBottom: 12 }}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" disabled={submitting} />
          </Form.Item>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              borderTop: '1px solid #f0f0f0',
              paddingTop: 14,
              marginTop: 8,
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
                minWidth: 100,
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

export default AVRGallery
