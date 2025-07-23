import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Dimensions,
  useColorScheme,
} from 'react-native';

const datosEjemplo = [
  { id: '1', mensaje: 'Tu pedido #123 fue enviado.' },
  { id: '2', mensaje: 'Nueva promoción disponible en productos de audio.' },
  { id: '3', mensaje: 'Tu pedido #122 fue entregado.' },
];

export default function NotificacionesScreen() {
  const screenWidth = Dimensions.get('window').width;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const borderColor = isDark ? '#fff' : '#000';
  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: 24, backgroundColor: isDark ? '#000' : '#fff' }]}
    >
      <Text style={[styles.titulo, { color: isDark ? '#fff' : '#000' }]}>Notificaciones</Text>
      <FlatList
        data={datosEjemplo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                width: screenWidth < 400 ? '100%' : 360,
                alignSelf: 'center',
                backgroundColor: cardBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Text style={[styles.mensaje, { color: isDark ? '#fff' : '#333' }]}>
              {item.mensaje}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mensaje: {
    fontSize: 16,
  },
});
