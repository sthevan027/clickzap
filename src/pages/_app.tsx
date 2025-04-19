import { AppProps } from 'next/app';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../contexts/AuthContext';
import '../config/i18n';
import theme from '../styles/theme';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode="light" />
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp; 