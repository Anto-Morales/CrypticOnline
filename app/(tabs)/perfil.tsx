import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function PerfilProfesionalScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const infoColor = isDark ? '#ccc' : 'gray';

  const [userData, setUserData] = useState({
    nombres: 'Cargando...',
    email: 'Cargando...',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    role: 'customer',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await fetch('http://192.168.0.108:3000/api/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Response text:', text);

        if (response.ok) {
          const data = JSON.parse(text);
          setUserData(data.user);
        } else {
          console.error('Error en la respuesta:', text);
        }
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View
        style={[styles.card, { backgroundColor: cardBg, borderColor: isDark ? '#fff' : '#000' }]}
      >
        <Image source={require('../../assets/images/gearsOfWar.jpg')} style={styles.avatar} />
        <Text style={[styles.nombre, { color: textColor }]}>
          {loading
            ? 'Cargando...'
            : `${userData.nombres} ${userData.apellidoPaterno} ${userData.apellidoMaterno}`}
        </Text>
        <Text style={[styles.info, { color: infoColor }]}>
          {loading ? 'Cargando...' : userData.email}
        </Text>
        <Text style={[styles.info, { color: infoColor }]}>
          {loading ? 'Cargando...' : userData.telefono}
        </Text>
        <Text style={[styles.profesion, { color: textColor }]}>
          {userData.role === 'admin' ? 'Administrador' : 'Cliente'}
        </Text>
        <Text style={[styles.descripcion, { color: infoColor }]}>
          Apasionado por la tecnología, con experiencia en desarrollo web y móvil. Siempre
          aprendiendo y buscando nuevos retos.
        </Text>
        <View style={{ marginTop: 30 }}>
          <Button title="Editar perfil" onPress={() => {}} color={isDark ? '#fff' : '#000'} />
          <View style={{ marginTop: 10 }} />
          <Button title="Cerrar sesión" onPress={handleLogout} color="red" />
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
});
