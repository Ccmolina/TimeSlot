import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, Platform, TouchableOpacity, Modal, FlatList, Pressable
} from "react-native";
import { router } from "expo-router";
import { useReservas } from "../store/reservas";

const AREAS = ["Gastroenterología", "Clínica Médica", "Cardiología", "Dermatología"];
const PROFES = [
  "JENSEN, María Virginia",
  "GARCÍA, Pablo",
  "SILVA, Andrea",
  "RODRÍGUEZ, Juan",
];

export default function NuevaReserva() {
  const add = useReservas((s) => s.add);

  const [area, setArea] = useState<string>("");
  const [profesional, setProfesional] = useState<string>("");
  const [fechaISO, setFechaISO] = useState<string>(toISO(new Date()));
  const [hora, setHora] = useState<string>("08:00");

  const [openArea, setOpenArea] = useState(false);
  const [openPro, setOpenPro] = useState(false);
  const [openFecha, setOpenFecha] = useState(false);
  const [openHora, setOpenHora] = useState(false);

  const diasMes = useMemo(() => buildMonthDays(new Date(fechaISO)), [fechaISO]);

  const crear = () => {
    if (!area || !profesional || !fechaISO || !hora) {
      return alert("Completa todos los campos");
    }
    add({ area, profesional, fechaISO, hora, modalidad: "Presencial" });
    router.replace("/home");
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.h1}>Crea Tu</Text>
        <Text style={s.hBig}>RESERVA</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        {/* Select Area */}
        <Text style={s.label}>Area</Text>
        <Pressable style={s.select} onPress={() => setOpenArea(true)}>
          <Text style={s.selectText}>{area || "Selecciona un área"}</Text>
          <Text style={s.caret}>▾</Text>
        </Pressable>

        {/* Select Profesional */}
        <Text style={[s.label, { marginTop: 14 }]}>Profesional</Text>
        <Pressable style={s.select} onPress={() => setOpenPro(true)}>
          <Text style={s.selectText}>{profesional || "Selecciona un profesional"}</Text>
          <Text style={s.caret}>▾</Text>
        </Pressable>

        {/* Calendario minimal */}
        <Text style={[s.label, { marginTop: 14 }]}>Fecha</Text>
        <View style={s.calendar}>
          <View style={s.calHead}>
            <TouchableOpacity onPress={() => setFechaISO(toISO(addMonths(new Date(fechaISO), -1)))}>
              <Text style={s.arrow}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{formatMonthYear(new Date(fechaISO))}</Text>
            <TouchableOpacity onPress={() => setFechaISO(toISO(addMonths(new Date(fechaISO), 1)))}>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={s.weekRow}>
            {["D","L","M","M","J","V","S"].map((d) => (
              <Text key={d} style={s.weekDay}>{d}</Text>
            ))}
          </View>

          <View style={s.daysGrid}>
            {diasMes.map((d) => (
              <TouchableOpacity
                key={d.key}
                disabled={!d.day}
                style={[
                  s.dayCell,
                  d.iso === fechaISO && d.day ? s.daySelected : null,
                  !d.day ? { opacity: 0 } : null,
                ]}
                onPress={() => setFechaISO(d.iso!)}
              >
                <Text style={[s.dayText, d.iso === fechaISO ? { color: "#fff", fontWeight: "800" } : null]}>
                  {d.day || ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hora */}
        <Text style={[s.label, { marginTop: 14 }]}>Hora</Text>
        <Pressable style={s.select} onPress={() => setOpenHora(true)}>
          <Text style={s.selectText}>{hora}</Text>
          <Text style={s.caret}>▾</Text>
        </Pressable>

        <TouchableOpacity style={s.primaryBtn} onPress={crear}>
          <Text style={s.primaryBtnText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {/* MODALES */}
      <SimplePicker
        visible={openArea}
        title="Selecciona un área"
        items={AREAS}
        onClose={() => setOpenArea(false)}
        onPick={setArea}
      />
      <SimplePicker
        visible={openPro}
        title="Selecciona un profesional"
        items={PROFES}
        onClose={() => setOpenPro(false)}
        onPick={setProfesional}
      />
      <SimplePicker
        visible={openHora}
        title="Selecciona la hora"
        items={["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00"]}
        onClose={() => setOpenHora(false)}
        onPick={setHora}
      />
    </View>
  );
}

/* ---------- Helpers UI ---------- */
function SimplePicker({
  visible, title, items, onClose, onPick,
}: { visible: boolean; title: string; items: string[]; onClose: () => void; onPick: (v: string) => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose}>
        <View style={modalStyles.sheet}>
          <Text style={modalStyles.title}>{title}</Text>
          <FlatList
            data={items}
            keyExtractor={(x) => x}
            renderItem={({ item }) => (
              <TouchableOpacity style={modalStyles.item} onPress={() => { onPick(item); onClose(); }}>
                <Text style={modalStyles.itemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

/* ---------- Fechas helpers ---------- */
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatMonthYear(d: Date) {
  const meses = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}
function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}
function buildMonthDays(base: Date) {
  // primer día del mes
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const offset = first.getDay(); // 0..6
  const total = last.getDate();  // 28..31
  const cells = Array.from({ length: offset }).map((_, i) => ({ key: `e${i}`, day: 0, iso: undefined as string | undefined }));
  for (let d = 1; d <= total; d++) {
    const iso = toISO(new Date(base.getFullYear(), base.getMonth(), d));
    cells.push({ key: `d${d}`, day: d, iso });
  }
  // completar a múltiplos de 7
  while (cells.length % 7 !== 0) cells.push({ key: `z${cells.length}`, day: 0, iso: undefined });
  return cells;
}

/* ---------- Styles ---------- */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#0E3A46",
    width: "100%",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  h1: {
    color: "#E6F1F4",
    fontSize: 20,
    fontWeight: "700",
    fontFamily: Platform.select({ ios: "Times New Roman", android: "serif", default: "serif" }),
  },
  hBig: { color: "#0E3A46", backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 2, borderRadius: 6, marginTop: 8, fontSize: 32, fontWeight: "800" },

  label: { color: "#0E3A46", fontWeight: "700", marginBottom: 6, marginTop: 6 },
  select: {
    height: 44, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB",
    borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  selectText: { color: "#111827" },
  caret: { color: "#6B7280", fontSize: 16 },

  calendar: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
  calHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  monthLabel: { color: "#0E3A46", fontWeight: "800" },
  arrow: { color: "#0E3A46", fontSize: 20, paddingHorizontal: 6 },

  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  weekDay: { width: `${100 / 7}%`, textAlign: "center", color: "#6B7280", fontSize: 12 },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 3,
  },
  daySelected: { backgroundColor: "#0E3A46" },
  dayText: { color: "#0E3A46", fontWeight: "600" },

  primaryBtn: {
    backgroundColor: "#0E3A46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  sheet: { width: "86%", maxHeight: "70%", backgroundColor: "#fff", borderRadius: 12, padding: 14 },
  title: { color: "#0E3A46", fontWeight: "800", fontSize: 16, marginBottom: 8, textAlign: "center" },
  item: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  itemText: { color: "#111827" },
});
