import { StyleSheet, Text, View } from 'react-native';

export default function AdminOrders() {
  console.log('📦 ADMIN ORDERS: Renderizando...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        📦 Gestión de Órdenes
      </Text>
      <Text style={styles.subtitle}>
        Administra pedidos y envíos
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          ✅ Pantalla de órdenes cargada
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  cardText: {
    color: '#000',
    fontWeight: 'bold',
  },
});