import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Platform } from 'react-native';

import Widget from './components/Widget';
import tools from './utils/tools';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.topContent}>
        <Text style={styles.description}>
          Cross-platform generative-AI speech by Larynx.
        </Text>

        <View style={styles.toolsList}>
          <Text style={styles.toolsTitle}>Available Client Tools:</Text>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Get battery level</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>web</Text>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Change screen brightness</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
          <View style={styles.toolItem}>
            <Text style={styles.toolText}>Flash screen</Text>
            <View style={styles.platformTags}>
              <Text style={styles.platformTag}>ios</Text>
              <Text style={styles.platformTag}>android</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Voice Widget - positioned as floating widget */}
      <Widget
        dom={{ style: styles.widget }}
        platform={Platform.OS}
        get_battery_level={tools.get_battery_level}
        change_brightness={tools.change_brightness}
        flash_screen={tools.flash_screen}
      />

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContent: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
    marginBottom: 24,
  },
  toolsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  toolsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  toolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E2E8F0',
  },
  platformTags: {
    flexDirection: 'row',
    gap: 8,
  },
  platformTag: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: 'Inter-Regular',
  },
  widget: {
    // Widget will handle its own positioning via fixed positioning
  },
});