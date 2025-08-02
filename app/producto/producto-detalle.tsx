import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useCarrito } from '../context/CarritoContext';

export default function ProductoDetalleScreen() {
  const params = useLocalSearchParams() as {
    id: string;
    name: string;
    price: string;
    image?: string;
  };
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [cantidad, setCantidad] = useState(1);
  const [talla, setTalla] = useState('M');
  const carrito = useCarrito();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Detalle del Producto',
          headerShown: true 
        }} 
      />
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <Image
        source={
          params.image ? { uri: params.image as string } : require('../../assets/images/shirt1.png')
        }
        style={styles.imagen}
        resizeMode="contain"
      />
      <Text style={[styles.nombre, { color: isDark ? '#fff' : '#000' }]}>{params.name}</Text>
      <Text style={[styles.precio, { color: isDark ? '#fff' : '#000' }]}>{params.price}</Text>
      <Text style={[styles.label, { color: isDark ? '#aaa' : '#333' }]}>Selecciona la talla:</Text>
      <View style={styles.tallasRow}>
        {['S', 'M', 'L', 'XL'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tallaBtn, talla === t && styles.tallaBtnSelected]}
            onPress={() => setTalla(t)}
          >
            <Text style={[styles.tallaText, talla === t && styles.tallaTextSelected]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.label, { color: isDark ? '#aaa' : '#333' }]}>Cantidad:</Text>
      <View style={styles.cantidadRow}>
        <TouchableOpacity
          style={styles.cantidadBtn}
          onPress={() => setCantidad(Math.max(1, cantidad - 1))}
        >
          <Text style={styles.cantidadBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.cantidadInput}
          value={String(cantidad)}
          onChangeText={(v) => setCantidad(Number(v))}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.cantidadBtn} onPress={() => setCantidad(cantidad + 1)}>
          <Text style={styles.cantidadBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {/* RESUMEN DE COSTOS - FUERA DEL CONTAINER DE BOTONES */}
      <View style={[styles.costSummary, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
        <Text style={[styles.costLabel, { color: isDark ? '#ccc' : '#666' }]}>
          Resumen de compra:
        </Text>
        <View style={styles.costRow}>
          <Text style={[styles.costText, { color: isDark ? '#fff' : '#000' }]}>
            Producto ({cantidad}x):
          </Text>
          <Text style={[styles.costText, { color: isDark ? '#fff' : '#000' }]}>
            ${(Number(String(params.price).replace(/[^\d.]/g, '')) * cantidad).toFixed(2)}
          </Text>
        </View>
        <View style={styles.costRow}>
          <Text style={[styles.costText, { color: isDark ? '#fff' : '#000' }]}>
            Envío:
          </Text>
          <Text style={[styles.costText, { color: isDark ? '#fff' : '#000' }]}>
            $50.00
          </Text>
        </View>
        <View style={[styles.costRow, styles.totalRow]}>
          <Text style={[styles.totalText, { color: isDark ? '#fff' : '#000' }]}>
            Total:
          </Text>
          <Text style={[styles.totalText, { color: isDark ? '#fff' : '#000' }]}>
            ${((Number(String(params.price).replace(/[^\d.]/g, '')) * cantidad) + 50).toFixed(2)}
          </Text>
        </View>
      </View>
      
      {/* BOTONES DE ACCIÓN */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDark ? '#fff' : '#000' }]}
          onPress={() => {
            carrito.addItem({
              id: params.id,
              title: params.name,
              quantity: cantidad,
              unit_price: Number(String(params.price).replace(/[^\d.]/g, '')),
              talla: talla,
              image:
                params.image && typeof params.image === 'number'
                  ? params.image
                  : require('../../assets/images/shirt1.png'),
            });
            router.back();
          }}
        >
          <Text style={[styles.buttonText, { color: isDark ? '#000' : '#fff' }]}>
            Agregar al carrito
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#009ee3' }]}
          onPress={() => {
            const productPrice = Number(String(params.price).replace(/[^\d.]/g, ''));
            const shippingCost = 50;
            const totalWithShipping = (productPrice * cantidad) + shippingCost;
            
            router.push({
              pathname: '/pago/pago' as any,
              params: {
                productoId: params.id,
                precio: productPrice.toString(),
                nombre: params.name,
                cantidad: cantidad.toString(),
                talla: talla,
                costoEnvio: shippingCost.toString(),
                totalConEnvio: totalWithShipping.toString(),
                // También enviar cartItems para compatibilidad
                cartItems: JSON.stringify([
                  {
                    id: params.id, // AGREGAR ID
                    title: params.name,
                    quantity: cantidad, // USAR LA CANTIDAD SELECCIONADA
                    unit_price: productPrice,
                    talla: talla,
                    productId: parseInt(params.id), // ID COMO NÚMERO
                  },
                ]),
              },
            });
          }}
        >
          <Text style={styles.buttonText}>Comprar</Text>
        </TouchableOpacity>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    paddingBottom: 50, // AGREGAR MÁS ESPACIO EN LA PARTE INFERIOR
  },
  imagen: { width: 220, height: 220, marginBottom: 20 },
  nombre: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  precio: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 15, marginBottom: 6 },
  tallasRow: { flexDirection: 'row', marginBottom: 12 },
  tallaBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#aaa',
    marginHorizontal: 6,
  },
  tallaBtnSelected: { backgroundColor: '#009ee3', borderColor: '#009ee3' },
  tallaText: { fontSize: 16, color: '#aaa' },
  tallaTextSelected: { color: '#fff', fontWeight: 'bold' },
  cantidadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  cantidadBtn: { padding: 8, borderRadius: 8, backgroundColor: '#eee', marginHorizontal: 8 },
  cantidadBtnText: { fontSize: 18, fontWeight: 'bold' },
  cantidadInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  // ESTILOS PARA RESUMEN DE COSTOS - MEJORADOS
  costSummary: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32, // MÁS ESPACIO ANTES DE LOS BOTONES
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  costText: {
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 8,
  },
  totalText: {
    fontSize: 18, // Más grande para destacar
    fontWeight: 'bold',
  },
  // ESTILOS PARA BOTONES - MEJORADOS CON MÁS ESPACIO
  buttonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    gap: 12, // Espacio entre botones
    marginBottom: 40, // AGREGAR MARGEN INFERIOR PARA SEPARAR DEL INDICADOR DE iOS
    paddingHorizontal: 4, // Un poco de padding lateral
  },
  button: { 
    flex: 1, 
    paddingVertical: 16, // Más altura
    paddingHorizontal: 12,
    borderRadius: 12, // Más redondeado
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    fontWeight: 'bold', 
    fontSize: 16,
    textAlign: 'center',
  },
});
