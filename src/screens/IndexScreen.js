import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BackgroundWrapper from "../component/BackgroundWrapper";
import Button from "../component/Button";

const IndexScreen = () => {
    const navigation = useNavigation();
    const [authType, setAuthType] = useState("login");

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

                <Button
                    title="🚑 Ambulance Dashboard"
                    onPress={() => handleDashboardNavigation("ambulance")}
                    gradientColors={["#4fc3f7", "#0288d1"]}
                    style={styles.dashboardButton}
                    textStyle={styles.dashboardButtonText}
                />

                <Button
                    title="🏥 Hospital Dashboard"
                    onPress={() => handleDashboardNavigation("hospital")}
                    gradientColors={["#81d4fa", "#1565c0"]}
                    style={styles.dashboardButton}
                    textStyle={styles.dashboardButtonText}
                />
            </View>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        justifyContent: "flex-start",
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#0D47A1",
        textAlign: "center",
        paddingHorizontal: 20,
        marginTop: "10%",
        marginBottom: 10,
        height: "30%",
        justifyContent: "center",
        textAlignVertical: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#444",
        marginBottom: 20,
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
        marginTop: 20,
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
        width: 300,
        marginBottom: 15,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 5,
        alignSelf: "center",
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
