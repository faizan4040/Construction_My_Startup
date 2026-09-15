'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { IconButton, Badge, Menu, MenuItem, Typography, Divider } from '@mui/material'
import axios from 'axios'
import Link from 'next/link'
import dayjs from 'dayjs'

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications')
      setNotifications(data.data.notifications)
      setUnreadCount(data.data.unreadCount)
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s — simplest reliable option without adding websockets/SSE
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleOpen = async (e) => {
    setAnchorEl(e.currentTarget)
    if (unreadCount > 0) {
      await axios.post('/api/notifications/mark-read', { ids: 'all' })
      setUnreadCount(0)
    }
  }

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Typography className="px-4 py-2 font-semibold text-sm">Notifications</Typography>
        <Divider />
        {notifications.length === 0 && (
          <MenuItem disabled>No notifications yet</MenuItem>
        )}
        {notifications.map((n) => (
          <MenuItem key={n._id} component={n.link ? Link : 'li'} href={n.link || undefined} onClick={() => setAnchorEl(null)}>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.message}</span>
              <span className="text-[10px] text-gray-400">{dayjs(n.createdAt).fromNow()}</span>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default NotificationBell