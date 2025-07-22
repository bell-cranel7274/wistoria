import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Loader2,
  Circle
} from 'lucide-react';
import { getStatusColor } from '../../utils/homelabConstants';

export const StatusBadge = ({ 
  status, 
  type = 'service', 
  size = 'sm', 
  showText = true,
  className = '' 
}) => {
  const colors = getStatusColor(status, type);
  
  const getIcon = () => {
    switch (status) {
      case 'running':
      case 'online':
        return <CheckCircle className="w-3 h-3" />;
      case 'stopped':
      case 'offline':
        return <XCircle className="w-3 h-3" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'restarting':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${colors.text} ${colors.bg} ${colors.border} border
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {getIcon()}
      {showText && (
        <span className="capitalize">
          {status.replace('_', ' ')}
        </span>
      )}
    </span>
  );
};

export const ServiceCard = ({ 
  service, 
  metrics, 
  onAction, 
  actionLoading,
  className = '' 
}) => {
  const isLoading = actionLoading[service.id];

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
      p-4 hover:shadow-md transition-all duration-200
      ${className}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {service.description || `Port ${service.port}`}
          </p>
        </div>
        <StatusBadge status={service.status} />
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            CPU: <span className="font-medium">{metrics.cpu}%</span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Memory: <span className="font-medium">{metrics.memory}MB</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {service.status === 'running' && (
          <>
            <button
              onClick={() => onAction && onAction(service.id, 'restart')}
              disabled={isLoading}
              className="
                flex-1 px-3 py-1.5 text-xs font-medium rounded
                bg-yellow-100 text-yellow-700 hover:bg-yellow-200
                dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              {isLoading === 'restart' ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
              ) : (
                'Restart'
              )}
            </button>
            <button
              onClick={() => onAction && onAction(service.id, 'stop')}
              disabled={isLoading}
              className="
                flex-1 px-3 py-1.5 text-xs font-medium rounded
                bg-red-100 text-red-700 hover:bg-red-200
                dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              {isLoading === 'stop' ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
              ) : (
                'Stop'
              )}
            </button>
          </>
        )}
        
        {service.status === 'stopped' && (
          <button
            onClick={() => onAction && onAction(service.id, 'start')}
            disabled={isLoading}
            className="
              w-full px-3 py-1.5 text-xs font-medium rounded
              bg-green-100 text-green-700 hover:bg-green-200
              dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {isLoading === 'start' ? (
              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
            ) : (
              'Start'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  status = 'normal',
  icon: Icon,
  className = '' 
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10';
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10';
      case 'good':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  return (
    <div className={`
      rounded-lg border p-4 ${getStatusColors()}
      ${className}
    `}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {unit}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {trend}
        </div>
      )}
    </div>
  );
};

export const DeviceList = ({ 
  devices, 
  onDeviceClick,
  showActions = false,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {devices.map((device) => (
        <div
          key={device.id}
          className={`
            flex items-center justify-between p-3 rounded-lg border
            border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
            ${onDeviceClick ? 'cursor-pointer hover:shadow-sm' : ''}
            transition-all duration-200
          `}
          onClick={() => onDeviceClick && onDeviceClick(device)}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-2 h-2 rounded-full
              ${getStatusColor(device.status, 'device').dot}
            `} />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {device.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {device.ip}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {device.ping && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {device.ping}ms
              </span>
            )}
            <StatusBadge 
              status={device.status} 
              type="device" 
              size="sm"
              showText={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const LoadingSpinner = ({ 
  size = 'md', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-gray-400`} />
      {text && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
};

export const ErrorMessage = ({ 
  error, 
  onRetry,
  className = '' 
}) => {
  return (
    <div className={`
      bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800
      rounded-lg p-4 ${className}
    `}>
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-red-800 dark:text-red-400">
            Error
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="
                mt-2 text-sm font-medium text-red-800 dark:text-red-400
                hover:text-red-900 dark:hover:text-red-300
                underline focus:outline-none
              "
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConnectionStatus = ({ 
  status, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          text: 'Connected'
        };
      case 'disconnected':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: XCircle,
          text: 'Disconnected'
        };
      case 'mock':
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertTriangle,
          text: 'Mock Mode'
        };
      case 'error':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: XCircle,
          text: 'Connection Error'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
      ${config.color} ${config.bg} ${config.border}
      text-sm font-medium
      ${className}
    `}>
      <Icon className="w-3 h-3" />
      <span>{config.text}</span>
    </div>
  );
};
