import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const apiRequest = async (
  endpoint: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
) => {
  const { method = 'GET', headers = {}, body } = options;
  let baseUrl =
    process.env.EXPO_PUBLIC_NGROK_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  const FALLBACK_NGROK_URL = 'https://8024cfccc3d9.ngrok-free.app';
  if (!process.env.EXPO_PUBLIC_NGROK_URL && !process.env.EXPO_PUBLIC_API_URL)
    baseUrl = FALLBACK_NGROK_URL;
  const url = `${baseUrl}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...headers,
  };
  const config: RequestInit = { method, headers: defaultHeaders };
  if (body && method !== 'GET') config.body = body;
  const response = await fetch(url, config);
  const data = await response.json();
  return { response, data };
};

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    users: 0,
    products: 0,
    orders: 0,
    payments: 0,
    todayRevenue: 0,
    todayOrders: 0,
    activeUsers: 0,
    activeProducts: 0,
    newUsers: [],
    topProducts: [],
    bestProduct: null,
    outOfStock: 0,
  });
  const [chartData, setChartData] = useState<any>({
    usersByDay: { labels: [], data: [] },
    salesByProduct: { labels: [], data: [] },
    revenueByDay: { labels: [], data: [] },
    ordersByStatus: { labels: [], data: [] },
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      // Usuarios nuevos por día
      const { data: userStats } = await apiRequest('/api/admin/users/stats', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Productos más vendidos
      const { data: productsData } = await apiRequest('/api/admin/products/top', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Ingresos por día
      const { data: paymentStats } = await apiRequest('/api/admin/payments/stats', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Órdenes por estado
      const { data: orderStats } = await apiRequest('/api/admin/orders/stats', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStats({
        users: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        products: productsData.totalProducts || 0,
        activeProducts: productsData.activeProducts || 0,
        orders: orderStats.totalOrders || 0,
        todayOrders: orderStats.todayOrders || 0,
        payments: paymentStats.totalTransactions || 0,
        todayRevenue: paymentStats.todayRevenue || 0,
        newUsers: userStats.users?.slice(0, 5) || [],
        topProducts: productsData.topProducts?.slice(0, 5) || [],
        bestProduct: productsData.topProducts?.[0] || null,
        outOfStock: productsData.outOfStock || 0,
      });
      setChartData({
        usersByDay: {
          labels: userStats.usersByDay?.map((d: any) => d.day) || [],
          data: userStats.usersByDay?.map((d: any) => d.count) || [],
        },
        salesByProduct: {
          labels: productsData.topProducts?.map((p: any) => p.nombre) || [],
          data: productsData.topProducts?.map((p: any) => p.totalSold) || [],
        },
        revenueByDay: {
          labels: paymentStats.revenueByDay?.map((d: any) => d.day) || [],
          data: paymentStats.revenueByDay?.map((d: any) => d.amount) || [],
        },
        ordersByStatus: {
          labels: orderStats.ordersByStatus?.map((d: any) => d.status) || [],
          data: orderStats.ordersByStatus?.map((d: any) => d.count) || [],
        },
      });
    } catch (error) {
      setStats({
        users: 0,
        products: 0,
        orders: 0,
        payments: 0,
        todayRevenue: 0,
        todayOrders: 0,
        activeUsers: 0,
        activeProducts: 0,
        newUsers: [],
        topProducts: [],
        bestProduct: null,
        outOfStock: 0,
      });
      setChartData({
        usersByDay: { labels: [], data: [] },
        salesByProduct: { labels: [], data: [] },
        revenueByDay: { labels: [], data: [] },
        ordersByStatus: { labels: [], data: [] },
      });
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { label: 'Usuarios', icon: 'people-outline', screen: 'users', color: '#007bff' },
    { label: 'Productos', icon: 'cube-outline', screen: 'products', color: '#28a745' },
    { label: 'Órdenes', icon: 'receipt-outline', screen: 'orders', color: '#ffc107' },
    { label: 'Pagos', icon: 'card-outline', screen: 'payments', color: '#17a2b8' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.content, { padding: isMobile ? 10 : 20 }]}>
        <Text style={[styles.title, { fontSize: isMobile ? 20 : 28 }]}>
          Panel de Administración
        </Text>
        <Text style={[styles.subtitle, { fontSize: isMobile ? 14 : 18 }]}>
          Dashboard visual y estratégico
        </Text>
        {loading ? (
          <View style={{ marginVertical: 40 }}>
            <ActivityIndicator size="large" color="#ffc107" />
            <Text style={{ color: '#ffc107', marginTop: 10 }}>Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
            {/* Gráfico de usuarios nuevos por día */}
            <Text style={styles.graphTitle}>Usuarios nuevos (última semana)</Text>
            <BarChart
              data={{
                labels: chartData.usersByDay.labels,
                datasets: [{ data: chartData.usersByDay.data }],
              }}
              width={width - 40}
              height={220}
              yAxisLabel=""
              chartConfig={graphConfig}
              style={styles.graph}
            />

            {/* Gráfico de ventas por producto */}
            <Text style={styles.graphTitle}>Ventas por producto (Top 5)</Text>
            <BarChart
              data={{
                labels: chartData.salesByProduct.labels,
                datasets: [{ data: chartData.salesByProduct.data }],
              }}
              width={width - 40}
              height={220}
              yAxisLabel=""
              chartConfig={graphConfig}
              style={styles.graph}
            />

            {/* Gráfico de ingresos por día */}
            <Text style={styles.graphTitle}>Ingresos diarios (última semana)</Text>
            <LineChart
              data={{
                labels: chartData.revenueByDay.labels,
                datasets: [{ data: chartData.revenueByDay.data }],
              }}
              width={width - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={graphConfig}
              style={styles.graph}
            />

            {/* Gráfico de órdenes por estado */}
            <Text style={styles.graphTitle}>Órdenes por estado</Text>
            <BarChart
              data={{
                labels: chartData.ordersByStatus.labels,
                datasets: [{ data: chartData.ordersByStatus.data }],
              }}
              width={width - 40}
              height={180}
              yAxisLabel=""
              chartConfig={graphConfig}
              style={styles.graph}
            />
          </>
        )}
        <Text style={[styles.sectionTitle, { fontSize: isMobile ? 16 : 20 }]}>Accesos Rápidos</Text>
        <View style={[styles.quickLinks, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={[styles.quickLinkCard, { backgroundColor: link.color }]}
              onPress={() => {
                /* Navegación a la pantalla correspondiente */
              }}
            >
              <Ionicons name={link.icon as any} size={28} color="#fff" />
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const graphConfig = {
  backgroundGradientFrom: '#181824',
  backgroundGradientTo: '#181824',
  color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  barPercentage: 0.6,
  decimalPlaces: 0,
  style: { borderRadius: 16 },
  propsForDots: { r: '5', strokeWidth: '2', stroke: '#ffc107' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181824',
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#ffc107',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  graph: {
    marginVertical: 16,
    borderRadius: 16,
  },
  graphTitle: {
    color: '#ffc107',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 36,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  quickLinks: {
    width: '100%',
    gap: 18,
    marginBottom: 36,
  },
  quickLinkCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    borderRadius: 16,
    marginHorizontal: 7,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  quickLinkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 18,
    letterSpacing: 0.5,
  },
});
