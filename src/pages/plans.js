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
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 9.90,
    features: [
      '100 mensagens por mês',
      'Suporte por email',
      'Integração com WhatsApp',
      'Relatórios básicos',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 14.90,
    features: [
      'Mensagens ilimitadas',
      'Suporte prioritário',
      'Integração com WhatsApp',
      'Relatórios avançados',
      'Automação de mensagens',
      'API exclusiva',
    ],
  },
];

export default function Plans() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
  }, [user, token]);

  const handleSelectPlan = async (planId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar link de checkout');
      }

      router.push(`/checkout?plan=${planId}`);
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

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            Escolha seu Plano
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Selecione o plano que melhor atende às suas necessidades
          </Text>
        </Box>

        <HStack spacing={8} align="stretch" justify="center">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              w="sm"
              variant="outline"
              borderWidth={2}
              borderColor={plan.id === 'premium' ? 'blue.500' : 'gray.200'}
            >
              <CardHeader>
                <Heading size="md" textAlign="center">
                  {plan.name}
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Text fontSize="3xl" fontWeight="bold">
                    R$ {plan.price.toFixed(2)}
                    <Text as="span" fontSize="md" color="gray.500">
                      /mês
                    </Text>
                  </Text>

                  <List spacing={3}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListIcon as={CheckIcon} color="green.500" />
                        {feature}
                      </ListItem>
                    ))}
                  </List>
                </VStack>
              </CardBody>
              <CardFooter>
                <Button
                  colorScheme={plan.id === 'premium' ? 'blue' : 'gray'}
                  size="lg"
                  width="full"
                  isLoading={loading}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Selecionar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </HStack>
      </VStack>
    </Container>
  );
} 