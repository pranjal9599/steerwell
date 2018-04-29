import React from 'react';
import { StackNavigator } from 'react-navigation';
import firebase from 'react-native-firebase';

import { 
  AsyncStorage,
  View
} from 'react-native';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';


const androidConfig = {
  clientId: '170757033325-k086llvvfv5asqjqqal7j3gb777b75qs.apps.googleusercontent.com',
  appId: '1:170757033325:android:d75f0329780f7586',
  apiKey: 'AIzaSyDegXsmYGouFkLkgRmkv412z3l2pw5Lif8',
  databaseURL: 'https://hackathon-535b6.firebaseio.com/',
  storageBucket: 'hackathon-535b6.appspot.com',
  messagingSenderId: '170757033325',
  projectId: 'hackathon-535b6',

  // enable persistence by adding the below flag
  persistence: true,
};

// class App extends React.Component {
//   async componentDidMount() {

//     firebase.initializeApp(
//       androidConfig
//     );

//     this.state = {

//       initialRoute: ''
//     }

//     console.log(uid);
//     if (uid !== '' && typeof(uid) != 'undefined') {
//       this.state = {
//         initialRoute: 'Dashboard'
//       }
//     } else {
//       this.state = {
//         initialRoute: 'Login'
//       }
//     }
//   }
//   render() {
//     return (
//       <sn initialRouteName={'Login'} />
//     )
//   }
// }

const init = async () => {
    try {
      return await AsyncStorage.getItem('@MySuperStore:uid');
    } catch (error) {
      console.log(error);
    }
};

console.log(init());
//AsyncStorage.getItem('@MySuperStore:uid').then(uid => console.log(uid));

const Sn = StackNavigator({
  Login: {
    screen: Login
  },
  Dashboard: {
    screen: Dashboard
  },
  Profile: {
    screen: Profile
  }
},
{
  headerMode: 'none',
  initialRouteName: 'Login'
}
);

class App extends React.Component {
  render() {
    return (
        <Sn />
    )
  }
}


export default App;