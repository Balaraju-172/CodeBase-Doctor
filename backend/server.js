import 'dotenv/config';
import express from 'express';


import dashboardRoutes from './src/routes/dashboard.routes.js';
import repositoryRoutes from './src/routes/repository.routes.js';

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3001;

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/repositories', repositoryRoutes);

app.listen(port, () => {
  console.log(`AI Codebase Doctor backend listening on port ${port}`);
});
