import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const tallas = ['S', 'M', 'L', 'XL', 'XXL'];
const imagenes = [
  require('@/assets/images/shirt1.png'),
  require('@/assets/images/shirt2.png'),
  require('@/assets/images/shirt3.png'),
];

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function PlayeraDetalle() {
  const [tallaSeleccionada, setTallaSeleccionada] = useState('');
  const [imagenActual, setImagenActual] = useState(0);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();

  // Datos del producto
  const producto = {
    nombre: 'Polo Casual De Manga Corta',
    precio: 118.44,
    precioOriginal: 282,
    descuento: '58% OFF',
    marca: 'CR7-BROS',
    material: 'Poliéster',
    temporada: 'Primavera/Verano',
    descripcion:
      'Este Polo Casual de Manga Corta de Calidad a la Moda es perfecto para hombres adultos que buscan lucir elegantes y a la moda en cualquier ocasión...',
  };

  const showAlert = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const enviarOpinion = () => {
    if (calificacion === 0 || comentario.trim() === '') {
      showAlert('Error', 'Por favor califica el producto y escribe un comentario.');
      return;
    }
    showAlert('¡Gracias!', 'Tu opinión ha sido enviada.');
    setCalificacion(0);
    setComentario('');
  };

  const manejarCompra = () => {
    if (!tallaSeleccionada) {
      showAlert('Selecciona una talla', 'Por favor selecciona una talla antes de continuar.');
      return;
    }

    router.push({
      pathname: '/edit/selectdomicilio',
      params: {
        nombre: producto.nombre,
        precio: producto.precio.toString(),
        talla: tallaSeleccionada,
        imagen: imagenActual.toString(),
      },
    });
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={[styles.contentWrapper, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {/* Carrusel */}
          <View style={styles.carruselWrapper}>
            <View style={styles.carruselContenedor}>
              <Image
                source={imagenes[imagenActual]}
                style={[
                  styles.imagen,
                  {
                    width: isMobile ? width * 0.8 : width * 0.6,
                    height: isMobile ? 300 : 450,
                  },
                ]}
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() => imagenActual > 0 && setImagenActual(imagenActual - 1)}
                disabled={imagenActual === 0}
                style={[styles.botonInterno, { left: 10 }]}
              >
                <Ionicons
                  name="chevron-back"
                  size={32}
                  color={imagenActual === 0 ? '#ccc' : '#000'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  imagenActual < imagenes.length - 1 && setImagenActual(imagenActual + 1)
                }
                disabled={imagenActual === imagenes.length - 1}
                style={[styles.botonInterno, { right: 10 }]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={32}
                  color={imagenActual === imagenes.length - 1 ? '#ccc' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.paginacion}>
              {imagenes.map((_, index) => (
                <View
                  key={index}
                  style={[styles.punto, imagenActual === index && styles.puntoActivo]}
                />
              ))}
            </View>
          </View>

          {/* Info producto */}
          <View style={styles.infoCard}>
            <TouchableOpacity
              onPress={() => setEsFavorito(!esFavorito)}
              style={styles.botonFavorito}
            >
              <Ionicons
                name={esFavorito ? 'heart' : 'heart-outline'}
                size={28}
                color={esFavorito ? 'red' : 'gray'}
              />
            </TouchableOpacity>

            <Text style={styles.titulo}>{producto.nombre}</Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Ionicons name="star" size={20} color="#FFD700" />
              <Ionicons name="star" size={20} color="#FFD700" />
              <Ionicons name="star" size={20} color="#FFD700" />
              <Ionicons name="star-half" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>(5037)</Text>
            </View>

            <Text style={styles.precioDescuento}>${producto.precio}</Text>
            <Text style={styles.precioOriginal}>${producto.precioOriginal}</Text>
            <Text style={styles.descuento}>{producto.descuento}</Text>

            <Text style={styles.subtitulo}>Selecciona una talla:</Text>
            <View style={styles.tallasContainer}>
              {tallas.map((talla) => (
                <TouchableOpacity
                  key={talla}
                  style={[
                    styles.tallaBoton,
                    tallaSeleccionada === talla && styles.tallaSeleccionada,
                  ]}
                  onPress={() => setTallaSeleccionada(talla)}
                >
                  <Text
                    style={[
                      styles.tallaTexto,
                      tallaSeleccionada === talla && styles.tallaTextoSeleccionado,
                    ]}
                  >
                    {talla}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.botonContainer}>
              <TouchableOpacity style={styles.botonCarrito}>
                <Text style={styles.botonTexto}>Agregar al carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonComprar} onPress={manejarCompra}>
                <Text style={styles.botonTextoNegro}>Comprar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sección extra */}
        <View style={styles.seccionExtra}>
          <Text style={styles.tituloSeccion}>Características del producto</Text>
          <View style={styles.filaCaracteristicas}>
            <Text style={styles.caracteristica}>Marca: {producto.marca}</Text>
            <Text style={styles.caracteristica}>Material: {producto.material}</Text>
            <Text style={styles.caracteristica}>Temporada: {producto.temporada}</Text>
          </View>

          <Text style={styles.tituloSeccion}>Descripción</Text>
          <Text style={styles.descripcion}>{producto.descripcion}</Text>

          <Text style={styles.tituloSeccion}>Métodos de pago</Text>
          <Text style={styles.pagoTexto}>Aceptamos:</Text>
          <View style={styles.metodosPago}>
            <Image source={require('@/assets/images/VISA.png')} style={styles.logoPago} />
            <Image source={require('@/assets/images/Mastercard.png')} style={styles.logoPago} />
            <Image source={require('@/assets/images/Oxxo_Logo.png')} style={styles.logoPago} />
            <Image source={require('@/assets/images/MP.png')} style={styles.logoPago} />
          </View>
        </View>

        {/* Opiniones y calificaciones */}
        <View style={styles.seccionExtra}>
          <Text style={styles.tituloSeccion}>Opiniones y calificaciones</Text>

          <View style={styles.opinion}>
            <Text style={styles.nombreUsuario}>Carlos M.</Text>
            <View style={styles.estrellas}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.textoOpinion}>
              Excelente calidad y entrega rápida. Recomiendo totalmente esta playera.
            </Text>
          </View>

          <View style={styles.opinion}>
            <Text style={styles.nombreUsuario}>Lucía R.</Text>
            <View style={styles.estrellas}>
              {[...Array(4)].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
              <Ionicons name="star-outline" size={16} color="#FFD700" />
            </View>
            <Text style={styles.textoOpinion}>
              Me gustó mucho, aunque la talla viene un poco reducida.
            </Text>
          </View>

          <Text style={styles.subtitulo}>Escribe tu opinión</Text>

          <View style={styles.calificacionInput}>
            <Text style={styles.label}>Calificación:</Text>
            <View style={styles.estrellas}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setCalificacion(i + 1)}>
                  <Ionicons
                    name={i < calificacion ? 'star' : 'star-outline'}
                    size={24}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.textAreaBox}>
            <Text style={styles.label}>Deja tu comentario:</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Escribe aquí tu opinión..."
              value={comentario}
              onChangeText={setComentario}
            />
          </View>

          <TouchableOpacity style={styles.botonCarrito} onPress={enviarOpinion}>
            <Text style={styles.botonTexto}>Enviar opinión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal personalizado para alertas */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
            <Text style={modalStyles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={modalStyles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f3f3' },
  contentWrapper: { padding: 20, gap: 20 },
  carruselWrapper: { width: isMobile ? '100%' : width * 0.6, alignItems: 'center' },
  carruselContenedor: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonInterno: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 6,
    zIndex: 5,
  },
  imagen: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 8,
  },
  paginacion: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  puntoActivo: { backgroundColor: '#000' },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  botonFavorito: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  ratingText: { marginLeft: 8, color: '#555' },
  precioDescuento: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  precioOriginal: { textDecorationLine: 'line-through', color: '#888', fontSize: 16 },
  descuento: { color: 'green', fontWeight: '600', marginBottom: 20 },
  subtitulo: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 10 },
  tallasContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tallaBoton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  tallaSeleccionada: { backgroundColor: '#000' },
  tallaTexto: { color: '#000' },
  tallaTextoSeleccionado: { color: '#fff' },
  botonContainer: { marginTop: 25, flexDirection: 'row', justifyContent: 'space-between' },
  botonCarrito: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  botonComprar: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    alignItems: 'center',
    flex: 1,
  },
  botonTextoNegro: { color: '#000', fontWeight: '600', fontSize: 16 },

  seccionExtra: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  tituloSeccion: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#000' },
  filaCaracteristicas: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 15 },
  caracteristica: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 6,
  },
  descripcion: { fontSize: 15, lineHeight: 22, color: '#444', marginBottom: 25 },
  pagoTexto: { fontSize: 15, color: '#333', marginBottom: 10 },
  metodosPago: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  logoPago: { width: 60, height: 40, resizeMode: 'contain', marginRight: 10 },
  opinion: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nombreUsuario: {
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  estrellas: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  textoOpinion: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  calificacionInput: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  textAreaBox: {
    marginBottom: 15,
  },
  textArea: {
    backgroundColor: '#f3f3f3',
    height: 100,
    borderRadius: 8,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlignVertical: 'top',
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
