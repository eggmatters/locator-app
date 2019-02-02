import React from 'react';
import {
    Text
  , View
  , StyleSheet
  , TextInput
  , Button
} from 'react-native';

export default class Homescreen extends React.Component {

  render() {
    let stub = () => {};
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Enter your bus route number to display buses near you.
        </Text>
        <TextInput
          style={{height: 40, width: 100}}
          placeholder="Route Number"
          onChangeText={(text) => this.setState({text})}
        />
        <Button
          onPress={stub}
          title="Show"
          color="#841584"
          accessibilityLabel="Learn less about this green button"
        />
      </View>
    );

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,

  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    //lineHeight: 1.5,
    color: '#212529',
    height: 40
    //textAlign: 'left'
  }
});
