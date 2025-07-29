import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Platform,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SavedCardsScreen = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 600;

  const [cardData, setCardData] = useState<any[]>([]);
  const [showWebAlert, setShowWebAlert] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Estados para el modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const animationRef = useRef<LottieView>(null);

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
    const loadCards = async () => {
      try {
        const storedCards = await AsyncStorage.getItem('cards');
        if (storedCards) {
          setCardData(JSON.parse(storedCards));
        } else {
          setCardData([]);
        }
      } catch (error) {
        console.error('Error cargando las tarjetas:', error);
      }
    };

    loadCards();
  }, []);

  const confirmDelete = async (id: string) => {
    try {
      const newCards = cardData.filter((card) => card.id !== id);
      setCardData(newCards);
      await AsyncStorage.setItem('cards', JSON.stringify(newCards));
    } catch (error) {
      console.error('Error eliminando la tarjeta:', error);
    }
  };

  // Función para mostrar nuestro modal personalizado
  const showCustomAlert = (title: string, message: string, confirmCallback?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnConfirm(() => confirmCallback || null);
    setModalVisible(true);
  };

  const handleDeleteCard = (id: string) => {
    if (Platform.OS === 'web') {
      setCardToDelete(id);
      // En lugar de usar Alert.alert, mostramos nuestro modal
      showCustomAlert('Eliminar tarjeta', '¿Estás seguro que deseas eliminar esta tarjeta?', () => {
        if (id) {
          confirmDelete(id);
        }
      });
    } else {
      // En móvil usamos la alerta nativa
      Alert.alert('Eliminar tarjeta', '¿Estás seguro que deseas eliminar esta tarjeta?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(id),
        },
      ]);
    }
  };

  const renderCardItem = ({ item }: { item: any }) => (
    <Animated.View
      style={[
        styles.cardItem,
        { backgroundColor: item.backgroundColor },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        {item.type === 'Visa' && (
          <Image source={require('@/assets/images/VISA.png')} style={styles.cardLogo} />
        )}
        {item.type === 'Mastercard' && (
          <Image source={require('@/assets/images/Mastercard.png')} style={styles.cardLogo} />
        )}
        <TouchableOpacity onPress={() => handleDeleteCard(item.id)}>
          <MaterialIcons name="delete" size={24} color="#ff6b6b" />
        </TouchableOpacity>
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
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.cardsPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Mis Tarjetas</Text>
            <Text style={styles.subtitle}>Administra tus métodos de pago</Text>
          </View>

          {cardData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No hay ninguna tarjeta registrada. Agrega una para comenzar.
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
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push('../(tabs)/inicio')}
              >
                <MaterialIcons name="home" size={24} color="#fff" />
                <Text style={styles.buttonText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
                key={Date.now()}
                ref={animationRef}
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
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push('../(tabs)/inicio')}
              >
                <MaterialIcons name="home" size={24} color="#fff" />
                <Text style={styles.buttonText}>Volver al Inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Modal personalizado para alertas en web */}
      {Platform.OS === 'web' && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
              <Text style={modalStyles.modalMessage}>{modalMessage}</Text>
              <View style={[modalStyles.buttonRow, onConfirm ? null : modalStyles.singleButtonRow]}>
                {onConfirm ? (
                  <>
                    <Pressable
                      style={[modalStyles.button, modalStyles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={modalStyles.textStyle}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={[modalStyles.button, modalStyles.confirmButton]}
                      onPress={() => {
                        if (onConfirm) onConfirm();
                        setModalVisible(false);
                      }}
                    >
                      <Text style={modalStyles.textStyle}>Eliminar</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[modalStyles.button, modalStyles.confirmButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={modalStyles.textStyle}>OK</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  singleButtonRow: {
    justifyContent: 'center',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  textStyle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardLogo: {
    width: 60,
    height: 40,
    resizeMode: 'contain',
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
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#495057',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  webAlertOverlay: {
    // Este estilo ya no se usa, ya que el modal personalizado se usa en su lugar.
  },
  webAlertBox: {
    // Este estilo ya no se usa.
  },
  webAlertTitle: {
    // Este estilo ya no se usa.
  },
  webAlertMessage: {
    // Este estilo ya no se usa.
  },
  webAlertButtons: {
    // Este estilo ya no se usa.
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default SavedCardsScreen;
