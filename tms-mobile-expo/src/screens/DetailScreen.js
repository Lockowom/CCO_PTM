import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, MapPin, Phone, CheckCircle, XCircle, 
  Calendar, Play, Navigation 
} from 'lucide-react-native';

const MOTIVOS_RECHAZO = [
  'Cliente no se encontraba', 'Dirección incorrecta', 'Cliente rechazó el pedido',
  'Producto dañado', 'Fuera de horario', 'Zona de difícil acceso', 'Otro motivo'
];

const MOTIVOS_REPROGRAMACION = [
  'Cliente solicitó otro día', 'Local cerrado', 'No había quien recibiera',
  'Problema con documentación', 'Reagendar por capacidad', 'Otro motivo'
];

export default function DetailScreen({ route, navigation }) {
  const { entrega } = route.params;
  const [loading, setLoading] = useState(false);
  const [modalAction, setActionModal] = useState(null); // 'RECHAZADO' | 'REPROGRAMADO'
  const [motivo, setMotivo] = useState('');
  const [obs, setObs] = useState('');

  const handleUpdateStatus = async (newStatus, extraData = {}) => {
    try {
      setLoading(true);
      const updatePayload = {
        estado: newStatus,
        updated_at: new Date().toISOString(),
        ...extraData
      };

      if (newStatus === 'ENTREGADO') {
        updatePayload.fecha_entrega_real = new Date().toISOString();
      }

      // Append observaciones if needed
      let finalObs = entrega.observaciones || '';
      if (extraData.observaciones) {
        finalObs = finalObs ? `${finalObs}\n${extraData.observaciones}` : extraData.observaciones;
        updatePayload.observaciones = finalObs;
      }

      const { error } = await supabase
        .from('tms_entregas')
        .update(updatePayload)
        .eq('id', entrega.id);

      if (error) throw error;

      Alert.alert('Éxito', 'Estado actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMaps = () => {
    const query = encodeURIComponent(`${entrega.direccion}, ${entrega.comuna}`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const confirmAction = () => {
    if (!motivo) {
      Alert.alert('Atención', 'Debes seleccionar un motivo');
      return;
    }
    const observationText = `[${modalAction}] ${motivo} ${obs ? '- ' + obs : ''}`;
    handleUpdateStatus(modalAction, { observaciones: observationText });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-slate-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">Detalle de Entrega</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Header Card */}
        <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
          <Text className="text-2xl font-black text-slate-800 mb-2">{entrega.cliente}</Text>
          <Text className="font-mono text-sm text-slate-500">NV: {entrega.nv}</Text>
        </View>

        {/* Info Blocks */}
        <View className="space-y-6 mb-8">
          <View>
            <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Dirección</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-slate-800 font-medium text-lg">{entrega.direccion}</Text>
                <Text className="text-slate-500">{entrega.comuna}, {entrega.region}</Text>
              </View>
              <TouchableOpacity 
                onPress={openMaps}
                className="w-12 h-12 bg-indigo-50 items-center justify-center rounded-xl"
              >
                <Navigation size={24} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-slate-50 p-4 rounded-xl">
              <Text className="text-xs text-slate-400 mb-1">Contacto</Text>
              <Text className="font-bold text-slate-700">{entrega.telefono || 'Sin teléfono'}</Text>
            </View>
            <View className="flex-1 bg-slate-50 p-4 rounded-xl">
              <Text className="text-xs text-slate-400 mb-1">Horario</Text>
              <Text className="font-bold text-slate-700">09:00 - 18:00</Text>
            </View>
          </View>

          {entrega.observaciones && (
            <View className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <Text className="text-amber-800 text-sm font-medium">
                Nota: {entrega.observaciones}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {entrega.estado === 'PENDIENTE' && (
          <TouchableOpacity 
            onPress={() => handleUpdateStatus('EN_RUTA')}
            className="w-full py-4 bg-blue-600 rounded-2xl flex-row items-center justify-center space-x-2 shadow-lg shadow-blue-200"
          >
            <Play size={24} color="white" />
            <Text className="text-white font-bold text-lg">Iniciar Ruta</Text>
          </TouchableOpacity>
        )}

        {entrega.estado === 'EN_RUTA' && !modalAction && (
          <View className="space-y-3">
            <TouchableOpacity 
              onPress={() => handleUpdateStatus('ENTREGADO')}
              className="w-full py-4 bg-emerald-500 rounded-2xl flex-row items-center justify-center space-x-2 shadow-lg shadow-emerald-200"
            >
              <CheckCircle size={24} color="white" />
              <Text className="text-white font-bold text-lg">Confirmar Entrega</Text>
            </TouchableOpacity>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setActionModal('RECHAZADO')}
                className="flex-1 py-3 bg-white border-2 border-red-100 rounded-xl items-center"
              >
                <Text className="text-red-600 font-bold">Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setActionModal('REPROGRAMADO')}
                className="flex-1 py-3 bg-white border-2 border-purple-100 rounded-xl items-center"
              >
                <Text className="text-purple-600 font-bold">Reprogramar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modal Logic (Inline for simplicity) */}
        {modalAction && (
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <Text className="text-lg font-bold text-slate-800 mb-4">
              {modalAction === 'RECHAZADO' ? 'Reportar Rechazo' : 'Reprogramar'}
            </Text>
            
            <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Motivo</Text>
            <View className="space-y-2 mb-4">
              {(modalAction === 'RECHAZADO' ? MOTIVOS_RECHAZO : MOTIVOS_REPROGRAMACION).map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMotivo(m)}
                  className={`p-3 rounded-xl ${motivo === m ? 'bg-indigo-600' : 'bg-white'}`}
                >
                  <Text className={`font-medium ${motivo === m ? 'text-white' : 'text-slate-600'}`}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={obs}
              onChangeText={setObs}
              placeholder="Comentarios adicionales..."
              multiline
              className="bg-white p-3 rounded-xl border border-slate-200 h-24 mb-4 text-slate-700"
              textAlignVertical="top"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => { setActionModal(null); setMotivo(''); }}
                className="flex-1 py-3 bg-slate-200 rounded-xl items-center"
              >
                <Text className="text-slate-600 font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={confirmAction}
                disabled={loading}
                className="flex-1 py-3 bg-slate-900 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
