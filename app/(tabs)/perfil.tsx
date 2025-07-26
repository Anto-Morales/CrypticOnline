import { View, Text, StyleSheet, Image, Button } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
      <Text style={styles.nombre}>Antonio Arellano</Text>
      <Text style={styles.info}>antonio@correo.com</Text>

      <View style={{ marginTop: 30 }}>
        <Button title="Editar perfil" onPress={() => {}} />
        <View style={{ marginTop: 10 }} />
        <Button title="Cerrar sesión" onPress={() => {}} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  nombre: { fontSize: 24, fontWeight: 'bold' },
  info: { fontSize: 16, color: 'gray' },
});
