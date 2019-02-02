import { createStackNavigator, createAppContainer } from 'react-navigation';
import Homescreen from './Homescreen';
import Routes from './Rotes';

const AppStack = createStackNavigator({
  Home: {screen: HomeScreen},
  Routes:  { screen: Routes }
});

const AppContainer = createAppContainer(AppStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
