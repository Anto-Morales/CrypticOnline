import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const AgregarDireccionScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;

  // Forzamos colores claros sin importar el tema del sistema
  const themeColors = {
    background: '#fff', // Fondo blanco siempre
    text: '#000', // Texto negro siempre
    inputBackground: '#fff', // Fondo blanco para inputs
    border: '#000', // Borde negro
    buttonBackground: '#000', // Botón negro
    buttonText: '#fff', // Texto de botón blanco
  };

  const [form, setForm] = useState({
    direccion: '',
    codigoPostal: '',
    estado: '',
    numero: '',
    colonia: '',
    departamento: '',
    descripcion: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleRegisterAddress = () => {
    console.log('Dirección guardada:', form);
    router.push('/(tabs)/carrito');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View
          style={[styles.mainContainer, isSmallScreen ? styles.columnLayout : styles.rowLayout]}
        >
          <View
            style={[
              styles.leftContainer,
              { width: isSmallScreen ? '100%' : '50%', padding: isSmallScreen ? 40 : 60 },
            ]}
          >
            <TouchableOpacity onPress={handleGoBack}>
              <Text style={[styles.backButton, { color: themeColors.text }]}>←</Text>
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/Logo1.png')}
              style={[
                styles.logo,
                {
                  width: isSmallScreen ? '80%' : 400,
                  height: isSmallScreen ? 200 : 350,
                  marginBottom: isSmallScreen ? 20 : -80,
                  marginTop: isSmallScreen ? 20 : -70,
                },
              ]}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: themeColors.text }]}>AGREGA UNA DIRECCIÓN</Text>

            {[
              { name: 'direccion', placeholder: 'DIRECCIÓN CUIDAD O EMPRESA' },
              { name: 'codigoPostal', placeholder: 'CÓDIGO POSTAL' },
              { name: 'estado', placeholder: 'ESTADO' },
              { name: 'numero', placeholder: 'NÚMERO' },
              { name: 'colonia', placeholder: 'COLONIA O BARRIO' },
              { name: 'departamento', placeholder: 'NÚMERO DEL DEPARTAMENTO/OFICINA' },
              { name: 'descripcion', placeholder: 'DESCRIPCIÓN (OPCIONAL)' },
            ].map((input) => (
              <View key={input.name} style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor: themeColors.border,
                      width: isSmallScreen ? '100%' : 350,
                      height: isSmallScreen ? 50 : 60,
                      borderRadius: isSmallScreen ? 25 : 30,
                    },
                  ]}
                  placeholder={input.placeholder}
                  placeholderTextColor="#888" // Color gris para placeholders
                  value={form[input.name as keyof typeof form]}
                  onChangeText={(text) => handleChange(input.name, text)}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.button,
                {
                  width: isSmallScreen ? '100%' : 350,
                  borderRadius: isSmallScreen ? 25 : 50,
                  paddingVertical: isSmallScreen ? 12 : 15,
                  backgroundColor: themeColors.buttonBackground,
                },
              ]}
              onPress={handleRegisterAddress}
            >
              <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>
                REGISTRAR DIRECCIÓN
              </Text>
            </TouchableOpacity>
          </View>

          {!isSmallScreen && (
            <View style={[styles.rightContainer, { backgroundColor: themeColors.background }]}>
              <Image
                source={require('../../assets/images/modeloo.png')}
                style={[
                  styles.modelImage,
                  {
                    width: width * 0.5,
                    height: height * 0.8,
                    maxWidth: 850,
                    maxHeight: 650,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AgregarDireccionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1 },
  mainContainer: { flex: 1 },
  rowLayout: { flexDirection: 'row' },
  columnLayout: { flexDirection: 'column' },
  leftContainer: { justifyContent: 'center', alignSelf: 'center' },
  rightContainer: { justifyContent: 'center', alignItems: 'center' },
  backButton: { fontSize: 28, marginBottom: 20 },
  logo: { alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  inputContainer: { marginBottom: 15, width: '100%', maxWidth: 400, alignSelf: 'center' },
  input: { borderWidth: 1, paddingHorizontal: 15, alignSelf: 'center' },
  button: { alignItems: 'center', marginTop: 10, alignSelf: 'center' },
  buttonText: { fontWeight: 'bold' },
  modelImage: { width: '100%', height: '100%' },
});
