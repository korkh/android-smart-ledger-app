import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, marginTop: 12 },
  langContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  langBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  langText: { fontSize: 13, fontWeight: "500" },
  langTextActive: { color: "#fff", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: "#ffebee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  logoutText: {
    color: "#d32f2f",
    fontWeight: "bold",
    fontSize: 15,
  },
});
