import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useResponsive } from "../../utils/responsive";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function BursaryThankYou() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useAppTheme();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 16) + (responsive.isTablet ? 100 : 80);
  const referenceNumber = route.params?.referenceNumber;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: scrollBottomPadding, padding: responsive.horizontalPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          { padding: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 24), alignItems: "center" },
        ]}
      >
        <View style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: theme.success,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}>
          <Ionicons name="checkmark" size={48} color={theme.white} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text, textAlign: "center" }}>Application Submitted!</Text>
        <Text style={{
          fontSize: 14,
          color: theme.textSecondary,
          textAlign: "center",
          marginTop: 8,
          maxWidth: 320,
        }}>
          Thank you. Your bursary application has been received and is now pending review.
        </Text>
      </View>

      <View style={{
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: "600" }}>Reference Number</Text>
        <Text style={{
          fontSize: 22,
          fontWeight: "800",
          color: theme.primary,
          marginTop: 6,
          letterSpacing: 1,
        }}>{referenceNumber || "N/A"}</Text>
        <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: "center", marginTop: 8 }}>
          Keep this reference number safe. You can use it to track the status of your application.
        </Text>
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 24,
        }}
        onPress={() => navigation.navigate("CitizenTabs", { screen: "Home" })}
      >
        <Text style={{ color: theme.white, fontSize: 16, fontWeight: "700" }}>Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: theme.surface,
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 12,
          borderWidth: 1,
          borderColor: theme.border,
        }}
        onPress={() => navigation.navigate("BursaryTracking")}
      >
        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}>Track My Application</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
