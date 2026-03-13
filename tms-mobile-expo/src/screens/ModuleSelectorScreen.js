import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, LayoutDashboard, Box, ShoppingCart, Users, LogOut, Package
} from 'lucide-react-native';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard, color: 'indigo', route: '/dashboard' },
  { id: 'inbound', label: 'Recepción (WMS)', icon: Box, color: 'blue', route: '/wms/reception' },
  { id: 'inventory', label: 'Inventario / Stock', icon: Package, color: 'emerald', route: '/wms/stock' },
  { id: 'outbound', label: 'Picking & Despacho', icon: ShoppingCart, color: 'amber', route: '/wms/picking' },
  { id: 'tms', label: 'Gestión Transporte', icon: Truck, color: 'purple', route: '/tms/control-tower' },
  { id: 'admin', label: 'Administración', icon: Users, color: 'slate', route: '/admin/users' },
  { id: 'full', label: 'Plataforma Completa', icon: LayoutDashboard, color: 'rose', route: '/' },
];

export default function ModuleSelectorScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2; // Calcular ancho dinámico (2 columnas)

  const handleModuleSelect = (module) => {
    if (module.id === 'tms_driver') {
      navigation.navigate('DriverHome'); // Ruta nativa de conductores
    } else {
      // Navegar al WebView genérico pasando la URL
      navigation.navigate('WebModule', { 
        moduleUrl: module.route, 
        moduleName: module.label 
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-slate-900 pt-6 pb-6 px-6 rounded-b-3xl shadow-xl z-10">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Bienvenido</Text>
            <Text className="text-white text-2xl font-black">{user?.nombre || 'Usuario'}</Text>
          </View>
          <TouchableOpacity onPress={signOut} className="bg-slate-800 p-3 rounded-full">
            <LogOut size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-slate-800 text-lg font-bold mb-4 ml-1">Selecciona un Módulo</Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* Tarjeta Especial Conductores (Nativa) */}
          <TouchableOpacity
            onPress={() => navigation.navigate('DriverHome')}
            className="w-full bg-indigo-600 p-5 rounded-2xl mb-4 shadow-lg shadow-indigo-200 flex-row items-center"
          >
            <View className="bg-white/20 p-3 rounded-xl mr-4">
              <Truck size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-black text-lg">App Conductores</Text>
              <Text className="text-indigo-100 text-xs">Versión Nativa (GPS, Fotos)</Text>
            </View>
            <View className="bg-white px-3 py-1 rounded-full">
              <Text className="text-indigo-600 font-bold text-xs">IR</Text>
            </View>
          </TouchableOpacity>

          {/* Módulos Web (WMS, Admin, etc) */}
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            
            return (
              <TouchableOpacity
                key={mod.id}
                onPress={() => handleModuleSelect(mod)}
                style={{ width: itemWidth }}
                className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center justify-center py-8"
              >
                <View className={`bg-${mod.color}-100 p-4 rounded-full mb-3`}>
                  <Icon size={28} color="#1e293b" /> 
                </View>
                <Text className="text-slate-700 font-bold text-center text-sm">{mod.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
