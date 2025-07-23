import { View, Text, StyleSheet, Image, Button, useColorScheme } from 'react-native';

export default function PerfilProfesionalScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const containerBg = isDark ? '#000' : '#fff';
  const cardBg = isDark ? '#222' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const infoColor = isDark ? '#ccc' : 'gray';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View
        style={[styles.card, { backgroundColor: cardBg, borderColor: isDark ? '#fff' : '#000' }]}
      >
        <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
        <Text style={[styles.nombre, { color: textColor }]}>Antonio Arellano</Text>
        <Text style={[styles.info, { color: infoColor }]}>antonio@correo.com</Text>
        <Text style={[styles.profesion, { color: textColor }]}>Desarrollador Full Stack</Text>
        <Text style={[styles.descripcion, { color: infoColor }]}>
          Apasionado por la tecnología, con experiencia en desarrollo web y móvil. Siempre
          aprendiendo y buscando nuevos retos.
        </Text>
        <View style={{ marginTop: 30 }}>
          <Button title="Editar perfil" onPress={() => {}} color={isDark ? '#fff' : '#000'} />
          <View style={{ marginTop: 10 }} />
          <Button title="Cerrar sesión" onPress={() => {}} color="red" />
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
