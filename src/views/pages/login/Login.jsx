/* eslint-disable prettier/prettier */
import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button } from 'antd'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import logo from '../../../assets/seci-logo.png'
import { authService } from '../../../services/auth.service'
import { AppContext } from '../../../Context/AppContext'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(AppContext)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const loginRes = await authService.login({ phone: values.phone, password: values.password })
      const { authToken, role } = loginRes.data.data

      // Save token in cookie
      Cookies.set('AVR', authToken, { expires: 30 })

      // Save minimal user info so ProtectedRoute passes immediately
      const minimalUser = { role, phone: values.phone }
      setUser(minimalUser)

      toast.success('Login successful')
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #042954 0%, #0a4a8a 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          padding: '28px 32px',
          width: '100%',
          maxWidth: 420,
          margin: '16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src={logo}
            alt="SECI Logo"
            style={{ width: 100, height: 'auto', marginBottom: 12, display: 'block', margin: '0 auto 12px' }}
          />
          <h2 style={{ color: '#042954', fontWeight: 800, margin: 0, fontSize: 22 }}>Login</h2>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="middle">
          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: 600 }}>Phone Number</span>}
            rules={[{ required: true, message: 'Please enter phone number' }]}
            style={{ marginBottom: 6 }}
          >
            <Input placeholder="Enter phone number" autoComplete="username" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Password</span>}
            rules={[{ required: true, message: 'Please enter password' }]}
            style={{ marginBottom: 10 }}
          >
            <Input.Password
              placeholder="Enter password"
              style={{ height: 40 }}
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: '#042954',
                borderColor: '#042954',
                fontWeight: 600,
                height: 44,
                borderRadius: 8,
                fontSize: 15,
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login
