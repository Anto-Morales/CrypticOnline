import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';

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
  
  const cartItems: CartItem[] = [
    {
      id: 1,
      name: 'PLAYERA 1',
      size: 'TALLA MEDIANA',
      status: 'TU PEDIDO ESTA EN PREPARACION LLEGA ENTRE EL 23 DE JULIO A 27',
      price: 999,
      image: require('../../assets/images/shirt1.png')
    },
    {
      id: 2,
      name: 'PLAYERA 1',
      size: 'TALLA MEDIANA',
      status: 'TU PEDIDO ESTA EN PREPARACION LLEGA ENTRE EL 23 DE JULIO A 27',
      price: 999,
      image: require('../../assets/images/shirt1.png')
    }
  ];

  const shippingCost = 200;
  const totalProducts = cartItems.length;
  const totalProductsPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const totalToPay = totalProductsPrice + shippingCost;

  return (
    <View style={styles.container}>
      {/* Header with logo, search and icons */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Logo.png')} 
          style={styles.companyLogo}
        />
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
          />
        </View>

      </View>

      <ScrollView style={styles.contentContainer}>
        {cartItems.map(item => (
          <View key={item.id} style={styles.itemContainer}>
            <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSize}>{item.size}</Text>
              <Text style={styles.itemStatus}>{item.status}</Text>
              <Text style={styles.itemPrice}>$ {item.price} MXN</Text>
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.secondaryButton}>
                  <Text>ELIMINAR DEL CARRITO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>COMPRAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>TOTAL A PAGAR</Text>
          <Text style={styles.summaryText}>Productos: {totalProducts}</Text>
          <Text style={styles.summaryText}>Envios: 1</Text>
          <Text style={styles.summaryText}>Costo de Envios: ${shippingCost} MXN</Text>
          <Text style={styles.totalPrice}>$ {totalToPay} MXN</Text>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>COMPRAR CARRITO</Text>
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
    padding: 10
  },
  itemImage: {
    width: 100,
    height: 100,
    marginRight: 10
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  itemSize: {
    fontSize: 14,
    color: '#555',
    marginTop: 5
  },
  itemStatus: {
    fontSize: 12,
    color: '#333',
    marginTop: 5
  },
  itemPrice: {
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 16
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    borderRadius: 5
  },
  primaryButton: {
    backgroundColor: '#000',
    padding: 8,
    borderRadius: 5
  },
  primaryButtonText: {
    color: '#fff'
  },
  summaryContainer: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 15,
    marginTop: 20
  },
  summaryTitle: {  // Corrected from sumaryTitle to summaryTitle
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5
  },
  totalPrice: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10
  },
  checkoutButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 15
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
});

export default CartScreen;