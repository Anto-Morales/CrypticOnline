import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function PerfilProfesionalScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const infoColor = isDark ? '#ccc' : 'gray';

  const [user, setUser] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    calle: '',
    numero: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    referencias: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔍 Token encontrado:', token ? 'SÍ' : 'NO');
      
      if (!token) {
        console.log('❌ No token found, redirecting to main screen');
        router.push('/');
        return;
      }

      // 🔧 USAR LA MISMA URL QUE FUNCIONA EN LOGIN
      const HARDCODED_NGROK_URL = 'https://2667b7e4b7b2.ngrok-free.app';
      const profileUrl = `${HARDCODED_NGROK_URL}/api/auth/profile`;

      console.log('📡 Fetching user profile...');
      console.log('🌐 URL:', profileUrl);

      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'CrypticOnline-Mobile-App',
        },
      });
      
      const data = await response.json();

      console.log('📡 Response status:', response.status);
      console.log('📦 Response data:', JSON.stringify(data, null, 2));

      if (response.ok && data.user) {
        console.log('✅ Profile data received:', data.user);
        setUser(data.user);
      } else if (response.status === 401) {
        // Token inválido o expirado
        console.log('❌ Token invalid, removing and redirecting to main screen');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.push('/');
      } else {
        console.error('❌ Error fetching profile:', response.status, data);
        // Intentar cargar usuario guardado localmente como fallback
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          console.log('💾 Using saved user data as fallback');
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      // Intentar cargar usuario guardado localmente como fallback
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          console.log('💾 Using saved user data after error');
          setUser(JSON.parse(savedUser));
        }
      } catch (fallbackError) {
        console.error('❌ Error loading saved user:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Eliminar todos los datos de sesión
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('isLoggedIn');
      
      console.log('✅ Sesión cerrada completamente');
      
      // Redirigir a la pantalla principal (index.tsx)
      router.replace('/');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Incluso si hay error, intentar redirigir
      router.replace('/');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009ee3" />
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
            Cargando perfil...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View
        style={[styles.card, { backgroundColor: cardBg, borderColor: isDark ? '#fff' : '#000' }]}
      >
        <Image source={require('../../assets/images/gearsOfWar.jpg')} style={styles.avatar} />
        <Text style={[styles.nombre, { color: textColor }]}>
          {loading
            ? 'Cargando...'
            : `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno}`}
        </Text>
        <Text style={[styles.info, { color: infoColor }]}>
          {loading ? 'Cargando...' : user.email}
        </Text>
        <Text style={[styles.info, { color: infoColor }]}>
          {loading ? 'Cargando...' : user.telefono}
        </Text>
        <Text style={[styles.profesion, { color: textColor }]}>
          {user.role === 'admin' ? 'Administrador' : 'Cliente'}
        </Text>
        <View style={{ marginTop: 30, width: '100%' }}>
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: isDark ? '#fff' : '#007bff' }
            ]}
            onPress={() => router.push('/perfil/editar-perfil')}
          >
            <Text style={[
              styles.editButtonText,
              { color: isDark ? '#000' : '#fff' }
            ]}>
               Editar Perfil
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>
               Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 20, width: '100%' }}>
          <TouchableOpacity
            style={[
              styles.option,
              {
                backgroundColor: isDark ? '#222' : '#f5f5f5',
                borderColor: isDark ? '#444' : '#ddd',
              },
            ]}
            onPress={() => router.push('/pedidos/mis-pedidos')}
          >
            <Text style={[styles.optionText, { color: isDark ? '#fff' : '#000' }]}>
               Mis Pedidos
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  nombre: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  info: { fontSize: 16, marginBottom: 8 },
  profesion: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  descripcion: { fontSize: 15, textAlign: 'center' },
  option: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  optionText: { fontSize: 16, marginLeft: 10 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  editButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
