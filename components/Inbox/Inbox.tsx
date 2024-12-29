'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, List, ListItem } from '@mui/material';
import { Reply, Forward, AttachFile, Send } from '@mui/icons-material';
import { Message } from './Message';
import { styles } from './styles';

interface MessageType {
  id: string;
  sender: {
    name: string;
    avatar: string;
    position: string;
  };
  subject: string;
  content: string;
  timestamp: string;
  isNew?: boolean;
  attachments?: Array<{
    name: string;
    type: string;
  }>;
}

// Sample data - replace with your API calls
const mockMessages: MessageType[] = [
  {
    id: '1',
    sender: {
      name: 'User name 05',
      avatar: '/avatars/user1.jpg',
      position: 'Admin'
    },
    subject: 'Product Review Request',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '2024-01-20T10:00:00Z',
    isNew: true,
    attachments: [{ name: 'Product Name 01', type: 'EPD LCA' }]
  },
  {
    id: '2',
    sender: {
      name: 'User name 02',
      avatar: '/avatars/user2.jpg',
      position: 'Manager'
    },
    subject: 'EPD Documentation Update',
    content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    timestamp: '2024-01-19T15:30:00Z',
    isNew: false
  }
];

const mockUsers = [
  { id: '1', name: 'User name 01', position: 'Position', avatar: '/avatars/user1.jpg', online: true },
  { id: '2', name: 'User name 02', position: 'Position', avatar: '/avatars/user2.jpg', online: true },
  { id: '3', name: 'User name 03', position: 'Position', avatar: '/avatars/user3.jpg', online: false },
  { id: '4', name: 'User name 04', position: 'Position', avatar: '/avatars/user4.jpg', online: true },
  { id: '5', name: 'User name 05', position: 'Position', avatar: '/avatars/user5.jpg', online: true }
];

export const Inbox: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [replyText, setReplyText] = useState('');
  const [users, setUsers] = useState(mockUsers);

  const handleMessageSelect = (message: MessageType) => {
    setSelectedMessage(message);
    // Mark message as read
    setMessages(messages.map(msg => 
      msg.id === message.id ? { ...msg, isNew: false } : msg
    ));
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    // Add your reply logic here
    console.log('Replying to:', selectedMessage.id, 'with:', replyText);
    setReplyText('');
  };

  const handleForward = () => {
    if (!selectedMessage) return;
    // Add your forward logic here
    console.log('Forwarding message:', selectedMessage.id);
  };

  return (
    <Box sx={styles.container}>
      {/* Message List */}
      <Box sx={styles.sidebar}>
        {messages.map((message) => (
          <Message
            key={message.id}
            sender={message.sender}
            subject={message.subject}
            isNew={message.isNew}
            isSelected={selectedMessage?.id === message.id}
            onClick={() => handleMessageSelect(message)}
          />
        ))}
      </Box>

      {/* Message Detail */}
      <Box sx={styles.mainContent}>
        {selectedMessage ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={selectedMessage.sender.avatar} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="h6">{selectedMessage.sender.name}</Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" sx={{ mb: 2 }}>
              {selectedMessage.subject}
            </Typography>

            <Typography>{selectedMessage.content}</Typography>

            {selectedMessage.attachments && (
              <Box sx={{ mt: 2 }}>
                {selectedMessage.attachments.map((attachment, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AttachFile />
                    <Typography sx={{ ml: 1 }}>{attachment.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
              <IconButton onClick={handleReply}>
                <Reply />
              </IconButton>
              <IconButton onClick={handleForward}>
                <Forward />
              </IconButton>
            </Box>

            <Box sx={styles.messageInput}>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <IconButton 
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Typography variant="subtitle1" color="textSecondary" sx={{ p: 3 }}>
            Select a message to view its contents
          </Typography>
        )}
      </Box>

      {/* Users List */}
      <Box sx={styles.usersList}>
        <Typography variant="h6" sx={{ mb: 2 }}>Users</Typography>
        <List>
          {users.map((user) => (
            <ListItem key={user.id} sx={styles.userItem}>
              <Avatar src={user.avatar} />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2">{user.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.position}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: user.online ? '#4caf50' : '#bdbdbd',
                  marginLeft: 'auto',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};
