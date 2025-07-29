import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const UserProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: null,
    address: '',
    postalCode: '',
    addressDescription: '',
    recentOrders: [
      { id: '1234', description: 'Pedido de camiseta', status: 'Entregado' },
      { id: '5678', description: 'Pedido de zapatos', status: 'En camino' },
      { id: '9101', description: 'Pedido de accesorios', status: 'Pendiente' },
    ],
  });

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (params.data) {
      try {
        const parsedData = JSON.parse(params.data as string);

        if (!parsedData.recentOrders) {
          parsedData.recentOrders = [
            { id: '1234', description: 'Pedido de camiseta', status: 'Entregado' },
            { id: '5678', description: 'Pedido de zapatos', status: 'En camino' },
            { id: '9101', description: 'Pedido de accesorios', status: 'Pendiente' },
          ];
        }

        setUserData(parsedData);
      } catch (error) {
        console.warn('Error al parsear datos:', error);
      }
    }
  }, [params.data]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Estás seguro de que deseas salir?');
      if (confirmed) {
        router.replace('/auth/login');
      }
    } else {
      Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar sesión', onPress: () => router.replace('/auth/login') },
      ]);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.infoContainer, { width: isMobile ? '100%' : '60%' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <FontAwesome name="user" size={40} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>

            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={20} color="#000" />
              <Text style={styles.infoText}>{userData.phone}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color="#000" />
              <Text style={styles.infoText}>{userData.address}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="pin-drop" size={20} color="#000" />
              <Text style={styles.infoText}>Código Postal: {userData.postalCode}</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="description" size={20} color="#000" />
              <Text style={styles.infoText}>Descripción: {userData.addressDescription}</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Últimos pedidos</Text>
            {userData.recentOrders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <MaterialIcons name="local-shipping" size={20} color="#000" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.orderText}>{order.description}</Text>
                  <Text style={styles.orderStatus}>Estado: {order.status}</Text>
                </View>
              </View>
            ))}

            {isMobile && (
              <View style={styles.mobileButtonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(
                      `../edit/editarUser?data=${encodeURIComponent(JSON.stringify(userData))}`
                    )
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#000" />
                  <Text style={styles.buttonText}>Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('../(tabs)/inicio')}
                >
                  <Ionicons name="heart-outline" size={24} color="#000" />
                  <Text style={styles.buttonText}>Mis Favoritos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('../tarjeta/mistarjetas')}
                >
                  <FontAwesome name="credit-card" size={20} color="#000" />
                  <Text style={styles.buttonText}>Métodos de Pago</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push('../tarjeta/SelecTarjeta')}
                >
                  <MaterialIcons name="history" size={24} color="#000" />
                  <Text style={styles.buttonText}>Historial de pedidos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.logoutButton]}
                  onPress={handleLogout}
                >
                  <MaterialIcons name="exit-to-app" size={24} color="#fff" />
                  <Text style={[styles.buttonText, styles.logoutText]}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {!isMobile && (
        <View style={styles.actionsContainer}>
          <Image source={require('@/assets/images/Logo1.png')} style={styles.logoGif} />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                router.push(
                  `../edit/editarUser?data=${encodeURIComponent(JSON.stringify(userData))}`
                )
              }
            >
              <Ionicons name="create-outline" size={24} color="#000" />
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('../(tabs)/inicio')}
            >
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.buttonText}>Mis Favoritos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('../tarjeta/mistarjetas')}
            >
              <FontAwesome name="credit-card" size={20} color="#000" />
              <Text style={styles.buttonText}>Métodos de Pago</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('../tarjeta/SelecTarjeta')}
            >
              <MaterialIcons name="history" size={24} color="#000" />
              <Text style={styles.buttonText}>Historial de pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <MaterialIcons name="exit-to-app" size={24} color="#fff" />
              <Text style={[styles.buttonText, styles.logoutText]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#fff' },
  infoContainer: { padding: 20, borderRightWidth: 1, borderRightColor: '#e0e0e0' },
  actionsContainer: {
    width: '40%',
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
  },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  mobileButtonsContainer: { marginTop: 30 },
  profileImageContainer: { alignSelf: 'center', marginBottom: 20 },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: '#000' },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { fontSize: 16, color: '#000', marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  orderText: { fontSize: 16, color: '#000' },
  orderStatus: { fontSize: 14, color: '#555' },
  logoGif: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 20 },
  buttonsContainer: { marginBottom: 20 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'flex-start',
  },
  buttonText: { fontSize: 18, color: '#000', marginLeft: 15 },
  logoutButton: { backgroundColor: '#000', borderColor: '#000', marginTop: 30 },
  logoutText: { color: '#fff' },
});

export default UserProfileScreen;
