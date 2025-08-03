import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { apiRequest } from '../config/api';

interface PaymentSession {
  orderId: string;
  preferenceId: string;
  startTime: number;
  isActive: boolean;
  lastChecked?: number; // Prevenir múltiples verificaciones
}

interface PaymentAlertData {
  visible: boolean;
  type: 'success' | 'pending' | 'error';
  title: string;
  message: string;
  orderId?: string;
}

export const usePaymentReturnHandler = () => {
  const router = useRouter();
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [alertData, setAlertData] = useState<PaymentAlertData>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [isChecking, setIsChecking] = useState(false); // Prevenir verificaciones simultáneas

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
    setIsChecking(false);
    console.log('💳 Sesión de pago finalizada');
  };

  // Verificar estado del pago (con prevención de duplicados)
  const checkPaymentOnReturn = async (forceCheck = false) => {
    // Prevenir verificaciones simultáneas
    if (isChecking && !forceCheck) {
      console.log('🔄 Ya hay una verificación en progreso, saltando...');
      return;
    }

    try {
      setIsChecking(true);
      
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

      // Prevenir verificaciones muy frecuentes (mínimo 3 segundos entre verificaciones)
      const now = Date.now();
      if (session.lastChecked && (now - session.lastChecked) < 3000 && !forceCheck) {
        console.log('⏰ Verificación demasiado reciente, esperando...');
        return;
      }

      console.log('🔄 Verificando pago para orden:', session.orderId);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('❌ No hay token, no se puede verificar pago');
        return;
      }

      // Actualizar timestamp de última verificación
      session.lastChecked = now;
      await AsyncStorage.setItem('activePaymentSession', JSON.stringify(session));

      // Verificación más agresiva con reintentos rápidos
      let attempts = 0;
      const maxAttempts = 5; // Más intentos
      
      while (attempts < maxAttempts) {
        try {
          console.log(`🔍 Intento ${attempts + 1}/${maxAttempts} de verificación...`);
          
          const { response, data } = await apiRequest(`/api/orders/${session.orderId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok && data.order) {
            const order = data.order;
            console.log('📊 Estado verificado:', {
              orderId: order.id,
              status: order.status,
              total: order.total,
              attempts: attempts + 1
            });

            // Finalizar sesión inmediatamente
            await endPaymentSession();

            // Mostrar alerta personalizada con delay mínimo
            setTimeout(() => {
              showPaymentAlert(order);
            }, 500);

            return; // Salir exitosamente
          } else {
            console.log(`⚠️ Intento ${attempts + 1} falló - Status: ${response.status}`);
          }
        } catch (attemptError: any) {
          console.log(`❌ Error en intento ${attempts + 1}:`, attemptError?.message || attemptError);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Reintentos más rápidos: 1s, 2s, 3s, 4s
          await new Promise(resolve => setTimeout(resolve, attempts * 1000));
        }
      }
      
      // Si todos los intentos fallaron
      console.log('❌ Todos los intentos de verificación fallaron');
      await endPaymentSession();
      
      setTimeout(() => {
        showPaymentAlert({ 
          id: session.orderId,
          status: 'PENDING', 
          total: 0 
        });
      }, 500);

    } catch (error) {
      console.error('❌ Error verificando pago al regresar:', error);
      await endPaymentSession();
    } finally {
      setIsChecking(false);
    }
  };

  // Mostrar alerta personalizada
  const showPaymentAlert = (order: any) => {
    let alertConfig: PaymentAlertData;

    switch (order.status) {
      case 'PAID':
        alertConfig = {
          visible: true,
          type: 'success',
          title: '¡Pago Exitoso!',
          message: `Tu pago de $${order.total} MXN ha sido procesado correctamente.\n\nPedido #${order.id}`,
          orderId: order.id.toString(),
        };
        break;

      case 'PENDING':
        alertConfig = {
          visible: true,
          type: 'pending',
          title: 'Pago en Proceso',
          message: `Tu pago está siendo procesado. Te notificaremos cuando se complete.\n\nPedido #${order.id}`,
          orderId: order.id.toString(),
        };
        break;

      case 'CANCELLED':
      case 'FAILED':
        alertConfig = {
          visible: true,
          type: 'error',
          title: 'Pago No Completado',
          message: 'Tu pago no pudo ser procesado. Puedes intentar nuevamente.',
          orderId: order.id.toString(),
        };
        break;

      default:
        alertConfig = {
          visible: true,
          type: 'pending',
          title: 'Verificando Pago',
          message: 'Estamos verificando el estado de tu pago. Te notificaremos cuando tengamos más información.',
          orderId: order.id.toString(),
        };
        break;
    }

    setAlertData(alertConfig);
  };

  // Cerrar alerta
  const hideAlert = () => {
    setAlertData(prev => ({ ...prev, visible: false }));
  };

  // Acciones de los botones de la alerta
  const handlePrimaryAction = () => {
    hideAlert();
    if (alertData.type === 'success') {
      router.replace('/pedidos/mis-pedidos');
    } else {
      router.replace('/(tabs)/inicio');
    }
  };

  const handleSecondaryAction = () => {
    hideAlert();
    if (alertData.type === 'error') {
      router.replace('/(tabs)/carrito');
    } else {
      router.replace('/(tabs)/inicio');
    }
  };

  // Listener optimizado para detectar cuando la app vuelve al foreground
  useEffect(() => {
    let timeoutId: any;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App volvió al foreground');
        
        // Pequeño delay para asegurar que la app esté completamente cargada
        timeoutId = setTimeout(() => {
          checkPaymentOnReturn();
        }, 1000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Verificar una sola vez al montar
    timeoutId = setTimeout(() => {
      checkPaymentOnReturn();
    }, 1500);

    return () => {
      subscription?.remove();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    startPaymentSession,
    endPaymentSession,
    paymentSession,
    alertData,
    hideAlert,
    handlePrimaryAction,
    handleSecondaryAction,
    isChecking
  };
};