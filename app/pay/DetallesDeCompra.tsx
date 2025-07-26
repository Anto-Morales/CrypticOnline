import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: string;
}

const DetallesDeCompraScreen: React.FC = () => {
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
        shippingAddress: 'CALLE 2 ORIENTE, SANTA ROSA, TLAXCALA, MX',
      };

  const themeColors = {
    primary: '#2c3e50',
    secondary: '#3498db',
    text: '#2c3e50',
    lightText: '#ffffff',
    border: '#dfe6e9',
    background: '#f8f9fa',
    success: '#27ae60',
  };

  const paymentIcons: Record<string, any> = {
    'OXXO PAY': require('../../assets/images/mercado.png'),
    'Tarjeta de Crédito/Débito': require('../../assets/images/mercado.png'),
    PayPal: require('../../assets/images/mercado.png'),
    'Mercado Pago': require('../../assets/images/mercado.png'),
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>DETALLES DE ENTREGA</Text>
      <View style={[styles.card, { borderColor: themeColors.border }]}>
        <Text style={{ color: themeColors.text }}>
          📍 {checkoutData.shippingAddress || 'Dirección no especificada'}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>DETALLES DE PAGO</Text>
      <View style={[styles.card, { borderColor: themeColors.border }]}>
        {checkoutData.paymentMethod && paymentIcons[checkoutData.paymentMethod] && (
          <Image source={paymentIcons[checkoutData.paymentMethod]} style={styles.paymentIcon} />
        )}
        <Text style={{ color: themeColors.text }}>
          {checkoutData.paymentMethod || 'Método no especificado'}
        </Text>
      </View>

      <View style={[styles.summaryBox, { borderColor: themeColors.border }]}>
        <Text style={[styles.summaryTitle, { color: themeColors.primary }]}>Resumen de Compra</Text>

        {/* Lista de productos */}
        {checkoutData.items?.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <Text style={{ color: themeColors.text }}>
              {item.name} x{item.quantity}
            </Text>
            <Text style={{ color: themeColors.text }}>
              ${(item.price * item.quantity).toFixed(2)} MXN
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={{ color: themeColors.text }}>
          Subtotal: ${checkoutData.subtotal?.toFixed(2) || '0.00'} MXN
        </Text>
        <Text style={{ color: themeColors.text }}>
          Envío: ${checkoutData.shipping?.toFixed(2) || '0.00'} MXN
        </Text>
        <Text style={[styles.total, { color: themeColors.primary }]}>
          Total: ${checkoutData.total?.toFixed(2) || '0.00'} MXN
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.primary }]}
          onPress={() => router.push('/shipment/CompraExitosa')}
        >
          <Text style={[styles.buttonText, { color: themeColors.lightText }]}>CONFIRMAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIcon: {
    width: 60,
    height: 25,
    marginRight: 10,
  },
  summaryBox: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  total: {
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 10,
  },
});

export default DetallesDeCompraScreen;
