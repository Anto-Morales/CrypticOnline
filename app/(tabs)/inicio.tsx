import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { apiRequest } from '../config/api';

// Interfaces
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  userId: number;
  createdAt: string;
}

const HomeScreen = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Estados para productos reales
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar productos reales al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('🛍️ Cargando productos para la tienda...');
      
      const { response, data } = await apiRequest('/api/simple-products', {
        method: 'GET',
      });

      if (response.ok && data.products) {
        // Filtrar solo productos con stock disponible
        const availableProducts = data.products.filter((product: Product) => product.stock > 0);
        
        console.log(`✅ ${availableProducts.length} productos disponibles cargados`);
        
        // Separar productos: los más recientes y los destacados
        const recentProducts = availableProducts.slice(0, 6); // Primeros 6 para "LO ÚLTIMO"
        const topProducts = availableProducts.slice(-6); // Últimos 6 para "MÁS VENDIDOS"
        
        setProducts(recentProducts);
        setFeaturedProducts(topProducts);
      } else {
        console.error('❌ Error cargando productos:', data.error);
        // Mantener productos de ejemplo si hay error
        setProducts([]);
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      // Mantener productos de ejemplo si hay error de conexión
    } finally {
      setLoading(false);
    }
  };

  const navigateToProduct = (product: Product) => {
    router.push({
      pathname: '/producto/producto-detalle',
      params: {
        id: product.id.toString(),
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock.toString()
      },
    });
  };

  // Ajuste responsivo para todas las tarjetas
  const productCardStyle = {
    width: screenWidth < 400 ? screenWidth * 0.9 : screenWidth * 0.45,
    marginRight: 15,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center' as const,
    marginBottom: 15,
  };
  const productImageStyle = {
    width: productCardStyle.width * 0.85,
    height: productCardStyle.width * 0.85,
    marginBottom: -40,
  };

  const navigateToProductDetail = (product: Product) => {
    router.push({
      pathname: '/producto/producto-detalle',
      params: {
        id: product.id.toString(),
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock.toString()
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Header transparente superpuesto */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2,
          },
        ]}
      >
        <Image source={require('../../assets/images/Logo.png')} style={styles.companyLogo} />
        <View style={[styles.searchContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <TextInput
            style={[
              styles.searchBar,
              { width: screenWidth < 500 ? '80%' : 350, alignSelf: 'center' },
            ]}
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
          />
        </View>
      </View>
      {/* Contenido principal */}
      <ScrollView style={styles.content}>
        {/* Banner principal */}
        <View style={styles.bannerSection}>
          <Image
            source={require('../../assets/images/PC.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Text style={styles.bannerText}>Una playera, mil miradas</Text>
        </View>

        {/* Sección LO ÚLTIMO EN MODA */}
        <Text style={styles.sectionTitle}>LO ÚLTIMO EN MODA</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={products}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={productCardStyle}
                onPress={() => navigateToProductDetail(item)}
              >
                <Image 
                  source={item.imageUrl ? { uri: item.imageUrl } : { uri: 'https://via.placeholder.com/300x300?text=Producto' }} 
                  style={productImageStyle} 
                  resizeMode="contain" 
                />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.productSeason}>Stock: {item.stock}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productsContainer}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* Banner de preventa */}
        <View style={styles.presaleSection}>
          <Image
            source={require('../../assets/images/banner.png')}
            style={styles.presaleImage}
            resizeMode="cover"
          />
          <View style={styles.presaleTextContainer}>
            <Text style={styles.presaleText}>
              COLECCIÓN EXCLUSIVA 2025 + ENVÍO GRATIS EN TU PRIMERA COMPRA
            </Text>
            <Text style={styles.presaleTitle}>COLECCIÓN PREMIUM</Text>
          </View>
        </View>

        {/* Productos destacados */}
        <Text style={styles.sectionTitle}>LOS MÁS VENDIDOS</Text>
        <View style={styles.featuredGrid}>
          {featuredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={productCardStyle}
              onPress={() => navigateToProductDetail(product)}
            >
              <Image 
                source={product.imageUrl ? { uri: product.imageUrl } : { uri: 'https://via.placeholder.com/300x300?text=Producto' }} 
                style={productImageStyle} 
                resizeMode="contain" 
              />
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.featuredPrice}>${product.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sección inferior */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>EXPLORA NUESTRA COLECCIÓN</Text>
          <Text style={styles.searchText}>Descubre más productos</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingTop: 5,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  companyLogo: {
    width: 150,
    height: 150,
    marginRight: 10,
    resizeMode: 'contain',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 20,
    padding: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginLeft: 15,
  },
  icon: {
    width: 28,
    height: 28,
    marginLeft: 15,
    tintColor: '#fff',
  },
  content: {
    flex: 1,
  },
  bannerSection: {
    height: 350,
    marginBottom: 30,
    justifyContent: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerText: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 15,
    marginTop: 10,
  },
  productsContainer: {
    paddingLeft: 15,
    paddingBottom: 10,
  },
  // Ajustar productCard para que sea responsivo usando dimensiones relativas al ancho de la pantalla para evitar problemas de diseño en pantallas pequeñas

  productName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  productPrice: {
    color: '#fff',
    fontSize: 15,
    marginTop: 5,
  },
  productSeason: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 3,
  },
  presaleSection: {
    height: 400,
    marginVertical: 25,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 15,
  },
  presaleImage: {
    width: '100%',
    height: '100%',
  },
  presaleTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presaleText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  presaleTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 5,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  featuredName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  featuredPrice: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 10,
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  searchText: {
    color: '#aaa',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default HomeScreen;
