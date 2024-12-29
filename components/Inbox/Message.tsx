'use client';
import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';

interface MessageProps {
  sender: {
    name: string;
    avatar: string;
  };
  subject: string;
  isNew?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export const Message: React.FC<MessageProps> = ({
  sender,
  subject,
  isNew,
  isSelected,
  onClick,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        padding: 2,
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f5f5f5' : 'transparent',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
        borderBottom: '1px solid #eee',
      }}
    >
      <Avatar src={sender.avatar} />
      <Box sx={{ marginLeft: 2, flex: 1 }}>
        <Typography variant="subtitle1">{sender.name}</Typography>
        <Typography variant="body2" color="textSecondary" noWrap>
          {subject}
        </Typography>
      </Box>
      {isNew && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            marginLeft: 'auto',
          }}
        />
      )}
    </Box>
  );
};
