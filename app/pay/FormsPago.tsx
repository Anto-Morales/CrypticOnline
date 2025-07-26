import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
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
}

const FormaDePagoScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  // Obtener datos del carrito
  const checkoutData = params.checkoutData
    ? (JSON.parse(params.checkoutData as string) as CheckoutData)
    : null;

  const themeColors = {
    primary: '#2c3e50',
    secondary: '#3498db',
    text: '#2c3e50',
    lightText: '#ffffff',
    border: '#dfe6e9',
    background: '#f8f9fa',
    success: '#27ae60',
  };

  const [selected, setSelected] = useState('');

  type PagoPath = '/pay/Tarjeta' | '/pay/Paypal' | '/pay/MercadoPago' | '/pay/OxxoPay';

  const opciones: { key: string; label: string; path: PagoPath }[] = [
    { key: 'tarjeta', label: 'Tarjeta de Crédito/Débito', path: '/pay/Tarjeta' },
    { key: 'paypal', label: 'PayPal', path: '/pay/Paypal' },
    { key: 'mercadopago', label: 'Mercado Pago', path: '/pay/MercadoPago' },
    { key: 'oxxopay', label: 'OXXO Pay', path: '/pay/OxxoPay' },
  ];

  const handleSeleccionar = (key: string) => {
    setSelected(key);
  };

  const handleContinuar = () => {
    const path = opciones.find((opt) => opt.key === selected)?.path;
    if (path) {
      router.push({
        pathname: path,
        params: {
          checkoutData: params.checkoutData, // Pasamos los mismos datos a la siguiente pantalla
        },
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.mainContainer, isSmallScreen ? styles.columnLayout : styles.rowLayout]}>
        {/* Sección de opciones de pago */}
        <View
          style={[
            styles.sectionContainer,
            styles.paymentOptions,
            isSmallScreen ? styles.fullWidth : styles.leftSection,
            { backgroundColor: '#ffffff' },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>Método de Pago</Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.text }]}>
            Selecciona tu forma de pago preferida
          </Text>

          <View style={styles.optionsContainer}>
            {opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion.key}
                style={[
                  styles.optionCard as ViewStyle,
                  {
                    borderColor:
                      selected === opcion.key ? themeColors.secondary : themeColors.border,
                    backgroundColor: selected === opcion.key ? '#e8f4fc' : '#ffffff',
                  },
                ]}
                onPress={() => handleSeleccionar(opcion.key)}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIcon as ViewStyle,
                      {
                        backgroundColor:
                          selected === opcion.key ? themeColors.secondary : '#f1f1f1',
                      },
                    ]}
                  >
                    <Text style={styles.optionIconText}>{opcion.label.charAt(0)}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: themeColors.text }]}>
                    {opcion.label}
                  </Text>
                </View>
                {selected === opcion.key && (
                  <View style={styles.selectedIndicator}>
                    <Text style={{ color: themeColors.secondary, fontWeight: 'bold' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección de resumen y botón */}
        <View
          style={[
            styles.sectionContainer,
            styles.summaryCard,
            isSmallScreen ? styles.fullWidth : styles.rightSection,
            { backgroundColor: '#ffffff' },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
            Resumen de Compra
          </Text>

          {/* Lista de productos */}
          {checkoutData?.items?.map((item) => (
            <View key={item.id} style={styles.productRow}>
              <Text style={[styles.productName, { color: themeColors.text }]}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.productPrice, { color: themeColors.text }]}>
                ${(item.price * item.quantity).toFixed(2)} MXN
              </Text>
            </View>
          ))}

          <View style={styles.summaryItems}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: themeColors.text }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                ${checkoutData?.subtotal?.toFixed(2) || '0.00'} MXN
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: themeColors.text }]}>Envío</Text>
              <Text style={[styles.summaryValue, { color: themeColors.text }]}>
                ${checkoutData?.shipping?.toFixed(2) || '0.00'} MXN
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.summaryRow, { marginBottom: 20 }]}>
            <Text style={[styles.totalLabel, { color: themeColors.primary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: themeColors.primary }]}>
              ${checkoutData?.total?.toFixed(2) || '0.00'} MXN
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button as ViewStyle,
              {
                backgroundColor: selected ? themeColors.secondary : '#ccc',
                opacity: selected ? 1 : 0.7,
              },
            ]}
            onPress={handleContinuar}
            disabled={!selected}
          >
            <Text style={[styles.buttonText, { color: themeColors.lightText }]}>
              CONTINUAR CON EL PAGO
            </Text>
          </TouchableOpacity>

          <View style={styles.securityContainer}>
            <View style={styles.securityIcon}>
              <Text style={{ color: themeColors.secondary }}>🔒</Text>
            </View>
            <Text style={[styles.securityText, { color: themeColors.text }]}>
              Pago seguro encriptado
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Definimos interfaces para los estilos
interface Styles {
  scrollContainer: ViewStyle;
  mainContainer: ViewStyle;
  rowLayout: ViewStyle;
  columnLayout: ViewStyle;
  sectionContainer: ViewStyle;
  fullWidth: ViewStyle;
  leftSection: ViewStyle;
  rightSection: ViewStyle;
  paymentOptions: ViewStyle;
  summaryCard: ViewStyle;
  sectionTitle: TextStyle;
  sectionSubtitle: TextStyle;
  optionsContainer: ViewStyle;
  optionCard: ViewStyle;
  optionContent: ViewStyle;
  optionIcon: ViewStyle;
  optionIconText: TextStyle;
  optionText: TextStyle;
  selectedIndicator: ViewStyle;
  summaryItems: ViewStyle;
  summaryRow: ViewStyle;
  summaryLabel: TextStyle;
  summaryValue: TextStyle;
  divider: ViewStyle;
  totalLabel: TextStyle;
  totalValue: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  securityContainer: ViewStyle;
  securityIcon: ViewStyle;
  securityText: TextStyle;
  productRow: ViewStyle;
  productName: TextStyle;
  productPrice: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
    width: '100%',
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  sectionContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  leftSection: {
    width: '58%',
    marginRight: '2%',
  },
  rightSection: {
    width: '40%',
  },
  paymentOptions: {},
  summaryCard: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    color: '#7f8c8d',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryItems: {
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  securityIcon: {
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default FormaDePagoScreen;
