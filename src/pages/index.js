import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import hotmartConfig from '../config/hotmart';

export default function Home() {
  const [instances, setInstances] = useState([]);
  const toast = useToast();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handlePurchase = (product) => {
    const { id, offer } = product;
    window.open(`https://pay.hotmart.com/${id}?off=${offer}&checkoutMode=6`, '_blank');
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" shadow="sm" py={4}>
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <Heading size="lg" color="brand.500">ZapClick</Heading>
            <HStack spacing={4}>
              <Button onClick={handleLogin} variant="ghost">Login</Button>
              <Button onClick={handleRegister} colorScheme="brand">Registrar</Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" mb={4}>
              Automatize seu WhatsApp
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Gerencie múltiplas instâncias, crie respostas automáticas e integre com IA
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={8}>
            <Card>
              <CardHeader>
                <Heading size="md">Plano Free</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text>1 instância do WhatsApp</Text>
                  <Text>Respostas automáticas básicas</Text>
                  <Text>Suporte por email</Text>
                  <Button 
                    colorScheme="brand" 
                    variant="outline"
                    onClick={handleRegister}
                  >
                    Começar Grátis
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Plano Basic</Heading>
                <Badge colorScheme="green" ml={2}>Mais Popular</Badge>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text>3 instâncias do WhatsApp</Text>
                  <Text>Respostas com IA</Text>
                  <Text>Suporte prioritário</Text>
                  <Button 
                    colorScheme="brand"
                    onClick={() => handlePurchase(hotmartConfig.products.basic)}
                  >
                    R$ 9,90/mês
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Plano Premium</Heading>
                <Badge colorScheme="purple" ml={2}>Mais Recursos</Badge>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Text>10 instâncias do WhatsApp</Text>
                  <Text>Respostas com IA avançada</Text>
                  <Text>Suporte 24/7</Text>
                  <Button 
                    colorScheme="brand"
                    onClick={() => handlePurchase(hotmartConfig.products.premium)}
                  >
                    R$ 14,90/mês
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Box textAlign="center" mt={12}>
            <Heading size="lg" mb={4}>
              Garantia de 7 dias
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Teste sem compromisso. Se não gostar, devolvemos seu dinheiro.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
} 