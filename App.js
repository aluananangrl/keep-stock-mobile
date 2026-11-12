import { useEffect } from "react";
import { Alert } from "react-native";
import {
  createNavigationContainerRef,
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { SCREEN_BACKGROUND } from "./src/components/ScreenBackground";
import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CameraScannerScreen from "./src/screens/CameraScannerScreen";
import PerfilScreen from "./src/screens/PerfilScreen";
import DetalhesProdutoScreen from "./src/screens/DetalhesProdutoScreen";
import ResultadoLeituraScreen from "./src/screens/ResultadoLeituraScreen";
import ConfirmacaoMovimentoScreen from "./src/screens/ConfirmacaoMovimentoScreen";
import ErroScannerScreen from "./src/screens/ErroScannerScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import InventarioScreen from "./src/screens/InventarioScreen";
import RelatoriosScreen from "./src/screens/RelatoriosScreen";
import HistoricoScreen from "./src/screens/HistoricoScreen";
import ListaProdutosScreen from "./src/screens/ListaProdutosScreen";
import FornecedoresScreen from "./src/screens/FornecedoresScreen";
import ConfiguracoesScreen from "./src/screens/ConfiguracoesScreen";
import NotificacoesScreen from "./src/screens/NotificacoesScreen";
import RecuperarSenhaScreen from "./src/screens/RecuperarSenhaScreen";
import QRCodeProdutoScreen from "./src/screens/QRCodeProdutoScreen";
import CadastroProdutoScreen from "./src/screens/CadastroProdutoScreen";
import NovaSenhaScreen from "./src/screens/NovaSenhaScreen";

import RegistroFormScreen from "./src/screens/RegistroFormScreen";
import { setOnSessaoExpirada } from "./src/services/api";

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

function AppNavigator() {
  const { theme } = useTheme();

  useEffect(() => {
    setOnSessaoExpirada(() => {
      if (!navigationRef.isReady()) return;
      const tela = navigationRef.getCurrentRoute()?.name;
      if (["Login", "Cadastro", "RecuperarSenha", "NovaSenha"].includes(tela)) return;

      navigationRef.resetRoot({ index: 0, routes: [{ name: "Login" }] });
      Alert.alert("Sessão expirada", "Entre novamente para continuar.");
    });
    return () => setOnSessaoExpirada(undefined);
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ route }) => {
          if (["Login", "Cadastro", "RecuperarSenha", "NovaSenha"].includes(route.name)) {
            return { headerShown: false };
          }
          const light = theme === "light" && ["Home", "Perfil", "Configuracoes"].includes(route.name);
          return {
            headerShown: false,
            contentStyle: { backgroundColor: light ? "#F4F7FC" : SCREEN_BACKGROUND },
            headerStyle: { backgroundColor: light ? "#E8F0FF" : "#13294B" },
            headerTintColor: light ? "#20273C" : "#F1F5F9",
            headerShadowVisible: false,
          };
        }}
      >
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="CameraScanner"
          component={CameraScannerScreen}
          options={{ headerShown: false, animation: "none" }}
        />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen
          name="DetalhesProduto"
          component={DetalhesProdutoScreen}
        />
        <Stack.Screen
          name="ResultadoLeitura"
          component={ResultadoLeituraScreen}
        />
        <Stack.Screen
          name="ConfirmacaoMovimento"
          component={ConfirmacaoMovimentoScreen}
        />
        <Stack.Screen name="ErroScanner" component={ErroScannerScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Inventario" component={InventarioScreen} />
        <Stack.Screen name="Relatorios" component={RelatoriosScreen} />
        <Stack.Screen name="Historico" component={HistoricoScreen} />
        <Stack.Screen name="ListaProdutos" component={ListaProdutosScreen} />
        <Stack.Screen name="Fornecedores" component={FornecedoresScreen} />
        <Stack.Screen name="Categorias" component={FornecedoresScreen} />
        <Stack.Screen name="RegistroForm" component={RegistroFormScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
        <Stack.Screen name="QRCodeProduto" component={QRCodeProdutoScreen}
          options={{ title: "QR Code do produto" }}/>
        <Stack.Screen name="CadastroProduto" component={CadastroProdutoScreen} />
          <Stack.Screen name="NovaSenha" component={NovaSenhaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
