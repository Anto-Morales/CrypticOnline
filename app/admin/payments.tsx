import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  user: {
    nombres: string;
    apellidoPaterno: string;
    email: string;
  };
  createdAt: string;
  processedAt?: string;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  todayRevenue: number;
  todayTransactions: number;
  methodStats: { method: string; count: number; amount: number; percentage: number }[];
  recentPayments: Payment[];
}

export default function AdminPayments() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    todayRevenue: 0,
    todayTransactions: 0,
    methodStats: [],
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // Mock data hasta que creemos la API real
      const mockPayments: Payment[] = [
        {
          id: 1,
          orderId: 1,
          amount: 640.99,
          method: 'MercadoPago',
          status: 'COMPLETED',
          transactionId: 'MP_001_ABC123',
          user: {
            nombres: 'Angel Valentin',
            apellidoPaterno: 'Flores',
            email: 'an@c.com'
          },
          createdAt: '2025-01-28T10:30:00Z',
          processedAt: '2025-01-28T10:31:00Z'
        },
        {
          id: 2,
          orderId: 2,
          amount: 1349.50,
          method: 'MercadoPago',
          status: 'PENDING',
          transactionId: 'MP_002_DEF456',
          user: {
            nombres: 'María José',
            apellidoPaterno: 'García',
            email: 'maria@example.com'
          },
          createdAt: '2025-01-28T09:15:00Z'
        },
        {
          id: 3,
          orderId: 3,
          amount: 1250.00,
          method: 'PayPal',
          status: 'COMPLETED',
          transactionId: 'PP_GHI789',
          user: {
            nombres: 'Carlos',
            apellidoPaterno: 'López',
            email: 'carlos@example.com'
          },
          createdAt: '2025-01-27T14:20:00Z',
          processedAt: '2025-01-27T14:22:00Z'
        },
        {
          id: 4,
          orderId: 4,
          amount: 850.00,
          method: 'MercadoPago',
          status: 'COMPLETED',
          transactionId: 'MP_003_JKL012',
          user: {
            nombres: 'Ana',
            apellidoPaterno: 'Martínez',
            email: 'ana@example.com'
          },
          createdAt: '2025-01-26T11:10:00Z',
          processedAt: '2025-01-26T11:12:00Z'
        },
        {
          id: 5,
          orderId: 5,
          amount: 590.99,
          method: 'Transferencia',
          status: 'FAILED',
          user: {
            nombres: 'Luis',
            apellidoPaterno: 'Rodríguez',
            email: 'luis@example.com'
          },
          createdAt: '2025-01-25T16:45:00Z'
        }
      ];

      setPayments(mockPayments);

      // Calcular estadísticas
      const totalRevenue = mockPayments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalTransactions = mockPayments.filter(p => p.status === 'COMPLETED').length;
      
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = mockPayments.filter(p => 
        p.createdAt.startsWith(today) && p.status === 'COMPLETED'
      );
      const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Estadísticas por método
      const methodCounts: { [key: string]: { count: number; amount: number } } = {};
      mockPayments.filter(p => p.status === 'COMPLETED').forEach(payment => {
        if (!methodCounts[payment.method]) {
          methodCounts[payment.method] = { count: 0, amount: 0 };
        }
        methodCounts[payment.method].count++;
        methodCounts[payment.method].amount += payment.amount;
      });

      const methodStats = Object.entries(methodCounts).map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: (data.count / totalTransactions) * 100
      }));

      setStats({
        totalRevenue,
        totalTransactions,
        todayRevenue,
        todayTransactions: todayPayments.length,
        methodStats,
        recentPayments: mockPayments.slice(0, 5)
      });

    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED': return themeColors.success;
      case 'PENDING': return themeColors.warning;
      case 'FAILED': return themeColors.danger;
      case 'REFUNDED': return themeColors.info;
      default: return themeColors.subText;
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED': return 'checkmark-circle-outline';
      case 'PENDING': return 'time-outline';
      case 'FAILED': return 'close-circle-outline';
      case 'REFUNDED': return 'return-down-back-outline';
      default: return 'help-outline';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'mercadopago': return 'card-outline';
      case 'paypal': return 'logo-paypal';
      case 'transferencia': return 'swap-horizontal-outline';
      default: return 'card-outline';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
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
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
      </View>
    </View>
  );

  const PaymentCard = ({ payment }: { payment: Payment }) => (
    <View style={[styles.paymentCard, { backgroundColor: themeColors.cardBg }]}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={[styles.paymentId, { color: themeColors.textColor }]}>
            Pago #{payment.id} - Orden #{payment.orderId}
          </Text>
          <Text style={[styles.paymentUser, { color: themeColors.subText }]}>
            {payment.user.nombres} {payment.user.apellidoPaterno}
          </Text>
          <Text style={[styles.paymentEmail, { color: themeColors.subText }]}>
            {payment.user.email}
          </Text>
        </View>
        <View style={styles.paymentMeta}>
          <Text style={[styles.paymentAmount, { color: themeColors.success }]}>
            ${payment.amount.toFixed(2)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
            <Ionicons name={getStatusIcon(payment.status) as any} size={16} color="#fff" />
            <Text style={styles.statusText}>{payment.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.paymentMethod}>
          <Ionicons name={getMethodIcon(payment.method) as any} size={20} color={themeColors.accent} />
          <Text style={[styles.methodText, { color: themeColors.textColor }]}>
            {payment.method}
          </Text>
        </View>
        {payment.transactionId && (
          <Text style={[styles.transactionId, { color: themeColors.subText }]}>
            ID: {payment.transactionId}
          </Text>
        )}
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={[styles.paymentDate, { color: themeColors.subText }]}>
          {new Date(payment.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        {payment.processedAt && (
          <Text style={[styles.processedDate, { color: themeColors.success }]}>
            Procesado: {new Date(payment.processedAt).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: themeColors.textColor }]}>
          Gestión de Pagos
        </Text>
        <Text style={[styles.pageSubtitle, { color: themeColors.subText }]}>
          Análisis de transacciones y métodos de pago
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Cards */}
        <View style={[styles.statsGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          <StatCard
            title="Ingresos Totales"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="trending-up-outline"
            color={themeColors.success}
            subtitle={`${stats.totalTransactions} transacciones`}
          />
          <StatCard
            title="Ingresos Hoy"
            value={`$${stats.todayRevenue.toLocaleString()}`}
            icon="today-outline"
            color={themeColors.info}
            subtitle={`${stats.todayTransactions} transacciones`}
          />
        </View>

        {/* Payment Methods Stats */}
        <View style={[styles.chartCard, { backgroundColor: themeColors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: themeColors.textColor }]}>
            Métodos de Pago
          </Text>
          {stats.methodStats.map((method, index) => (
            <View key={index} style={styles.methodStat}>
              <View style={styles.methodInfo}>
                <Ionicons 
                  name={getMethodIcon(method.method) as any} 
                  size={24} 
                  color={themeColors.accent} 
                />
                <Text style={[styles.methodName, { color: themeColors.textColor }]}>
                  {method.method}
                </Text>
              </View>
              <View style={styles.methodStats}>
                <Text style={[styles.methodAmount, { color: themeColors.success }]}>
                  ${method.amount.toFixed(2)}
                </Text>
                <Text style={[styles.methodCount, { color: themeColors.subText }]}>
                  {method.count} transacciones ({method.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Search and Filters */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.inputBg }]}>
          <Ionicons name="search" size={20} color={themeColors.subText} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textColor }]}
            placeholder="Buscar por usuario, email o ID de transacción..."
            placeholderTextColor={themeColors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: statusFilter === status ? themeColors.accent : themeColors.inputBg,
                    borderColor: themeColors.borderColor
                  }
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterText,
                  { color: statusFilter === status ? '#fff' : themeColors.textColor }
                ]}>
                  {status === 'ALL' ? 'Todos' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payments List */}
        <View style={styles.paymentsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.textColor }]}>
            Transacciones Recientes
          </Text>
          {filteredPayments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
          
          {filteredPayments.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={64} color={themeColors.subText} />
              <Text style={[styles.emptyText, { color: themeColors.subText }]}>
                No se encontraron transacciones
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 16,
  },
  statsGrid: {
    gap: 15,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statSubtitle: {
    fontSize: 12,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  methodStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  methodStats: {
    alignItems: 'flex-end',
  },
  methodAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodCount: {
    fontSize: 14,
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
  paymentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentUser: {
    fontSize: 14,
    marginBottom: 2,
  },
  paymentEmail: {
    fontSize: 12,
  },
  paymentMeta: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  paymentDetails: {
    marginBottom: 10,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  paymentDate: {
    fontSize: 12,
  },
  processedDate: {
    fontSize: 12,
    fontWeight: '500',
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
});