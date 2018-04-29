/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Image,
  StatusBar
} from 'react-native';

import { GoogleSigninButton, GoogleSignin } from 'react-native-google-signin';
import firebase from 'react-native-firebase';

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


firebase.initializeApp(
  androidConfig
);


const FCM = firebase.messaging();
const ref = firebase.firestore().collection("users");
const ref1 = firebase.firestore().collection("userinfo");


type Props = {};
export default class Login extends Component<Props> {

  async componentDidMount() {
    this._setupGoogleSignin();
    // GoogleSignin.signOut()
    // .then(() => {
    //   console.log('out');
    // })
    // .catch((err) => {

    // });
    // //console.log(firebase);
  }

  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        webClientId: '170757033325-bqgbk63mcrbemqd7vq1hchi0khsqa1ns.apps.googleusercontent.com',
        offlineAccess: false
      });
    }
    catch(err) {
      console.log("Play services error", err.code, err.message);
    }
    let user = GoogleSignin.currentUser();
    console.log(Object.keys(user));
    if (Object.keys(user).length !== 0) {
      this.props.navigation.navigate('Dashboard');
    }
    let uid = await AsyncStorage.getItem('@MySuperStore:uid');
    console.log(uid);
    if (uid !== null ) {
      this.props.navigation.navigate('Dashboard');
    }
    console.log(user);
  }

  async _signIn() {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.log(error);
    }
    try {
      const data = await GoogleSignin.signIn();
      const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
      const currentUser = await firebase.auth().signInAndRetrieveDataWithCredential(credential);

      ref1.doc(currentUser.user.email)
      .set({ 
        uid: currentUser.user.uid, 
        name: currentUser.user.displayName 
      });

      firebase.messaging().requestPermission();
      firebase.messaging().getToken().then(token => {
        ref.doc(currentUser.user.uid).set({ 
          pushToken: token, 
          name: currentUser.user.displayName,  
          email: currentUser.user.email,
          picture: currentUser.user.photoURL}, {merge: true});
      });
      try {
        await AsyncStorage.setItem('@MySuperStore:uid', currentUser.user.uid);
      } catch (error) {
        console.log(error);
      }

      this.props.navigation.navigate('Dashboard');

    } catch (error) {
      console.log(error);
    }

    // create credential


    // login with credential

    // console.info(JSON.stringify(currentUser.user.toJSON()));

    


        
  }


  render() {
    return (
      <View source={require('./bg.jpg')} style={styles.container}>
        <StatusBar
          translucent={true} 
          backgroundColor={"rgba(0,0,0,0)"}
          barStyle="dark-content" 
          />
        <Image source={require('./bg.jpg')} style={{ width: "100%", flex: 2 }}/>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.welcome}>
            Welcome to Steer Well
          </Text>
          <Text style={styles.instructions}>
            Steerwell sends alerts on over speeding and detect accidents.
          </Text>
          <GoogleSigninButton
            style={{ height: 48, width: 200}}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Light}
            onPress={() => this._signIn()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#111',
    fontWeight: '700',
  },
  instructions: {
    color: '#111',
    marginBottom: 15,
    fontWeight: '200',
    fontSize: 12,
    paddingLeft: 40,
    paddingRight: 40,
    textAlign: 'center'
  },
});
