import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { api } from '../../lib/api';


interface Medico {
  usuario_id: number;
  nombre_usuario: string;
  apellido: string;
  correo: string;
  telefono: string;
}

export default function GestionMedicosScreen() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    obtenerMedicos();
  }, []);

  const obtenerMedicos = async () => {
  try {
    const res = await fetch(`${API_URL}/usuarios?rol=medico`);
    if (!res.ok) throw new Error("Error al cargar médicos");
    const data = await res.json();
    setMedicos(data);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "No se pudo conectar con el servidor");
  }
};


  const guardarMedico = async () => {
    if (!nombre || !apellido || !correo ||(!editandoId && !contrasena) ||!telefono) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const method = editandoId ? "PUT" : "POST";
      const url = editandoId
        ? `${API_URL}/usuarios/${editandoId}`
        : `${API_URL}/usuarios`;

      const body = {
        nombre_usuario: nombre,
        apellido,
        correo,
        telefono,
        rol: "medico",
        ...(editandoId ? {} : { contra: contrasena }),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Éxito", editandoId ? "Médico actualizado" : "Médico creado");
        limpiarFormulario();
        obtenerMedicos();
      } else {
        Alert.alert("Error", data.error || "No se pudo guardar el médico");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setApellido("");
    setCorreo("");
    setContrasena("");
    setTelefono("");
    setEditandoId(null);
  };

  const editarMedico = (m: Medico) => {
    setEditandoId(m.usuario_id);
    setNombre(m.nombre_usuario);
    setApellido(m.apellido);
    setCorreo(m.correo);
    setContrasena("");
    setTelefono(m.telefono);
  };

const eliminarMedico = async (id: number) => {
  const confirmacion = Platform.OS === "web"
    ? window.confirm("¿Eliminar este médico?")
    : await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Confirmar",
          "¿Eliminar este médico?",
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
            { text: "Eliminar", style: "destructive", onPress: () => resolve(true) },
          ]
        );
      });

  if (!confirmacion) return;

  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      Alert.alert("Eliminado", data.message || "Médico eliminado correctamente");
      setMedicos((prev) => prev.filter((m) => m.usuario_id !== id));
    } else {
      Alert.alert("Error", data.error || "No se pudo eliminar el médico");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "No se pudo conectar con el servidor");
  }
};




  return (
    <View style={s.container}>
      <View style={s.header}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" }}
          style={s.logo}
          resizeMode="contain"
        />
        <Text style={s.h1}>Gestión de Médicos</Text>
        <Text style={s.h2}>{editandoId ? "Editar médico" : "Agregar nuevo profesional"}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, width: "100%" }}
      >
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}keyboardShouldPersistTaps="handled">
          <View style={s.card}>
            <Text style={s.title}>{editandoId ? "Editar Médico" : "Crear Médico"}</Text>

            <TextInput style={s.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
            <TextInput style={s.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
            <TextInput
              style={s.input}
              placeholder="Correo"
              value={correo}
              onChangeText={setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!editandoId && (
              <TextInput
                style={s.input}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
              />
            )}
            <TextInput
              style={s.input}
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <TouchableOpacity style={s.primaryBtn} onPress={guardarMedico} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.primaryBtnText}>{editandoId ? "Actualizar" : "Crear Médico"}</Text>
              )}
            </TouchableOpacity>

            {editandoId && (
              <TouchableOpacity onPress={limpiarFormulario} style={s.cancelBtn}>
                <Text style={s.cancelBtnText}>Cancelar edición</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginTop: 30, width: 340 }}>
            <Text style={s.title}>Lista de Médicos</Text>
            {medicos.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#777" }}>No hay médicos registrados</Text>
            ) : (
              medicos.map((m) => (
                <View key={m.usuario_id} style={s.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemName}>
                      {m.nombre_usuario} {m.apellido}
                    </Text>
                    <Text style={s.itemEmail}>{m.correo}</Text>
                    <Text style={s.itemPhone}>{m.telefono}</Text>
                  </View>
                  <TouchableOpacity onPress={() => editarMedico(m)} style={s.editBtn}>
                    <Text style={s.editText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      console.log("Botón eliminar clickeado", m.usuario_id);
                      eliminarMedico(m.usuario_id);
                    }}
                    style={[s.deleteBtn, { zIndex: 10, backgroundColor: "transparent" }]}
                  >
                    <Text style={s.deleteText}>🗑️</Text>
                  </TouchableOpacity>

                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: {
    backgroundColor: "#0E3A46",
    width: "130%",
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  logo: { width: 64, height: 64, marginBottom: 6 },
  h1: { color: "#FFFFFF", fontSize: 30, fontWeight: "800" },
  h2: { color: "#E6F1F4", fontSize: 15, fontWeight: "600", marginTop: 4 },
  card: {
    width: 340,
    backgroundColor: "#fff",
    marginTop: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    elevation: 4,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 16, textAlign: "center", color: "#0E3A46" },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#111827",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  cancelBtn: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 6,
  },
  cancelBtnText: { color: "#0E3A46", fontWeight: "600" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemName: { fontWeight: "700", color: "#111" },
  itemEmail: { color: "#555" },
  itemPhone: { color: "#777" },
  editBtn: { marginHorizontal: 8 },
  deleteBtn: {},
  editText: { fontSize: 18 },
  deleteText: { fontSize: 18 },
});
