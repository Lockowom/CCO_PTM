import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LogOut, RotateCw } from 'lucide-react-native';

export default function WebModuleScreen({ route, navigation }) {
  const { moduleUrl, moduleName } = route.params;
  const { user, signOut } = useAuth();
  const webViewRef = useRef(null);

  // URL base de la aplicación web desplegada
  // NOTA: Debes cambiar esto por tu URL real de Render/Netlify
  const BASE_URL = 'https://tms-cco-frontend.onrender.com'; // URL de producción del frontend

  // Construir la URL completa con parámetros de autenticación si es necesario
  // O idealmente, la web app debería manejar la sesión si comparten cookies/dominio,
  // pero en una app nativa, a menudo pasamos un token o dejamos que el usuario se loguee de nuevo en el webview.
  // Para simplificar, abrimos la URL directa.
  const fullUrl = `${BASE_URL}${moduleUrl}`;

  const handleLogout = () => {
    signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header Nativo */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <Text className="text-white font-bold text-lg">{moduleName}</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
            <RotateCw size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: fullUrl }}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-slate-900">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
        style={{ flex: 1, backgroundColor: '#0f172a' }}
        // Inyectar JS para ocultar sidebar si es necesario o ajustar estilos
        injectedJavaScript={`
          // Ejemplo: Ocultar navbar nativo de la web si molesta
          // document.querySelector('nav')?.style.display = 'none';
          true;
        `}
      />
    </SafeAreaView>
  );
}
