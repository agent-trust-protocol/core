import express from 'express';
import cors from 'cors';
import { StorageService } from './services/storage.js';
import { CredentialService } from './services/credential.js';
import { CredentialController } from './controllers/credential.js';
const app = express();
const port = process.env.PORT || 3002;
app.use(cors());
app.use(express.json());
const storage = new StorageService(process.env.DB_PATH);
const credentialService = new CredentialService(storage);
const credentialController = new CredentialController(credentialService);
app.post('/vc/issue', (req, res) => credentialController.issue(req, res));
app.post('/vc/verify', (req, res) => credentialController.verify(req, res));
app.post('/vc/revoke/:credentialId', (req, res) => credentialController.revoke(req, res));
app.post('/vc/schemas', (req, res) => credentialController.registerSchema(req, res));
app.get('/vc/schemas/:schemaId', (req, res) => credentialController.getSchema(req, res));
app.get('/vc/schemas', (req, res) => credentialController.listSchemas(req, res));
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'vc-service' });
});
app.listen(port, () => {
    console.log(`VC Service running on port ${port}`);
});
export { StorageService, CredentialService, CredentialController };
