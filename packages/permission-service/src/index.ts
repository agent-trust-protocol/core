import express from 'express';
import cors from 'cors';
import { StorageService } from './services/storage.js';
import { PermissionService } from './services/permission.js';
import { PermissionController } from './controllers/permission.js';

const app = express();
const port = process.env.PORT || 3003;
const secretKey = process.env.JWT_SECRET || 'atp-default-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const storage = new StorageService(process.env.DB_PATH);
const permissionService = new PermissionService(storage, secretKey);
const permissionController = new PermissionController(permissionService);

// Initialize with default policy rules
permissionService.loadPolicyRules().then(() => {
  console.log('Policy rules loaded');
});

app.post('/perm/grant', (req, res) => permissionController.grant(req, res));
app.post('/perm/check', (req, res) => permissionController.check(req, res));
app.post('/perm/validate', (req, res) => permissionController.validateToken(req, res));
app.get('/perm/list/:did', (req, res) => permissionController.list(req, res));
app.delete('/perm/revoke/:grantId', (req, res) => permissionController.revoke(req, res));

app.post('/perm/policy/rules', (req, res) => permissionController.addPolicyRule(req, res));
app.delete('/perm/policy/rules/:ruleId', (req, res) => permissionController.removePolicyRule(req, res));
app.get('/perm/policy/rules', (req, res) => permissionController.listPolicyRules(req, res));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'permission-service' });
});

app.listen(port, () => {
  console.log(`Permission Service running on port ${port}`);
});

export { StorageService, PermissionService, PermissionController };