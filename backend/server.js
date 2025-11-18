import express from "express";
import cors from "cors";
import servicios from "./src/admin/servicios.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/servicios", servicios);

const PORT = 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor corriendo en http://localhost:${PORT}`));