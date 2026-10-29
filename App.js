import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
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

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: true }}
      >
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CameraScanner" component={CameraScannerScreen} />
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
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
        <Stack.Screen name="Notificacoes" component={NotificacoesScreen} />
        <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
        <Stack.Screen name="QRCodeProduto" component={QRCodeProdutoScreen}
          options={{ title: "QR Code do produto" }}/>
        <Stack.Screen name="CadastroProduto" component={CadastroProdutoScreen} />
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
