import express from "express";
import dotenv from "dotenv";
import usuarioRouter from "./src/routes/usuario.routes";
import alimentoRouter from "./src/routes/alimento.routes";
import campanhaRouter from "./src/routes/campanhas.routes";
import doacaoRouter from "./src/routes/doacao.routes";
import localidadeRouter from "./config/routes/localidade.router";
import cors from "cors";
import { PrismaClient } from "@prisma/client";


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

const prisma = new PrismaClient();


// Buscar nome do usuário pelo id
app.get('/api/usuario/nome/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });
  // Verifica se o id é um ObjectId válido (24 caracteres hex ou 12 bytes)
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({ error: 'id inválido' });
  }
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ nome: usuario.nm_usuario });
});

// Lista conversas do usuário (mock: userId via query)
app.get('/api/chat/conversations', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

  // Busca o usuário para saber se é admin
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

  let conversations = [];
  if (usuario.fg_admin === 1) {
    // Admin: vê todas as conversas
    conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  } else {
    // Usuário comum: só vê conversas em que participa
    conversations = await prisma.conversation.findMany({
      where: { users: { has: userId } },
      orderBy: { updatedAt: 'desc' },
    });
  }
  res.json(conversations);
});

// Cria nova conversa entre usuário e admin
app.post('/api/chat/conversations', async (req, res) => {
  const { userId, adminId } = req.body;
  if (!userId || !adminId) return res.status(400).json({ error: 'userId e adminId obrigatórios' });
  const conv = await prisma.conversation.create({
    data: {
      users: [userId, adminId],
      lastMessage: '',
      updatedAt: new Date(),
    },
  });
  res.json(conv);
});

// Lista mensagens de uma conversa (só se o usuário participa)
app.get('/api/chat/messages', async (req, res) => {
  const conversationId = req.query.conversationId as string;
  const userId = req.query.userId as string;
  if (!conversationId || !userId) return res.status(400).json({ error: 'conversationId e userId obrigatórios' });
  // Busca a conversa e verifica se o usuário participa ou é admin
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return res.status(404).json({ error: 'Conversa não encontrada' });
  // Busca o usuário
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
  // Permite acesso se for participante ou admin
  if (!conversation.users.includes(userId) && usuario.fg_admin !== 1) return res.status(403).json({ error: 'Acesso negado' });
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
});

// Envia mensagem
app.post('/api/chat/messages', async (req, res) => {
  const { conversationId, senderId, text } = req.body;
  if (!conversationId || !senderId || !text) return res.status(400).json({ error: 'Campos obrigatórios' });
  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      text,
      createdAt: new Date(),
    },
  });
  // Atualiza lastMessage na conversa
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: text, updatedAt: new Date() },
  });
  res.json(msg);
});

// Excluir conversa (chat) e suas mensagens
app.delete('/api/chat/conversations/:id', async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.query.userId as string;
  if (!conversationId || !userId) return res.status(400).json({ error: 'conversationId e userId obrigatórios' });

  // Verifica se o usuário é participante da conversa
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return res.status(404).json({ error: 'Conversa não encontrada' });
  if (!conversation.users.includes(userId)) return res.status(403).json({ error: 'Acesso negado' });

  // Exclui mensagens associadas
  await prisma.message.deleteMany({ where: { conversationId } });
  // Exclui a conversa
  await prisma.conversation.delete({ where: { id: conversationId } });
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
