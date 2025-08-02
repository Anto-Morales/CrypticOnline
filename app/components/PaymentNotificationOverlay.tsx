import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface PaymentNotificationProps {
  show: boolean;
  type: 'success' | 'error' | 'pending';
  title: string;
  message: string;
  onHide: () => void;
}

const PaymentNotificationOverlay: React.FC<PaymentNotificationProps> = ({
  show,
  type,
  title,
  message,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (show) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 50,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -200,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show]);

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDark ? '#1d4e1f' : '#d4edda',
          borderColor: '#28a745',
          iconColor: '#28a745',
        };
      case 'error':
        return {
          backgroundColor: isDark ? '#4e1d1d' : '#f8d7da',
          borderColor: '#dc3545',
          iconColor: '#dc3545',
        };
      case 'pending':
        return {
          backgroundColor: isDark ? '#1d3a4e' : '#d1ecf1',
          borderColor: '#17a2b8',
          iconColor: '#17a2b8',
        };
      default:
        return {
          backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
          borderColor: '#6c757d',
          iconColor: '#6c757d',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  if (!show) return null;

  const notificationStyle = getNotificationStyle();

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.notification,
          {
            backgroundColor: notificationStyle.backgroundColor,
            borderColor: notificationStyle.borderColor,
            width: width - 40,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationContent}
          onPress={onHide}
          activeOpacity={0.9}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#fff' : '#000' }
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.message,
                { color: isDark ? '#ccc' : '#555' }
              ]}
            >
              {message}
            </Text>
          </View>

          <View style={styles.dismissContainer}>
            <Text style={[styles.dismissText, { color: notificationStyle.iconColor }]}>
              Tocar para cerrar
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
    alignItems: 'center',
  },
  notification: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginHorizontal: 20,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 18,
  },
  dismissContainer: {
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PaymentNotificationOverlay;