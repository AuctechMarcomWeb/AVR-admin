/* eslint-disable prettier/prettier */
import { useContext, useState } from 'react'
import { Dropdown, Modal, Form, Input, Button, Descriptions, Tag, Spin } from 'antd'
import { LogoutOutlined, DownOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import maleAvatar from '../../assets/male.png'
import { deleteCookie } from '../../Hooks/cookie'
import { useNavigate } from 'react-router-dom'
import { useRoles } from '../../Context/AuthContext'
import { AppContext } from '../../Context/AppContext'
import { authService } from '../../services/auth.service'
import toast from 'react-hot-toast'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { user } = useContext(AppContext)
  const { role } = useRoles()

  const name = user?.name || user?.user?.name || 'Admin'
  const displayRole = role || user?.role || 'Admin'

  // ── Profile modal state ───────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Change password modal state ───────────────────────────────────────────
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const [pwdForm] = Form.useForm()

  const openProfile = async () => {
    setProfileOpen(true)
    setProfileLoading(true)
    try {
      const res = await authService.getProfile()
      setProfileData(res.data.data.user)
    } catch {
      toast.error('Failed to fetch profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async (vals) => {
    setPwdSubmitting(true)
    try {
      await authService.updatePassword({
        userId: vals.userId,
        oldPassword: vals.oldPassword,
        newPassword: vals.newPassword,
      })
      toast.success('Password updated successfully')
      setPwdOpen(false)
      pwdForm.resetFields()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    } finally {
      setPwdSubmitting(false)
    }
  }

  const logOut = () => {
    deleteCookie('AVR')
    localStorage.removeItem('AVR')
    navigate('/login')
    window.location.reload()
  }

  const items = [
    {
      key: 'info',
      label: (
        <div style={{ padding: '4px 0', minWidth: '160px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#042954' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>{displayRole}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: (
        <span style={{ fontWeight: 500 }}>
          <UserOutlined className="me-2" />
          Profile
        </span>
      ),
      onClick: openProfile,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <span style={{ color: '#ff4d4f', fontWeight: 500 }}>
          <LogoutOutlined className="me-2" />
          Log Out
        </span>
      ),
      onClick: logOut,
    },
  ]

  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <div
          className="d-flex align-items-center gap-2"
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <div
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0,
            }}
          >
            <img src={maleAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="d-none d-sm-flex flex-column" style={{ lineHeight: '1.3' }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{name}</span>
          </div>
          <DownOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }} />
        </div>
      </Dropdown>

      {/* ── Profile Detail Modal ─────────────────────────────────────────── */}
      <Modal
        title="Profile"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={
          <Button
            icon={<LockOutlined />}
            style={{ background: '#042954', color: '#fff', border: 'none' }}
            onClick={() => { setProfileOpen(false); setPwdOpen(true) }}
          >
            Update Password
          </Button>
        }
        width="min(480px, 95vw)"
        destroyOnHidden
      >
        <Spin spinning={profileLoading}>
          {profileData && (
            <Descriptions column={1} bordered size="small" style={{ marginTop: 8 }}>
              <Descriptions.Item label="Name">{profileData.name || '—'}</Descriptions.Item>
              <Descriptions.Item label="User ID">{profileData.userId || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{profileData.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{profileData.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Gender">{profileData.gender || '—'}</Descriptions.Item>
              <Descriptions.Item label="Address">{profileData.address || '—'}</Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color="#042954">{profileData.role || '—'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={profileData.isBlock ? 'red' : 'green'}>
                  {profileData.isBlock ? 'Blocked' : 'Active'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Modal>

      {/* ── Update Password Modal ────────────────────────────────────────── */}
      <Modal
        title="Update Password"
        open={pwdOpen}
        onCancel={() => { setPwdOpen(false); pwdForm.resetFields() }}
        onOk={() => pwdForm.submit()}
        okText="Update"
        okButtonProps={{ style: { background: '#042954' }, loading: pwdSubmitting }}
        width="min(400px, 95vw)"
        destroyOnHidden
        afterOpenChange={(open) => {
          if (open) pwdForm.setFieldsValue({ userId: profileData?.userId || user?.userId || '' })
        }}
      >
        <Form
          form={pwdForm}
          layout="vertical"
          style={{ marginTop: 8 }}
          requiredMark={false}
          onFinish={handleUpdatePassword}
        >
          <Form.Item name="userId" label="User ID">
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="oldPassword"
            label={<span>Old Password <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter old password' }]}
          >
            <Input.Password placeholder="Enter old password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={<span>New Password <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Enter new password' }, { min: 6, message: 'Minimum 6 characters' }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AppHeaderDropdown
