import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import PaymentNotificationOverlay from '../components/PaymentNotificationOverlay';
import { useCarrito } from '../context/CarritoContext';
import { usePaymentNotifications } from '../hooks/usePaymentNotifications';
import { usePaymentReturnHandler } from '../hooks/usePaymentReturnHandler';

export default function PagoScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();
  const { notification, checkPaymentStatus, hideNotification, showPaymentAlert } = usePaymentNotifications();
  const { startPaymentSession } = usePaymentReturnHandler();
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const carrito = useCarrito();
  // cartItems debe ser un array de productos [{ title, quantity, unit_price }]
  const cartItems = params.cartItems
    ? JSON.parse(params.cartItems as string)
    : [{ title: 'Producto', quantity: 1, unit_price: 100 }];

  // Función para Mercado Pago
  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      // Obtiene el token JWT guardado después de login
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('Items enviados:', cartItems);

      const response = await fetch('http://192.168.0.108:3000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          orderId: params.productoId || 'carrito',
        }),
      });

      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);

      if (response.ok) {
        const data = JSON.parse(text);
        if (data.init_point) {
          Linking.openURL(data.init_point);
        } else {
          console.error('No hay init_point en la respuesta:', data);
          Alert.alert('Error', 'No se pudo iniciar el pago - Sin init_point');
        }
      } else {
        console.error('Error en la respuesta:', text);
        Alert.alert('Error', `Error ${response.status}: ${text}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', 'No se pudo conectar con el backend');
    }
    setLoading(false);
  };

  // Función mejorada para crear orden con notificaciones
  const createOrderWithNotifications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showPaymentAlert('error', 'Error de Autenticación', 'No estás autenticado. Por favor inicia sesión.');
        router.push('/auth/login');
        return;
      }

      let orderData;
      if (params.productoId === 'carrito') {
        // Compra del carrito completo
        orderData = {
          items: carrito.items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          totalAmount: carrito.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) + 50,
        };
      } else {
        // Compra de producto individual
        orderData = {
          productId: params.productoId,
          quantity: 1,
        };
      }

      console.log('📦 Creando orden:', orderData);

      const response = await fetch('https://c8f94f0f0f83.ngrok-free.app/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Orden creada:', data.order.id);
        setCurrentOrderId(data.order.id.toString());
        
        // Iniciar sesión de pago ANTES de navegar a MercadoPago
        await startPaymentSession(data.order.id.toString(), data.preference.id);
        
        // Limpiar carrito si era compra del carrito
        if (params.productoId === 'carrito') {
          console.log('🛒 Limpiando carrito después de crear orden...');
          carrito.clearCart();
        }
        
        // Navegar a MercadoPago
        const initPoint = data.preference.init_point;
        console.log('🌐 Navegando a MercadoPago...');
        
        // Usar Linking para abrir MercadoPago en navegador externo
        if (Platform.OS === 'web') {
          window.open(initPoint, '_blank');
        } else {
          // En móvil, abrir en navegador externo
          const { Linking } = require('react-native');
          await Linking.openURL(initPoint);
        }
      } else {
        console.error('❌ Error al crear orden:', data);
        showPaymentAlert('error', 'Error al Crear Orden', data.error || 'No se pudo crear la orden');
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      showPaymentAlert('error', 'Error de Conexión', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // FUNCIÓN UNIVERSAL PARA COMPRAS (CARRITO O PRODUCTO INDIVIDUAL)
  const handleMercadoPagoPayment = async () => {
    try {
      setLoading(true);
      
      console.log('🛒 Preparando pago con MercadoPago...');
      console.log('📦 Parámetros recibidos:', params);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
        return;
      }

      // DETERMINAR SI ES COMPRA DEL CARRITO O PRODUCTO INDIVIDUAL
      const isCartPurchase = params.productoId === 'carrito';
      let paymentData;

      if (isCartPurchase) {
        // COMPRA DEL CARRITO COMPLETO
        console.log('🛒 Procesando compra del carrito...');
        console.log('📦 Items del carrito:', carrito.items);
        
        if (!carrito.items || carrito.items.length === 0) {
          Alert.alert('Error', 'El carrito está vacío');
          return;
        }

        // Calcular total con envío
        const itemsTotal = carrito.items.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0);
        const shippingCost = 50;
        const totalWithShipping = itemsTotal + shippingCost;
        
        console.log('💰 Cálculo de totales del carrito:');
        console.log('  - Items total:', itemsTotal);
        console.log('  - Costo de envío:', shippingCost);
        console.log('  - Total con envío:', totalWithShipping);
        
        paymentData = {
          items: carrito.items.map((item: any) => ({
            title: item.title || item.product?.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          shipping: {
            cost: shippingCost
          },
          cartItems: carrito.items.map((item: any) => ({
            productId: parseInt(item.id) || item.product?.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          totalAmount: totalWithShipping,
        };
        
      } else {
        // COMPRA DE PRODUCTO INDIVIDUAL
        console.log('🛍️ Procesando compra de producto individual...');
        console.log('📦 ID del producto:', params.productoId);
        console.log('📦 Precio:', params.precio);
        console.log('📦 Nombre:', params.nombre);
        console.log('📦 Cantidad desde parámetros:', params.cantidad);
        
        const productPrice = parseFloat(params.precio as string) || 0;
        const productQuantity = parseInt(params.cantidad as string) || 1; // USAR LA CANTIDAD DE LOS PARÁMETROS
        const shippingCost = 50;
        const totalWithShipping = (productPrice * productQuantity) + shippingCost;
        
        console.log('💰 Cálculo de totales del producto:');
        console.log('  - Precio del producto:', productPrice);
        console.log('  - Cantidad del producto:', productQuantity);
        console.log('  - Subtotal productos:', productPrice * productQuantity);
        console.log('  - Costo de envío:', shippingCost);
        console.log('  - Total con envío:', totalWithShipping);
        
        paymentData = {
          items: [{
            title: params.nombre as string || 'Producto',
            quantity: productQuantity, // USAR LA CANTIDAD CORRECTA
            unit_price: productPrice,
          }],
          shipping: {
            cost: shippingCost
          },
          cartItems: [{
            productId: parseInt(params.productoId as string),
            quantity: productQuantity, // USAR LA CANTIDAD CORRECTA AQUÍ TAMBIÉN
            unit_price: productPrice,
            id: params.productoId as string,
            title: params.nombre as string || 'Producto',
            talla: params.talla as string || 'M',
          }],
          totalAmount: totalWithShipping,
        };
      }
      
      console.log('💳 Enviando datos a MP:', JSON.stringify(paymentData, null, 2));

      // Verificar si el servidor está funcionando
      console.log('🔍 Verificando conexión con el servidor...');
      try {
        const healthCheck = await fetch('https://c8f94f0f0f83.ngrok-free.app/health', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('💚 Health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('💔 Error en health check:', healthError);
        Alert.alert('Error de Conexión', 'No se puede conectar con el servidor. Verifica que esté ejecutándose.');
        return;
      }

      const response = await fetch('https://c8f94f0f0f83.ngrok-free.app/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📄 Response text (primeros 500 chars):', responseText.substring(0, 500));

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        console.error('📄 Respuesta completa del servidor:', responseText);
        Alert.alert('Error de Servidor', `El servidor devolvió una respuesta inválida. Status: ${response.status}`);
        return;
      }
      
      if (response.ok && data.preference) {
        console.log('✅ Preferencia creada:', data.preference.id);
        console.log('📦 Orden creada:', data.order.id);

        // Guardar sesión de pago
        await startPaymentSession(data.order.id, data.preference.id);

        // Limpiar carrito solo si era compra del carrito
        if (isCartPurchase) {
          console.log('🛒 Limpiando carrito después de crear orden...');
          carrito.clearCart();
        }

        // Abrir MercadoPago
        const supported = await Linking.canOpenURL(data.preference.init_point);
        if (supported) {
          await Linking.openURL(data.preference.init_point);
        } else {
          Alert.alert('Error', 'No se puede abrir MercadoPago');
        }
      } else {
        console.error('❌ Error creando preferencia:', data);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response statusText:', response.statusText);
        
        // Manejar diferentes tipos de errores
        if (response.status === 404) {
          Alert.alert('Error 404', 'El endpoint de pagos no existe. Verifica la URL del servidor.');
        } else if (response.status === 500) {
          Alert.alert('Error de Servidor', 'Error interno del servidor. Revisa los logs del backend.');
        } else if (response.status === 401) {
          Alert.alert('Error de Autenticación', 'Token inválido. Inicia sesión nuevamente.');
          router.push('/auth/login');
        } else {
          Alert.alert('Error de Pago', data.error || `Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error en pago MP:', error);
      Alert.alert('Error', 'Error al procesar el pago con MercadoPago');
    } finally {
      setLoading(false);
    }
  };

  // Verificar estado del pago cuando se regresa de MercadoPago
  useEffect(() => {
    if (params.payment_status && currentOrderId) {
      console.log('🔄 Regresando de MercadoPago con estado:', params.payment_status);
      
      // Simular verificación de pago
      setTimeout(async () => {
        await checkPaymentStatus(currentOrderId);
      }, 1000);
    }
  }, [params.payment_status, currentOrderId]);

  // Función auxiliar para debug de rutas
  const debugApiCall = (endpoint: string, method: string = 'GET') => {
    console.log(`🔗 API Call: ${method} ${endpoint}`);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Método de Pago',
          headerShown: true,
          headerBackTitle: 'Tienda',
          presentation: 'card'
        }} 
      />
      <View style={[styles.container, { backgroundColor: containerBg }]}>
      {/* Overlay de notificación */}
      <PaymentNotificationOverlay
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onHide={hideNotification}
      />
      
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.title, { color: textColor }]}>Selecciona tu método de pago</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#009ee3' }]}
                        onPress={handleMercadoPagoPayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Mercado Pago</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#003087' }]}
          onPress={() => Alert.alert('PayPal', 'Integración pendiente')}
        >
          <Text style={styles.buttonText}>PayPal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#333' }]}
          onPress={() => Alert.alert('Criptomonedas', 'Integración pendiente')}
        >
          <Text style={styles.buttonText}>Criptomonedas</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator size="large" color="#009ee3" style={{ marginTop: 20 }} />}
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  button: {
    width: '100%',
    maxWidth: 250,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
