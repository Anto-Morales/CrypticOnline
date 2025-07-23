import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface CartItem {
  id: number;
  name: string;
  size: string;
  status: string;
  price: number;
  image: any;
}

const CartScreen: React.FC = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const cartItems: CartItem[] = [
    {
      id: 1,
      name: 'PLAYERA 1',
      size: 'TALLA MEDIANA',
      status: 'TU PEDIDO ESTA EN PREPARACION LLEGA ENTRE EL 23 DE JULIO A 27',
      price: 999,
      image: require('../../assets/images/shirt1.png'),
    },
    {
      id: 2,
      name: 'PLAYERA 1',
      size: 'TALLA MEDIANA',
      status: 'TU PEDIDO ESTA EN PREPARACION LLEGA ENTRE EL 23 DE JULIO A 27',
      price: 999,
      image: require('../../assets/images/shirt1.png'),
    },
  ];

  const shippingCost = 200;
  const totalProducts = cartItems.length;
  const totalProductsPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalToPay = totalProductsPrice + shippingCost;

  // Estilos responsivos
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5'; // color claro para tarjetas en modo claro
  const borderColor = isDark ? '#fff' : '#000';

  const contentContainerStyle = {
    flex: 1,
    padding: screenWidth < 400 ? 8 : 20,
    width: screenWidth < 500 ? '100%' : 500,
    alignSelf: 'center',
  };
  const itemContainerStyle = {
    borderWidth: 1,
    borderColor: borderColor,
    marginBottom: 20,
    padding: screenWidth < 400 ? 6 : 10,
    borderRadius: 10,
    backgroundColor: cardBg,
  };
  const itemImageStyle = {
    width: screenWidth < 400 ? 70 : 100,
    height: screenWidth < 400 ? 70 : 100,
    marginRight: 10,
    borderRadius: 8,
  };
  const summaryContainerStyle = {
    borderWidth: 1,
    borderColor: borderColor,
    padding: screenWidth < 400 ? 10 : 15,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: cardBg,
  };

  const handleComprarProducto = (item: CartItem) => {
    router.push({ pathname: '/(tabs)/pago', params: { productoId: item.id } });
  };

  const handleComprarCarrito = () => {
    // Enviamos los productos del carrito como parámetro
    router.push({
      pathname: '/(tabs)/pago',
      params: {
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            title: item.name,
            quantity: 1, // Puedes ajustar la cantidad si tienes ese dato
            unit_price: item.price,
          }))
        ),
        productoId: 'carrito',
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {/* Header with logo, search and icons */}
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.companyLogo} />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center' }}>
        {cartItems.map((item) => (
          <View key={item.id} style={[styles.itemContainer, itemContainerStyle]}>
            <Image source={item.image} style={itemImageStyle} resizeMode="contain" />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: isDark ? '#fff' : '#000' }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemSize, { color: isDark ? '#ccc' : '#555' }]}>
                {item.size}
              </Text>
              <Text style={[styles.itemStatus, { color: isDark ? '#aaa' : '#333' }]}>
                {item.status}
              </Text>
              <Text
                style={[styles.itemPrice, { color: isDark ? '#fff' : '#000' }]}
              >{`$ ${item.price} MXN`}</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={[styles.secondaryButton, { borderColor }]}>
                  <Text style={{ color: isDark ? '#fff' : '#000' }}>ELIMINAR DEL CARRITO</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: isDark ? '#fff' : '#000' }]}
                  onPress={() => handleComprarProducto(item)}
                >
                  <Text style={[styles.primaryButtonText, { color: isDark ? '#000' : '#fff' }]}>
                    COMPRAR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.summaryContainer, summaryContainerStyle]}>
          <Text style={[styles.summaryTitle, { color: isDark ? '#fff' : '#000' }]}>
            TOTAL A PAGAR
          </Text>
          <Text style={[styles.summaryText, { color: isDark ? '#fff' : '#000' }]}>
            Productos: {totalProducts}
          </Text>
          <Text style={[styles.summaryText, { color: isDark ? '#fff' : '#000' }]}>Envios: 1</Text>
          <Text style={[styles.summaryText, { color: isDark ? '#fff' : '#000' }]}>
            Costo de Envios: ${shippingCost} MXN
          </Text>
          <Text style={[styles.totalPrice, { color: isDark ? '#fff' : '#000' }]}>
            $ {totalToPay} MXN
          </Text>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              { backgroundColor: isDark ? '#fff' : '#000', width: '100%' },
            ]}
            onPress={handleComprarCarrito}
          >
            <Text style={[styles.checkoutButtonText, { color: isDark ? '#000' : '#fff' }]}>
              COMPRAR CARRITO
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingTop: 5,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  companyLogo: {
    width: 150,
    height: 150,
    marginRight: 10,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    padding: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  icon: {
    width: 28,
    height: 28,
    marginLeft: 15,
    tintColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
    padding: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemSize: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  itemStatus: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  itemPrice: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 5,
  },
  primaryButtonText: {
    color: '#fff',
  },
  summaryContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 15,
    marginTop: 20,
  },
  summaryTitle: {
    // Corrected from sumaryTitle to summaryTitle
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
  },
  totalPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  checkoutButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CartScreen;
