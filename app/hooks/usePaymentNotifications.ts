import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest } from '../config/api';

export interface PaymentNotification {
  show: boolean;
  type: 'success' | 'error' | 'pending';
  title: string;
  message: string;
  orderId?: number;
}

export const usePaymentNotifications = () => {
  const router = useRouter();
  const [notification, setNotification] = useState<PaymentNotification>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const checkPaymentStatus = async (orderId?: string, preferenceId?: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      console.log('🔍 Verificando estado de pago...', { orderId, preferenceId });

      // Si tenemos orderId, consultamos directamente
      if (orderId && orderId !== 'carrito') {
        const { response, data } = await apiRequest(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          return handlePaymentResult(data.order);
        }
      }

      // Si tenemos preferenceId, buscamos por preference
      if (preferenceId) {
        const { response, data } = await apiRequest(`/api/orders/by-preference/${preferenceId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          return handlePaymentResult(data.order);
        }
      }

      // Si no encontramos nada específico, mostrar estado genérico
      showNotification('pending', 'Verificando Pago', 'Estamos verificando el estado de tu pago...');
      
    } catch (error) {
      console.error('Error verificando estado de pago:', error);
      showNotification('error', 'Error de Conexión', 'No pudimos verificar el estado de tu pago');
    }
  };

  const handlePaymentResult = (order: any) => {
    console.log('📊 Estado de la orden:', order.status);

    switch (order.status) {
      case 'PAID':
        showNotification(
          'success',
          '¡Pago Exitoso! ✅',
          `Tu pago de $${order.total} MXN ha sido procesado correctamente. Recibirás un email de confirmación.`,
          order.id
        );
        return 'success';

      case 'PENDING':
        showNotification(
          'pending',
          'Pago Pendiente ⏳',
          'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          order.id
        );
        return 'pending';

      case 'CANCELLED':
        showNotification(
          'error',
          'Pago Cancelado ❌',
          'El pago fue cancelado. Puedes intentar nuevamente.',
          order.id
        );
        return 'cancelled';

      case 'FAILED':
        showNotification(
          'error',
          'Error en el Pago ❌',
          'Hubo un problema procesando tu pago. Intenta con otro método.',
          order.id
        );
        return 'failed';

      default:
        showNotification(
          'pending',
          'Verificando Pago ⏳',
          'Estamos verificando el estado de tu pago...',
          order.id
        );
        return 'unknown';
    }
  };

  const showNotification = (
    type: 'success' | 'error' | 'pending',
    title: string,
    message: string,
    orderId?: number
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      orderId
    });

    // Auto-hide después de 4 segundos para pending/error, 6 para success
    const delay = type === 'success' ? 6000 : 4000;
    setTimeout(() => {
      hideNotification();
    }, delay);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
    
    // Navegar al inicio después de esconder la notificación
    setTimeout(() => {
      router.replace('/(tabs)/inicio');
    }, 300);
  };

  const showPaymentAlert = (
    type: 'success' | 'error' | 'pending',
    title: string,
    message: string,
    orderId?: number
  ) => {
    const buttons = [
      {
        text: type === 'success' ? 'Ver Pedidos' : 'Ir al Inicio',
        onPress: () => {
          if (type === 'success' && orderId) {
            router.replace('/pedidos/mis-pedidos');
          } else {
            router.replace('/(tabs)/inicio');
          }
        }
      }
    ];

    if (type === 'error') {
      buttons.unshift({
        text: 'Reintentar',
        onPress: () => router.back()
      });
    }

    Alert.alert(title, message, buttons);
  };

  return {
    notification,
    checkPaymentStatus,
    showNotification,
    hideNotification,
    showPaymentAlert
  };
};