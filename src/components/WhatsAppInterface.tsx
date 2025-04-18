import React, { useState, useRef } from 'react';
import { Box, Input, IconButton, Flex, useToast } from '@chakra-ui/react';
import { AttachmentIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaCamera, FaImage } from 'react-icons/fa';

interface WhatsAppInterfaceProps {
  onSendMessage: (message: string) => void;
  onSendMedia: (file: File, type: string) => void;
  isDisabled?: boolean;
}

const WhatsAppInterface: React.FC<WhatsAppInterfaceProps> = ({
  onSendMessage,
  onSendMedia,
  isDisabled = false
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) { // 16MB limit
        toast({
          title: 'Arquivo muito grande',
          description: 'O tamanho máximo permitido é 16MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }
      onSendMedia(file, type);
      event.target.value = ''; // Limpa o input para permitir enviar o mesmo arquivo novamente
    }
  };

  return (
    <Box bg="white" p={4} borderRadius="lg" shadow="md">
      <Flex>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isDisabled ? "Conecte o WhatsApp para enviar mensagens" : "Digite uma mensagem"}
          mr={2}
          isDisabled={isDisabled}
        />
        
        <IconButton
          aria-label="Anexar arquivo"
          icon={<AttachmentIcon />}
          onClick={() => fileInputRef.current?.click()}
          mr={2}
          isDisabled={isDisabled}
        />
        
        <IconButton
          aria-label="Enviar imagem"
          icon={<FaImage />}
          onClick={() => imageInputRef.current?.click()}
          mr={2}
          isDisabled={isDisabled}
        />
        
        <IconButton
          aria-label="Tirar foto"
          icon={<FaCamera />}
          onClick={() => cameraInputRef.current?.click()}
          mr={2}
          isDisabled={isDisabled}
        />
        
        <IconButton
          aria-label="Enviar mensagem"
          icon={<ArrowForwardIcon />}
          onClick={handleSendMessage}
          colorScheme="green"
          isDisabled={isDisabled || !message.trim()}
        />
      </Flex>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, 'document')}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.txt"
        disabled={isDisabled}
      />
      
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileUpload(e, 'image')}
        style={{ display: 'none' }}
        accept="image/*"
        disabled={isDisabled}
      />
      
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => handleFileUpload(e, 'camera')}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
        disabled={isDisabled}
      />
    </Box>
  );
};

export default WhatsAppInterface; 