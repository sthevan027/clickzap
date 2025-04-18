import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Image } from '@chakra-ui/react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  isVisible: boolean;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ isVisible }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<string>('waiting');

  useEffect(() => {
    const eventSource = new EventSource('/api/whatsapp-events');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'qr') {
        QRCode.toDataURL(data.qr)
          .then(url => {
            setQrCode(url);
            setStatus('qr');
          })
          .catch(err => {
            console.error('Erro ao gerar QR Code:', err);
          });
      } else if (data.type === 'ready') {
        setStatus('connected');
        eventSource.close();
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.8)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="modal"
    >
      <VStack
        bg="white"
        p={8}
        borderRadius="lg"
        spacing={4}
        align="center"
      >
        {status === 'waiting' && (
          <Text fontSize="lg">Aguardando QR Code...</Text>
        )}
        
        {status === 'qr' && (
          <>
            <Text fontSize="lg" fontWeight="bold">
              Escaneie o QR Code com seu WhatsApp
            </Text>
            <Image src={qrCode} alt="QR Code" boxSize="300px" />
            <Text fontSize="sm" color="gray.600">
              Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione WhatsApp Web
            </Text>
          </>
        )}
        
        {status === 'connected' && (
          <Text fontSize="lg" color="green.500">
            WhatsApp conectado com sucesso!
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default QRCodeComponent; 