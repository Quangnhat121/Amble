import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { usePartnerAuthStore } from "../../store/partnerAuthStore";

export default function PartnerProfileScreen() {
	const router = useRouter();
	const { logout } = usePartnerAuthStore();

	const handleLogout = () => {
		Alert.alert("Đăng xuất", "Bạn muốn đăng xuất khỏi tài khoản partner?", [
			{ text: "Hủy", style: "cancel" },
			{
				text: "Đăng xuất",
				style: "destructive",
				onPress: async () => {
					await logout();
					router.replace("/partner-login");
				},
			},
		]);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Profile</Text>
			<Text style={styles.subtitle}>Man hinh dang cap nhat.</Text>
			<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
				<Text style={styles.logoutText}>Đăng xuất</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
		padding: 24,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	subtitle: {
		marginTop: 8,
		fontSize: 13,
		color: "#6B7280",
	},
	logoutButton: {
		marginTop: 20,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#111827",
	},
	logoutText: {
		color: "#FFFFFF",
		fontWeight: "700",
	},
});
