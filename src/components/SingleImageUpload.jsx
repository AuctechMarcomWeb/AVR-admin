/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Upload, Progress, Image } from 'antd'
import { PlusOutlined, EyeOutlined, DeleteFilled, LoadingOutlined } from '@ant-design/icons'
import { uploadService } from '../services/upload.service'

/**
 * Reusable single image upload component.
 * Props:
 *   value    {string}   — current image URL
 *   onChange {fn}       — called with new URL after upload, or '' on remove
 */
const SingleImageUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [percent, setPercent] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleUpload = async (file) => {
    setUploading(true)
    setPercent(10)
    const timer = setInterval(() => {
      setPercent((p) => (p < 85 ? p + 12 : p))
    }, 180)
    try {
      const res = await uploadService.uploadImage(file)
      clearInterval(timer)
      setPercent(100)
      onChange(res.data.data.imageUrl)
    } catch {
      clearInterval(timer)
      setPercent(0)
    } finally {
      setTimeout(() => { setUploading(false); setPercent(0) }, 400)
    }
    return false // prevent antd auto-upload
  }

  const handleRemove = (e) => { e.stopPropagation(); onChange('') }

  // ── Uploading state ──────────────────────────────────────────────────────
  if (uploading) {
    return (
      <div style={{
        width: 104, height: 104, border: '1px dashed #d9d9d9', borderRadius: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, background: '#fafafa', padding: '12px 10px',
      }}>
        <LoadingOutlined style={{ fontSize: 22, color: '#1677ff' }} />
        <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>Uploading...</span>
        <Progress percent={percent} showInfo={false} strokeColor="#1677ff" size="small" style={{ width: 72, margin: 0 }} />
      </div>
    )
  }

  // ── Preview with hover overlay ───────────────────────────────────────────
  if (value) {
    return (
      <>
        <style>{`.avr-img-card:hover .avr-overlay { opacity: 1 !important; }`}</style>
        <div
          className="avr-img-card"
          style={{ width: 104, height: 104, borderRadius: 8, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
        >
          <img
            src={value}
            alt="preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            className="avr-overlay"
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 16, opacity: 0, transition: 'opacity 0.2s',
            }}
          >
            <EyeOutlined
              style={{ color: '#fff', fontSize: 20 }}
              onClick={(e) => { e.stopPropagation(); setPreviewOpen(true) }}
            />
            <DeleteFilled
              style={{ color: '#fff', fontSize: 20 }}
              onClick={handleRemove}
            />
          </div>
        </div>
        <Image
          src={value}
          style={{ display: 'none' }}
          preview={{ visible: previewOpen, onVisibleChange: (v) => setPreviewOpen(v) }}
        />
      </>
    )
  }

  // ── Empty upload trigger ─────────────────────────────────────────────────
  return (
    <Upload accept="image/*" showUploadList={false} beforeUpload={handleUpload}>
      <div style={{
        width: 104, height: 104, border: '1px dashed #d9d9d9', borderRadius: 8,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 6, background: '#fafafa', cursor: 'pointer',
      }}>
        <PlusOutlined style={{ fontSize: 18, color: '#555' }} />
        <span style={{ fontSize: 12, color: '#555' }}>Upload</span>
      </div>
    </Upload>
  )
}

export default SingleImageUpload
