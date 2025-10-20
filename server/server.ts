import express from "express";
import dotenv from "dotenv";
import usuarioRouter from "./src/routes/usuario.routes";
import alimentoRouter from "./src/routes/alimento.routes";
import campanhaRouter from "./src/routes/campanhas.routes";
import doacaoRouter from "./src/routes/doacao.routes";
import localidadeRouter from "./config/routes/localidade.router";
import cors from "cors";
import chatRouter from "./src/routes/chat.routes";

dotenv.config({ path: "../.env" });

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Express routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", usuarioRouter);
app.use("/api", alimentoRouter);
app.use("/api", campanhaRouter);
app.use("/api", doacaoRouter);
app.use("/api", localidadeRouter);
app.use("/api", chatRouter);

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
