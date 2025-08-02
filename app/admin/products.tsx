import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from 'react-native';
import { apiRequest } from '../config/api';

interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  imagen?: string;
  disponible: boolean;
  totalSold?: number;
  totalRevenue?: number;
  createdAt: string;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  lowStock: number;
  topProducts: Array<{
    id: number;
    nombre: string;
    precio: number;
    stock: number;
    totalSold: number;
  }>;
}

export default function AdminProducts() {
  console.log('🏷️ ADMIN PRODUCTS: Renderizando...');
  
  const { width } = useWindowDimensions();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const isMobile = width < 768;

  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: '',
    disponible: true
  });

  const themeColors = {
    background: isDark ? '#000' : '#f8f9fa',
    cardBg: isDark ? '#222' : '#fff',
    textColor: isDark ? '#fff' : '#000',
    subText: isDark ? '#ccc' : '#666',
    inputBg: isDark ? '#333' : '#f8f9fa',
    borderColor: isDark ? '#444' : '#ddd',
    accent: '#007bff',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
  };

  const categories = ['Ropa', 'Electrónicos', 'Hogar', 'Deportes', 'Libros', 'Otros'];

  useEffect(() => {
    loadProducts();
  }, []);

  // Cargar estadísticas cuando los productos cambien
  useEffect(() => {
    if (products.length > 0) {
      loadStats();
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      console.log('📦 Cargando productos...');
      
      // Usar la API simple que ya funciona
      const { response, data } = await apiRequest('/api/simple-products', {
        method: 'GET',
      });

      if (response.ok) {
        // Adaptar la estructura de datos
        const adaptedProducts = data.products?.map((product: any) => ({
          id: product.id,
          nombre: product.name,
          descripcion: product.description,
          precio: product.price,
          stock: product.stock,
          categoria: product.category || 'Sin categoría',
          imagen: product.imageUrl,
          disponible: product.stock > 0,
          totalSold: 0, // Por ahora en 0
          totalRevenue: 0, // Por ahora en 0
          createdAt: product.createdAt
        })) || [];

        setProducts(adaptedProducts);
        console.log('✅ Productos cargados:', adaptedProducts.length);
      } else {
        console.error('❌ Error cargando productos:', data.error);
        Alert.alert('Error', 'No se pudieron cargar los productos');
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      Alert.alert('Error', 'Error de conexión al cargar productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calcular estadísticas simples basadas en los productos cargados
      // Por ahora usamos datos locales en lugar de una API separada
      if (products.length > 0) {
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.disponible).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

        setStats({
          totalProducts,
          activeProducts,
          inactiveProducts: totalProducts - activeProducts,
          outOfStock,
          lowStock,
          topProducts: []
        });

        console.log('✅ Estadísticas calculadas:', { totalProducts, activeProducts, outOfStock, lowStock });
      }
    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
    loadStats();
  };

  const openCreateModal = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagen: '',
      disponible: true
    });
    setSelectedProduct(null);
    setIsEditing(false);
    setShowProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      categoria: product.categoria || '',
      imagen: product.imagen || '',
      disponible: product.disponible
    });
    setSelectedProduct(product);
    setIsEditing(true);
    setShowProductModal(true);
  };

  const closeModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: '',
      imagen: '',
      disponible: true
    });
  };

  const handleSaveProduct = async () => {
    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        Alert.alert('Error', 'El nombre del producto es requerido');
        return;
      }

      if (!formData.precio || isNaN(parseFloat(formData.precio))) {
        Alert.alert('Error', 'El precio debe ser un número válido');
        return;
      }

      if (!formData.stock || isNaN(parseInt(formData.stock))) {
        Alert.alert('Error', 'El stock debe ser un número válido');
        return;
      }

      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria: formData.categoria,
        imagen: formData.imagen.trim()
      };

      console.log('💾 Guardando producto:', productData);

      let response, data;

      if (isEditing && selectedProduct) {
        // Actualizar producto existente
        console.log('📝 Actualizando producto ID:', selectedProduct.id);
        const result = await apiRequest(`/api/simple-products/${selectedProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData),
        });
        response = result.response;
        data = result.data;
      } else {
        // Crear nuevo producto usando la API simple
        console.log('➕ Creando nuevo producto');
        const result = await apiRequest('/api/simple-products/create', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        response = result.response;
        data = result.data;
      }

      console.log('📡 Respuesta del servidor:', { status: response.status, data });

      if (response.ok) {
        Alert.alert(
          'Éxito', 
          `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`
        );
        closeModal();
        loadProducts();
        loadStats();
      } else {
        console.error('❌ Error del servidor:', data);
        Alert.alert('Error', data.error || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('❌ Error guardando producto:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    console.log('🗑️ Preparando eliminar producto:', product.nombre);
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      console.log('🗑️ Eliminando producto ID:', productToDelete.id);
      const { response, data } = await apiRequest(`/api/simple-products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      console.log('📡 Respuesta eliminación:', { status: response.status, data });

      if (response.ok) {
        console.log('✅ Producto eliminado exitosamente');
        loadProducts(); // Recargar lista
        setShowDeleteModal(false);
        setProductToDelete(null);
        
        // Mostrar confirmación (opcional)
        Alert.alert('Éxito', data.message || 'Producto eliminado');
      } else {
        console.error('❌ Error eliminando:', data);
        Alert.alert('Error', data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const cancelDeleteProduct = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: themeColors.danger, text: 'Sin Stock' };
    if (stock <= 5) return { color: themeColors.warning, text: 'Stock Bajo' };
    return { color: themeColors.success, text: 'En Stock' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.descripcion && product.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'ALL' || product.categoria === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && product.disponible) ||
      (statusFilter === 'INACTIVE' && !product.disponible) ||
      (statusFilter === 'OUT_OF_STOCK' && product.stock === 0) ||
      (statusFilter === 'LOW_STOCK' && product.stock > 0 && product.stock <= 5);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { backgroundColor: themeColors.cardBg }]}>
      <View style={styles.statContent}>
        <View>
          <Text style={[styles.statTitle, { color: themeColors.subText }]}>{title}</Text>
          <Text style={[styles.statValue, { color: themeColors.textColor }]}>{value}</Text>
          {subtitle && (
            <Text style={[styles.statSubtitle, { color: themeColors.subText }]}>{subtitle}</Text>
          )}
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
      </View>
    </View>
  );

  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product.stock);
    
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: themeColors.cardBg }]}
        onPress={() => openEditModal(product)}
      >
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          {product.imagen ? (
            <Image source={{ uri: product.imagen }} style={styles.productImage} />
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: themeColors.inputBg }]}>
              <Ionicons name="image-outline" size={32} color={themeColors.subText} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: themeColors.textColor }]} numberOfLines={2}>
            {product.nombre}
          </Text>
          {product.descripcion && (
            <Text style={[styles.productDescription, { color: themeColors.subText }]} numberOfLines={2}>
              {product.descripcion}
            </Text>
          )}
          
          <View style={styles.productMeta}>
            <Text style={[styles.productPrice, { color: themeColors.success }]}>
              ${product.precio.toFixed(2)}
            </Text>
            {product.categoria && (
              <View style={[styles.categoryBadge, { backgroundColor: themeColors.accent }]}>
                <Text style={styles.categoryText}>{product.categoria}</Text>
              </View>
            )}
          </View>

          <View style={styles.productStats}>
            <View style={styles.stockInfo}>
              <Ionicons name="cube-outline" size={16} color={stockStatus.color} />
              <Text style={[styles.stockText, { color: stockStatus.color }]}>
                {product.stock} unidades
              </Text>
            </View>
            {product.totalSold !== undefined && (
              <Text style={[styles.salesText, { color: themeColors.subText }]}>
                Vendidos: {product.totalSold}
              </Text>
            )}
          </View>

          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.accent }]}
              onPress={() => openEditModal(product)}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: themeColors.danger }]}
              onPress={() => handleDeleteProduct(product)}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Indicator */}
        <View style={[
          styles.statusIndicator,
          { backgroundColor: product.disponible ? themeColors.success : themeColors.danger }
        ]}>
          <Ionicons 
            name={product.disponible ? "checkmark" : "close"} 
            size={12} 
            color="#fff" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.pageTitle, { color: themeColors.textColor }]}>
            🏷️ Gestión de Productos
          </Text>
          <Text style={[styles.pageSubtitle, { color: themeColors.subText }]}>
            {stats.totalProducts} productos • {stats.activeProducts} activos
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColors.success }]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={24} color="#fff" />
          {!isMobile && <Text style={styles.addButtonText}>Nuevo Producto</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={[styles.statsContainer, { flexDirection: isMobile ? 'column' : 'row' }]}>
          <StatCard
            title="Total Productos"
            value={stats.totalProducts}
            icon="cube-outline"
            color={themeColors.accent}
          />
          <StatCard
            title="Sin Stock"
            value={stats.outOfStock}
            icon="alert-circle-outline"
            color={themeColors.danger}
          />
          <StatCard
            title="Stock Bajo"
            value={stats.lowStock}
            icon="warning-outline"
            color={themeColors.warning}
          />
        </View>

        {/* Search and Filters */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.inputBg }]}>
          <Ionicons name="search" size={20} color={themeColors.subText} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textColor }]}
            placeholder="Buscar productos..."
            placeholderTextColor={themeColors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {[
            { value: 'ALL', label: 'Todos' },
            { value: 'ACTIVE', label: 'Activos' },
            { value: 'INACTIVE', label: 'Inactivos' },
            { value: 'OUT_OF_STOCK', label: 'Sin Stock' },
            { value: 'LOW_STOCK', label: 'Stock Bajo' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                {
                  backgroundColor: statusFilter === filter.value ? themeColors.accent : themeColors.inputBg,
                  borderColor: themeColors.borderColor
                }
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text style={[
                styles.filterText,
                { color: statusFilter === filter.value ? '#fff' : themeColors.textColor }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={[styles.productsGrid, { 
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: isMobile ? 'nowrap' : 'wrap'
        }]}>
          {filteredProducts.map((product) => (
            <View 
              key={product.id} 
              style={[
                styles.productWrapper,
                { width: isMobile ? '100%' : '48%' }
              ]}
            >
              <ProductCard product={product} />
            </View>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={themeColors.subText} />
            <Text style={[styles.emptyText, { color: themeColors.subText }]}>
              No se encontraron productos
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBg }]}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.textColor }]}>
                  {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                </Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={24} color={themeColors.textColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                    Nombre *
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.textColor,
                      borderColor: themeColors.borderColor
                    }]}
                    placeholder="Nombre del producto"
                    placeholderTextColor={themeColors.subText}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                    Descripción
                  </Text>
                  <TextInput
                    style={[styles.textArea, { 
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.textColor,
                      borderColor: themeColors.borderColor
                    }]}
                    placeholder="Descripción del producto"
                    placeholderTextColor={themeColors.subText}
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                      Precio *
                    </Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: themeColors.inputBg,
                        color: themeColors.textColor,
                        borderColor: themeColors.borderColor
                      }]}
                      placeholder="0.00"
                      placeholderTextColor={themeColors.subText}
                      value={formData.precio}
                      onChangeText={(text) => setFormData({ ...formData, precio: text })}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                      Stock *
                    </Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: themeColors.inputBg,
                        color: themeColors.textColor,
                        borderColor: themeColors.borderColor
                      }]}
                      placeholder="0"
                      placeholderTextColor={themeColors.subText}
                      value={formData.stock}
                      onChangeText={(text) => setFormData({ ...formData, stock: text })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                    Categoría
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.categorySelector}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryOption,
                            {
                              backgroundColor: formData.categoria === category ? themeColors.accent : themeColors.inputBg,
                              borderColor: themeColors.borderColor
                            }
                          ]}
                          onPress={() => setFormData({ ...formData, categoria: category })}
                        >
                          <Text style={[
                            styles.categoryOptionText,
                            { color: formData.categoria === category ? '#fff' : themeColors.textColor }
                          ]}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                    URL de Imagen
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: themeColors.inputBg,
                      color: themeColors.textColor,
                      borderColor: themeColors.borderColor
                    }]}
                    placeholder="https://..."
                    placeholderTextColor={themeColors.subText}
                    value={formData.imagen}
                    onChangeText={(text) => setFormData({ ...formData, imagen: text })}
                  />
                </View>

                <View style={styles.switchContainer}>
                  <Text style={[styles.inputLabel, { color: themeColors.textColor }]}>
                    Producto disponible
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      { backgroundColor: formData.disponible ? themeColors.success : themeColors.danger }
                    ]}
                    onPress={() => setFormData({ ...formData, disponible: !formData.disponible })}
                  >
                    <Text style={styles.switchText}>
                      {formData.disponible ? 'Disponible' : 'No Disponible'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: themeColors.subText }]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: themeColors.success }]}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.modalButtonText}>
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelDeleteProduct}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={48} color={themeColors.danger} />
              <Text style={[styles.deleteModalTitle, { color: themeColors.textColor }]}>
                Eliminar Producto
              </Text>
            </View>
            
            <Text style={[styles.deleteModalMessage, { color: themeColors.subText }]}>
              ¿Estás seguro de que quieres eliminar{'\n'}
              <Text style={{ fontWeight: 'bold', color: themeColors.textColor }}>
                "{productToDelete?.nombre}"
              </Text>
              ?{'\n\n'}
              Esta acción no se puede deshacer.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, { 
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.borderColor
                }]}
                onPress={cancelDeleteProduct}
              >
                <Text style={[styles.deleteModalButtonText, { color: themeColors.textColor }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: themeColors.danger }]}
                onPress={confirmDeleteProduct}
              >
                <Text style={[styles.deleteModalButtonText, { color: '#fff' }]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productsGrid: {
    gap: 15,
    marginBottom: 20,
  },
  productWrapper: {
    marginBottom: 15,
  },
  productCard: {
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productStats: {
    marginBottom: 15,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  salesText: {
    fontSize: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 5,
    fontSize: 14,
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  switchText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para modal de eliminación
  deleteModalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteModalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});