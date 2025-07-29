import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, useColorScheme } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const datosEjemplo = [
  { id: '1', tipo: 'envio', mensaje: 'Tu pedido #123 fue enviado.' },
  { id: '2', tipo: 'promo', mensaje: 'Nueva promoción disponible en productos de audio.' },
  { id: '3', tipo: 'entregado', mensaje: 'Tu pedido #122 fue entregado.' },
  { id: '4', tipo: 'general', mensaje: 'Recordatorio: Actualiza tu dirección de envío.' },
];

// Iconos en tonos grises para blanco/negro
const iconoPorTipo = (tipo: string, color: string) => {
  switch (tipo) {
    case 'envio':
      return <MaterialIcons name="local-shipping" size={28} color={color} />;
    case 'entregado':
      return <MaterialIcons name="check-circle" size={28} color={color} />;
    case 'promo':
      return <FontAwesome5 name="tags" size={28} color={color} />;
    default:
      return <MaterialIcons name="notifications" size={28} color={color} />;
  }
};

export default function NotificacionesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Paleta estricta blanco y negro
  const colors = {
    background: isDark ? '#000' : '#fff',
    bannerBackground: isDark ? '#222' : '#f9f9f9',
    textPrimary: isDark ? '#eee' : '#111',
    textSecondary: isDark ? '#aaa' : '#555',
    borderColor: isDark ? '#444' : '#ccc',
    cardBackground: isDark ? '#111' : '#fff',
    iconColor: isDark ? '#bbb' : '#444',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Banner izquierdo */}
      <View
        style={[
          styles.bannerContainer,
          { backgroundColor: colors.bannerBackground, borderColor: colors.borderColor },
        ]}
      >
        <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Promociones</Text>
        <Image
          source={require('@/assets/images/Logo1.png')} // Ajusta la ruta si es necesario
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
          ¡Aprovecha nuestras ofertas exclusivas!
        </Text>
      </View>

      {/* Lista de notificaciones derecha */}
      <View style={styles.notificacionesContainer}>
        <Text style={[styles.titulo, { color: colors.textPrimary }]}>Notificaciones</Text>
        <FlatList
          data={datosEjemplo}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.cardBackground, borderColor: colors.borderColor },
              ]}
            >
              <View style={styles.iconContainer}>{iconoPorTipo(item.tipo, colors.iconColor)}</View>
              <Text style={[styles.mensaje, { color: colors.textPrimary }]}>{item.mensaje}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={[styles.sinNotificaciones, { color: colors.textSecondary }]}>
              No tienes notificaciones nuevas.
            </Text>
          }
        />
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
  },
  bannerContainer: {
    flex: 1,
    maxWidth: screenWidth * 0.3,
    borderRadius: 15,
    padding: 20,
    marginRight: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    marginBottom: 15,
    tintColor: 'gray',
  },
  bannerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  notificacionesContainer: {
    flex: 2,
    maxWidth: screenWidth * 0.6,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  mensaje: {
    fontSize: 16,
    flexShrink: 1,
  },
  sinNotificaciones: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});
