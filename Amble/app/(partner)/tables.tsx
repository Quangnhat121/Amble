import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PartnerTablesScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Tables</Text>
			<Text style={styles.subtitle}>Man hinh dang cap nhat.</Text>
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
});
