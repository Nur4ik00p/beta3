import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography,
  Box,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  TextField
} from '@mui/material';
import axios from '../../axios';
import VerifiedIcon from '@mui/icons-material/Verified';
import StoreIcon from '@mui/icons-material/Store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/admin/users');
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка загрузки пользователей');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAccountTypeChange = async (userId, newType) => {
    setUpdating(userId);
    try {
      const response = await axios.patch(
        `/admin/users/${userId}/account-type`,
        { accountType: newType }
      );

      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? response.data : user
        )
      );
      setSuccess('Тип аккаунта успешно обновлен');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = Array.isArray(users) 
    ? users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getAccountTypeBadge = (type) => {
    switch (type) {
      case 'verified_user':
        return <VerifiedIcon color="primary" fontSize="small" />;
      case 'shop':
        return <StoreIcon color="secondary" fontSize="small" />;
      case 'admin':
        return <AdminPanelSettingsIcon color="success" fontSize="small" />;
      default:
        return null;
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom style={{ marginBottom: '30px' }}>
        Панель администратора
      </Typography>

      <Box mb={3} display="flex" justifyContent="space-between">
        <TextField
          label="Поиск пользователей"
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '300px' }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Текущий статус</TableCell>
              <TableCell>Изменить тип</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.fullName}
                    {getAccountTypeBadge(user.accountType)}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.accountType === 'user' && 'Обычный'}
                    {user.accountType === 'verified_user' && 'Верифицированный'}
                    {user.accountType === 'shop' && 'Магазин'}
                    {user.accountType === 'admin' && 'Администратор'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.accountType || 'user'}
                      onChange={(e) => handleAccountTypeChange(user._id, e.target.value)}
                      disabled={updating === user._id}
                      size="small"
                    >
                      <MenuItem value="user">Обычный</MenuItem>
                      <MenuItem value="verified_user">Верифицированный</MenuItem>
                      <MenuItem value="shop">Магазин</MenuItem>
                      <MenuItem value="admin">Администратор</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {updating === user._id ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Button
                        variant="outlined"
                        color={user.accountType === 'verified_user' ? 'secondary' : 'primary'}
                        onClick={() => handleAccountTypeChange(
                          user._id, 
                          user.accountType === 'verified_user' ? 'user' : 'verified_user'
                        )}
                      >
                        {user.accountType === 'verified_user' ? 'Снять верификацию' : 'Верифицировать'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {users.length === 0 ? 'Нет пользователей для отображения' : 'Ничего не найдено'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;