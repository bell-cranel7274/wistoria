# Homelab API Server Specification

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
All API endpoints require authentication via API key in header:
```
Authorization: Bearer YOUR_API_KEY
```

## Core Endpoints

### System Information

#### GET /system/health
Health check endpoint for API server status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-05T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400
}
```

#### GET /system/metrics
Current system metrics for the homelab server.

**Response:**
```json
{
  "cpu": {
    "percentage": 45.2,
    "temperature": 62.5,
    "cores": 8,
    "load_average": [1.2, 1.1, 0.9]
  },
  "memory": {
    "used": 8589934592,
    "total": 17179869184,
    "percentage": 50.0,
    "available": 8589934592
  },
  "network": {
    "interfaces": [
      {
        "name": "eth0",
        "rx_bytes": 1024000000,
        "tx_bytes": 512000000,
        "speed": "1000Mbps"
      }
    ],
    "latency": 18
  },
  "power": {
    "consumption": 180,
    "efficiency": 92
  },
  "uptime": 1382400
}
```

### Service Management

#### GET /services
List all managed services.

**Response:**
```json
{
  "services": [
    {
      "id": "docker",
      "name": "Docker",
      "status": "running",
      "port": 2376,
      "category": "infrastructure",
      "description": "Container runtime platform",
      "metrics": {
        "cpu": 5.2,
        "memory": 256,
        "uptime": 86400
      }
    }
  ]
}
```

#### POST /services/{serviceId}/restart
Restart a specific service.

**Response:**
```json
{
  "success": true,
  "message": "Service restarted successfully",
  "service_id": "docker",
  "timestamp": "2025-06-05T10:30:00Z"
}
```

#### POST /services/{serviceId}/stop
Stop a specific service.

#### POST /services/{serviceId}/start
Start a specific service.

### Network Management

#### GET /network/devices
List all network devices.

**Response:**
```json
{
  "devices": [
    {
      "id": "router",
      "name": "Main Router",
      "ip": "192.168.1.1",
      "mac": "aa:bb:cc:dd:ee:ff",
      "status": "online",
      "ping": 1,
      "device_type": "router",
      "last_seen": "2025-06-05T10:30:00Z"
    }
  ]
}
```

#### POST /network/scan
Trigger network device discovery scan.

**Response:**
```json
{
  "success": true,
  "scan_id": "scan_123456",
  "estimated_duration": 30,
  "devices_found": 12
}
```

#### GET /network/traffic
Current network traffic statistics.

**Response:**
```json
{
  "download": 45.2,
  "upload": 12.8,
  "latency": 18,
  "timestamp": "2025-06-05T10:30:00Z"
}
```

### Storage Management

#### GET /storage/nas
NAS storage information.

**Response:**
```json
{
  "nas_devices": [
    {
      "id": "synology-main",
      "name": "Main NAS",
      "model": "DS920+",
      "status": "online",
      "volumes": [
        {
          "name": "Volume 1",
          "size_total": 8796093022208,
          "size_used": 4398046511104,
          "percentage_used": 50.0,
          "file_system": "btrfs"
        }
      ],
      "disks": [
        {
          "name": "Disk 1",
          "model": "WD Red Plus 4TB",
          "status": "healthy",
          "temperature": 35
        }
      ]
    }
  ]
}
```

### Docker Management

#### GET /docker/containers
List Docker containers.

**Response:**
```json
{
  "containers": [
    {
      "id": "abc123",
      "name": "plex",
      "image": "plexinc/pms-docker:latest",
      "status": "running",
      "ports": [
        {
          "private": 32400,
          "public": 32400,
          "type": "tcp"
        }
      ],
      "stats": {
        "cpu_percentage": 15.2,
        "memory_usage": 1073741824,
        "memory_limit": 4294967296,
        "network_rx": 1024000,
        "network_tx": 512000
      }
    }
  ]
}
```

#### POST /docker/containers/{containerId}/restart
Restart a Docker container.

### Home Automation

#### GET /automation/rules
List automation rules.

**Response:**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Evening Lights",
      "enabled": true,
      "trigger": {
        "type": "time",
        "time": "18:00",
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
      },
      "action": {
        "type": "device_control",
        "device_id": "living_room_lights",
        "command": "turn_on"
      },
      "last_executed": "2025-06-04T18:00:00Z"
    }
  ]
}
```

#### POST /automation/rules
Create new automation rule.

**Request Body:**
```json
{
  "name": "Morning Routine",
  "trigger": {
    "type": "time",
    "time": "07:00"
  },
  "action": {
    "type": "device_control",
    "device_id": "coffee_maker",
    "command": "start"
  }
}
```

#### PUT /automation/rules/{ruleId}/toggle
Enable/disable automation rule.

**Request Body:**
```json
{
  "enabled": true
}
```

### Security & Monitoring

#### GET /security/alerts
Current security alerts.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "severity": "medium",
      "type": "system",
      "message": "CPU usage high: 85%",
      "timestamp": "2025-06-05T10:25:00Z",
      "acknowledged": false
    }
  ]
}
```

#### GET /security/firewall
Firewall status and rules.

**Response:**
```json
{
  "status": "active",
  "default_policy": "deny",
  "rules": [
    {
      "id": "rule_001",
      "action": "allow",
      "source": "192.168.1.0/24",
      "destination": "any",
      "port": 22,
      "protocol": "tcp"
    }
  ]
}
```

## WebSocket Events

### Connection
```
ws://localhost:3001/ws?token=YOUR_API_KEY
```

### Real-time Events

#### System Metrics Update
```json
{
  "event": "system_metrics",
  "data": {
    "cpu": 45.2,
    "memory": 50.0,
    "timestamp": "2025-06-05T10:30:00Z"
  }
}
```

#### Service Status Change
```json
{
  "event": "service_status",
  "data": {
    "service_id": "docker",
    "status": "restarting",
    "timestamp": "2025-06-05T10:30:00Z"
  }
}
```

#### New Device Discovered
```json
{
  "event": "device_discovered",
  "data": {
    "device": {
      "id": "new_device_001",
      "name": "Smart Light",
      "ip": "192.168.1.150",
      "status": "online"
    }
  }
}
```

#### Security Alert
```json
{
  "event": "security_alert",
  "data": {
    "alert": {
      "id": "alert_002",
      "severity": "high",
      "message": "Unauthorized login attempt detected",
      "timestamp": "2025-06-05T10:30:00Z"
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": true,
  "code": "SERVICE_NOT_FOUND",
  "message": "Service with ID 'invalid_service' not found",
  "timestamp": "2025-06-05T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting
- 100 requests per minute per API key
- WebSocket connections: 5 per API key
- Burst limit: 20 requests in 10 seconds

## Pagination
For endpoints returning large datasets:

**Request:**
```
GET /api/v1/logs?page=2&limit=50
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 1000,
    "pages": 20,
    "has_next": true,
    "has_prev": true
  }
}
```

## Environment-Specific Endpoints

### Development
- Mock data responses
- Simulated delays
- Debug information included

### Production
- Real hardware integration
- Performance optimizations
- Security hardening

This API specification serves as the contract between your React frontend and the homelab API server, ensuring consistent communication and integration patterns.
