import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import DifficultyScreen from './src/screens/DifficultyScreen';
import GameScreen from './src/screens/GameScreen';
import MainScreen from './src/screens/MainScreen';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Difficulty" component={DifficultyScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
