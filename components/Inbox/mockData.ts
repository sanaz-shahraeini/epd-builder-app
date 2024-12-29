export interface User {
  id: string;
  name: string;
  position: string;
  avatar: string;
  online?: boolean;
}

export interface Message {
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

export const mockMessages: Message[] = [
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
  },
  {
    id: '3',
    sender: {
      name: 'User name 03',
      avatar: '/avatars/user3.jpg',
      position: 'Reviewer'
    },
    subject: 'New EPD Submission',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    timestamp: '2024-01-18T09:15:00Z',
    isNew: true
  }
];

export const mockUsers: User[] = [
  { id: '1', name: 'User name 01', position: 'Position', avatar: '/avatars/user1.jpg', online: true },
  { id: '2', name: 'User name 02', position: 'Position', avatar: '/avatars/user2.jpg', online: true },
  { id: '3', name: 'User name 03', position: 'Position', avatar: '/avatars/user3.jpg', online: false },
  { id: '4', name: 'User name 04', position: 'Position', avatar: '/avatars/user4.jpg', online: true },
  { id: '5', name: 'User name 05', position: 'Position', avatar: '/avatars/user5.jpg', online: true },
  { id: '6', name: 'User name 06', position: 'Position', avatar: '/avatars/user6.jpg', online: false },
  { id: '7', name: 'User name 07', position: 'Position', avatar: '/avatars/user7.jpg', online: true },
  { id: '8', name: 'User name 08', position: 'Position', avatar: '/avatars/user8.jpg', online: true }
];
