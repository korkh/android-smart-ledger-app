import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  logoutBtn: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 14,
  },
  // Tab Bar Styles
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 13,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "700",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Form Styles
  cardSection: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    color: "#212529",
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  searchBar: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryChipSelected: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 13,
    color: "#495057",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteCatIcon: {
    marginLeft: 6,
    color: "#d32f2f",
    fontSize: 12,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  // Item List Card
  itemCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e9ecef",
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemHeader: {
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.12)", // Полупрозрачный синий фон
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212529",
  },
  itemDetails: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 2,
  },
  oemTag: {
    fontSize: 12,
    color: "#2b8a3e",
    fontWeight: "600",
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    color: "#d32f2f",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#adb5bd",
    marginTop: 40,
    fontSize: 15,
  },
});
