import { useRouter } from 'expo-router';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  useColorScheme,
} from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Datos de productos
  const products = [
    {
      id: '1',
      name: 'PLAYERA 1',
      price: '999 MXN',
      season: 'TEMPORADA 2',
      image: require('../../assets/images/shirt1.png'),
    },
    {
      id: '2',
      name: 'PLAYERA 2',
      price: '1500 MXN',
      season: 'TEMPORADA 3',
      image: require('../../assets/images/shirt2.png'),
    },
    {
      id: '3',
      name: 'PLAYERA 3',
      price: '1000 MXN',
      season: 'TEMPORADA 4',
      image: require('../../assets/images/shirt3.png'),
    },
  ];

  const featuredProducts = [
    {
      id: '4',
      name: 'PLAYER A',
      price: '3909 MXN',
      image: require('../../assets/images/shirt1.png'),
    },
    {
      id: '5',
      name: 'PLAYER B',
      price: '1500 MXN',
      image: require('../../assets/images/shirt2.png'),
    },
    {
      id: '6',
      name: 'PLAYER C',
      price: '1300 MXN',
      image: require('../../assets/images/shirt3.png'),
    },
  ];

  const navigateToProduct = (id: string) => {
    router.push({ pathname: '../productos', params: { id } });
  };

  // Estilos responsivos para las cards
  const productCardStyle = {
    width: screenWidth * 0.7 > 430 ? 430 : screenWidth * 0.7,
    marginRight: 15,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center' as const,
  };
  const productImageStyle = {
    width: screenWidth * 0.62 > 380 ? 380 : screenWidth * 0.62,
    height: screenWidth * 0.62 > 380 ? 380 : screenWidth * 0.62,
    marginBottom: -52,
  };
  const featuredCardStyle = {
    width: screenWidth * 0.7 > 430 ? 430 : screenWidth * 0.7,
    marginRight: 15,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center' as const,
  };
  const featuredImageStyle = {
    width: screenWidth * 0.62 > 380 ? 380 : screenWidth * 0.62,
    height: screenWidth * 0.62 > 380 ? 380 : screenWidth * 0.62,
    marginBottom: -80,
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      {/* Barra superior con logo, búsqueda e iconos */}
      <View style={styles.header}>
        {/* Logo de la empresa */}
        <Image source={require('../../assets/images/Logo.png')} style={styles.companyLogo} />

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Iconos */}
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
        <FlatList
          horizontal
          data={products}
          renderItem={({ item }) => (
            <TouchableOpacity style={productCardStyle} onPress={() => navigateToProduct(item.id)}>
              <Image source={item.image} style={productImageStyle} resizeMode="contain" />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
              <Text style={styles.productSeason}>{item.season}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsContainer}
          showsHorizontalScrollIndicator={false}
        />

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
              style={featuredCardStyle}
              onPress={() => navigateToProduct(product.id)}
            >
              <Image source={product.image} style={featuredImageStyle} resizeMode="contain" />
              <Text style={styles.featuredName}>{product.name}</Text>
              <Text style={styles.featuredPrice}>{product.price}</Text>
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
});

export default HomeScreen;
