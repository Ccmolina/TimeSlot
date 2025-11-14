import { create, type StateCreator } from "zustand";

export type Reserva = {
  id: string;
  area: string;
  profesional: string;
  fechaISO: string;   
  hora: string;       
  modalidad?: "Presencial" | "Virtual";
};

type State = {
  reservas: Reserva[];
  add: (r: Omit<Reserva, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const creator: StateCreator<State> = (set) => ({
  reservas: [],
  add: (r) =>
    set((prev: State) => {
      const nueva: Reserva = { ...r, id: String(Date.now()) };
      const ordenadas = [...prev.reservas, nueva].sort((a, b) =>
        (a.fechaISO + a.hora).localeCompare(b.fechaISO + b.hora)
      );
      return { reservas: ordenadas };
    }),
  remove: (id: string) =>
    set((prev: State) => ({ reservas: prev.reservas.filter((x) => x.id !== id) })),
  clear: () => set({ reservas: [] })
});

export const useReservas = create<State>(creator);
