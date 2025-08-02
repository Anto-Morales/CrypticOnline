// components/CustomAlert.tsx
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomAlert = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancelar',
}: CustomAlertProps) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={[styles.buttonRow, !onConfirm && styles.singleButtonRow]}>
            {onConfirm ? (
              <>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                  <Text style={styles.textStyle}>{cancelText}</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => {
                    onConfirm();
                    onCancel?.();
                  }}
                >
                  <Text style={styles.textStyle}>{confirmText}</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={[styles.button, styles.confirmButton]} onPress={onCancel}>
                <Text style={styles.textStyle}>OK</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  singleButtonRow: {
    justifyContent: 'center',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  textStyle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
