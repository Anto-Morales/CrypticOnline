import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { apiRequest } from '../config/api';
import { usePaymentStatusChecker } from '../hooks/usePaymentStatusChecker';

interface Payment {
  id: number;
  status: string;
  amount: number;
  provider: string;
  referenceId?: string;
  createdAt: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  paidAt?: string;
  orderItems: OrderItem[];
  payments?: Payment[];
}

export default function MisPedidosScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { autoCheckPendingOrders } = usePaymentStatusChecker();

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('🔍 Obteniendo lista de pedidos...');

      const { response, data } = await apiRequest('/api/orders', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 Respuesta completa:', { status: response.status, data });

      if (response.ok && data && data.success) {
        const ordersArray = data.orders || [];
        console.log('✅ Pedidos obtenidos:', ordersArray.length);
        console.log('📦 Órdenes:', ordersArray);
        setOrders(ordersArray);
      } else {
        console.error('❌ Error al obtener pedidos:', response.status, data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar cuando se regresa a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Pantalla enfocada - Refrescando pedidos...');
      fetchOrders().then(async () => {
        // Verificar automáticamente órdenes pendientes después de cargar
        console.log('🔄 Verificando órdenes pendientes automáticamente...');
        await autoCheckPendingOrders();
        // Recargar después de la verificación
        await fetchOrders();
      });
    }, [])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagado';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Mis Pedidos',
            headerShown: true 
          }} 
        />
        <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009ee3" />
            <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
              Cargando tus pedidos...
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Mis Pedidos',
          headerShown: true 
        }} 
      />
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDark ? '#fff' : '#000'}
            />
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
                No tienes pedidos aún
              </Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/inicio')}
              >
                <Text style={styles.shopButtonText}>Ir de Compras</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => (
            <View
              key={order.id}
              style={[
                styles.orderCard,
                {
                  backgroundColor: isDark ? '#222' : '#f5f5f5',
                  borderColor: isDark ? '#444' : '#ddd',
                },
              ]}
            >
              {/* Header del pedido */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={[styles.orderNumber, { color: isDark ? '#fff' : '#000' }]}>
                    Pedido #{order.id}
                  </Text>
                  <Text style={[styles.orderDate, { color: isDark ? '#ccc' : '#666' }]}>
                    {formatDate(order.createdAt)}
                  </Text>
                </View>
                <View
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                >
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
              </View>

              {/* Productos del pedido */}
              <View style={styles.orderProducts}>
                {order.orderItems.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.productRow}>
                    <Image
                      source={
                        item.product.imageUrl
                          ? { uri: item.product.imageUrl }
                          : require('../../assets/images/shirt1.png')
                      }
                      style={styles.productImage}
                      defaultSource={require('../../assets/images/shirt1.png')}
                    />
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: isDark ? '#fff' : '#000' }]}>
                        {item.product.name}
                      </Text>
                      <Text style={[styles.productDetails, { color: isDark ? '#ccc' : '#666' }]}>
                        Cantidad: {item.quantity} | ${item.price} MXN
                      </Text>
                    </View>
                  </View>
                ))}
                {order.orderItems.length > 2 && (
                  <Text style={[styles.moreProducts, { color: isDark ? '#ccc' : '#666' }]}>
                    +{order.orderItems.length - 2} productos más
                  </Text>
                )}
              </View>

              {/* Total y acciones */}
              <View style={styles.orderFooter}>
                <View>
                  <Text style={[styles.orderTotal, { color: isDark ? '#fff' : '#000' }]}>
                    Total: ${order.total} MXN
                  </Text>
                  {order.payments && order.payments.length > 0 && (
                    <Text style={[styles.paymentInfo, { color: isDark ? '#ccc' : '#666' }]}>
                      Pago: {order.payments[0].provider} ({order.payments[0].status})
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.detailButton, { borderColor: isDark ? '#fff' : '#000' }]}
                  onPress={() => {
                    // Navegar a una pantalla de detalles específica del pedido
                    router.push({
                      pathname: '/pedidos/detalle-pedido',
                      params: { 
                        orderId: order.id,
                        status: order.status,
                        total: order.total,
                        createdAt: order.createdAt
                      },
                    });
                  }}
                >
                  <Text style={[styles.detailButtonText, { color: isDark ? '#fff' : '#000' }]}>
                    Ver Detalles
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#009ee3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderProducts: {
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
  },
  moreProducts: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  detailButton: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
