/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react'
import { Upload, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'

const normalizeUrls = (value) => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

const getFileNameFromUrl = (url, index) => {
  try {
    const cleanUrl = url.split('?')[0]
    return cleanUrl.split('/').pop() || `gallery-image-${index + 1}`
  } catch {
    return `gallery-image-${index + 1}`
  }
}

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

const MultipleImageUpload = ({
  value = [],
  onChange,
  uploadImage,
  maxCount = 10,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  /*
   * Edit ke time backend se aane wale URL array ko
   * Ant Design fileList format mein convert karega.
   */
  useEffect(() => {
    const urls = normalizeUrls(value)

    setFileList((previousFiles) => {
      // Jo files abhi upload ho rahi hain unhe remove nahi karna
      const uploadingFiles = previousFiles.filter((file) => file.status === 'uploading')

      const uploadedFiles = urls.map((url, index) => {
        const previousFile = previousFiles.find(
          (file) => file.url === url || file.response?.imageUrl === url,
        )

        if (previousFile) {
          return {
            ...previousFile,
            status: 'done',
            url,
          }
        }

        return {
          uid: `existing-${index}-${url}`,
          name: getFileNameFromUrl(url, index),
          status: 'done',
          url,
          response: {
            imageUrl: url,
          },
        }
      })

      return [...uploadedFiles, ...uploadingFiles].slice(0, maxCount)
    })
  }, [value, maxCount])

  const beforeUpload = (file) => {
    const isImage = file.type?.startsWith('image/')

    if (!isImage) {
      toast.error('Only image files are allowed')
      return Upload.LIST_IGNORE
    }

    const isLessThan5MB = file.size / 1024 / 1024 < 5

    if (!isLessThan5MB) {
      toast.error('Image size must be less than 5MB')
      return Upload.LIST_IGNORE
    }

    if (fileList.length >= maxCount) {
      toast.error(`Maximum ${maxCount} images are allowed`)
      return Upload.LIST_IGNORE
    }

    return true
  }

  const customUploadRequest = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      // Upload start UI
      setFileList((previousFiles) => {
        const exists = previousFiles.some((item) => item.uid === file.uid)

        if (exists) {
          return previousFiles.map((item) =>
            item.uid === file.uid
              ? {
                  ...item,
                  status: 'uploading',
                  percent: 20,
                }
              : item,
          )
        }

        return [
          ...previousFiles,
          {
            uid: file.uid,
            name: file.name,
            status: 'uploading',
            percent: 20,
            originFileObj: file,
          },
        ].slice(0, maxCount)
      })

      onProgress?.({ percent: 30 })

      const uploadedUrl = await uploadImage(file)

      if (!uploadedUrl) {
        throw new Error('Image URL not received')
      }

      onProgress?.({ percent: 100 })

      setFileList((previousFiles) =>
        previousFiles.map((item) =>
          item.uid === file.uid
            ? {
                ...item,
                status: 'done',
                percent: 100,
                url: uploadedUrl,
                response: {
                  imageUrl: uploadedUrl,
                },
              }
            : item,
        ),
      )

      // Backend URL array update
      onChange((previousValue) => {
        const previousUrls = normalizeUrls(previousValue)

        if (previousUrls.includes(uploadedUrl)) {
          return previousUrls
        }

        return [...previousUrls, uploadedUrl].slice(0, maxCount)
      })

      onSuccess?.({
        imageUrl: uploadedUrl,
      })

      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      setFileList((previousFiles) =>
        previousFiles.map((item) =>
          item.uid === file.uid
            ? {
                ...item,
                status: 'error',
              }
            : item,
        ),
      )

      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload image')

      onError?.(error)
    }
  }

  const handleRemove = (file) => {
    const imageUrl = file.url || file.response?.imageUrl || file.response?.data?.imageUrl

    setFileList((previousFiles) => previousFiles.filter((item) => item.uid !== file.uid))

    if (imageUrl) {
      onChange((previousValue) => normalizeUrls(previousValue).filter((url) => url !== imageUrl))
    }

    return true
  }

  const handlePreview = async (file) => {
    let imageSource =
      file.url || file.preview || file.response?.imageUrl || file.response?.data?.imageUrl

    if (!imageSource && file.originFileObj) {
      imageSource = await getBase64(file.originFileObj)
    }

    setPreviewImage(imageSource || '')
    setPreviewTitle(
      file.name || imageSource?.substring(imageSource.lastIndexOf('/') + 1) || 'Gallery Image',
    )

    setPreviewOpen(true)
  }

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, maxCount))
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  return (
    <>
      <Upload
        accept="image/*"
        listType="picture-card"
        multiple
        fileList={fileList}
        maxCount={maxCount}
        disabled={disabled}
        beforeUpload={beforeUpload}
        customRequest={customUploadRequest}
        onChange={handleUploadChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
      >
        {fileList.length >= maxCount || disabled ? null : uploadButton}
      </Upload>

      <div
        style={{
          color: '#8c8c8c',
          fontSize: 12,
          marginTop: 4,
        }}
      >
        Upload up to {maxCount} images. Maximum image size: 5MB.
      </div>

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img
          alt={previewTitle}
          src={previewImage}
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
        />
      </Modal>
    </>
  )
}

export default MultipleImageUpload
