import express, { Request, Response } from "express";
import { fetchEstadosCidades } from "./config/IbgeApi";
import dotenv from "dotenv";
import usuarioRouter from "./src/routes/usuario.routes";
import alimentoRouter from "./src/routes/alimento.routes";
import campanhaRouter from "./src/routes/campanhas.routes";
dotenv.config({ path: "../.env" });
const app = express();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

interface IAlimentoInsert {
  _id: string;
  qt_alimento_meta: number;
}

interface IAlimentoDoacao {
  _id: string;
  qt_alimento_doacao: number;
}

// Função para inserir alimentos em campanhas
const insertAlimentosCampanha = async (
  cdCampanha: string,
  alimentos: IAlimentoInsert[]
) => {
  const alimentosCampanha = alimentos.map((alimento) => ({
    alimento_id: alimento._id,
    campanha_id: cdCampanha,
    qt_alimento_meta: alimento.qt_alimento_meta,
  }));

  const result = await prisma.alimento_campanha.create({
    data: alimentosCampanha,
  });
  return result;
};

const insertAlimentosDoacao = async (
  cdCampanha: string,
  cdUsuario: string,
  alimentos: IAlimentoDoacao[]
) => {
  const alimentosDoacao = alimentos.map((alimento) => ({
    usuario_id: cdUsuario,
    alimento_id: alimento._id,
    campanha_id: cdCampanha,
    qt_alimento_doado: alimento.qt_alimento_doacao,
  }));

  const result = await prisma.alimento_doacao.createMany({
    data: alimentosDoacao,
  });
  return result;
};

// Express routes

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", [usuarioRouter, alimentoRouter, campanhaRouter]);

// app.get("/api/campanhas/:id?", async (req: Request, res: Response) => {
//   const id = req.params.id || null;
//   const campanhasResponse = await campanhas(id);
//   res.json(campanhasResponse);
// });

// app.get("/api/alimentos", async (req: Request, res: Response) => {
//   const alimentosResponse = await alimentos();
//   res.json(alimentosResponse);
// });

// app.get("/api/alimentosDoados", async (req: Request, res: Response) => {
//   const alimentosResponse = await alimentosDoados();
//   res.json(alimentosResponse);
// });

// app.get("/api/usuarios", async (req: Request, res: Response) => {
//   const usuariosResponse = await usuarios();
//   res.json(usuariosResponse);
// });

app.get("/api/estadosCidades", async (req: Request, res: Response) => {
  const estadosCidades = await fetchEstadosCidades();
  res.json(estadosCidades);
});

// app.post("/api/campanhas", async (req: Request, res: Response) => {
//   const { infos_campanha, alimentos_campanha } = req.body;
//   const campanhaData = {
//     usuario_id: infos_campanha.usuario_id,
//     nm_titulo_campanha: infos_campanha.nm_titulo_campanha,
//     dt_encerramento_campanha: new Date(infos_campanha.dt_encerramento_campanha),
//     nm_cidade_campanha: infos_campanha.nm_cidade_campanha,
//     sg_estado_campanha: infos_campanha.sg_estado_campanha,
//     ds_acao_campanha: infos_campanha.ds_acao_campanha,
//     cd_imagem_campanha: infos_campanha.cd_imagem_campanha,
//     fg_campanha_ativa: infos_campanha.fg_campanha_ativa,
//   };

//   try {
//     const campanhaInserida = await prisma.campanha.create({
//       data: campanhaData,
//     });
//     const campanhaId = campanhaInserida.id;
//     let alimentosToInsert;
//     let alimentosResponse;
//     let inserted;

//     // Verifica se alimentos_campanha é um array, caso contrário, transforma em array
//     const alimentosArray = Array.isArray(alimentos_campanha)
//       ? alimentos_campanha
//       : [alimentos_campanha];

//     // Se só tem um alimento, cadastra com insertOne, se tem mais de um, cadastra com insertMany
//     if (alimentosArray.length === 1) {
//       const alimento = alimentosArray[0];
//       alimentosToInsert = {
//         alimento_id: alimento.id,
//         campanha_id: campanhaId,
//         qt_alimento_meta: alimento.qt_alimento_meta,
//       };
//       alimentosResponse = await prisma.alimento_campanha.createMany({
//         data: alimentosToInsert,
//       });
//       inserted = 1;
//     } else {
//       alimentosToInsert = alimentosArray.map(
//         (alimento: { id: any; qt_alimento_meta: any }) => ({
//           alimento_id: alimento.id,
//           campanha_id: campanhaId,
//           qt_alimento_meta: alimento.qt_alimento_meta,
//         })
//       );
//       alimentosResponse = await prisma.alimento_campanha.createMany({
//         data: alimentosToInsert,
//       });
//       inserted = alimentosResponse.insertedCount;
//     }

//     res.json({ campanhaId, alimentosInserted: inserted });
//   } catch (error) {
//     console.error("Error while inserting campanha:", error);
//     res.status(500).json({ message: "Error while inserting campanha" });
//   }
// });

app.post("/api/doacoes", async (req: Request, res: Response) => {
  const { infos_doacao, alimentos_doacao } = req.body;
  if (
    !alimentos_doacao ||
    (Array.isArray(alimentos_doacao) && alimentos_doacao.length === 0)
  ) {
    console.log("Doação vazia.");
    return;
  }
  try {
    const alimentosToInsert = alimentos_doacao.map((alimento: any) => ({
      usuario_id: infos_doacao.usuario_doacao,
      alimento_id: alimento.alimento_id,
      campanha_id: infos_doacao.cd_campanha_doacao,
      qt_alimento_doado: alimento.qt_alimento_doacao,
    }));

    const response = await prisma.alimento_doacao.createMany({
      data: alimentosToInsert,
    });

    for (const alimento of alimentos_doacao) {
      if (!alimento || !alimento.alimento_id) {
        console.error(`Alimento inválido: ${JSON.stringify(alimento)}`);
        continue; // Ignora alimentos inválidos
      }

      if (
        typeof alimento.qt_alimento_doacao !== "number" ||
        isNaN(alimento.qt_alimento_doacao)
      ) {
        console.error(
          `Quantidade inválida de alimento ${alimento._id}: ${alimento.qt_alimento_doado}`
        );
        continue; // Ignora doações com quantidade inválida
      }
    }

    res.json({ insertedCount: response.insertedCount });
  } catch (error) {
    console.error("Error while processing doacoes:", error);
    res.status(500).json({ message: "Error while processing doacoes" });
  }
});

// app.post("/api/usuarioCadastro", async (req: Request, res: Response) => {
//   const userInfos = req.body.user_infos;

//   try {
//     const hashedPassword = await bcrypt.hash(userInfos.cd_senha_usuario, salt);
//     userInfos.cd_senha_usuario = hashedPassword;
//     const userResponse = await prisma.usuario.create({
//       data: userInfos,
//     });

//     // Como não existe mais o 'ops', utilize o insertedId
//     res.json({ _id: userResponse.insertedId, ...userInfos });
//   } catch (err) {
//     console.error("Error while registering user:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/api/usuarioLogin", async (req: Request, res: Response) => {
//   const { user_email, user_password } = req.body;

//   try {
//     const userResponse = await prisma.usuario.findFirst({
//       where: {
//         cd_email_usuario: user_email,
//       },
//     });

//     if (!userResponse) {
//       return res.status(400).json({
//         user: null,
//         authenticated: false,
//         message: "Email ou senha inválidos",
//       });
//     }

//     const hashPasswordDB = userResponse.cd_senha_usuario;

//     if (user_password && hashPasswordDB) {
//       const compare = await bcrypt.compare(user_password, hashPasswordDB);

//       if (compare) {
//         return res.status(200).json({
//           user: userResponse,
//           authenticated: true,
//           message: "Usuário autenticado",
//         });
//       } else {
//         return res.status(400).json({
//           user: null,
//           authenticated: false,
//           message: "Email ou senha inválidos",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         user: null,
//         authenticated: false,
//         message: "Erro ao resgatar dados",
//       });
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

export {};
