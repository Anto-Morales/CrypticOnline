import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { createApiUrl, createAuthHeaders } from '../config/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export default function NotificacionesScreen() {
  const screenWidth = Dimensions.get('window').width;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = isDark ? '#222' : '#f5f5f5';
  const borderColor = isDark ? '#444' : '#ddd';

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('🔔 Obteniendo notificaciones...');
      const response = await fetch(createApiUrl('/api/notifications'), {
        method: 'GET',
        headers: createAuthHeaders(token),
      });

      console.log('📡 Respuesta notificaciones:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notificaciones obtenidas:', data.length || 0);
        setNotifications(data || []);
      } else {
        console.error('❌ Error en respuesta de notificaciones:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      console.log('📖 Marcando notificación como leída:', notificationId);
      const response = await fetch(createApiUrl(`/api/notifications/${notificationId}/read`), {
        method: 'PUT',
        headers: createAuthHeaders(token),
      });

      if (response.ok) {
        console.log('✅ Notificación marcada como leída');
        // Actualizar estado local
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif))
        );
      } else {
        console.error('❌ Error al marcar como leída:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      console.log('📖 Marcando todas las notificaciones como leídas...');
      const response = await fetch(createApiUrl('/api/notifications/mark-all-read'), {
        method: 'PUT',
        headers: createAuthHeaders(token),
      });

      if (response.ok) {
        console.log('✅ Todas las notificaciones marcadas como leídas');
        // Actualizar estado local
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      } else {
        console.error('❌ Error al marcar todas como leídas:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al marcar todas como leídas:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return '💳';
      case 'ORDER_STATUS':
        return '📦';
      case 'PROMOTION':
        return '🎉';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📄';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return '#4CAF50';
      case 'ORDER_STATUS':
        return '#2196F3';
      case 'PROMOTION':
        return '#FF9800';
      case 'SYSTEM':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    console.log('🔔 Notificación presionada:', notification.type, notification.id);
    console.log('📋 Datos de la notificación:', JSON.stringify(notification, null, 2));

    // Marcar como leída
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // 🎯 NAVEGAR SEGÚN EL TIPO DE NOTIFICACIÓN
    try {
      if (notification.type === 'ORDER_STATUS' && notification.data?.orderId) {
        console.log('📦 Navegando al detalle de la orden:', notification.data.orderId);
        console.log('🛣️ Intentando navegar a: /pedidos/detalle-pedido');
        console.log('📋 Parámetros: { orderId:', notification.data.orderId, '}');

        // 🔧 NAVEGACIÓN CORREGIDA: usar push con parámetros separados
        router.push({
          pathname: '/pedidos/detalle-pedido' as any,
          params: {
            orderId: notification.data.orderId.toString(),
          },
        });
      } else if (notification.type === 'PAYMENT') {
        console.log('💳 Notificación de pago - navegando a mis pedidos');
        console.log('🛣️ Intentando navegar a: /pedidos/mis-pedidos');

        // Para notificaciones de pago, ir directamente a la lista de pedidos
        router.push('/pedidos/mis-pedidos' as any);
      } else if (notification.type === 'PROMOTION') {
        console.log('🎉 Notificación de promoción - navegando al inicio');
        console.log('🛣️ Intentando navegar a: /(tabs)/inicio');

        // Para promociones, ir al inicio
        router.push('/(tabs)/inicio');
      } else {
        console.log('📄 Notificación general - navegando al inicio');
        console.log('🔍 Tipo no reconocido:', notification.type);
        console.log('🛣️ Intentando navegar a: /(tabs)/inicio');

        // Para otros tipos, ir al inicio por defecto
        router.push('/(tabs)/inicio');
      }
    } catch (error) {
      console.error('❌ Error navegando desde notificación:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Sin stack trace');
      console.error('❌ Notificación que causó el error:', notification);

      // 🚨 FALLBACK SEGURO: navegar al inicio si hay cualquier error
      try {
        console.log('🔄 Intentando fallback a inicio...');
        router.push('/(tabs)/inicio');
      } catch (fallbackError) {
        console.error('❌ Error incluso en el fallback:', fallbackError);
        // Si hasta el fallback falla, mostrar alert
        Alert.alert(
          'Error de Navegación',
          'No se pudo navegar desde la notificación. Por favor, ve manualmente a la sección correspondiente.',
          [{ text: 'Entendido' }]
        );
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009ee3" />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
            Cargando notificaciones...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: 24, backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000' }]}>Notificaciones</Text>
        {notifications.some((n) => !n.isRead) && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: '#009ee3' }]}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#009ee3']} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                width: screenWidth < 400 ? '100%' : 360,
                alignSelf: 'center',
                backgroundColor: item.isRead ? cardBg : isDark ? '#2a2a2a' : '#e8f4fd',
                borderColor: item.isRead ? borderColor : getNotificationColor(item.type),
                borderWidth: item.isRead ? 1 : 2,
              },
            ]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={styles.notificationHeader}>
              <View style={styles.notificationTitleRow}>
                <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
                <Text
                  style={[
                    styles.notificationTitle,
                    {
                      color: isDark ? '#fff' : '#000',
                      fontWeight: item.isRead ? 'normal' : 'bold',
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              {!item.isRead && (
                <View
                  style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]}
                />
              )}
            </View>

            <Text
              style={[
                styles.mensaje,
                {
                  color: isDark ? '#ccc' : '#333',
                  fontWeight: item.isRead ? 'normal' : '500',
                },
              ]}
            >
              {item.message}
            </Text>

            <Text style={[styles.timestamp, { color: isDark ? '#888' : '#666' }]}>
              {formatDate(item.createdAt)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
              No tienes notificaciones
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mensaje: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
