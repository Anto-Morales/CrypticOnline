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
  useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    password: ''
  });

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error cuando el usuario escribe
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      password: ''
    };

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
      isValid = false;
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
      isValid = false;
    } else if (!/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = 'Solo se permiten números';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      console.log('Datos del formulario:', formData);
      router.push('/(tabs)/Nvpassword');
    }
  };

  const handleLoginRedirect = () => {
    router.push('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.contentContainer,
          isSmallScreen ? styles.columnLayout : styles.rowLayout
        ]}>
          <View style={[
            styles.formContainer,
            {
              padding: isSmallScreen ? 24 : 40,
              maxWidth: isSmallScreen ? '100%' : '50%'
            }
          ]}>
            <Image
              source={require('../../assets/images/Logo1.png')}
              style={[
                styles.logo,
                {
                  width: isSmallScreen ? '70%' : 300,
                  height: isSmallScreen ? 150 : 300,
                  marginBottom: isSmallScreen ? 20 : 0,
                  marginTop: isSmallScreen ? 10 : -60
                }
              ]}
              resizeMode="contain"
            />

            <Text style={styles.sectionTitle}>REGISTRO</Text>

            {/* Campo Nombre */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.nombre && styles.inputError
                ]}
                placeholder="Ingresa tu nombre"
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
              />
              {errors.nombre ? <Text style={styles.errorMessage}>{errors.nombre}</Text> : null}
            </View>

            {/* Campo Apellidos */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>APELLIDOS</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.apellidos && styles.inputError
                ]}
                placeholder="Ingresa tus apellidos"
                value={formData.apellidos}
                onChangeText={(text) => handleChange('apellidos', text)}
              />
              {errors.apellidos ? <Text style={styles.errorMessage}>{errors.apellidos}</Text> : null}
            </View>

            {/* Campo Teléfono */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>TELÉFONO</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.telefono && styles.inputError
                ]}
                placeholder="Ingresa tu teléfono"
                value={formData.telefono}
                onChangeText={(text) => handleChange('telefono', text)}
                keyboardType="phone-pad"
              />
              {errors.telefono ? <Text style={styles.errorMessage}>{errors.telefono}</Text> : null}
            </View>

            {/* Campo Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.email && styles.inputError
                ]}
                placeholder="Ingresa tu email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorMessage}>{errors.email}</Text> : null}
            </View>

            {/* Campo Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <TextInput
                style={[
                  styles.inputField,
                  errors.password && styles.inputError
                ]}
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
              />
              {errors.password ? <Text style={styles.errorMessage}>{errors.password}</Text> : null}
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>SIGUIENTE</Text>
            </TouchableOpacity>

            {/* Enlace a Login */}
            <TouchableOpacity 
              style={styles.linkContainer} 
              onPress={handleLoginRedirect}
            >
              <Text style={styles.linkText}>
                ¿YA TIENES CUENTA? <Text style={styles.boldLinkText}>INICIA SESIÓN</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {!isSmallScreen && (
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/FOTO 3.jpg')}
                style={styles.modelImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  formContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputField: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 80,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorMessage: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  boldLinkText: {
    fontWeight: 'bold',
    color: '#000',
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
});

export default RegisterScreen;