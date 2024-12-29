export const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)', // Adjust based on your header height
    backgroundColor: '#f9f9f9',
  },
  sidebar: {
    width: 300,
    borderRight: '1px solid #eee',
    backgroundColor: '#fff',
    overflowY: 'auto',
  },
  mainContent: {
    flex: 1,
    padding: 3,
    backgroundColor: '#fff',
    margin: 2,
    borderRadius: 1,
    overflowY: 'auto',
  },
  usersList: {
    width: 250,
    borderLeft: '1px solid #eee',
    backgroundColor: '#fff',
    padding: 2,
    overflowY: 'auto',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    padding: 1,
    marginBottom: 1,
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderRadius: 1,
    },
  },
  messageInput: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: '#fff',
    padding: 2,
    borderTop: '1px solid #eee',
  },
};
