import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const API_URL = 'http://192.168.12.172:4000/api'; 

type Servicio = {
  servicio_id: number;
  nombre_servicio: string;
  descripcion: string;
  duracion_min: number;
  usuario_id: number | null;
  nombre_usuario?: string;
  apellido?: string;
};

type Medico = {
  usuario_id: number;
  nombre_usuario: string;
  apellido: string;
};

export default function AsignacionesScreen() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [selectedMedicos, setSelectedMedicos] = useState<{ [key: number]: number }>({});

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_URL}/servicios`);
      const data = await res.json();
      setServicios(data);

      const initialSelection: { [key: number]: number } = {};
      data.forEach((s: Servicio) => {
        initialSelection[s.servicio_id] = s.usuario_id || 0;
      });
      setSelectedMedicos(initialSelection);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los servicios: ' + error.message);
    }
  };

  const fetchMedicos = async () => {
    try {
      const res = await fetch(`${API_URL}/servicios/medicos`);
      const data = await res.json();
      setMedicos(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los médicos: ' + error.message);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchMedicos();
  }, []);

  const asignarMedico = async (servicio_id: number) => {
    const usuario_id = selectedMedicos[servicio_id];
    if (!usuario_id || usuario_id === 0) {
      Alert.alert('Error', 'Seleccione un médico');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/servicios/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio_id, usuario_id }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', 'Médico asignado correctamente');
        fetchServicios();
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      console.error('Error asignando médico:', error);
      Alert.alert('Error', 'No se pudo asignar el médico');
    }
  };

  const renderItem = ({ item }: { item: Servicio }) => (
    <View style={s.card}>
      <Text style={s.title}>{item.nombre_servicio}</Text>
      <Text style={s.text}>{item.descripcion}</Text>
      <Text style={s.text}>Duración: {item.duracion_min} min</Text>
      <Text style={s.text}>
        Médico actual:{" "}
        <Text style={s.highlight}>
          {item.nombre_usuario ? `${item.nombre_usuario} ${item.apellido}` : 'Sin asignar'}
        </Text>
      </Text>

      <Picker
        selectedValue={selectedMedicos[item.servicio_id]}
        onValueChange={(value) =>
          setSelectedMedicos((prev) => ({ ...prev, [item.servicio_id]: value }))
        }
        style={s.picker}
      >
        <Picker.Item label="No asignado" value={0} />
        {medicos.map((m) => (
          <Picker.Item
            key={m.usuario_id}
            label={`${m.nombre_usuario} ${m.apellido}`}
            value={m.usuario_id}
          />
        ))}
      </Picker>

      <View style={s.btnContainer}>
        <Button title="Asignar Médico" onPress={() => asignarMedico(item.servicio_id)} color="#0E3A46" />
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={{ uri: "" }}
          style={s.logo}
          resizeMode="contain"
        />
        <Text style={s.h1}>Asignaciones</Text>
        <Text style={s.h2}>de Servicios</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <FlatList
          data={servicios}
          keyExtractor={(item) => item.servicio_id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={s.text}>No hay servicios disponibles</Text>}
        />
      </ScrollView>

      {/* Barra inferior */}
      <View style={s.bottomBar}>
        <TouchableOpacity onPress={() => router.replace("/home")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>🏠</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/admin/AsignacionScreen")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>A</Text>
        </TouchableOpacity>
        
        <View style={s.chatBotBtn}>
          <Text style={s.chatIcon}>🤖</Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/reservas/nueva")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      <View style={s.bottomLeft} />
      <View style={s.bottomRight} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: {
    backgroundColor: "#0E3A46",
    width: "130%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  logo: { width: 64, height: 64, marginBottom: 6 },
  h1: { color: "#FFFFFF", fontSize: 32, fontWeight: "800", letterSpacing: 0.3 },
  h2: { color: "#E6F1F4", fontSize: 16, fontWeight: "700", marginTop: 2 },
  card: {
    width: 340,
    backgroundColor: "#fff",
    marginVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignSelf: "center",
  },
  title: { color: "#0E3A46", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  text: { color: "#111827", fontSize: 14, marginBottom: 2 },
  highlight: { fontWeight: "700", color: "#0E3A46" },
  picker: { backgroundColor: "#F9FAFB", borderRadius: 8, marginVertical: 8 },
  btnContainer: { marginTop: 8 },

  bottomLeft: { position: "absolute", bottom: 0, left: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopRightRadius: 80 },
  bottomRight: { position: "absolute", bottom: 0, right: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopLeftRadius: 80 },

  bottomBar: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bottomBtn: { padding: 10, alignItems: "center" },
  bottomIcon: { fontSize: 20 },
  chatBotBtn: {
    backgroundColor: "#0E3A46",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    bottom: 10,
  },
  chatIcon: { fontSize: 22, color: "#fff" },
});
