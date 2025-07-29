import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreditCardForm = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  const detectCardType = (number: string) => {
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const mastercardRegex = /^5[1-5][0-9]{14}$/;
    const amexRegex = /^3[47][0-9]{13}$/;

    if (visaRegex.test(number)) return 'Visa';
    if (mastercardRegex.test(number)) return 'Mastercard';
    if (amexRegex.test(number)) return 'American Express';
    return '';
  };

  const formatCardNumber = (number: string) => {
    const clean = number.replace(/\s+/g, '');
    const cardTypeDetected = detectCardType(clean);
    setCardType(cardTypeDetected);

    if (cardTypeDetected === 'American Express') {
      return clean
        .replace(/\D/g, '')
        .replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3')
        .substring(0, 17);
    } else {
      return clean
        .replace(/\D/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .substring(0, 19);
    }
  };

  const handleCardNumberChange = (number: string) => {
    setCardNumber(formatCardNumber(number));
  };

  const formatExpiryDate = (date: string) => {
    return date
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d{0,2})/, '$1/$2')
      .substring(0, 5);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      cardNumber: '',
      cardHolder: '',
      expiryDate: '',
      cvv: '',
    };

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Número de tarjeta requerido';
      valid = false;
    } else if (cardNumber.replace(/\s/g, '').length < 15) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
      valid = false;
    }

    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Titular de tarjeta requerido';
      valid = false;
    }

    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'Fecha de expiración requerida';
      valid = false;
    } else {
      const [month, year] = expiryDate.split('/');
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;

      if (!month || !year || month.length !== 2 || year.length !== 2) {
        newErrors.expiryDate = 'Formato inválido (MM/AA)';
        valid = false;
      } else if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Mes inválido';
        valid = false;
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = 'Tarjeta expirada';
        valid = false;
      }
    }

    if (!cvv.trim()) {
      newErrors.cvv = 'CVV requerido';
      valid = false;
    } else if ((cardType === 'American Express' && cvv.length !== 4) || cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const nuevaTarjeta = {
        id: Date.now().toString(),
        cardNumber: '•••• •••• •••• ' + cardNumber.replace(/\s/g, '').slice(-4),
        cardHolder,
        expiryDate,
        type: cardType,
        backgroundColor: cardType === 'Visa' ? '#1a1a2e' : '#16213e',
      };

      try {
        // Leer tarjetas guardadas
        const storedCards = await AsyncStorage.getItem('cards');
        let cards = storedCards ? JSON.parse(storedCards) : [];

        // Agregar nueva tarjeta
        cards.push(nuevaTarjeta);

        // Guardar la lista actualizada
        await AsyncStorage.setItem('cards', JSON.stringify(cards));

        // Navegar a la pantalla de tarjetas
        router.push('/tarjeta/mistarjetas');
      } catch (error) {
        console.error('Error guardando la tarjeta:', error);
      }
    }
  };

  return (
    <View style={[styles.mainContainer, isMobile && { flexDirection: 'column' }]}>
      <View style={[styles.leftContainer, isMobile && { width: '100%' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Agregar tarjeta</Text>
            <View style={styles.cardIcons}>
              {cardType === 'Visa' && (
                <Image source={require('@/assets/images/VISA.png')} style={styles.cardIcon} />
              )}
              {cardType === 'Mastercard' && (
                <Image source={require('@/assets/images/Mastercard.png')} style={styles.cardIcon} />
              )}
              {cardType === 'American Express' && (
                <Image source={require('@/assets/images/MP.png')} style={styles.cardIcon} />
              )}
            </View>
          </View>

          <View style={styles.cardPreview}>
            <Text style={styles.cardNumberPreview}>{cardNumber || '•••• •••• •••• ••••'}</Text>
            <View style={styles.cardBottomRow}>
              <Text style={styles.cardHolderPreview}>{cardHolder || 'NOMBRE DEL TITULAR'}</Text>
              <Text style={styles.expiryDatePreview}>{expiryDate || 'MM/AA'}</Text>
            </View>
          </View>

          {/* Campos del formulario */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Número de tarjeta</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="credit-card" size={24} color="black" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa el número de tu tarjeta"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="number-pad"
                maxLength={cardType === 'American Express' ? 17 : 19}
              />
            </View>
            {errors.cardNumber ? <Text style={styles.error}>{errors.cardNumber}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre del titular</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={24} color="black" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre tal aparezca en la tarjeta"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="characters"
              />
            </View>
            {errors.cardHolder ? <Text style={styles.error}>{errors.cardHolder}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Expiración (MM/AA)</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="calendar-today" size={24} color="black" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              {errors.expiryDate ? <Text style={styles.error}>{errors.expiryDate}</Text> : null}
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>CVV</Text>
              <View style={[styles.inputContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <MaterialIcons name="lock" size={24} color="black" style={styles.icon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder=" CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="number-pad"
                    maxLength={cardType === 'American Express' ? 4 : 3}
                    secureTextEntry={!showCvv}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowCvv(!showCvv)} style={styles.eyeButton}>
                  <MaterialIcons
                    name={showCvv ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.cvv ? <Text style={styles.error}>{errors.cvv}</Text> : null}
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Agregar tarjeta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {!isMobile && (
        <View style={styles.rightContainer}>
          <LottieView
            source={require('@/animations/CardTarjeta.json')}
            autoPlay
            loop
            style={{ width: 250, height: 250, marginBottom: 40 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
  },
  leftContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  rightContainer: {
    width: Dimensions.get('window').width * 0.4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  cardIcons: {
    flexDirection: 'row',
  },
  cardIcon: {
    width: 40,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  cardPreview: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  cardNumberPreview: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
    marginTop: 20,
    fontFamily: 'Courier',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHolderPreview: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  expiryDatePreview: {
    color: '#fff',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    fontSize: 18,
    color: '#000',
    paddingVertical: 10,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  error: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 5,
    marginLeft: 10,
  },
});

export default CreditCardForm;
