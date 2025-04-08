import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const IndexScreen = () => {
    const navigation = useNavigation();
    const [authType, setAuthType] = useState("login"); 
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handleDashboardNavigation = (dashboard) => {
        const routes = {
            ambulance: authType === "signup" ? "ambulance_signup" : "AmbulanceDashboard",
            hospital: authType === "signup" ? "hospital_signup" : "Hospital"
        };
        navigation.navigate(routes[dashboard], { authType });
    };

    return (
        <LinearGradient
            colors={["#e0f7fa", "#ffffff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <Text style={styles.title}>🚑 Welcome to ZatPat</Text>
            <Text style={styles.subtitle}>Quick, Reliable Emergency Assistance</Text>

            {/* Toggle Authentication Type */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    onPress={() => setAuthType("login")}
                    style={[styles.toggleButton, authType === "login" && styles.activeToggle]}
                >
                    <Text style={[styles.toggleText, authType === "login" && styles.activeToggleText]}>
                        🔐 Login
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setAuthType("signup")}
                    style={[styles.toggleButton, authType === "signup" && styles.activeToggle]}
                >
                    <Text style={[styles.toggleText, authType === "signup" && styles.activeToggleText]}>
                        📝 Sign Up
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Dashboard Navigation */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    onPress={() => handleDashboardNavigation("ambulance")}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.dashboardButton}
                    activeOpacity={0.8}
                >
                    <LinearGradient colors={["#4fc3f7", "#0288d1"]} style={styles.gradientButton}>
                        <Text style={styles.dashboardButtonText}>🚑 Ambulance Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleDashboardNavigation("hospital")}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.dashboardButton}
                    activeOpacity={0.8}
                >
                    <LinearGradient colors={["#81d4fa", "#1565c0"]} style={styles.gradientButton}>
                        <Text style={styles.dashboardButtonText}>🏥 Hospital Dashboard</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0D47A1",
        marginBottom: 5,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#444",
        marginBottom: 30,
        textAlign: "center",
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#F0F0F0",
        borderRadius: 30,
        padding: 5,
        width: "80%",
        marginBottom: 30,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
    },
    toggleText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#777",
    },
    activeToggle: {
        backgroundColor: "#0288d1",
    },
    activeToggleText: {
        color: "#fff",
    },
    dashboardButton: {
        width: "85%",
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 5,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: "center",
    },
    dashboardButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default IndexScreen;
