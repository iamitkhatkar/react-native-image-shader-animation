import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SkiaCanvas} from './src/components/skiaCanvas';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

export const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <SkiaCanvas />
      </View>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
