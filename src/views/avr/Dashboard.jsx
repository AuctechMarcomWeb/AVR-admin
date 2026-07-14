/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from 'react'
import { Card, Row, Col, Table, Tag, Badge, ConfigProvider, Skeleton, Tooltip } from 'antd'
import {
  PictureOutlined, FileTextOutlined, AppstoreOutlined,
  MessageOutlined, CalendarOutlined, StarOutlined,
  MailOutlined, PhoneOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useDashboard } from '../../Hooks/useDashboard'

const BRAND = '#042954'
const TABLE_HEADER_BG = '#042954'

const STATUS_COLORS = {
  Pending: 'orange',
  Confirmed: 'blue',
  Completed: 'green',
  Cancelled: 'red',
}

/* ─── Animated count-up + ripple ─── */
const AnimatedStat = ({ value, color }) => {
  const [display, setDisplay] = useState(0)
  const [ripple, setRipple] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0
    if (target === 0) { setDisplay(0); return }

    const duration = 900        // ms
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
        setRipple(true)
        setTimeout(() => setRipple(false), 600)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        style={{
          fontSize: 32,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: '-1px',
        }}
      >
        {display}
      </span>
      {ripple && (
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: color,
            opacity: 0,
            animation: 'ripplePop 0.6s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}
    </span>
  )
}

/* ─── Stat card config ─── */
const STAT_CARDS = [
  {
    title: 'Home Sliders',
    icon: <PictureOutlined />,
    color: '#1890ff',
    path: '/home-slider',
    value: (c) => c?.sliders?.total ?? 0,
    sub: (c) => `Active: ${c?.sliders?.active ?? 0}  ·  Inactive: ${c?.sliders?.inactive ?? 0}`,
  },
  {
    title: 'Gallery Items',
    icon: <AppstoreOutlined />,
    color: '#52c41a',
    path: '/gallery',
    value: (c) => c?.gallery?.total ?? 0,
    sub: (c) => `Active: ${c?.gallery?.active ?? 0}`,
  },
  {
    title: 'Blogs',
    icon: <FileTextOutlined />,
    color: '#722ed1',
    path: '/blogs',
    value: (c) => c?.blogs?.total ?? 0,
    sub: (c) => `Active: ${c?.blogs?.active ?? 0}  ·  Inactive: ${c?.blogs?.inactive ?? 0}`,
  },
  {
    title: 'Portfolio',
    icon: <AppstoreOutlined />,
    color: '#fa8c16',
    path: '/portfolio',
    value: (c) => c?.portfolios?.total ?? 0,
    sub: (c) => `Active: ${c?.portfolios?.active ?? 0}  ·  Inactive: ${c?.portfolios?.inactive ?? 0}`,
  },
  // {
  //   title: 'Testimonials',
  //   icon: <StarOutlined />,
  //   color: '#eb2f96',
  //   path: '/testimonials',
  //   value: () => 0,
  //   sub: () => '',
  // },
  {
    title: 'Contact Enquiries',
    icon: <MessageOutlined />,
    color: '#faad14',
    path: '/contact',
    value: (c) => c?.contacts?.total ?? 0,
    sub: (c) => (
      <span>
        <Badge status="warning" />
        {` Unread: ${c?.contacts?.unread ?? 0}`}
      </span>
    ),
  },
  {
    title: 'Consultations',
    icon: <CalendarOutlined />,
    color: '#13c2c2',
    path: '/book-consultation',
    value: (c) => c?.consultations?.total ?? 0,
    sub: (c) => (
      <span>
        <Badge status="warning" />
        {` Unread: ${c?.consultations?.unread ?? 0}`}
      </span>
    ),
  },
]

/* ─── Table columns ─── */
const consultationColumns = [
  { title: '#', width: 40, render: (_, __, i) => i + 1 },
  {
    title: 'Contact',
    width: 220,
    render: (_, r) => (
      <div style={{ lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: '#042954', fontSize: 13 }}>{r.name}</div>
        <div style={{ fontSize: 12, color: '#555' }}>
          <MailOutlined style={{ marginRight: 4, color: '#888' }} />
          {r.email}
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          <PhoneOutlined style={{ marginRight: 4, color: '#888' }} />
          {r.phone}
        </div>
      </div>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'date',
    width: 110,
    render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '—'),
  },
  {
    title: 'Slot',
    dataIndex: 'slot',
    ellipsis: { showTitle: false },
    render: (v) => <Tooltip title={v}>{v}</Tooltip>,
  },
  {
    title: 'Remarks',
    dataIndex: 'remarks',
    ellipsis: { showTitle: false },
    render: (v) => v ? <Tooltip title={v}>{v}</Tooltip> : '—',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 95,
    render: (v) => <Tag color={STATUS_COLORS[v] || 'default'}>{v || 'Pending'}</Tag>,
  },
]

const contactColumns = [
  { title: '#', width: 40, render: (_, __, i) => i + 1 },
  {
    title: 'Contact',
    render: (_, r) => (
      <div style={{ lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: '#222', fontSize: 13 }}>{r.name}</div>
        <Tooltip title={r.email}>
          <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
            <MailOutlined style={{ color: '#888', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</span>
          </div>
        </Tooltip>
        <div style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
          <PhoneOutlined style={{ color: '#888', flexShrink: 0 }} />
          {r.phone}
        </div>
      </div>
    ),
  },
  // {
  //   title: 'Subject',
  //   dataIndex: 'subject',
  //   ellipsis: { showTitle: false },
  //   render: (v) => v ? <Tooltip title={v}>{v}</Tooltip> : '—',
  // },
  {
    title: 'Message',
    dataIndex: 'message',
    ellipsis: { showTitle: false },
    render: (v) => v ? <Tooltip title={v}>{v}</Tooltip> : '—',
  },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    width: 110,
    render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '—'),
  },
]

/* ─── Component ─── */
const AVRDashboard = () => {
  const navigate = useNavigate()
  const { data, loading } = useDashboard()
  const counts = data?.counts ?? null
  const recent = data?.recent ?? null

  return (
    <>
      {/* Ripple keyframe injected once */}
      <style>{`
        @keyframes ripplePop {
          0%   { opacity: 0.35; transform: translate(-50%, -50%) scale(0.2); }
          100% { opacity: 0;    transform: translate(-50%, -50%) scale(2.2); }
        }
      `}</style>

      <div style={{ padding: '8px 0' }}>
        <h4 style={{ marginBottom: 24, color: BRAND, fontWeight: 700 }}>Dashboard</h4>

        {/* ── Stat Cards: 1 col mobile → 2 col tablet → 3 col desktop ── */}
        <Row gutter={[16, 16]}>
          {STAT_CARDS.map((s, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card
                onClick={() => navigate(s.path)}
                style={{
                  borderRadius: 12,
                  borderTop: `4px solid ${s.color}`,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'box-shadow 0.2s',
                }}
                styles={{ body: { padding: '20px 24px' } }}
                hoverable
              >
                {loading ? (
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#666', fontSize: 13, fontWeight: 500 }}>{s.title}</span>
                      <span
                        style={{
                          color: s.color,
                          fontSize: 24,
                          background: `${s.color}18`,
                          borderRadius: 8,
                          padding: '4px 8px',
                          lineHeight: 1,
                        }}
                      >
                        {s.icon}
                      </span>
                    </div>

                    <AnimatedStat value={counts ? s.value(counts) : 0} color={s.color} />

                    {counts && (
                      <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
                        {s.sub(counts)}
                      </div>
                    )}
                  </>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Recent Sections ── */}
        <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
          {/* Unread Consultations */}
          <Col xs={24} xl={14}>
            <Card
              title={
                <span style={{ color: BRAND, fontWeight: 700, fontSize: 14 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Recent Consultations
                  {counts?.consultations?.unread > 0 && (
                    <Tag color="orange" style={{ marginLeft: 10, fontSize: 11 }}>
                      {counts.consultations.unread} unread
                    </Tag>
                  )}
                </span>
              }
              extra={
                <span
                  style={{ color: BRAND, cursor: 'pointer', fontSize: 13 }}
                  onClick={() => navigate('/book-consultation')}
                >
                  View All →
                </span>
              }
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: '0 0 8px' } }}
            >
              <ConfigProvider
                theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff' } } }}
              >
                <Table
                  dataSource={recent?.unreadConsultations ?? []}
                  columns={consultationColumns}
                  rowKey="_id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  scroll={{ x: 620 }}
                  locale={{ emptyText: 'No unread consultations' }}
                />
              </ConfigProvider>
            </Card>
          </Col>

          {/* Unread Contacts */}
          <Col xs={24} xl={10}>
            <Card
              title={
                <span style={{ color: BRAND, fontWeight: 700, fontSize: 14 }}>
                  <MessageOutlined style={{ marginRight: 8 }} />
                  Recent Contacts
                  {counts?.contacts?.unread > 0 && (
                    <Tag color="orange" style={{ marginLeft: 10, fontSize: 11 }}>
                      {counts.contacts.unread} unread
                    </Tag>
                  )}
                </span>
              }
              extra={
                <span
                  style={{ color: BRAND, cursor: 'pointer', fontSize: 13 }}
                  onClick={() => navigate('/contact')}
                >
                  View All →
                </span>
              }
              style={{ borderRadius: 12 }}
              styles={{ body: { padding: '0 0 8px' } }}
            >
              <ConfigProvider
                theme={{ components: { Table: { headerBg: TABLE_HEADER_BG, headerColor: '#fff' } } }}
              >
                <Table
                  dataSource={recent?.unreadContacts ?? []}
                  columns={contactColumns}
                  rowKey="_id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  scroll={{ x: 520 }}
                  locale={{ emptyText: 'No unread contacts' }}
                />
              </ConfigProvider>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default AVRDashboard
