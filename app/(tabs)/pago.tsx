import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function PagoScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();

  // Ejemplo de función para Mercado Pago
  const handleMercadoPago = async () => {
    setLoading(true);
    try {
      // Cambia la URL por la de tu backend
      const response = await fetch('https://TU_BACKEND_URL/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId: params.productoId || null }),
      });
      const data = await response.json();
      if (data.init_point) {
        // Redirige al usuario al link de Mercado Pago
        Alert.alert('Redirigiendo a Mercado Pago', data.init_point);
        // Aquí puedes usar Linking.openURL(data.init_point) si quieres abrir el navegador
      } else {
        Alert.alert('Error', 'No se pudo iniciar el pago');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el backend');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.title, { color: textColor }]}>Selecciona tu método de pago</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#009ee3' }]}
          onPress={handleMercadoPago}
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
