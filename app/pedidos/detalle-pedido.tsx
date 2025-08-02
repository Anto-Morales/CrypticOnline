import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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

interface OrderDetail {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  paidAt: string | null;
  orderItems: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl: string;
    };
  }>;
  payment?: {
    status: string;
    method: string;
    amount: number;
  };
}

export default function DetallePedidoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { checkPaymentStatus, checking } = usePaymentStatusChecker();

  const fetchOrderDetail = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      console.log('🔍 Obteniendo detalles del pedido:', params.orderId);

      const { response, data } = await apiRequest(`/api/orders/${params.orderId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        console.log('✅ Detalles del pedido obtenidos:', data.order.id);
        setOrder(data.order);
      } else {
        console.error('❌ Error al obtener detalles:', response.status, data);
      }
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar cuando se regresa a la pantalla
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Detalle enfocado - Refrescando pedido...');
      fetchOrderDetail();
    }, [params.orderId])
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderDetail();
  }, [params.orderId]);

  const handleCheckPayment = async () => {
    if (!order) return;
    
    console.log('🔄 Verificando estado de pago manualmente...');
    const updatedOrder = await checkPaymentStatus(order.id);
    
    if (updatedOrder) {
      setOrder(updatedOrder);
      console.log('✅ Orden actualizada con nuevo estado');
    }
  };

  const handleManualUpdate = async () => {
    if (!order) return;
    
    try {
      console.log('🔧 Actualizando estado manualmente...');
      
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const { response, data } = await apiRequest(`/api/orders/manual/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'PAID' })
      });

      if (response.ok && data.success) {
        console.log('✅ Estado actualizado manualmente');
        setOrder({ ...order, status: 'PAID', paidAt: new Date().toISOString() });
      } else {
        console.error('❌ Error actualizando manualmente:', data);
      }
    } catch (error) {
      console.error('❌ Error en actualización manual:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'CANCELLED':
        return '#f44336';
      case 'FAILED':
        return '#e91e63';
      default:
        return '#2196F3';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagado y Confirmado';
      case 'PENDING':
        return 'Pago Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      case 'FAILED':
        return 'Pago Fallido';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Pago Completado ✅';
      case 'PENDING':
        return 'Pago Pendiente ⏳';
      case 'FAILED':
        return 'Pago Fallido ❌';
      default:
        return 'Sin información de pago';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: `Pedido #${params.orderId}`,
            headerShown: true 
          }} 
        />
        <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#009ee3" />
            <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
              Cargando detalles...
            </Text>
          </View>
        </View>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: `Pedido #${params.orderId}`,
            headerShown: true 
          }} 
        />
        <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
              No se pudo cargar el pedido
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backButton, { color: '#009ee3' }]}>Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Pedido #${params.orderId}`,
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
        {/* Estado del pedido */}
        <View style={[styles.section, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Estado del Pedido
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
            <Text style={[styles.statusDate, { color: isDark ? '#ccc' : '#666' }]}>
              Creado: {formatDate(order.createdAt)}
            </Text>
            {order.paidAt && (
              <Text style={[styles.statusDate, { color: isDark ? '#ccc' : '#666' }]}>
                Pagado: {formatDate(order.paidAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Información de pago */}
        <View style={[styles.section, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Estado del Pago
          </Text>
          <Text style={[styles.paymentInfo, { color: isDark ? '#ccc' : '#666' }]}>
            {order.status === 'PAID' 
              ? 'Pago Completado ✅' 
              : order.payment 
                ? getPaymentStatusText(order.payment.status) 
                : order.status === 'PENDING' 
                  ? 'Pago Pendiente ⏳'
                  : 'Pago no procesado'
            }
          </Text>
          {(order.payment || order.status === 'PAID') && (
            <Text style={[styles.paymentMethod, { color: isDark ? '#ccc' : '#666' }]}>
              Método: {order.payment?.method || 'MercadoPago'}
            </Text>
          )}
        </View>

        {/* Productos */}
        <View style={[styles.section, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Productos
          </Text>
          {order.orderItems.map((item, index) => (
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
                  Cantidad: {item.quantity} unidades
                </Text>
                <Text style={[styles.productPrice, { color: isDark ? '#fff' : '#000' }]}>
                  Precio unitario: ${item.price} MXN
                </Text>
                <Text style={[styles.productSubtotal, { color: isDark ? '#4CAF50' : '#2E7D32' }]}>
                  Subtotal: ${(item.price * item.quantity).toFixed(2)} MXN
                </Text>
              </View>
              <Text style={[styles.productTotal, { color: isDark ? '#fff' : '#000' }]}>
                ${(item.price * item.quantity).toFixed(2)} MXN
              </Text>
            </View>
          ))}
          
          {/* Agregar costo de envío si aplica */}
          <View style={[styles.productRow, styles.shippingRow]}>
            <View style={[styles.shippingIcon, { backgroundColor: isDark ? '#444' : '#e0e0e0' }]}>
              <Text style={[styles.shippingText, { color: isDark ? '#fff' : '#000' }]}>📦</Text>
            </View>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: isDark ? '#fff' : '#000' }]}>
                Costo de envío
              </Text>
              <Text style={[styles.productDetails, { color: isDark ? '#ccc' : '#666' }]}>
                Envío estándar
              </Text>
            </View>
            <Text style={[styles.productTotal, { color: isDark ? '#fff' : '#000' }]}>
              $50.00 MXN
            </Text>
          </View>
        </View>

        {/* Total */}
        <View style={[styles.section, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: isDark ? '#fff' : '#000' }]}>
              Total del Pedido:
            </Text>
            <Text style={[styles.totalAmount, { color: '#4CAF50' }]}>
              ${order.total.toFixed(2)} MXN
            </Text>
          </View>
        </View>

        {/* Acciones */}
        {order.status === 'PENDING' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#009ee3' }]}
              onPress={handleCheckPayment}
              disabled={checking}
            >
              <Text style={styles.actionButtonText}>
                {checking ? 'Verificando...' : 'Verificar Estado del Pago'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50', marginTop: 12 }]}
              onPress={handleManualUpdate}
            >
              <Text style={styles.actionButtonText}>
                ✅ Marcar como Pagado (Temporal)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f44336', marginTop: 12 }]}
              onPress={() => {
                console.log('Cancelar pedido');
              }}
            >
              <Text style={styles.actionButtonText}>Cancelar Pedido</Text>
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentInfo: {
    fontSize: 16,
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
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
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  productSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  shippingRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 16,
  },
  shippingIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shippingText: {
    fontSize: 24,
  },
  productTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});