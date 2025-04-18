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
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const router = useRouter();
  const { plan } = router.query;
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    if (!plan) {
      router.push('/plans');
      return;
    }

    generateCheckoutLink();
  }, [plan, user, token]);

  const generateCheckoutLink = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar link de checkout');
      }

      setCheckoutUrl(data.checkoutUrl);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (checkoutUrl) {
    return (
      <Container maxW="container.md" py={10}>
        <Box
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
        >
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Finalizar Compra
            </Heading>

            <Text fontSize="lg" textAlign="center">
              Você será redirecionado para a página de pagamento da Hotmart.
            </Text>

            <Button
              colorScheme="green"
              size="lg"
              onClick={() => window.location.href = checkoutUrl}
            >
              Ir para Pagamento
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/plans')}
            >
              Voltar para Planos
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }

  return null;
} 