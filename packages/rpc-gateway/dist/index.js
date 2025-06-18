import express from 'express';
import cors from 'cors';
import { WebSocketService } from './services/websocket.js';
import { RPCService } from './services/rpc.js';
import { AuthService } from './services/auth.js';
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Initialize services
const rpcService = new RPCService();
const authService = new AuthService();
const wsService = new WebSocketService(rpcService, authService);
// HTTP API endpoints
app.get('/health', (req, res) => {
    const serviceStatus = rpcService.getServiceStatus();
    res.json({
        status: 'healthy',
        service: 'rpc-gateway',
        services: serviceStatus,
        timestamp: Date.now(),
    });
});
app.get('/services', (req, res) => {
    const serviceStatus = rpcService.getServiceStatus();
    res.json({
        success: true,
        data: serviceStatus,
    });
});
// Broadcast endpoint for service notifications
app.post('/broadcast', (req, res) => {
    const { event, data } = req.body;
    wsService.broadcast(event, data);
    res.json({ success: true, message: 'Event broadcasted' });
});
// Start health check interval
setInterval(() => {
    rpcService.healthCheck();
}, 30000); // Every 30 seconds
app.listen(port, () => {
    console.log(`RPC Gateway running on port ${port}`);
    console.log(`WebSocket server running on port ${process.env.WS_PORT || '8081'}`);
});
export { WebSocketService, RPCService, AuthService };
