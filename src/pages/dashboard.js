import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchSubscription();
  }, [user, token]);

  const fetchSubscription = async () => {
    try {
      if (!user.subscription) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/subscriptions/${user.subscription}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar assinatura');
      }

      setSubscription(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar assinatura');
      }

      toast({
        title: 'Sucesso',
        description: 'Assinatura cancelada com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchSubscription();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Dashboard</Heading>
          <Button onClick={logout}>Sair</Button>
        </HStack>

        <Card>
          <CardHeader>
            <Heading size="md">Minha Assinatura</Heading>
          </CardHeader>
          <CardBody>
            {subscription ? (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text>Plano</Text>
                  <Badge colorScheme="blue">{subscription.plan}</Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text>Status</Text>
                  <Badge
                    colorScheme={
                      subscription.status === 'active' ? 'green' :
                      subscription.status === 'cancelled' ? 'red' : 'yellow'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text>Próximo pagamento</Text>
                  <Text>
                    {new Date(subscription.nextPaymentDate).toLocaleDateString()}
                  </Text>
                </HStack>

                <HStack justify="space-between">
                  <Text>Valor</Text>
                  <Text>R$ {subscription.price.toFixed(2)}</Text>
                </HStack>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text>Você ainda não tem uma assinatura ativa</Text>
                <Button
                  colorScheme="blue"
                  onClick={() => router.push('/plans')}
                >
                  Ver Planos
                </Button>
              </VStack>
            )}
          </CardBody>
          {subscription && subscription.status === 'active' && (
            <CardFooter>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleCancelSubscription}
              >
                Cancelar Assinatura
              </Button>
            </CardFooter>
          )}
        </Card>

        <Divider />

        <Card>
          <CardHeader>
            <Heading size="md">Configurações</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text>Notificações por Email</Text>
                <Badge
                  colorScheme={user.settings.notifications.email ? 'green' : 'red'}
                >
                  {user.settings.notifications.email ? 'Ativado' : 'Desativado'}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Notificações por WhatsApp</Text>
                <Badge
                  colorScheme={user.settings.notifications.whatsapp ? 'green' : 'red'}
                >
                  {user.settings.notifications.whatsapp ? 'Ativado' : 'Desativado'}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text>Tema</Text>
                <Badge>{user.settings.theme}</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
} 