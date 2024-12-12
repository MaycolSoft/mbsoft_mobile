// src/screens/LogScreen.tsx

import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLogStore } from '@/store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';

const RenderLogItem = ({ item }: { item: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.logItem}>
      <Text style={styles.method}>{item.method}</Text>
      <Text>URL: {item.url}</Text>

      {item.data && (
        <>
          <TouchableOpacity onPress={handleToggleExpand}>
            <Text style={styles.toggleButton}>
              {isExpanded ? 'Ocultar Data' : 'Mostrar Data'}
            </Text>
          </TouchableOpacity>
          {isExpanded && (
            <Text style={styles.dataText}>{JSON.stringify(item.data, null, 2)}</Text>
          )}
        </>
      )}

      {item.params && <Text>Params: {JSON.stringify(item.params)}</Text>}
      <Text>Timestamp: {item.timestamp.toLocaleString()}</Text>
    </View>
  );
};

const LogScreen: React.FC = () => {
  const logs = useLogStore((state) => state.logs);

  return (
    <Provider>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Logs</Text>
          <FlatList
            data={logs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <RenderLogItem item={item} />} // Aquí se asegura de que RenderLogItem sea pasado correctamente
          />
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  safeContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  method: {
    fontWeight: 'bold',
  },
  toggleButton: {
    color: '#007BFF',
    fontWeight: '500',
    marginTop: 5,
  },
  dataText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f4f4f4',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
});

export default LogScreen;
