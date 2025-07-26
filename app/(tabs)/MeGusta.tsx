import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  price: string;
  image: any;
  season?: string;
}

const NUM_COLUMNS = 2;

const MeGusta = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  const getImageSource = (imageParam: any) => {
    if (typeof imageParam === 'string') {
      return { uri: imageParam };
    }
    return imageParam;
  };

  useEffect(() => {
    if (params.id) {
      const newProduct: Product = {
        id: params.id as string,
        name: params.name as string,
        price: params.price as string,
        image: getImageSource(params.image),
        season: params.season as string,
      };

      setFavoriteProducts((prev) => {
        if (!prev.some((p) => p.id === newProduct.id)) {
          return [...prev, newProduct];
        }
        return prev;
      });
    }
  }, [params]);

  const removeFromFavorites = (productId: string) => {
    setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addToCart = (product: Product) => {
    router.push({
      pathname: '/carrito',
      params: {
        newProduct: JSON.stringify({
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: 1,
        }),
      },
    });
  };

  const renderFavoriteItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={item.image} style={styles.productImage} resizeMode="contain" />

      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.season && <Text style={styles.productSeason}>{item.season}</Text>}
        <Text style={styles.productPrice}>${item.price} MXN</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={() => addToCart(item)}>
            <Text style={styles.cartButtonText}>Agregar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartButton} onPress={() => removeFromFavorites(item.id)}>
            <AntDesign name="heart" size={16} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis favoritos ({favoriteProducts.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {favoriteProducts.length > 0 ? (
        <FlatList
          data={favoriteProducts}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.columnWrapper}
          key={`flatlist-${NUM_COLUMNS}`}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AntDesign name="hearto" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No tienes productos favoritos</Text>
          <Text style={styles.emptySubtext}>
            Presiona el corazón en los productos para agregarlos aquí
          </Text>
        </View>
      )}
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 20) / NUM_COLUMNS - 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: cardWidth * 0.8, // Altura más compacta
    backgroundColor: '#fff',
  },
  productDetails: {
    padding: 8,
  },
  productName: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    height: 30, // Altura fija para 2 líneas
  },
  productSeason: {
    color: '#666',
    fontSize: 10,
    marginBottom: 4,
  },
  productPrice: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: 5,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heartButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default MeGusta;
