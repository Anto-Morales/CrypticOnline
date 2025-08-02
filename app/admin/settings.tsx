import { StyleSheet, Text, View } from 'react-native';

export default function AdminSettings() {
  console.log('⚙️ ADMIN SETTINGS: Renderizando...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ⚙️ Configuración
      </Text>
      <Text style={styles.subtitle}>
        Administra la configuración del sistema
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          ✅ Pantalla de configuración cargada
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
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});