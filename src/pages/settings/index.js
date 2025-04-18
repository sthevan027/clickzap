import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Switch,
  useColorMode,
  Card,
  CardBody,
  Icon,
  Text,
  Flex,
  Divider,
  useToast
} from '@chakra-ui/react';
import { MdLanguage, MdBrightness4, MdSave } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  
  const [settings, setSettings] = useState({
    language: 'pt',
    theme: 'light'
  });

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      i18n.changeLanguage(parsed.language);
      if (parsed.theme !== colorMode) {
        toggleColorMode();
      }
    }
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSettings(prev => ({ ...prev, language: newLang }));
    i18n.changeLanguage(newLang);
    saveSettings({ ...settings, language: newLang });
  };

  const handleThemeChange = () => {
    const newTheme = colorMode === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    toggleColorMode();
    saveSettings({ ...settings, theme: newTheme });
  };

  const saveSettings = (newSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
    toast({
      title: t('settings.saved'),
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">{t('settings.title')}</Heading>
        
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <Flex align="center" mb={2}>
                  <Icon as={MdLanguage} mr={2} />
                  <FormLabel mb={0}>{t('settings.language')}</FormLabel>
                </Flex>
                <Select
                  value={settings.language}
                  onChange={handleLanguageChange}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </Select>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center">
                <Flex align="center" flex="1">
                  <Icon as={MdBrightness4} mr={2} />
                  <FormLabel mb={0}>{t('settings.darkMode')}</FormLabel>
                </Flex>
                <Switch
                  isChecked={colorMode === 'dark'}
                  onChange={handleThemeChange}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Box>
          <Text fontSize="sm" color="gray.500">
            {t('settings.saveInfo')}
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings; 