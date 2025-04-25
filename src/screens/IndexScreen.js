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
import BackgroundWrapper from "../component/BackgroundWrapper";
import Button from "../component/Button"; // Assuming Button is a custom component

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
            hospital: authType === "signup" ? "hospital_signup" : "Hospital_Dashboard",
        };
        navigation.navigate(routes[dashboard], { authType });
    };

    return (
        <BackgroundWrapper>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to PulseWay</Text>
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
                    <Button
                        title="🚑 Ambulance Dashboard"
                        onPress={() => handleDashboardNavigation("ambulance")}
                        gradientColors={["#4fc3f7", "#0288d1"]}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    />

                    <Button
                        title="🏥 Hospital Dashboard"
                        onPress={() => handleDashboardNavigation("hospital")}
                        gradientColors={["#81d4fa", "#1565c0"]}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                    />
                </Animated.View>
            </View>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16, // Apply spacing
    },
    content: {
        width: "100%",
        maxWidth: 400, // Make it mobile-friendly
        alignItems: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0D47A1",
        marginBottom: 10,
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
        width: "100%",
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
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    activeToggleText: {
        color: "#fff",
    },
    dashboardButton: {
        width: "100%",
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
