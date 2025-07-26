import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  image: any;
  quantity: number;
}

const CartScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingCost, setShippingCost] = useState(150);

  // Cargar productos del carrito
  useEffect(() => {
    if (params.newProduct) {
      try {
        const newProduct = JSON.parse(params.newProduct as string);

        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.id === newProduct.id);

          if (existingItem) {
            return prevItems.map((item) =>
              item.id === newProduct.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            return [...prevItems, newProduct];
          }
        });

        // Limpiar parámetros después de agregar
        router.setParams({ newProduct: undefined });
      } catch (error) {
        console.error('Error al procesar producto:', error);
      }
    }
  }, [params.newProduct]);

  // Función para eliminar producto del carrito
  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Calcular subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calcular total
  const total = subtotal + shippingCost;

  // Procesar compra
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos al carrito antes de comprar');
      return;
    }

    router.push({
      pathname: '/pay/FormsPago',
      params: {
        checkoutData: JSON.stringify({
          items: cartItems,
          subtotal,
          shipping: shippingCost,
          total,
        }),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>TU CARRITO</Text>
          <Text style={styles.itemCount}>
            {cartItems.length} {cartItems.length === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'}
          </Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/(tabs)/inicio')}
            >
              <Text style={styles.continueButtonText}>CONTINUAR COMPRANDO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Lista de productos */}
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={item.image} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSize}>{item.size}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)} MXN</Text>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <AntDesign name="minus" size={16} color="#333" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <AntDesign name="plus" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                  <AntDesign name="close" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Costo de envío */}
            <View style={styles.shippingContainer}>
              <Text style={styles.sectionTitle}>ENVÍO</Text>
              <View style={styles.shippingOptions}>
                <TouchableOpacity
                  style={[styles.shippingOption, shippingCost === 150 && styles.selectedShipping]}
                  onPress={() => setShippingCost(150)}
                >
                  <Text style={styles.shippingText}>Estándar (3-5 días)</Text>
                  <Text style={styles.shippingPrice}>$150 MXN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shippingOption, shippingCost === 250 && styles.selectedShipping]}
                  onPress={() => setShippingCost(250)}
                >
                  <Text style={styles.shippingText}>Express (1-2 días)</Text>
                  <Text style={styles.shippingPrice}>$250 MXN</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Resumen de compra */}
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>RESUMEN DE COMPRA</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)} MXN</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>${shippingCost.toFixed(2)} MXN</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)} MXN</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>PROCEDER AL PAGO</Text>
            <Text style={styles.checkoutButtonPrice}>${total.toFixed(2)} MXN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 20,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    position: 'absolute',
    top: 15,
    right: 0,
    padding: 5,
  },
  shippingContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  shippingOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  shippingOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedShipping: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0066cc',
  },
  shippingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  shippingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutButtonPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;
