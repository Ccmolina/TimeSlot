import React from "react"; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useReservas, type Reserva } from "./store/reservas";

function toDDMMYYYY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(-2)}`;
}

export default function Home() {
  const { reservas } = useReservas();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.hTop}>Hello,{"\n"}Georgia</Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <Text style={s.sectionTitle}>Mis reservas</Text>

        <View style={s.cardList}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { width: 110 }]}>Fecha</Text>
            <Text style={[s.th, { flex: 1 }]}>Medico</Text>
          </View>

          <ScrollView style={{ maxHeight: 420 }}>
            {reservas.length === 0 ? (
              <Text style={{ color: "#6B7280", padding: 12 }}>Aún no tienes reservas.</Text>
            ) : (
              reservas.map((r: Reserva) => (
                <View key={r.id} style={s.row}>
                  <View style={{ width: 110 }}>
                    <Text style={s.date}>{toDDMMYYYY(r.fechaISO)}</Text>
                    <Text style={s.date}>{r.hora}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.doctor}>{r.profesional}</Text>
                    <Text style={s.meta}>Especialidad: {r.area}</Text>
                    <Text style={s.meta}>Modalidad: {r.modalidad ?? "Presencial"}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={s.bottomBar}>
        <TouchableOpacity onPress={() => router.replace("/home")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>🏠</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/reservas/nueva")} style={s.fab}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>TIMESLOT</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/perfil")} style={s.bottomBtn}>
          <Text style={s.bottomIcon}>📅</Text>
        </TouchableOpacity>
      </View>

      <View style={s.bottomLeft} />
      <View style={s.bottomRight} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#0E3A46",
    width: "100%",
    height: 110,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  hTop: { color: "#E6F1F4", fontSize: 18, fontWeight: "700" },

  sectionTitle: {
    alignSelf: "center",
    fontSize: 22,
    color: "#0E3A46",
    fontWeight: "800",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#0E3A46",
    width: 180,
    textAlign: "center",
  },

  cardList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#EDF2F7",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: { color: "#0E3A46", fontWeight: "800", fontSize: 13 },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  date: { color: "#111827", fontWeight: "700", fontSize: 12 },
  doctor: { color: "#111827", fontWeight: "800", fontSize: 12 },
  meta: { color: "#374151", fontSize: 11 },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#0E3A46",
    borderRadius: 14,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  bottomBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bottomIcon: { color: "#fff", fontSize: 20 },
  fab: {
    position: "absolute",
    alignSelf: "center",
    bottom: 12,
    backgroundColor: "#0E3A46",
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 12,
  },

  bottomLeft: { position: "absolute", bottom: 0, left: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopRightRadius: 80 },
  bottomRight: { position: "absolute", bottom: 0, right: -10, width: 90, height: 80, backgroundColor: "#0E3A46", borderTopLeftRadius: 80 },
});
