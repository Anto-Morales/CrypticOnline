import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../edit/alert';

interface Branch {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
}

interface Address {
  id: string;
  street: string;
  reference: string;
  zipCode: string;
}

const DeliverySelector: React.FC = () => {
  const navigation = useNavigation();
  const [deliveryType, setDeliveryType] = useState<'home' | 'branch'>('home');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', reference: '', zipCode: '' });
  const [newBranch, setNewBranch] = useState({ name: '', address: '', hours: '' });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      name: 'Centro de distribución Norte',
      address: 'Av. Principal 123, Col. Industrial',
      distance: '2.5 km',
      hours: 'L-V 9:00 - 19:00',
    },
    {
      id: '2',
      name: 'Sucursal Centro',
      address: 'Calle Central 456, Zona Centro',
      distance: '1.2 km',
      hours: 'L-S 8:00 - 20:00',
    },
  ]);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      street: 'Calle Rosas 321',
      reference: 'Entre Av. Principal y Calle Secundaria',
      zipCode: '44600',
    },
    {
      id: '2',
      street: 'Av. Siempre Viva 742',
      reference: 'Frente al parque central',
      zipCode: '44620',
    },
  ]);

  const handleAddAddress = () => {
    const { street, reference, zipCode } = newAddress;
    if (!street.trim() || !reference.trim() || !zipCode.trim()) {
      setAlertTitle('Campos incompletos');
      setAlertMessage('Por favor completa todos los campos para agregar una dirección.');
      setAlertVisible(true);
      return;
    }
    const newId = (addresses.length + 1).toString();
    const addressToAdd = { id: newId, ...newAddress };
    setAddresses([...addresses, addressToAdd]);
    setSelectedAddress(addressToAdd);
    setShowAddressForm(false);
    setNewAddress({ street: '', reference: '', zipCode: '' });
  };

  const handleAddBranch = () => {
    const { name, address, hours } = newBranch;
    if (!name.trim() || !address.trim() || !hours.trim()) {
      setAlertTitle('Campos incompletos');
      setAlertMessage('Por favor completa todos los campos para agregar una sucursal.');
      setAlertVisible(true);
      return;
    }
    const newId = (branches.length + 1).toString();
    const branchToAdd = { id: newId, ...newBranch, distance: '0 km' };
    setBranches([...branches, branchToAdd]);
    setSelectedBranch(branchToAdd);
    setShowBranchForm(false);
    setNewBranch({ name: '', address: '', hours: '' });
  };

  const handleContinue = () => {
    if (
      (deliveryType === 'home' && !selectedAddress) ||
      (deliveryType === 'branch' && !selectedBranch)
    ) {
      setAlertTitle('Falta información');
      setAlertMessage('Por favor selecciona una dirección o sucursal antes de continuar');
      setAlertVisible(true);
      return;
    }
    navigation.navigate('tarjeta/SelecTarjeta' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu método de envío</Text>

      <View style={styles.mainContent}>
        {/* COLUMNA IZQUIERDA */}
        <View style={styles.leftColumn}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, deliveryType === 'home' && styles.toggleButtonActive]}
              onPress={() => setDeliveryType('home')}
            >
              <Text style={[styles.toggleText, deliveryType === 'home' && styles.toggleTextActive]}>
                A domicilio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, deliveryType === 'branch' && styles.toggleButtonActive]}
              onPress={() => setDeliveryType('branch')}
            >
              <Text
                style={[styles.toggleText, deliveryType === 'branch' && styles.toggleTextActive]}
              >
                Recoger en sucursal
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollColumn}>
            {deliveryType === 'home'
              ? addresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={[
                      styles.addressCard,
                      selectedAddress?.id === address.id && styles.addressCardSelected,
                    ]}
                    onPress={() => setSelectedAddress(address)}
                  >
                    <Text style={styles.addressTitle}>Dirección {address.id}</Text>
                    <Text style={styles.addressText}>{address.street}</Text>
                    <Text style={styles.addressDetail}>Ref: {address.reference}</Text>
                    <Text style={styles.addressDetail}>CP: {address.zipCode}</Text>
                    {selectedAddress?.id === address.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓ Seleccionado</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              : branches.map((branch) => (
                  <TouchableOpacity
                    key={branch.id}
                    style={[
                      styles.branchCard,
                      selectedBranch?.id === branch.id && styles.branchCardSelected,
                    ]}
                    onPress={() => setSelectedBranch(branch)}
                  >
                    <Text style={styles.branchName}>{branch.name}</Text>
                    <Text style={styles.branchAddress}>{branch.address}</Text>
                    <View style={styles.branchDetails}>
                      <Text style={styles.branchDetail}>{branch.distance}</Text>
                      <Text style={styles.branchDetail}>{branch.hours}</Text>
                    </View>
                    {selectedBranch?.id === branch.id && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.selectedText}>✓ Seleccionado</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        {/* COLUMNA DERECHA */}
        <View style={styles.rightColumn}>
          {deliveryType === 'home' && showAddressForm && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Agregar nuevo domicilio</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle y número"
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Referencias"
                value={newAddress.reference}
                onChangeText={(text) => setNewAddress({ ...newAddress, reference: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Código Postal"
                value={newAddress.zipCode}
                onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
                keyboardType="numeric"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowAddressForm(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleAddAddress}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {deliveryType === 'branch' && showBranchForm && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Agregar nueva sucursal</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la sucursal"
                value={newBranch.name}
                onChangeText={(text) => setNewBranch({ ...newBranch, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={newBranch.address}
                onChangeText={(text) => setNewBranch({ ...newBranch, address: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Horario (ej. L-V 9:00-18:00)"
                value={newBranch.hours}
                onChangeText={(text) => setNewBranch({ ...newBranch, hours: text })}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowBranchForm(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleAddBranch}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={() => {
                if (deliveryType === 'home') {
                  setShowAddressForm(!showAddressForm);
                  setShowBranchForm(false);
                } else {
                  setShowBranchForm(!showBranchForm);
                  setShowAddressForm(false);
                }
              }}
            >
              <Text style={styles.addButtonText}>
                {(deliveryType === 'home' && showAddressForm) ||
                (deliveryType === 'branch' && showBranchForm)
                  ? 'Cancelar'
                  : deliveryType === 'home'
                    ? '+ Agregar domicilio'
                    : '+ Agregar sucursal'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.continueButton]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  mainContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 15,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 0.5, // ¡Aquí se agrandó!
    justifyContent: 'flex-start',
  },
  scrollColumn: {
    flex: 1,
    paddingRight: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#000',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressCardSelected: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addressDetail: {
    fontSize: 12,
    color: '#999',
  },
  branchCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  branchCardSelected: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  branchAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  branchDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  branchDetail: {
    fontSize: 12,
    color: '#999',
  },
  selectedIndicator: {
    marginTop: 5,
    alignItems: 'flex-end',
  },
  selectedText: {
    color: '#000',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  bottomButtonsContainer: {
    gap: 10,
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#000',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DeliverySelector;
