import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
  paymentMethod?: string;
}

const CompraExitosaScreen: React.FC = () => {
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
        paymentMethod: 'OXXO PAY',
      };

  const themeColors = {
    primary: '#2c3e50',
    secondary: '#3498db',
    text: '#2c3e50',
    lightText: '#ffffff',
    border: '#dfe6e9',
    background: '#f8f9fa',
    success: '#28a745',
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: '#fff' }]}>
          <View style={[styles.successCircle, { backgroundColor: themeColors.success }]}>
            <MaterialIcons name="check" size={36} color="#fff" />
          </View>

          <Text style={[styles.title, { color: themeColors.primary }]}>¡COMPRA EXITOSA!</Text>
          <Text style={[styles.subtitle, { color: themeColors.text }]}>Gracias por tu compra</Text>

          {/* Lista de productos comprados */}
          {checkoutData.items?.map((item) => (
            <View key={item.id} style={styles.productContainer}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: themeColors.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.productDetail, { color: themeColors.text }]}>
                  TALLA {item.size}
                </Text>
                <Text style={[styles.productDetail, { color: themeColors.text }]}>
                  Cantidad: {item.quantity} | ${(item.price * item.quantity).toFixed(2)} MXN
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.statusContainer, { backgroundColor: '#e8f5e9' }]}>
            <MaterialIcons name="local-shipping" size={24} color={themeColors.success} />
            <Text style={[styles.statusText, { color: themeColors.success }]}>
              TU PEDIDO ESTÁ EN PREPARACIÓN
            </Text>
          </View>

          <Text style={[styles.deliveryText, { color: themeColors.text }]}>
            LLEGA ENTRE EL 23 DE JULIO AL 27
          </Text>

          <View style={styles.summaryContainer}>
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
            <View style={styles.divider} />
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
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/inicio')}>
            <Text style={[styles.backButtonText, { color: themeColors.text }]}>
              Volver al inicio
            </Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width > 500 ? '80%' : '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  productDetail: {
    fontSize: 14,
    marginBottom: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    justifyContent: 'center',
  },
  statusText: {
    marginLeft: 10,
    fontWeight: '500',
  },
  deliveryText: {
    fontSize: 15,
    marginBottom: 25,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    textDecorationLine: 'underline',
  },
});

export default CompraExitosaScreen;
