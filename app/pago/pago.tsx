// app/pago/pago.tsx
// Este archivo define la pantalla de pago en la aplicación móvil, permitiendo a los usuarios seleccionar su método de pago y procesar la compra.
// Utiliza hooks personalizados para manejar notificaciones y estilos adaptativos según el tema oscuro o claro.

//corrigido el error de importación de AsyncStorage y añadido la lógica para manejar el pago con Mercado Pago.

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import PaymentNotificationOverlay from '../components/PaymentNotificationOverlay';
import { API_CONFIG, createApiUrl, createAuthHeaders } from '../config/api';
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
  const { notification, checkPaymentStatus, hideNotification, showPaymentAlert } =
    usePaymentNotifications();
  const { startPaymentSession } = usePaymentReturnHandler();
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const carrito = useCarrito();

  // 🎯 DETECTAR SI ES UN RETRY DESDE DETALLE-PEDIDO
  const isRetryPayment = params.isRetry === 'true';
  const shouldAutoExecute = params.autoExecute === 'true';
  const selectedMethod = params.selectedMethod as string;
  const existingOrderId = params.orderId as string;

  console.log('🔍 Parámetros de pago detectados:', {
    isRetryPayment,
    shouldAutoExecute,
    selectedMethod,
    existingOrderId,
    allParams: params,
  });

  // 🚚 DEBUG: Revisar datos de envío específicamente
  console.log('🚚 DEBUG - DATOS DE ENVÍO EN PARÁMETROS:', {
    shippingCost: params.shippingCost,
    subtotal: params.subtotal,
    total: params.total,
    shippingData: params.shippingData,
    precio: params.precio,
    cantidad: params.cantidad,
    productoId: params.productoId,
  });

  // cartItems debe ser un array de productos [{ title, quantity, unit_price }]
  const cartItems = params.cartItems
    ? JSON.parse(params.cartItems as string)
    : [{ title: 'Producto', quantity: 1, unit_price: 100 }];

  // 🎯 EFECTO PARA AUTO-EJECUTAR MÉTODO DE PAGO EN RETRY
  useEffect(() => {
    if (isRetryPayment && shouldAutoExecute && selectedMethod && existingOrderId) {
      console.log('🔄 RETRY DETECTADO - Ejecutando automáticamente:', selectedMethod);
      console.log('📦 Orden existente ID:', existingOrderId);

      // Ejecutar automáticamente el método seleccionado
      setTimeout(() => {
        switch (selectedMethod) {
          case 'card':
            console.log('💳 Ejecutando pago con tarjeta...');
            handleCardPayment(existingOrderId);
            break;

          case 'mercadopago':
            console.log('💰 Ejecutando pago con MercadoPago...');
            handleMercadoPagoRetry(existingOrderId);
            break;

          case 'transfer':
            console.log('🏦 Ejecutando transferencia bancaria...');
            handleAlternativePayment('transfer');
            break;

          case 'oxxo':
            console.log('🏪 Ejecutando pago en OXXO...');
            handleAlternativePayment('oxxo');
            break;

          case 'paypal':
            console.log('🌍 Ejecutando pago con PayPal...');
            handleAlternativePayment('paypal');
            break;

          case 'crypto':
            console.log('₿ Ejecutando pago con criptomonedas...');
            handleAlternativePayment('crypto');
            break;

          default:
            console.error('❌ Método de pago no reconocido:', selectedMethod);
            Alert.alert('Error', 'Método de pago no válido');
        }
      }, 500); // Pequeño delay para que se monte el componente
    }
  }, [isRetryPayment, shouldAutoExecute, selectedMethod, existingOrderId]);

  // 🔄 FUNCIÓN: handleMercadoPagoRetry
  // Para cuando es un reintento de pago de pedido existente
  const handleMercadoPagoRetry = async (orderId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Procesando retry de MercadoPago para orden:', orderId);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Sesión expirada. Por favor inicia sesión nuevamente.');
        router.push('/auth/login');
        return;
      }

      // 🔧 DATOS ESPECÍFICOS PARA RETRY - NO CREAR NUEVO PEDIDO
      // El backend debe detectar estos campos y actualizar el pedido existente
      const retryData = {
        // 🎯 IDENTIFICADORES CLAVE PARA EL BACKEND
        isRetry: true, // Bandera que indica que es un retry
        existingOrderId: orderId, // ID del pedido que queremos actualizar
        retryPayment: true, // Confirma que es reintento de pago
        updateExistingOrder: true, // NO crear nueva orden, usar la existente

        // Datos mínimos para MercadoPago (solo para crear la preferencia)
        items: [
          {
            title: `Reintento pago - Orden #${orderId}`,
            quantity: 1,
            unit_price: parseFloat(params.total as string) || 90,
          },
        ],

        // Metadatos adicionales para el backend
        metadata: {
          originalOrderId: orderId,
          paymentAttempt: 'retry',
          source: 'order-detail-screen',
          doNotCreateNewOrder: true, // Importante: NO crear nueva orden
        },
      };

      console.log('🎯 Enviando datos de retry:', retryData);

      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS_CREATE), {
        method: 'POST',
        headers: createAuthHeaders(token),
        body: JSON.stringify(retryData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Verificar si la respuesta es HTML en lugar de JSON
      const contentType = response.headers.get('content-type');
      console.log('📋 Content-Type:', contentType);

      if (contentType && contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.log(
          '❌ Recibido HTML en lugar de JSON para retry. Primeros 200 chars:',
          htmlText.substring(0, 200)
        );
        throw new Error(
          'El servidor devolvió HTML en lugar de JSON. Verifica la URL de ngrok y que el backend esté funcionando.'
        );
      }

      const data = await response.json();
      console.log('📦 Respuesta completa de retry:', data);

      if (response.ok && data.preference) {
        console.log('✅ Nueva preferencia creada para retry:', data.preference.id);
        console.log('📦 Usando orden existente:', orderId, '(NO se creó nueva orden)');

        // Verificar si efectivamente es retry
        if (data.order && data.order.isRetry) {
          console.log('✅ Confirmado: Es un retry, NO se creó nueva orden');
        } else {
          console.warn('⚠️ ADVERTENCIA: Parece que se creó nueva orden en lugar de usar existente');
        }

        // Guardar sesión de pago con el MISMO orderId
        await startPaymentSession(orderId, data.preference.id);

        // Abrir MercadoPago
        const supported = await Linking.canOpenURL(data.preference.init_point);
        if (supported) {
          await Linking.openURL(data.preference.init_point);
        } else {
          Alert.alert('Error', 'No se puede abrir MercadoPago');
        }
      } else {
        console.error('❌ Error en retry de MercadoPago:', data);
        Alert.alert('Error de Pago', data.error || 'No se pudo procesar el pago');
      }
    } catch (error) {
      console.error('❌ Error en retry de MercadoPago:', error);
      Alert.alert('Error', 'Error al procesar el pago con MercadoPago');
    } finally {
      setLoading(false);
    }
  };

  // 💳 FUNCIÓN: handleCardPayment
  // Para pago directo con tarjeta (Stripe/Square)
  const handleCardPayment = async (orderId?: string) => {
    try {
      setLoading(true);
      console.log('💳 Procesando pago con tarjeta...');

      // Por ahora mostrar alert, luego implementar Stripe
      Alert.alert(
        'Pago con Tarjeta',
        `${orderId ? `Procesando pago para orden #${orderId}` : 'Procesando nuevo pago'}\n\n• Procesamiento seguro con Stripe\n• Aceptamos Visa, Mastercard, American Express\n• Autorización inmediata\n\n¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: () => {
              console.log('🏦 Implementar integración con Stripe aquí');
              // TODO: Implementar Stripe
              Alert.alert('Próximamente', 'La integración con Stripe estará disponible pronto.');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error en pago con tarjeta:', error);
      Alert.alert('Error', 'Error al procesar el pago con tarjeta');
    } finally {
      setLoading(false);
    }
  };

  // Función para Mercado Pago (DEPRECATED - usar handleMercadoPagoPayment)
  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      // Obtiene el token JWT guardado después de login
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('Items enviados:', cartItems);

      // 🔧 CONFIGURACIÓN AUTOMÁTICA DE URL
      let baseUrl =
        process.env.EXPO_PUBLIC_NGROK_URL ||
        process.env.EXPO_PUBLIC_API_URL ||
        'http://localhost:3000';

      // 🚨 FALLBACK URL SI LAS VARIABLES NO FUNCIONAN (ACTUALIZADA)
      const FALLBACK_NGROK_URL = 'https://aca21624c99b.ngrok-free.app';

      // 🌐 DETECCIÓN AUTOMÁTICA DE ENTORNO
      if (!process.env.EXPO_PUBLIC_NGROK_URL && !process.env.EXPO_PUBLIC_API_URL) {
        console.log('⚠️ Variables de entorno no disponibles en pago, usando fallback');
        baseUrl = FALLBACK_NGROK_URL;
      }

      const paymentUrl = `${baseUrl}/api/payments/create`;
      console.log('🔗 URL Base detectada en pago:', baseUrl);
      console.log('💳 URL de pago:', paymentUrl);

      // 🚚 AGREGAR COSTO DE ENVÍO A FUNCIÓN ANTIGUA
      const shippingCost = 50;
      const itemsWithShipping = [...cartItems];
      const itemsTotal = cartItems.reduce(
        (sum: number, item: any) => sum + item.unit_price * item.quantity,
        0
      );
      const totalWithShipping = itemsTotal + shippingCost;

      console.log('💰 FUNCIÓN ANTIGUA - Agregando envío:', {
        itemsTotal,
        shippingCost,
        totalWithShipping,
      });

      const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'CrypticOnline-Mobile-App',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsWithShipping,
          orderId: params.productoId || 'carrito',
          // 🚚 AGREGAR DATOS DE ENVÍO
          shipping: {
            cost: shippingCost,
            method: 'standard',
          },
          totalAmount: totalWithShipping,
        }),
      });

      console.log('Response status:', response.status);
      const text = await response.text();
      console.log('Response text:', text);

      if (response.ok) {
        const data = JSON.parse(text);
        if (data.init_point) {
          // 🎯 GUARDAR SESIÓN DE PAGO PARA NOTIFICACIONES
          if (data.order && data.preference) {
            await startPaymentSession(data.order.id.toString(), data.preference.id);
          }

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
        showPaymentAlert(
          'error',
          'Error de Autenticación',
          'No estás autenticado. Por favor inicia sesión.'
        );
        router.push('/auth/login');

        return;
      }

      let orderData;
      if (params.productoId === 'carrito') {
        // Compra del carrito completo
        orderData = {
          items: carrito.items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          totalAmount:
            carrito.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) + 50,
        };
      } else {
        // Compra de producto individual
        orderData = {
          productId: params.productoId,
          quantity: 1,
        };
      }

      console.log('📦 Creando orden:', orderData);

      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.ORDERS), {
        method: 'POST',
        headers: createAuthHeaders(token),
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
        showPaymentAlert(
          'error',
          'Error al Crear Orden',
          data.error || 'No se pudo crear la orden'
        );
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
        const itemsTotal = carrito.items.reduce(
          (sum: number, item: any) => sum + item.unit_price * item.quantity,
          0
        );
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
            cost: shippingCost,
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
        console.log('🚚 Costo de envío desde parámetros:', params.shippingCost);
        console.log('🚚 Total desde parámetros:', params.total);

        const productPrice = parseFloat(params.precio as string) || 0;
        const productQuantity = parseInt(params.cantidad as string) || 1;

        // 🚚 MANEJO UNIFICADO DE COSTOS DE ENVÍO
        let shippingCost = 50; // Valor por defecto

        // Priorizar datos que vienen de los parámetros
        if (params.shippingCost) {
          shippingCost = parseFloat(params.shippingCost as string);
          console.log('✅ Usando costo de envío desde parámetros:', shippingCost);
        } else {
          console.log(
            '⚠️ No hay costo de envío en parámetros, usando valor por defecto:',
            shippingCost
          );
          console.log('🔍 Parámetros disponibles:', Object.keys(params));
        }

        // 🔧 ASEGURAR QUE EL COSTO DE ENVÍO SEA VÁLIDO
        if (isNaN(shippingCost) || shippingCost <= 0) {
          console.log('⚠️ Costo de envío inválido, usando valor por defecto de 50');
          shippingCost = 50;
        }

        // Calcular totales (por si no vienen en parámetros)
        const subtotal = productPrice * productQuantity;

        // 🚚 PRIORIZAR TOTAL QUE VIENE EN PARÁMETROS (ya incluye envío)
        let totalWithShipping;
        if (params.total) {
          totalWithShipping = parseFloat(params.total as string);
          console.log('✅ Usando total desde parámetros (ya incluye envío):', totalWithShipping);
        } else {
          totalWithShipping = subtotal + shippingCost;
          console.log('⚠️ Calculando total manualmente:', totalWithShipping);
        }

        console.log('💰 Cálculo de totales del producto:');
        console.log('  - Precio del producto:', productPrice);
        console.log('  - Cantidad del producto:', productQuantity);
        console.log('  - Subtotal productos:', subtotal);
        console.log('  - Costo de envío FINAL:', shippingCost);
        console.log('  - Total con envío FINAL:', totalWithShipping);
        console.log('  - Fuente del total:', params.total ? 'parámetros' : 'calculado');

        paymentData = {
          items: [
            {
              title: (params.nombre as string) || 'Producto',
              quantity: productQuantity,
              unit_price: productPrice,
            },
          ],
          shipping: {
            cost: shippingCost,
            method: 'standard', // TODO: Obtener desde shippingData cuando se integre API
            estimatedDays: '3-5',
          },
          cartItems: [
            {
              productId: parseInt(params.productoId as string),
              quantity: productQuantity,
              unit_price: productPrice,
              id: params.productoId as string,
              title: (params.nombre as string) || 'Producto',
              talla: (params.talla as string) || 'M',
            },
          ],
          // 🚚 ESTE ERA EL PROBLEMA: Usar el total correcto con envío
          totalAmount: totalWithShipping,
          // 🚚 METADATOS PARA FUTURA INTEGRACIÓN CON API DE ENVÍOS
          shippingData: params.shippingData
            ? JSON.parse(params.shippingData as string)
            : {
                method: 'standard',
                cost: shippingCost,
                estimatedDays: '3-5',
                provider: 'default',
              },
        };

        console.log('✅ TOTAL FINAL ENVIADO AL BACKEND:', totalWithShipping);
        console.log('🔍 Verificación de datos:', {
          'Items total (productos)': subtotal,
          'Costo de envío': shippingCost,
          'Total con envío': totalWithShipping,
          'totalAmount enviado': totalWithShipping,
        });
      }

      console.log('💳 Enviando datos a MP:', JSON.stringify(paymentData, null, 2));

      // 🔍 VERIFICACIÓN FINAL DE QUE EL TOTAL INCLUYA ENVÍO
      console.log('🚚 VERIFICACIÓN FINAL - Total que se enviará al backend:');
      console.log('  - totalAmount:', paymentData.totalAmount);
      console.log('  - shipping.cost:', paymentData.shipping.cost);
      console.log(
        '  - ¿Total incluye envío?:',
        paymentData.totalAmount >= paymentData.shipping.cost
      );

      if (paymentData.totalAmount < paymentData.shipping.cost) {
        console.error('🚨 ERROR: El total es menor que el costo de envío. Algo está mal.');
      }

      // Verificar si el servidor está funcionando
      console.log('🔍 Verificando conexión con el servidor...');
      try {
        const healthCheck = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
          method: 'GET',
          headers: createAuthHeaders(token),
        });
        console.log('💚 Health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('💔 Error en health check:', healthError);
        Alert.alert(
          'Error de Conexión',
          'No se puede conectar con el servidor. Verifica que esté ejecutándose.'
        );
        return;
      }

      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS_CREATE), {
        method: 'POST',
        headers: createAuthHeaders(token),
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
        Alert.alert(
          'Error de Servidor',
          `El servidor devolvió una respuesta inválida. Status: ${response.status}`
        );
        return;
      }

      if (response.ok && data.preference) {
        console.log('✅ Preferencia creada:', data.preference.id);
        console.log('📦 Orden creada:', data.order.id);

        // 🔍 VERIFICAR QUE EL TOTAL DE LA ORDEN INCLUYA ENVÍO
        console.log('💰 Verificación de orden creada:');
        console.log('  - Total enviado al backend:', paymentData.totalAmount);
        console.log('  - Total de la orden creada:', data.order.total || 'No disponible');
        console.log('  - ¿Coinciden?:', data.order.total === paymentData.totalAmount);

        if (data.order.total && data.order.total !== paymentData.totalAmount) {
          console.warn('⚠️ ADVERTENCIA: El total de la orden no coincide con el enviado');
        }

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
          Alert.alert(
            'Error de Servidor',
            'Error interno del servidor. Revisa los logs del backend.'
          );
        } else if (response.status === 401) {
          Alert.alert('Error de Autenticación', 'Token inválido. Inicia sesión nuevamente.');
          router.push('/auth/login');
        } else {
          Alert.alert(
            'Error de Pago',
            data.error || `Error ${response.status}: ${response.statusText}`
          );
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

  /**
   * 💳 FUNCIÓN: handleAlternativePayment
   *
   * ¿QUÉ HACE?: Maneja métodos de pago alternativos
   */
  const handleAlternativePayment = (method: string) => {
    console.log('💳 Método de pago alternativo seleccionado:', method);

    switch (method) {
      case 'transfer':
        Alert.alert(
          'Transferencia Bancaria',
          'CUENTA CLABE: 123456789012345678\nBANCO: BBVA\nTITULAR: CrypticOnline\n\nEnvía tu comprobante de pago al WhatsApp.',
          [{ text: 'Copiar CLABE', onPress: () => console.log('CLABE copiada') }, { text: 'OK' }]
        );
        break;

      case 'oxxo':
        Alert.alert(
          'Pago en OXXO',
          '1. Ve a cualquier tienda OXXO\n2. Menciona "Pago de servicios"\n3. Proporciona el código que te enviaremos\n4. Paga en efectivo\n\nTu pedido se activará automáticamente.',
          [{ text: 'Entendido' }]
        );
        break;

      case 'paypal':
        Alert.alert(
          'PayPal',
          'Envía el pago a: pagos@crypticonline.com\n\nIncluye tu información de contacto en la nota.',
          [{ text: 'Entendido' }]
        );
        break;

      case 'crypto':
        Alert.alert(
          'Criptomonedas',
          'Bitcoin: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\nUSDT (TRC20): TGDHnK2U5Z8ZvZk8...\n\nEnvía el comprobante de transacción.',
          [{ text: 'Copiar dirección' }, { text: 'OK' }]
        );
        break;

      default:
        Alert.alert('Método no disponible', 'Este método de pago estará disponible pronto.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Método de Pago',
          headerShown: true,
          headerBackTitle: 'Tienda',
          presentation: 'card',
        }}
      />
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        {/* Overlay de notificación */}
        <PaymentNotificationOverlay
          show={notification.show}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onHide={hideNotification}
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 🔄 MOSTRAR LOADING CUANDO ES RETRY */}
          {isRetryPayment && shouldAutoExecute ? (
            <View style={styles.retryLoadingContainer}>
              <ActivityIndicator size="large" color="#00b4d8" />
              <Text style={[styles.retryLoadingTitle, { color: isDark ? '#fff' : '#000' }]}>
                Procesando pago...
              </Text>
              <Text style={[styles.retryLoadingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                Ejecutando{' '}
                {selectedMethod === 'mercadopago'
                  ? 'MercadoPago'
                  : selectedMethod === 'card'
                    ? 'pago con tarjeta'
                    : selectedMethod === 'transfer'
                      ? 'transferencia bancaria'
                      : selectedMethod === 'oxxo'
                        ? 'pago en OXXO'
                        : selectedMethod === 'paypal'
                          ? 'PayPal'
                          : selectedMethod === 'crypto'
                            ? 'pago con criptomonedas'
                            : 'método seleccionado'}
              </Text>
              <TouchableOpacity
                style={[styles.cancelRetryButton, { borderColor: isDark ? '#fff' : '#000' }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.cancelRetryButtonText, { color: isDark ? '#fff' : '#000' }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* 📱 INTERFAZ NORMAL DE SELECCIÓN DE MÉTODOS DE PAGO */}
              {/* Título principal */}
              <Text style={[styles.mainTitle, { color: isDark ? '#fff' : '#000' }]}>
                Selecciona tu método de pago
              </Text>

              {/* Subtítulo */}
              <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
                Elige la opción que prefieras para completar tu compra
              </Text>

              {/* Contenedor de métodos de pago */}
              <View
                style={[styles.paymentSection, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}
              >
                {/* MercadoPago */}
                <View style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodHeader}>
                      <Image
                        source={require('../../assets/images/payment-icons/mercadopago.png')}
                        style={styles.paymentHeaderIcon}
                      />
                      <Text style={[styles.paymentMethodName, { color: isDark ? '#fff' : '#000' }]}>
                        MercadoPago
                      </Text>
                    </View>
                    <Text style={[styles.paymentMethodDesc, { color: isDark ? '#ccc' : '#666' }]}>
                      Tarjetas, transferencia, efectivo
                    </Text>
                    <Text style={[styles.paymentMethodFeature, { color: '#00b4d8' }]}>
                      ✓ Pago seguro e instantáneo
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.paymentIconButton,
                      {
                        backgroundColor: 'rgba(0,180,216,0.1)',
                        borderWidth: 1,
                        borderColor: '#00b4d8',
                      },
                    ]}
                    onPress={handleMercadoPagoPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size={24} color="#00b4d8" />
                    ) : (
                      <Image
                        source={require('../../assets/images/payment-icons/mercadopago.png')}
                        style={styles.paymentButtonIcon}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Transferencia Bancaria */}
                <View style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodHeader}>
                      <MaterialIcons name="account-balance" size={20} color="#4CAF50" />
                      <Text style={[styles.paymentMethodName, { color: isDark ? '#fff' : '#000' }]}>
                        Transferencia Bancaria
                      </Text>
                    </View>
                    <Text style={[styles.paymentMethodDesc, { color: isDark ? '#ccc' : '#666' }]}>
                      SPEI, transferencia directa
                    </Text>
                    <Text style={[styles.paymentMethodFeature, { color: '#4CAF50' }]}>
                      ✓ Sin comisiones adicionales
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.paymentIconButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleAlternativePayment('transfer')}
                    disabled={loading}
                  >
                    <MaterialIcons name="account-balance" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* OXXO */}
                <View style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodHeader}>
                      <Image
                        source={require('../../assets/images/payment-icons/oxxo.png')}
                        style={styles.paymentHeaderIcon}
                      />
                      <Text style={[styles.paymentMethodName, { color: isDark ? '#fff' : '#000' }]}>
                        OXXO
                      </Text>
                    </View>
                    <Text style={[styles.paymentMethodDesc, { color: isDark ? '#ccc' : '#666' }]}>
                      Pago en efectivo en tienda
                    </Text>
                    <Text style={[styles.paymentMethodFeature, { color: '#E91E63' }]}>
                      ✓ Más de 20,000 tiendas
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.paymentIconButton,
                      {
                        backgroundColor: 'rgba(233,30,99,0.1)',
                        borderWidth: 1,
                        borderColor: '#E91E63',
                      },
                    ]}
                    onPress={() => handleAlternativePayment('oxxo')}
                    disabled={loading}
                  >
                    <Image
                      source={require('../../assets/images/payment-icons/oxxo.png')}
                      style={styles.paymentButtonIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* PayPal */}
                <View style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodHeader}>
                      <Image
                        source={require('../../assets/images/payment-icons/paypal.png')}
                        style={styles.paymentHeaderIcon}
                      />
                      <Text style={[styles.paymentMethodName, { color: isDark ? '#fff' : '#000' }]}>
                        PayPal
                      </Text>
                    </View>
                    <Text style={[styles.paymentMethodDesc, { color: isDark ? '#ccc' : '#666' }]}>
                      Pago internacional seguro
                    </Text>
                    <Text style={[styles.paymentMethodFeature, { color: '#0070ba' }]}>
                      ✓ Protección del comprador
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.paymentIconButton,
                      {
                        backgroundColor: 'rgba(0,112,186,0.1)',
                        borderWidth: 1,
                        borderColor: '#0070ba',
                      },
                    ]}
                    onPress={() => handleAlternativePayment('paypal')}
                    disabled={loading}
                  >
                    <Image
                      source={require('../../assets/images/payment-icons/paypal.png')}
                      style={styles.paymentButtonIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Criptomonedas */}
                <View style={styles.paymentMethodRow}>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodHeader}>
                      <Image
                        source={require('../../assets/images/payment-icons/bitcoin.png')}
                        style={styles.paymentHeaderIcon}
                      />
                      <Text style={[styles.paymentMethodName, { color: isDark ? '#fff' : '#000' }]}>
                        Criptomonedas
                      </Text>
                    </View>
                    <Text style={[styles.paymentMethodDesc, { color: isDark ? '#ccc' : '#666' }]}>
                      Bitcoin, USDT, Ethereum
                    </Text>
                    <Text style={[styles.paymentMethodFeature, { color: '#FF9800' }]}>
                      ✓ Pagos descentralizados
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.paymentIconButton,
                      {
                        backgroundColor: 'rgba(255,152,0,0.1)',
                        borderWidth: 1,
                        borderColor: '#FF9800',
                      },
                    ]}
                    onPress={() => handleAlternativePayment('crypto')}
                    disabled={loading}
                  >
                    <Image
                      source={require('../../assets/images/payment-icons/bitcoin.png')}
                      style={styles.paymentButtonIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Información de seguridad */}
              <View
                style={[styles.securityInfo, { backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa' }]}
              >
                <MaterialIcons name="security" size={24} color="#4CAF50" />
                <Text style={[styles.securityText, { color: isDark ? '#ccc' : '#666' }]}>
                  Todos los pagos están protegidos con encriptación SSL de 256 bits
                </Text>
              </View>

              {/* Indicador de carga global */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#00b4d8" />
                  <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
                    Procesando pago...
                  </Text>
                </View>
              )}
            </>
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
  contentContainer: {
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  paymentSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  paymentMethodDesc: {
    fontSize: 14,
    marginLeft: 32,
    marginBottom: 4,
  },
  paymentMethodFeature: {
    fontSize: 13,
    marginLeft: 32,
    fontWeight: '500',
  },
  paymentIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  paymentHeaderIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  paymentButtonIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  // 🔄 Estilos para pantalla de retry
  retryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  retryLoadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    textAlign: 'center',
  },
  retryLoadingSubtitle: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  cancelRetryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
  },
  cancelRetryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos antiguos mantenidos por compatibilidad
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
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
