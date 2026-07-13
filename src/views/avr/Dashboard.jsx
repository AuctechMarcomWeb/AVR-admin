/* eslint-disable prettier/prettier */
import { Card, Row, Col, Statistic } from 'antd'
import {
  PictureOutlined, FileTextOutlined, AppstoreOutlined,
  MessageOutlined, CalendarOutlined, StarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const stats = [
  { title: 'Home Sliders',      value: '—', icon: <PictureOutlined />,  color: '#1890ff', path: '/home-slider' },
  { title: 'Gallery Items',     value: '—', icon: <AppstoreOutlined />, color: '#52c41a', path: '/gallery' },
  { title: 'Blogs',             value: '—', icon: <FileTextOutlined />, color: '#722ed1', path: '/blogs' },
  { title: 'Portfolio',         value: '—', icon: <AppstoreOutlined />, color: '#fa8c16', path: '/portfolio' },
  { title: 'Testimonials',      value: '—', icon: <StarOutlined />,     color: '#eb2f96', path: '/testimonials' },
  { title: 'Contact Enquiries', value: '—', icon: <MessageOutlined />,  color: '#faad14', path: '/contact' },
  { title: 'Consultations',     value: '—', icon: <CalendarOutlined />, color: '#13c2c2', path: '/book-consultation' },
]

const AVRDashboard = () => {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '8px 0' }}>
      <h4 style={{ marginBottom: 24, color: '#042954', fontWeight: 700 }}>Dashboard</h4>
      <Row gutter={[16, 16]}>
        {stats.map((s, i) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={i}>
            <Card
              onClick={() => navigate(s.path)}
              style={{ borderRadius: 10, borderTop: `4px solid ${s.color}`, cursor: 'pointer' }}
              bodyStyle={{ padding: '20px 24px' }}
            >
              <Statistic
                title={<span style={{ color: '#666', fontSize: 13 }}>{s.title}</span>}
                value={s.value}
                prefix={<span style={{ color: s.color, fontSize: 22, marginRight: 8 }}>{s.icon}</span>}
                valueStyle={{ color: s.color, fontWeight: 700, fontSize: 28 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default AVRDashboard
