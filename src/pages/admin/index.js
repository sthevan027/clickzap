import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    usersByPlan: []
  });
  const [users, setUsers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      toast({
        title: 'Status atualizado',
        status: 'success',
        duration: 3000
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: newPlan })
      });
      toast({
        title: 'Plano atualizado',
        status: 'success',
        duration: 3000
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar plano',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8}>Painel Administrativo</Heading>

      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total de Usuários</StatLabel>
              <StatNumber>{stats.totalUsers}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Assinaturas Ativas</StatLabel>
              <StatNumber>{stats.activeSubscriptions}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Receita Total</StatLabel>
              <StatNumber>R$ {stats.totalRevenue.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Usuários por Plano</StatLabel>
              {stats.usersByPlan.map(plan => (
                <StatHelpText key={plan.plan}>
                  {plan.plan}: {plan.count}
                </StatHelpText>
              ))}
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Tabs>
        <TabList>
          <Tab>Usuários</Tab>
          <Tab>Promoções</Tab>
          <Tab>Logs</Tab>
          <Tab>Configurações</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Plano</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map(user => (
                  <Tr key={user.id}>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Select
                        value={user.plan}
                        onChange={(e) => handlePlanChange(user.id, e.target.value)}
                      >
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </Select>
                    </Td>
                    <Td>
                      <Button
                        colorScheme={user.status === 'active' ? 'green' : 'red'}
                        onClick={() => handleUserStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                      >
                        {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                      </Button>
                    </Td>
                    <Td>
                      <Button
                        colorScheme="blue"
                        onClick={() => {
                          setSelectedUser(user);
                          onOpen();
                        }}
                      >
                        Detalhes
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Button colorScheme="green" mb={4} onClick={onOpen}>
              Nova Promoção
            </Button>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Código</Th>
                  <Th>Desconto</Th>
                  <Th>Planos</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {promotions.map(promo => (
                  <Tr key={promo.id}>
                    <Td>{promo.code}</Td>
                    <Td>{promo.discount}%</Td>
                    <Td>{promo.plans.join(', ')}</Td>
                    <Td>{promo.status}</Td>
                    <Td>
                      <Button colorScheme="blue" mr={2}>
                        Editar
                      </Button>
                      <Button colorScheme="red">
                        Excluir
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Data</Th>
                  <Th>Usuário</Th>
                  <Th>Ação</Th>
                  <Th>IP</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map(log => (
                  <Tr key={log.id}>
                    <Td>{new Date(log.createdAt).toLocaleString()}</Td>
                    <Td>{log.user?.email}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.ip}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Configurações de Planos</Heading>
              </CardHeader>
              <CardBody>
                <FormControl mb={4}>
                  <FormLabel>Preço Plano Basic</FormLabel>
                  <Input type="number" defaultValue="9.90" />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel>Preço Plano Premium</FormLabel>
                  <Input type="number" defaultValue="14.90" />
                </FormControl>
                <Button colorScheme="blue">
                  Salvar Alterações
                </Button>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalhes do Usuário</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <>
                <Text><strong>Nome:</strong> {selectedUser.name}</Text>
                <Text><strong>Email:</strong> {selectedUser.email}</Text>
                <Text><strong>Plano:</strong> {selectedUser.plan}</Text>
                <Text><strong>Status:</strong> {selectedUser.status}</Text>
                <Text><strong>Data de Criação:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</Text>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
} 