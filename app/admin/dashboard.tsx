import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function AdminDashboard() {
  console.log('🎯 ADMIN DASHBOARD: Renderizando...');
  
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.content, { padding: isMobile ? 10 : 20 }]}>
        <Text style={[styles.title, { fontSize: isMobile ? 20 : 24 }]}>
          🎯 Dashboard de Administrador
        </Text>
        <Text style={[styles.subtitle, { fontSize: isMobile ? 14 : 16 }]}>
          Panel funcionando correctamente
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>
            ✅ Componente cargado exitosamente
          </Text>
        </View>
        
        {/* Stats Cards */}
        <View style={[styles.statsContainer, { 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 15 
        }]}>
          <View style={[styles.statCard, { backgroundColor: '#007bff' }]}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Usuarios</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#28a745' }]}>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ffc107' }]}>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Órdenes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    width: '100%',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
});