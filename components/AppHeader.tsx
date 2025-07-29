import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

type AppHeaderProps = {
  onActionPress?: (action: string) => void;
};

export default function AppHeader({ onActionPress }: AppHeaderProps) {
  const handlePress = (action: string) => {
    if (onActionPress) {
      onActionPress(action);
    } else {
      Alert.alert(`Acción: ${action}`);
    }
  };

  return (
    <View style={styles.header}>
      <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />

      <View style={styles.searchContainer}>
        <Text style={styles.searchText}>🔍 Buscar</Text>
      </View>

      <View style={styles.iconsContainer}>
        <TouchableOpacity onPress={() => handlePress('Carrito')}>
          <Text style={styles.icon}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress('Pedidos')}>
          <Text style={styles.icon}>📦</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress('Perfil')}>
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  logo: {
    width: 80,
    height: 100,
    resizeMode: 'contain',
    marginVertical: 5,
  },
  searchContainer: {
    width: '60%',
    maxWidth: 300,
    minWidth: 180,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 5,
  },
  searchText: {
    color: '#000',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  icon: {
    fontSize: 22,
    color: '#fff',
    marginLeft: 15,
  },
});
