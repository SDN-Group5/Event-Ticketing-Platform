import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { signInAsUser, signInAsStaff } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn kiểu đăng nhập</Text>
      <View style={styles.buttons}>
        <Button title="Login as User" onPress={signInAsUser} />
      </View>
      <View style={styles.buttons}>
        <Button title="Login as Staff" onPress={signInAsStaff} />
      </View>
      <Text style={styles.note}>
        Màn hình này chỉ là demo role. Sau này bạn có thể thay bằng form email/password + gọi API.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  buttons: {
    width: '80%',
    marginVertical: 8,
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
});

