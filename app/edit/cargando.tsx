import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreen() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayTop} />
      <View style={styles.overlayCenter}>
        <Image source={require('@/assets/images/LOGO ROTANDO.gif')} style={styles.logo} />
        <Text style={styles.loadingText}>CARGANDO{dots}</Text>
      </View>
      <View style={styles.overlayBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#333',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayCenter: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexShrink: 0,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  logo: {
    width: '80%',
    maxWidth: 300,
    aspectRatio: 1, // Mantiene proporción cuadrada
    marginBottom: 20,
    resizeMode: 'contain',
  },
  loadingText: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
  },
});
