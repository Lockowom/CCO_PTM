import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Truck } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-indigo-600 rounded-full items-center justify-center mb-4">
          <Truck size={48} color="white" />
        </View>
        <Text className="text-3xl font-bold text-white">TMS Conductor</Text>
        <Text className="text-slate-400 mt-2">Inicia sesión para ver tus rutas</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-300 mb-2 font-medium">Correo Electrónico</Text>
          <TextInput
            className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
            placeholder="correo@empresa.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-slate-300 mb-2 font-medium">Contraseña</Text>
          <TextInput
            className="w-full bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
            placeholder="••••••"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 py-4 rounded-xl mt-6 active:bg-indigo-700"
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
