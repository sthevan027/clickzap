import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Input,
  List,
  ListItem,
  Text,
  Avatar,
  Flex,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

interface Contact {
  id: string;
  name: string;
  number: string;
  profilePic?: string;
}

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts');
      setContacts(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contatos',
        status: 'error',
        duration: 3000,
      });
      console.error('Erro ao carregar contatos:', error);
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.includes(searchTerm)
  );

  return (
    <Box w="100%" bg="white" borderRadius="lg" shadow="md" p={4}>
      <VStack spacing={4}>
        <Input
          placeholder="Pesquisar contatos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <List spacing={2} w="100%">
          {filteredContacts.map((contact) => (
            <ListItem
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              p={2}
              borderRadius="md"
            >
              <Flex align="center">
                <Avatar
                  size="sm"
                  name={contact.name}
                  src={contact.profilePic}
                  mr={3}
                />
                <Box>
                  <Text fontWeight="medium">{contact.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {contact.number}
                  </Text>
                </Box>
              </Flex>
            </ListItem>
          ))}
        </List>

        {loading && <Text>Carregando contatos...</Text>}
        {!loading && filteredContacts.length === 0 && (
          <Text>Nenhum contato encontrado</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ContactList; 