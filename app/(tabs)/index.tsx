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
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      email: '',
      password: ''
    };

    if (!email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ingresa un email válido';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      console.log('Credenciales válidas, redirigiendo a /home');
      router.push('/home');
    }
  };

  const handleForgotPassword = () => {
    router.push('/Nvpassword');
  };

  const handleRegister = () => {
    router.push('/registro');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[
          styles.mainContainer, 
          isSmallScreen ? styles.columnLayout : styles.rowLayout
        ]}>
          <View style={[
            styles.leftContainer,
            { 
              width: isSmallScreen ? '100%' : '50%',
              padding: isSmallScreen ? 40 : 60
            }
          ]}>
            <Image 
              source={require('../../assets/images/Logo1.png')} 
              style={[
                styles.logo,
                {
                  width: isSmallScreen ? '80%' : 400,
                  height: isSmallScreen ? 200 : 350,
                  marginBottom: isSmallScreen ? 20 : -80,
                  marginTop: isSmallScreen ? 20 : -70
                }
              ]}
              resizeMode="contain"
            />

            <Text style={styles.title}>INICIO DE SESIÓN</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                  {
                    width: isSmallScreen ? '100%' : 350,
                    height: isSmallScreen ? 50 : 60,
                    borderRadius: isSmallScreen ? 25 : 30
                  }
                ]}
                placeholder="EMAIL"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({...errors, email: ''});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.password && styles.inputError,
                  {
                    width: isSmallScreen ? '100%' : 350,
                    height: isSmallScreen ? 50 : 60,
                    borderRadius: isSmallScreen ? 25 : 30
                  }
                ]}
                placeholder="CONTRASEÑA"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                secureTextEntry
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity 
              style={[
                styles.button,
                {
                  width: isSmallScreen ? '100%' : 350,
                  borderRadius: isSmallScreen ? 25 : 50,
                  paddingVertical: isSmallScreen ? 12 : 15
                }
              ]} 
              onPress={handleLogin}
              testID="login-button"
            >
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={[
                  styles.linkText,
                  { fontSize: isSmallScreen ? 16 : 19 }
                ]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={handleRegister}>
                <Text style={[
                  styles.linkText,
                  { fontSize: isSmallScreen ? 16 : 19 }
                ]}>¿No tienes cuenta? <Text style={styles.boldText}>REGÍSTRATE</Text></Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isSmallScreen && (
            <View style={styles.rightContainer}>
              <Image 
                source={require('../../assets/images/modeloo.png')}
                style={[
                  styles.modelImage,
                  {
                    width: width * 0.5,
                    height: height * 0.8,
                    maxWidth: 850,
                    maxHeight: 650
                  }
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

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  leftContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    borderColor: '#000',
    borderWidth: 1,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
    alignSelf: 'flex-start',
  },
  button: {
    backgroundColor: '#000',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#000',
    textAlign: 'center',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
});