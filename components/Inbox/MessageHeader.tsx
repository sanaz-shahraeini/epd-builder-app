'use client';
import React from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { Reply, Forward } from '@mui/icons-material';
import { Message } from './mockData';

interface MessageHeaderProps {
  message: Message;
  onReply: () => void;
  onForward: () => void;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({
  message,
  onReply,
  onForward,
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar src={message.sender.avatar} />
        <Box sx={{ ml: 2, flex: 1 }}>
          <Typography variant="h6">{message.sender.name}</Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {new Date(message.timestamp).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={onReply} size="small">
            <Reply />
          </IconButton>
          <IconButton onClick={onForward} size="small">
            <Forward />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {message.subject}
      </Typography>
    </>
  );
};
