import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const EditStoreProfile: React.FC = () => {
  const router = useRouter();

  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [postalCode, setPostalCode] = useState('');
  const [addressDescription, setAddressDescription] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    null
  );

  const [isMobile, setIsMobile] = useState(width < 768);

  // Estado para la alerta personalizada
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsMobile(window.width < 768);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert('Permisos necesarios', 'Se requiere acceso a la galería.');
        }
      }

      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        showAlert('Permisos necesarios', 'Se requiere acceso a la ubicación.');
      }
    })();
  }, []);

  // Función para mostrar alerta con diseño personalizado
  const showAlert = (title: string, message: string, confirmCallback?: () => void) => {
    setModalTitle(title);
    setModalMessage(message);
    setOnConfirm(() => confirmCallback || null);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showAlert(
          'Ubicación no disponible',
          'No hay acceso a la ubicación. Llena los datos manualmente.'
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const geo = reverseGeocode[0];

      setStreet(geo.street || '');
      setLocality(geo.district || geo.subregion || '');
      setMunicipality(geo.city || geo.subregion || '');
      setPostalCode(geo.postalCode || '');

      setLocation({
        lat: coords.latitude,
        lng: coords.longitude,
        address: `${geo.street || ''}, ${geo.district || ''}, ${geo.city || ''}, ${geo.postalCode || ''}`,
      });

      showAlert('Ubicación guardada', `Dirección detectada: ${geo.street || 'N/A'}`);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      showAlert('Error', 'No se pudo obtener la ubicación. Llena los datos manualmente.');
    }
  };

  const handleSave = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,}$/;
    const postalCodeRegex = /^\d{5}$/;

    if (!storeName.trim()) return showAlert('Error', 'El nombre de la tienda es obligatorio.');
    if (!email.trim() || !emailRegex.test(email))
      return showAlert('Error', 'Ingresa un correo válido.');
    if (!phone.trim() || !phoneRegex.test(phone))
      return showAlert('Error', 'Teléfono inválido (mínimo 10 dígitos).');
    if (!postalCode.trim() || !postalCodeRegex.test(postalCode))
      return showAlert('Error', 'Código postal inválido.');
    if (!addressDescription.trim()) return showAlert('Error', 'La descripción es obligatoria.');
    if (!street.trim()) return showAlert('Error', 'La calle es obligatoria.');
    if (!locality.trim()) return showAlert('Error', 'La localidad es obligatoria.');
    if (!municipality.trim()) return showAlert('Error', 'El municipio es obligatorio.');

    const storeData = {
      name: storeName,
      email,
      phone,
      profileImage,
      address: `${street}, ${locality}, ${municipality}`,
      postalCode,
      addressDescription,
      paymentMethods: ['•••• •••• •••• 4242', 'PayPal'],
    };

    const jsonData = encodeURIComponent(JSON.stringify(storeData));
    router.push(`/perfil?data=${jsonData}`);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.mainContainer, isMobile && { flexDirection: 'column' }]}
      >
        {/* Panel izquierdo */}
        <View style={[styles.sidebarContainer, { width: isMobile ? '100%' : '30%' }]}>
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="camera" size={28} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.userName}>{storeName || 'Mi Tienda'}</Text>
          <Text style={styles.userEmail}>{email || 'Correo no proporcionado'}</Text>

          {/* SOLO en web: botones debajo del perfil */}
          {!isMobile && (
            <View style={[styles.buttonGroup, styles.webButtons]}>
              <TouchableOpacity style={styles.outlineButton} onPress={handleGetLocation}>
                <MaterialIcons name="location-on" size={20} color="#000" />
                <Text style={styles.outlineButtonText}>Guardar Ubicación</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filledButton} onPress={handleSave}>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.filledButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Formulario */}
        <View style={[styles.formContainer, isMobile && styles.mobileFormContainer]}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del usuario"
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Código Postal"
            value={postalCode}
            onChangeText={setPostalCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={addressDescription}
            onChangeText={setAddressDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Calle"
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            style={styles.input}
            placeholder="Localidad"
            value={locality}
            onChangeText={setLocality}
          />
          <TextInput
            style={styles.input}
            placeholder="Municipio"
            value={municipality}
            onChangeText={setMunicipality}
          />
          {location && (
            <Text style={styles.locationText}>
              {street}, {locality}, {municipality}, CP {postalCode}
            </Text>
          )}

          {/* SOLO en móviles: botones hasta abajo */}
          {isMobile && (
            <View style={[styles.buttonGroup, styles.mobileButtons]}>
              <TouchableOpacity style={styles.outlineButton} onPress={handleGetLocation}>
                <MaterialIcons name="location-on" size={20} color="#000" />
                <Text style={styles.outlineButtonText}>Guardar Ubicación</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filledButton} onPress={handleSave}>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.filledButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal personalizado para alertas */}
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
                    <Text style={modalStyles.textStyle}>Aceptar</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingBottom: 20,
  },
  sidebarContainer: {
    backgroundColor: '#f4f4f4',
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#000',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    marginTop: 20,
  },
  mobileButtons: {
    flexDirection: 'column',
  },
  webButtons: {
    alignItems: 'center',
  },
  outlineButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  outlineButtonText: {
    color: '#000',
    fontWeight: '600',
    marginLeft: 10,
  },
  filledButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 10,
  },
  formContainer: {
    width: '70%',
    padding: 20,
  },
  mobileFormContainer: {
    width: '100%',
    padding: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    width: '100%',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditStoreProfile;
