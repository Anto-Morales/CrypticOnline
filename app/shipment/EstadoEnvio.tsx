import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: any;
  quantity: number;
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

const EstadoEnvioScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Obtener datos del checkout
  const checkoutData = params.checkoutData
    ? (JSON.parse(params.checkoutData as string) as CheckoutData)
    : {
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      };

  const themeColors = {
    primary: '#2c3e50',
    secondary: '#3498db',
    text: '#2c3e50',
    lightText: '#ffffff',
    border: '#dfe6e9',
    background: '#f5f5f5',
    success: '#4CAF50',
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: themeColors.primary }]}>ESTADO DE ENVÍO</Text>

        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                styles.circleFilled,
                { backgroundColor: themeColors.success, borderColor: themeColors.success },
              ]}
            >
              <MaterialIcons name="check" size={12} color="#fff" />
            </View>
            <Text style={[styles.stepTextActive, { color: themeColors.success }]}>
              EN PREPARACIÓN
            </Text>
          </View>

          <View style={[styles.line, { backgroundColor: themeColors.border }]} />

          <View style={styles.stepContainer}>
            <View style={[styles.circle, { borderColor: themeColors.border }]} />
            <Text style={[styles.stepText, { color: themeColors.text }]}>EN CAMINO</Text>
          </View>

          <View style={[styles.line, { backgroundColor: themeColors.border }]} />

          <View style={styles.stepContainer}>
            <View style={[styles.circle, { borderColor: themeColors.border }]} />
            <Text style={[styles.stepText, { color: themeColors.text }]}>ENTREGADO</Text>
          </View>
        </View>

        {/* Lista de productos */}
        {checkoutData.items?.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: '#fff' }]}>
            <Image source={item.image} style={styles.image} />
            <Text style={[styles.productTitle, { color: themeColors.primary }]}>{item.name}</Text>
            <Text style={[styles.productDetail, { color: themeColors.text }]}>
              TALLA {item.size}
            </Text>
            <Text style={[styles.productDetail, { color: themeColors.text }]}>
              Cantidad: {item.quantity} | ${(item.price * item.quantity).toFixed(2)} MXN
            </Text>
            <Text style={[styles.statusText, { color: themeColors.success }]}>
              TU PEDIDO ESTÁ EN PREPARACIÓN
            </Text>
            <Text style={[styles.deliveryText, { color: themeColors.text }]}>
              LLEGA ENTRE EL 23 DE JULIO A 27
            </Text>
          </View>
        ))}

        {/* Resumen de compra */}
        <View style={[styles.summaryCard, { backgroundColor: '#fff' }]}>
          <Text style={[styles.summaryTitle, { color: themeColors.primary }]}>
            Resumen de Compra
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.text }]}>Subtotal:</Text>
            <Text style={[styles.summaryValue, { color: themeColors.text }]}>
              ${checkoutData.subtotal?.toFixed(2) || '0.00'} MXN
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.text }]}>Envío:</Text>
            <Text style={[styles.summaryValue, { color: themeColors.text }]}>
              ${checkoutData.shipping?.toFixed(2) || '0.00'} MXN
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: themeColors.primary }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: themeColors.primary }]}>
              ${checkoutData.total?.toFixed(2) || '0.00'} MXN
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.primary }]}
          onPress={() => router.push('/shipment/EstadoEnvio')}
        >
          <Text style={[styles.buttonText, { color: themeColors.lightText }]}>SEGUIR ENVÍO</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(tabs)/inicio')}
        >
          <Text style={[styles.secondaryButtonText, { color: themeColors.primary }]}>
            Volver al inicio
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  // Timeline styles
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    width: 100,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  circleFilled: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 5,
  },
  stepText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  stepTextActive: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Card styles
  card: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  summaryCard: {
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  deliveryText: {
    fontSize: 14,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    width: '100%',
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  secondaryButton: {
    width: '100%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    textDecorationLine: 'underline',
  },
});

export default EstadoEnvioScreen;
