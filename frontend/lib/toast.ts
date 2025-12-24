import { Alert } from 'react-native';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

class ToastService {
  showSuccess(message: string, title: string = 'Success') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  showError(message: string, title: string = 'Error') {
    Alert.alert(title, message, [{ text: 'OK', style: 'destructive' }]);
  }

  showInfo(message: string, title: string = 'Info') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  showWarning(message: string, title: string = 'Warning') {
    Alert.alert(title, message, [{ text: 'OK', style: 'default' }]);
  }

  showConfirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    title: string = 'Confirm'
  ) {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: onCancel },
        { text: 'Confirm', style: 'destructive', onPress: onConfirm },
      ]
    );
  }
}

export const toast = new ToastService();