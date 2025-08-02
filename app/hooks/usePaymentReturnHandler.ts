import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { apiRequest } from '../config/api';

interface PaymentSession {
  orderId: string;
  preferenceId: string;
  startTime: number;
  isActive: boolean;
}

export const usePaymentReturnHandler = () => {
  const router = useRouter();
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);

  // Iniciar sesión de pago
  const startPaymentSession = async (orderId: string, preferenceId: string) => {
    const session: PaymentSession = {
      orderId,
      preferenceId,
      startTime: Date.now(),
      isActive: true
    };
    
    await AsyncStorage.setItem('activePaymentSession', JSON.stringify(session));
    setPaymentSession(session);
    console.log('💳 Sesión de pago iniciada:', session);
  };

  // Finalizar sesión de pago
  const endPaymentSession = async () => {
    await AsyncStorage.removeItem('activePaymentSession');
    setPaymentSession(null);
    console.log('💳 Sesión de pago finalizada');
  };

  // Verificar estado del pago
  const checkPaymentOnReturn = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('activePaymentSession');
      if (!sessionData) {
        console.log('🔍 No hay sesión de pago activa');
        return;
      }

      const session: PaymentSession = JSON.parse(sessionData);
      if (!session.isActive) {
        console.log('🔍 Sesión de pago no está activa');
        return;
      }

      console.log('🔄 Usuario regresó a la app, verificando pago...', session);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ No hay token, no se puede verificar pago');
        return;
      }

      // Verificar estado de la orden con retry
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          console.log(`🔍 Intento ${attempts + 1} de verificación...`);
          
          const { response, data } = await apiRequest(`/api/orders/${session.orderId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok && data.order) {
            const order = data.order;
            console.log('📊 Estado de la orden verificado:', order.status);

            // Finalizar sesión antes de mostrar notificación
            await endPaymentSession();

            // Mostrar notificación según el estado
            setTimeout(() => {
              showPaymentResultNotification(order);
            }, 1500); // Más tiempo para que la app se cargue

            return; // Salir del loop si fue exitoso
          } else {
            console.log(`⚠️ Intento ${attempts + 1} falló:`, response.status);
          }
        } catch (attemptError: any) {
          console.log(`❌ Error en intento ${attempts + 1}:`, attemptError?.message || attemptError);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        }
      }
      
      // Si todos los intentos fallaron, mostrar error genérico
      await endPaymentSession();
      setTimeout(() => {
        showPaymentResultNotification({ 
          status: 'UNKNOWN', 
          total: 0, 
          id: session.orderId 
        });
      }, 1500);

    } catch (error) {
      console.error('❌ Error verificando pago al regresar:', error);
      await endPaymentSession();
    }
  };

  // Mostrar notificación de resultado
  const showPaymentResultNotification = (order: any) => {
    switch (order.status) {
      case 'PAID':
        Alert.alert(
          '¡Pago Exitoso! ✅',
          `Tu pago de $${order.total} MXN ha sido procesado correctamente.\n\nPedido #${order.id}`,
          [
            {
              text: 'Ver Pedidos',
              onPress: () => router.replace('/pedidos/mis-pedidos')
            },
            {
              text: 'Continuar Comprando',
              onPress: () => router.replace('/(tabs)/inicio'),
              style: 'cancel'
            }
          ]
        );
        break;

      case 'PENDING':
        Alert.alert(
          'Pago Pendiente ⏳',
          `Tu pago está siendo procesado. Te notificaremos cuando se complete.\n\nPedido #${order.id}`,
          [
            {
              text: 'Entendido',
              onPress: () => router.replace('/(tabs)/inicio')
            }
          ]
        );
        break;

      case 'CANCELLED':
      case 'FAILED':
        Alert.alert(
          'Pago No Completado ❌',
          'Tu pago no pudo ser procesado. Puedes intentar nuevamente.',
          [
            {
              text: 'Reintentar',
              onPress: () => router.replace('/(tabs)/carrito')
            },
            {
              text: 'Ir al Inicio',
              onPress: () => router.replace('/(tabs)/inicio'),
              style: 'cancel'
            }
          ]
        );
        break;

      case 'UNKNOWN':
      default:
        Alert.alert(
          'Verificando Pago ⏳',
          'Estamos verificando el estado de tu pago. Te notificaremos cuando tengamos más información.',
          [
            {
              text: 'Ver Pedidos',
              onPress: () => router.replace('/pedidos/mis-pedidos')
            },
            {
              text: 'Ir al Inicio',
              onPress: () => router.replace('/(tabs)/inicio'),
              style: 'cancel'
            }
          ]
        );
        break;
    }
  };

  // Listener para detectar cuando la app vuelve al foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App volvió al foreground');
        // Verificar si hay una sesión de pago activa
        checkPaymentOnReturn();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Verificar al montar el componente
    checkPaymentOnReturn();

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    startPaymentSession,
    endPaymentSession,
    paymentSession
  };
};