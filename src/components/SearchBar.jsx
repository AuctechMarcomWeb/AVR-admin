/* eslint-disable prettier/prettier */
import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
        Search
      </label>
      <Input
        prefix={<SearchOutlined style={{ color: '#aaa' }} />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        style={{ maxWidth: 320, borderRadius: 8 }}
      />
    </div>
  )
}

export default SearchBar
