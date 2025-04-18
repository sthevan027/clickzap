import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      // Mensagens gerais
      welcome: 'Bem-vindo ao ZapClick',
      login: 'Entrar',
      logout: 'Sair',
      register: 'Registrar',
      
      // Dashboard
      dashboard: 'Painel',
      statistics: 'Estatísticas',
      users: 'Usuários',
      messages: 'Mensagens',
      
      // Configurações
      settings: 'Configurações',
      theme: 'Tema',
      language: 'Idioma',
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      
      // Planos
      plans: 'Planos',
      basic: 'Básico',
      premium: 'Premium',
      
      // Mensagens de erro
      error: 'Erro',
      unauthorized: 'Não autorizado',
      serverError: 'Erro no servidor',
      
      // Mensagens de sucesso
      success: 'Sucesso',
      saved: 'Salvo com sucesso',
      updated: 'Atualizado com sucesso',
      
      // Botões
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      send: 'Enviar'
    }
  },
  en: {
    translation: {
      // General messages
      welcome: 'Welcome to ZapClick',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      
      // Dashboard
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      users: 'Users',
      messages: 'Messages',
      
      // Settings
      settings: 'Settings',
      theme: 'Theme',
      language: 'Language',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      
      // Plans
      plans: 'Plans',
      basic: 'Basic',
      premium: 'Premium',
      
      // Error messages
      error: 'Error',
      unauthorized: 'Unauthorized',
      serverError: 'Server error',
      
      // Success messages
      success: 'Success',
      saved: 'Saved successfully',
      updated: 'Updated successfully',
      
      // Buttons
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      send: 'Send'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 