'use client';
import React from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';
import { styles } from './styles';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = 'Type your message...'
}) => {
  return (
    <Box sx={styles.messageInput}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <IconButton size="small">
          <AttachFile />
        </IconButton>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton 
          onClick={onSend}
          disabled={!value.trim()}
          color="primary"
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};
