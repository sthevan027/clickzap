import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, useToast } from '@chakra-ui/react';
import WhatsAppInterface from '../components/WhatsAppInterface';
import ContactList from '../components/ContactList';
import QRCodeComponent from '../components/QRCode';
import axios from 'axios';

interface Contact {
  id: string;
  name: string;
  number: string;
  profilePic?: string;
}

const ChatPage: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showQR, setShowQR] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Verifica o status da conexão do WhatsApp
    const checkConnection = async () => {
      try {
        const response = await axios.get('/api/whatsapp-status');
        setIsConnected(response.data.connected);
        setShowQR(!response.data.connected);
      } catch (error) {
        console.error('Erro ao verificar status do WhatsApp:', error);
        setShowQR(true);
      }
    };

    checkConnection();

    // Escuta eventos do WhatsApp
    const eventSource = new EventSource('/api/whatsapp-events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ready') {
        setIsConnected(true);
        setShowQR(false);
        toast({
          title: 'WhatsApp Conectado',
          description: 'Seu WhatsApp foi conectado com sucesso!',
          status: 'success',
          duration: 3000,
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [toast]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async (message: string) => {
    try {
      if (!selectedContact) {
        toast({
          title: 'Erro',
          description: 'Selecione um contato primeiro',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      if (!isConnected) {
        toast({
          title: 'Erro',
          description: 'WhatsApp não está conectado',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      await axios.post('/api/send-message', {
        number: selectedContact.number,
        message: message,
      });

      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mensagem',
        status: 'error',
        duration: 3000,
      });
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleSendMedia = async (file: File, type: string) => {
    try {
      if (!selectedContact) {
        toast({
          title: 'Erro',
          description: 'Selecione um contato primeiro',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      if (!isConnected) {
        toast({
          title: 'Erro',
          description: 'WhatsApp não está conectado',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('number', selectedContact.number);
      formData.append('type', type);

      await axios.post('/api/send-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Sucesso',
        description: 'Mídia enviada com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar mídia',
        status: 'error',
        duration: 3000,
      });
      console.error('Erro ao enviar mídia:', error);
    }
  };

  return (
    <>
      <QRCodeComponent isVisible={showQR} />
      
      <Container maxW="container.xl" py={8}>
        <Grid templateColumns="300px 1fr" gap={6}>
          <Box>
            <ContactList onSelectContact={handleSelectContact} />
          </Box>
          
          <Box>
            <Box mb={4} p={4} bg="white" borderRadius="lg" shadow="md">
              {selectedContact ? (
                <Box>
                  <Box fontWeight="bold">{selectedContact.name}</Box>
                  <Box color="gray.600">{selectedContact.number}</Box>
                </Box>
              ) : (
                <Box color="gray.500">Selecione um contato para iniciar a conversa</Box>
              )}
            </Box>
            
            <WhatsAppInterface
              onSendMessage={handleSendMessage}
              onSendMedia={handleSendMedia}
              isDisabled={!isConnected || !selectedContact}
            />
          </Box>
        </Grid>
      </Container>
    </>
  );
};

export default ChatPage; 