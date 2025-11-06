import React, { useState, useEffect } from 'react'
import { 
  Activity,
  Heart,
  Thermometer,
  Zap,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  Download,
  Share,
  RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface WearableDevice {
  id: string
  patientId: string
  patientName: string
  deviceType: string
  brand: string
  model: string
  batteryLevel: number
  connectionStatus: 'connected' | 'disconnected' | 'low_battery' | 'error'
  lastSync: string
  dataTypes: string[]
  alerts: WearableAlert[]
}

interface WearableAlert {
  id: string
  type: 'seizure_detected' | 'heart_rate_high' | 'low_battery' | 'disconnection' | 'temperature_high'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  message: string
  acknowledged: boolean
}

interface RealTimeData {
  heartRate: number
  oxygenSaturation: number
  movement: number
  temperature: number
  stressLevel: number
  sleepQuality: number
  seizureRisk: number
}

interface WearableMonitoringProps {
  className?: string
}

const WearableMonitoring: React.FC<WearableMonitoringProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [devices, setDevices] = useState<WearableDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    if (user) {
      loadDevices()
    }
    if (isMonitoring) {
      startRealTimeMonitoring()
    }
    return () => {
      if (isMonitoring) {
        stopRealTimeMonitoring()
      }
    }
  }, [user, isMonitoring])

  const loadDevices = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Buscar dispositivos wearables do Supabase
      const { data: devicesData, error: devicesError } = await supabase
        .from('wearable_devices')
        .select('*')
        .order('last_sync', { ascending: false })

      if (devicesError) {
        console.error('Erro ao carregar dispositivos:', devicesError)
        throw devicesError
      }

      // Buscar informações dos pacientes
      const patientIds = [...new Set((devicesData || []).map((d: any) => d.patient_id))]
      let patientsMap = new Map()
      if (patientIds.length > 0) {
        const { data: patientsData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', patientIds)

        patientsMap = new Map((patientsData || []).map((p: any) => [p.id, p]))
      }

      // Buscar dados mais recentes de cada dispositivo
      const devicesWithData = await Promise.all(
        (devicesData || []).map(async (device: any) => {
          const { data: latestData } = await supabase
            .from('wearable_data')
            .select('*')
            .eq('device_id', device.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single()

          return { device, latestData }
        })
      )

      // Transformar dispositivos para o formato esperado
      const formattedDevices: WearableDevice[] = devicesWithData.map(({ device, latestData }) => {
        const patient = patientsMap.get(device.patient_id)
        const connectionStatus = device.connection_status === 'connected' 
          ? (device.battery_level < 20 ? 'low_battery' : 'connected')
          : device.connection_status as 'connected' | 'disconnected' | 'low_battery' | 'error'

        return {
          id: device.id,
          patientId: device.patient_id,
          patientName: patient?.name || 'Paciente',
          deviceType: device.device_type,
          brand: device.brand || '',
          model: device.model || '',
          batteryLevel: device.battery_level || 100,
          connectionStatus,
          lastSync: device.last_sync || device.created_at,
          dataTypes: device.data_types || [],
          alerts: [] // TODO: Implementar sistema de alertas
        }
      })

      setDevices(formattedDevices)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null)

  const startRealTimeMonitoring = async () => {
    if (!selectedDevice) return

    // Buscar dados mais recentes do dispositivo
    const fetchLatestData = async () => {
      try {
        const { data: latestData } = await supabase
          .from('wearable_data')
          .select('*')
          .eq('device_id', selectedDevice)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        if (latestData) {
          // Agrupar dados por tipo
          const dataMap: { [key: string]: number } = {}
          const { data: recentData } = await supabase
            .from('wearable_data')
            .select('*')
            .eq('device_id', selectedDevice)
            .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos

          recentData?.forEach((d: any) => {
            if (d.data_type === 'heart_rate') dataMap.heartRate = d.value
            if (d.data_type === 'oxygen_saturation') dataMap.oxygenSaturation = d.value
            if (d.data_type === 'movement') dataMap.movement = d.value
            if (d.data_type === 'temperature') dataMap.temperature = d.value
          })

          setRealTimeData({
            heartRate: dataMap.heartRate || 78,
            oxygenSaturation: dataMap.oxygenSaturation || 98,
            movement: dataMap.movement || 2.3,
            temperature: dataMap.temperature || 36.8,
            stressLevel: 25, // TODO: Calcular a partir de dados reais
            sleepQuality: 85, // TODO: Calcular a partir de dados reais
            seizureRisk: 15 // TODO: Calcular a partir de dados reais
          })
        }
      } catch (error) {
        console.error('Erro ao buscar dados em tempo real:', error)
      }
    }

    // Buscar dados imediatamente
    await fetchLatestData()

    // Configurar intervalo para atualizar a cada 5 segundos
    const interval = setInterval(fetchLatestData, 5000)
    setMonitoringInterval(interval)
  }

  const stopRealTimeMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      setMonitoringInterval(null)
    }
    setRealTimeData(null)
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400'
      case 'disconnected': return 'text-red-400'
      case 'low_battery': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4" />
      case 'disconnected': return <WifiOff className="w-4 h-4" />
      case 'low_battery': return <BatteryLow className="w-4 h-4" />
      case 'error': return <AlertTriangle className="w-4 h-4" />
      default: return <WifiOff className="w-4 h-4" />
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 70) return 'text-green-400'
    if (level > 30) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBatteryIcon = (level: number) => {
    if (level > 70) return <Battery className="w-4 h-4" />
    if (level > 30) return <BatteryLow className="w-4 h-4" />
    return <BatteryLow className="w-4 h-4" />
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500/20 text-blue-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'critical': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const selectedDeviceData = devices.find(d => d.id === selectedDevice)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-cyan-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Activity className="w-6 h-6" />
              <span>Monitoramento Wearables</span>
            </h2>
            <p className="text-blue-200">
              Dispositivos conectados para monitoramento neurológico em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                isMonitoring 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isMonitoring ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Parar Monitoramento</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Iniciar Monitoramento</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Dispositivos Conectados</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {devices.filter(d => d.connectionStatus === 'connected').length}
            </p>
          </div>
          <div className="bg-blue-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Alertas Ativos</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {devices.reduce((acc, device) => acc + device.alerts.filter(a => !a.acknowledged).length, 0)}
            </p>
          </div>
          <div className="bg-blue-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Monitoramento</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {isMonitoring ? 'ATIVO' : 'INATIVO'}
            </p>
          </div>
          <div className="bg-blue-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-sm">Última Sincronização</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-white">
              {devices.length > 0 ? new Date(devices[0].lastSync).toLocaleTimeString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Dispositivos */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Dispositivos Conectados</h3>
            <div className="space-y-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDevice(device.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedDevice === device.id ? 'bg-slate-700' : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`${getConnectionStatusColor(device.connectionStatus)}`}>
                        {getConnectionStatusIcon(device.connectionStatus)}
                      </div>
                      <span className="text-white font-semibold text-sm">{device.patientName}</span>
                    </div>
                    <div className={`${getBatteryColor(device.batteryLevel)}`}>
                      {getBatteryIcon(device.batteryLevel)}
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">{device.brand} {device.model}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">
                      {device.batteryLevel}% bateria
                    </span>
                    {device.alerts.filter(a => !a.acknowledged).length > 0 && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        {device.alerts.filter(a => !a.acknowledged).length} alertas
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dados em Tempo Real */}
        <div className="lg:col-span-2">
          {selectedDeviceData ? (
            <div className="space-y-4">
              {/* Informações do Dispositivo */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{selectedDeviceData.patientName}</h3>
                    <p className="text-slate-400 text-sm">{selectedDeviceData.brand} {selectedDeviceData.model}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`${getConnectionStatusColor(selectedDeviceData.connectionStatus)}`}>
                      {getConnectionStatusIcon(selectedDeviceData.connectionStatus)}
                    </div>
                    <span className={`text-sm ${getConnectionStatusColor(selectedDeviceData.connectionStatus)}`}>
                      {selectedDeviceData.connectionStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <p className="text-white font-semibold">{realTimeData?.heartRate.toFixed(0) || '--'} bpm</p>
                    <p className="text-slate-400 text-xs">Frequência Cardíaca</p>
                  </div>
                  <div className="text-center">
                    <Activity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-white font-semibold">{realTimeData?.oxygenSaturation.toFixed(0) || '--'}%</p>
                    <p className="text-slate-400 text-xs">Saturação O2</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-semibold">{realTimeData?.movement.toFixed(1) || '--'}</p>
                    <p className="text-slate-400 text-xs">Movimento</p>
                  </div>
                  <div className="text-center">
                    <Thermometer className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-white font-semibold">{realTimeData?.temperature.toFixed(1) || '--'}°C</p>
                    <p className="text-slate-400 text-xs">Temperatura</p>
                  </div>
                </div>
              </div>

              {/* Métricas Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">Nível de Estresse</h4>
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{realTimeData?.stressLevel.toFixed(0) || '--'}%</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${realTimeData?.stressLevel || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">Qualidade do Sono</h4>
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{realTimeData?.sleepQuality.toFixed(0) || '--'}%</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${realTimeData?.sleepQuality || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">Risco de Crise</h4>
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{realTimeData?.seizureRisk.toFixed(0) || '--'}%</p>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (realTimeData?.seizureRisk || 0) > 70 ? 'bg-red-500' : 
                        (realTimeData?.seizureRisk || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${realTimeData?.seizureRisk || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {selectedDeviceData.alerts.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">Alertas Recentes</h4>
                  <div className="space-y-2">
                    {selectedDeviceData.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getAlertSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-slate-300 text-sm">{alert.message}</span>
                        </div>
                        <span className="text-slate-400 text-xs">
                          {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Selecione um Dispositivo</h3>
              <p className="text-slate-400">Escolha um dispositivo da lista para visualizar os dados em tempo real</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WearableMonitoring
