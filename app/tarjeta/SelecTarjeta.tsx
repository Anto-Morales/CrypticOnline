import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

const SelecTarjeta = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 600;

  const [cardData, setCardData] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const storedCards = await AsyncStorage.getItem('cards');
        if (storedCards) {
          const parsedCards = JSON.parse(storedCards);

          // Validar que cada tarjeta tenga los datos necesarios
          const validCards = parsedCards.filter(
            (card: any) =>
              card.id &&
              card.cardNumber &&
              card.cardHolder &&
              card.expiryDate &&
              card.type &&
              card.backgroundColor
          );

          setCardData(validCards);
        }
      } catch (error) {
        console.log('Error al obtener tarjetas:', error);
      }
    };

    fetchCards();
  }, []);

  const handleSelectCard = (id: string) => {
    setSelectedCardId(id);
  };

  const handlePay = () => {
    if (!selectedCardId) {
      Alert.alert('Selecciona una tarjeta para pagar');
      return;
    }

    const selectedCard = cardData.find((card) => card.id === selectedCardId);

    Alert.alert(
      'Pago realizado',
      `Pagaste con la tarjeta terminada en ${selectedCard?.cardNumber.slice(-4)}`
    );
  };

  const renderCardItem = ({ item }: { item: any }) => {
    const isSelected = selectedCardId === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelectCard(item.id)}
        style={[
          styles.cardItem,
          { backgroundColor: item.backgroundColor },
          isSelected && styles.selectedCard,
        ]}
      >
        <View style={styles.cardHeader}>
          {item.type === 'Visa' && <MaterialIcons name="credit-card" size={28} color="#fff" />}
          {item.type === 'Mastercard' && (
            <MaterialIcons name="credit-card" size={28} color="#fff" />
          )}

          {isSelected && <MaterialIcons name="check-circle" size={28} color="#4CAF50" />}
        </View>

        <Text style={styles.cardNumber}>{item.cardNumber}</Text>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>Titular</Text>
            <Text style={styles.cardHolder}>{item.cardHolder}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Expira</Text>
            <Text style={styles.expiryDate}>{item.expiryDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Panel izquierdo - Lista de tarjetas */}
        <View style={styles.cardsPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecciona una tarjeta para pagar</Text>
            <Text style={styles.subtitle}>Elige tu método de pago favorito</Text>
          </View>

          {cardData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No hay tarjetas disponibles. Agrega una desde la sección &quot;Mis Tarjetas&quot;.
              </Text>
            </View>
          ) : (
            <FlatList
              data={cardData}
              renderItem={renderCardItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Botones abajo para pantallas pequeñas */}
          {isSmallScreen && (
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.push('/tarjeta/tarjeta')}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.buttonText}>Agregar Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, !selectedCardId ? styles.disabledButton : styles.payButton]}
                onPress={handlePay}
                disabled={!selectedCardId}
              >
                <MaterialIcons name="payment" size={24} color="#fff" />
                <Text style={styles.buttonText}>Pagar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Panel derecho - Solo visible en pantallas grandes */}
        {!isSmallScreen && (
          <View style={styles.actionsPanel}>
            <Animated.View
              style={[
                styles.animationContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: fadeAnim }],
                },
              ]}
            >
              <LottieView
                source={require('@/animations/tarjeta.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </Animated.View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.push('/tarjeta/tarjeta')}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.buttonText}>Agregar Tarjeta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, !selectedCardId ? styles.disabledButton : styles.payButton]}
                onPress={handlePay}
                disabled={!selectedCardId}
              >
                <MaterialIcons name="payment" size={24} color="#fff" />
                <Text style={styles.buttonText}>Pagar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  cardsPanel: {
    flex: 2,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  actionsPanel: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardItem: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#28a745',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 30,
    fontFamily: 'Courier',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  cardHolder: {
    color: '#fff',
    fontSize: 14,
  },
  expiryDate: {
    color: '#fff',
    fontSize: 14,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  buttonsContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#000',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  payButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SelecTarjeta;
