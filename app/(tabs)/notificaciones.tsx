import { View, Text, StyleSheet, FlatList } from 'react-native';

const datosEjemplo = [
  { id: '1', mensaje: 'Tu pedido #123 fue enviado.' },
  { id: '2', mensaje: 'Nueva promoción disponible en productos de audio.' },
  { id: '3', mensaje: 'Tu pedido #122 fue entregado.' },
];

export default function NotificacionesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Notificaciones</Text>
      <FlatList
        data={datosEjemplo}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.mensaje}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // mismo fondo blanco
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000', // negro para título
  },
  card: {
    padding: 16,
    backgroundColor: '#f5f5f5', // color similar al rightContainer del carrito
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000', // bordes negros como en el carrito
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // sombra para Android
  },
  mensaje: {
    fontSize: 16,
    color: '#333',
  },
});
