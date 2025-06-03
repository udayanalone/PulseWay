import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const AuthForm = ({ authType, onSubmit }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
    });

    const handleChange = (name, value) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = () => {
        if (authType === 'signup') {
            const { fullName, email, username, password } = formData;
            if (!fullName || !email || !username || !password) {
                Alert.alert('Error', 'All fields are required for Sign Up.');
                return;
            }
            if (password.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters.');
                return;
            }
        } else if (authType === 'login') {
            const { username, password } = formData;
            if (!username || !password) {
                Alert.alert('Error', 'Username and Password are required for Login.');
                return;
            }
        }
        onSubmit(formData);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {authType === 'signup' ? '📝 Sign Up' : '🔐 Login'}
            </Text>

            {authType === 'signup' && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChangeText={(text) => handleChange('fullName', text)}
                        autoCapitalize="words"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        autoCapitalize="none"
                    />
                </>
            )}

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={formData.username}
                onChangeText={(text) => handleChange('username', text)}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>
                    {authType === 'signup' ? 'Create Account' : 'Login'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f5f7fa',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
});

export default AuthForm;
