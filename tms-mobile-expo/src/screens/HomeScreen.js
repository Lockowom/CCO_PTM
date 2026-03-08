import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, MapPin, CheckCircle, Clock, XCircle, Calendar, 
  Menu, LogOut, Box, Scale, RefreshCw 
} from 'lucide-react-native';

const ESTADOS_ENTREGA = {
  PENDIENTE: { label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
  EN_RUTA: { label: 'En Ruta', color: 'text-blue-600', bg: 'bg-blue-100', icon: Truck },
  ENTREGADO: { label: 'Entregado', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
  RECHAZADO: { label: 'Rechazado', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
  REPROGRAMADO: { label: 'Reprogramado', color: 'text-purple-600', bg: 'bg-purple-100', icon: Calendar },
};

export default function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    fetchEntregas();
    
    // Realtime subscription
    const subscription = supabase
      .channel('entregas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, fetchEntregas)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchEntregas = async () => {
    try {
      // Buscar conductor ID basado en user.id
      const { data: driver } = await supabase
        .from('tms_conductores')
        .select('id')
        .eq('user_id', user.id) // O usar email si no hay user_id directo
        .single();

      if (driver) {
        const { data } = await supabase
          .from('tms_entregas')
          .select('*')
          .eq('conductor_id', driver.id)
          .order('created_at', { ascending: false });
        
        setEntregas(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntregas = filter === 'TODOS' 
    ? entregas 
    : entregas.filter(e => e.estado === filter);

  const renderItem = ({ item }) => {
    const statusConfig = ESTADOS_ENTREGA[item.estado] || ESTADOS_ENTREGA.PENDIENTE;
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity 
        className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100"
        onPress={() => navigation.navigate('Detail', { entrega: item })}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center space-x-2">
            <View className="bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
              <Text className="text-indigo-700 text-xs font-bold">NV: {item.nv}</Text>
            </View>
          </View>
          <View className={`flex-row items-center space-x-1 px-2 py-1 rounded-full ${statusConfig.bg}`}>
            <StatusIcon size={12} color="#000" /> 
            <Text className={`${statusConfig.color} text-[10px] font-bold`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <Text className="text-lg font-black text-slate-800 mb-1">{item.cliente}</Text>
        
        <View className="flex-row items-start space-x-2 mb-4">
          <MapPin size={14} color="#94a3b8" style={{ marginTop: 2 }} />
          <Text className="text-slate-500 text-xs flex-1" numberOfLines={2}>
            {item.direccion}, {item.comuna}
          </Text>
        </View>

        <View className="flex-row bg-slate-50 rounded-xl p-3 border border-slate-100 justify-between">
          <View className="flex-row items-center space-x-2">
            <Box size={16} color="#475569" />
            <View>
              <Text className="text-[10px] text-slate-400 font-bold uppercase">Bultos</Text>
              <Text className="text-sm font-black text-slate-800">{item.bultos || 0}</Text>
            </View>
          </View>
          <View className="w-px h-8 bg-slate-200 mx-4" />
          <View className="flex-row items-center space-x-2">
            <Scale size={16} color="#475569" />
            <View>
              <Text className="text-[10px] text-slate-400 font-bold uppercase">Peso</Text>
              <Text className="text-sm font-black text-slate-800">{item.peso_kg || 0} kg</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      {/* Header */}
      <View className="bg-slate-900 p-4 pt-10 shadow-lg flex-row justify-between items-center">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center">
            <Text className="text-white font-bold text-lg">{user?.nombre?.charAt(0) || 'C'}</Text>
          </View>
          <View>
            <Text className="text-white font-bold">{user?.nombre || 'Conductor'}</Text>
            <Text className="text-slate-400 text-xs">{user?.vehiculo_patente || 'Sin Patente'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={signOut} className="p-2 bg-slate-800 rounded-lg">
          <LogOut size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="p-4 flex-row space-x-3">
        <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
          <Text className="text-slate-400 text-xs uppercase font-bold">Pendientes</Text>
          <Text className="text-2xl font-black text-indigo-600">
            {entregas.filter(e => ['PENDIENTE', 'EN_RUTA'].includes(e.estado)).length}
          </Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm">
          <Text className="text-slate-400 text-xs uppercase font-bold">Completadas</Text>
          <Text className="text-2xl font-black text-emerald-500">
            {entregas.filter(e => e.estado === 'ENTREGADO').length}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View className="px-4 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
          {['TODOS', 'PENDIENTE', 'EN_RUTA'].map(st => (
            <TouchableOpacity
              key={st}
              onPress={() => setFilter(st)}
              className={`px-4 py-2 rounded-full border ${
                filter === st ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${filter === st ? 'text-white' : 'text-slate-500'}`}>
                {st === 'TODOS' ? 'Todas' : ESTADOS_ENTREGA[st]?.label || st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredEntregas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-slate-400">No hay entregas disponibles</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
