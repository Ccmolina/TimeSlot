import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

const API_URL = "http://192.168.12.172:4000/api";

interface ReservaData {
  fecha: string;
  total_reservas: number;
}

export default function InformesScreen() {
  const [reservas, setReservas] = useState<ReservaData[]>([]);
  const [resumen, setResumen] = useState({
    total: 0,
    maxDia: "",
    maxCantidad: 0,
    promedio: 0,
  });

  useEffect(() => {
    fetch(`${API_URL}/informes/reservas`)
      .then((res) => res.json())
      .then((data) => {
        const ordenadas = [...data].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        );

        setReservas(ordenadas);

        if (ordenadas.length > 0) {
          const total = ordenadas.reduce(
            (sum: number, r: ReservaData) => sum + r.total_reservas,
            0
          );
          const max = ordenadas.reduce(
            (acc: any, r: ReservaData) =>
              r.total_reservas > acc.maxCantidad
                ? { maxDia: r.fecha, maxCantidad: r.total_reservas }
                : acc,
            { maxDia: "", maxCantidad: 0 }
          );
          const promedio = (total / ordenadas.length).toFixed(1);

          setResumen({
            total,
            maxDia: new Date(max.maxDia).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
            }),
            maxCantidad: max.maxCantidad,
            promedio: Number(promedio),
          });
        }
      })
      .catch(() => console.log("Error cargando informes"));
  }, []);

  const chartData = {
    labels: reservas.map((r) =>
      new Date(r.fecha).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
      })
    ),
    datasets: [
      {
        data: reservas.map((r) => r.total_reservas),
      },
    ],
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.h1}>Informes</Text>
        <Text style={s.h2}>Estadísticas del negocio</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
      >
        <View style={s.card}>
          <Text style={s.title}>Reservas Confirmadas por Día</Text>

          {reservas.length > 0 ? (
            <>
              <BarChart
                data={chartData}
                width={Dimensions.get("window").width - 60}
                height={220}
                fromZero
                showValuesOnTopOfBars
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(14, 58, 70, ${opacity})`,
                  labelColor: () => "#333",
                  barPercentage: 0.6,
                }}
                style={{ borderRadius: 10 }}
              />

              <View style={s.resumen}>
                <Text>
                  Total de reservas confirmadas:{" "}
                  <Text style={s.bold}>{resumen.total}</Text>
                </Text>
                <Text>
                  Día con más reservas:{" "}
                  <Text style={s.bold}>{resumen.maxDia}</Text>
                </Text>
                <Text>
                  Promedio diario:{" "}
                  <Text style={s.bold}>{resumen.promedio}</Text>
                </Text>
              </View>
            </>
          ) : (
            <Text style={s.text}>No hay datos de reservas recientes</Text>
          )}
        </View>
      </ScrollView>

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
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  logo: { width: 64, height: 64, marginBottom: 6 },
  h1: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  h2: { color: "#E6F1F4", fontSize: 15, fontWeight: "600", marginTop: 4 },
  card: {
    width: 340,
    backgroundColor: "#fff",
    marginTop: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#0E3A46",
  },
  text: { textAlign: "center", color: "#666", marginTop: 10 },
  resumen: { marginTop: 16, gap: 6 },
  bold: { fontWeight: "600", color: "#0E3A46" },
  bottomLeft: {
    position: "absolute",
    bottom: 0,
    left: -10,
    width: 90,
    height: 80,
    backgroundColor: "#0E3A46",
    borderTopRightRadius: 80,
  },
  bottomRight: {
    position: "absolute",
    bottom: 0,
    right: -10,
    width: 90,
    height: 80,
    backgroundColor: "#0E3A46",
    borderTopLeftRadius: 80,
  },
});
