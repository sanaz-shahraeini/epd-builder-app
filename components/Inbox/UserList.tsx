'use client';
import React from 'react';
import { Box, Typography, Avatar, List, ListItem } from '@mui/material';
import { styles } from './styles';
import { User } from './mockData';

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
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
  );
};
