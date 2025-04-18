import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Switch,
  Badge,
  Heading,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleToggleAdmin = async (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const confirmToggleAdmin = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Falha ao atualizar permissões');

      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user._id === selectedUser._id 
          ? { ...user, role: user.role === 'admin' ? 'user' : 'admin' }
          : user
      ));

      toast({
        title: t('success'),
        description: t('admin.userUpdated'),
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      onClose();
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>{t('admin.userManagement')}</Heading>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>{t('admin.name')}</Th>
              <Th>{t('admin.email')}</Th>
              <Th>{t('admin.plan')}</Th>
              <Th>{t('admin.status')}</Th>
              <Th>{t('admin.role')}</Th>
              <Th>{t('admin.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user._id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge colorScheme={user.plan === 'premium' ? 'purple' : 'green'}>
                    {user.plan}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={user.status === 'active' ? 'green' : 'red'}>
                    {user.status}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={user.role === 'admin' ? 'red' : 'blue'}>
                    {user.role}
                  </Badge>
                </Td>
                <Td>
                  <Switch
                    isChecked={user.role === 'admin'}
                    onChange={() => handleToggleAdmin(user)}
                    colorScheme="red"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>
              {selectedUser?.role === 'admin' 
                ? t('admin.removeAdminConfirm') 
                : t('admin.makeAdminConfirm')}
            </AlertDialogHeader>
            <AlertDialogBody>
              {selectedUser?.role === 'admin'
                ? t('admin.removeAdminWarning')
                : t('admin.makeAdminWarning')}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>{t('cancel')}</Button>
              <Button colorScheme="red" ml={3} onClick={confirmToggleAdmin}>
                {t('confirm')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default UsersManagement; 