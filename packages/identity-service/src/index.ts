import express from 'express';
import cors from 'cors';
import { StorageService } from './services/storage.js';
import { IdentityService } from './services/identity.js';
import { IdentityController } from './controllers/identity.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = new StorageService(process.env.DB_PATH);
const identityService = new IdentityService(storage);
const identityController = new IdentityController(identityService);

app.post('/identity/register', (req, res) => identityController.register(req, res));
app.get('/identity/:did', (req, res) => identityController.resolve(req, res));
app.get('/identity/:did/document', (req, res) => identityController.getDocument(req, res));
app.post('/identity/:did/rotate-keys', (req, res) => identityController.rotateKeys(req, res));
app.get('/identity', (req, res) => identityController.list(req, res));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'identity-service' });
});

app.listen(port, () => {
  console.log(`Identity Service running on port ${port}`);
});

export { StorageService, IdentityService, IdentityController };