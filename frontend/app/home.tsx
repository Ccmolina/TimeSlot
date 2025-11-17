import { Platform } from "react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useReservas, type Reserva } from "./store/reservas";

function toDDMMYYYY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(-2)}`;
}

export default function Home() {
  const { reservas } = useReservas();
  const [nombre, setNombre] = useState<string>("");

  useEffect(() => {
  (async () => {
    if (Platform.OS === "web") {
      const name = localStorage.getItem("userName");
      setNombre(name ?? "Georgia");
    } else {
      const value = await SecureStore.getItemAsync("userName");
      setNombre(value ?? "Georgia");
    }
  })();
}, []);

  const tieneReservas = reservas.length > 0;

  return (
    <View style={s.container}>
      <View style={s.bgCircleTop} />
      <View style={s.bgCircleMid} />


      <View style={s.header}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={s.avatar}
        />
        <View>
          <Text style={s.hello}>Hello,</Text>
          <Text style={s.username}>{nombre}</Text>
        </View>
        <Text style={s.bell}>🔔</Text>
      </View>


      <View style={s.titleWrapper}>
        <View style={s.titleRow}>
          <View style={s.titleLine} />
          <Text style={s.titleText}>Mis reservas</Text>
          <View style={s.titleLine} />
        </View>

        <View style={s.statsChip}>
          <Text style={s.statsText}>
            {tieneReservas
              ? `Tienes ${reservas.length} reserva${
                  reservas.length > 1 ? "s" : ""
                }`
              : "Cuando crees una reserva aparecerá aquí"}
          </Text>
        </View>
      </View>


      <View style={s.cardListWrapper}>
        <View style={s.cardList}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { width: "35%" }]}>Fecha</Text>
            <Text style={[s.th, { width: "65%" }]}>Medico</Text>
          </View>


          <ScrollView
            style={s.scroll}
            contentContainerStyle={
              reservas.length === 0 ? { paddingVertical: 18 } : undefined
            }
          >
            {reservas.length === 0 ? (
              <Text style={s.emptyText}>Aún no tienes reservas.</Text>
            ) : (
              reservas.map((r: Reserva) => (
                <View key={r.id} style={s.row}>
                  <View style={s.colFecha}>
                    <Text style={s.date}>{toDDMMYYYY(r.fechaISO)}</Text>
                    <Text style={s.hour}>{r.hora}</Text>
                  </View>

                
                  <View style={s.colMedico}>
                    <Text style={s.doctor}>{r.profesional}</Text>
                    <Text style={s.meta}>Especialidad: {r.area}</Text>
                    <View style={s.badge}>
                      <Text style={s.badgeText}>
                        {r.modalidad ?? "Presencial"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>


      <View style={s.centerBackground} />


      <View style={s.bottomBar}>
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          style={s.bottomBtn}
        >
          <Text style={s.bottomIcon}>🏠</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/admin/AsignacionScreen")}
          style={s.bottomBtn}
        >
          <Text style={s.bottomIcon}>A</Text>
        </TouchableOpacity>
        
        <View style={s.chatBotBtn}>
          <Text style={s.chatIcon}>🤖</Text>
        </View>

       
        <TouchableOpacity
          onPress={() => router.push("/reservas/nueva")}
          style={s.bottomBtn}
        >
          <Text style={s.bottomIcon}>📅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3F6",
    paddingBottom: 110,
  },


  bgCircleTop: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#D8E9EE",
    opacity: 0.5,
  },
  bgCircleMid: {
    position: "absolute",
    top: 260,
    left: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E1EBF3",
    opacity: 0.6,
  },


  header: {
    backgroundColor: "#0E3A46",
    width: "100%",
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    elevation: 5,
    zIndex: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  hello: {
    color: "#D8E9EE",
    fontSize: 13,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 2,
  },
  bell: {
    marginLeft: "auto",
    fontSize: 22,
    color: "#FFFFFF",
  },


  titleWrapper: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#CAD3DC",
  },
  titleText: {
    marginHorizontal: 12,
    fontSize: 22,
    color: "#0E3A46",
    fontWeight: "600",
  },
  statsChip: {
    marginTop: 10,
    alignSelf: "center", 
    backgroundColor: "#D0E9E6",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statsText: {
    fontSize: 11,
    color: "#0E3A46",
    fontWeight: "600",
  },


  cardListWrapper: {
    marginTop: 14,
    alignItems: "center",
  },
  cardList: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#0E3A46", // mismo azul que la página
    overflow: "hidden",
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  tableHeader: {
    backgroundColor: "#E6EDF2",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  th: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },
  scroll: {
    maxHeight: 430,
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  colFecha: {
    width: "35%",
  },
  colMedico: {
    width: "65%",
    paddingLeft: 4,
  },

  date: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12,
  },
  hour: {
    color: "#4B5563",
    fontSize: 12,
    marginTop: 2,
  },
  doctor: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 12,
  },
  meta: {
    color: "#4B5563",
    fontSize: 11,
    marginTop: 2,
  },

  badge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#D0E9E6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: "#0E3A46",
    fontSize: 10,
    fontWeight: "600",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
  },


  centerBackground: {
    position: "absolute",
    bottom: 78,
    alignSelf: "center",
    width: 110,
    height: 72,
    backgroundColor: "#DDE3EA",
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },


  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "#0E3A46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 42,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomIcon: {
    color: "#FFFFFF",
    fontSize: 22,
  },


  chatBotBtn: {
    position: "absolute",
    alignSelf: "center",
    top: -60,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#80a8b3ff",
    width: 56,
    height: 58,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00000013",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
  chatIcon: {
    fontSize: 26,
  },
});
