import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  Animated,
  Easing,
  TouchableNativeFeedback,
  DrawerLayoutAndroid,
  AsyncStorage,
  Geolocation,
  Alert
} from 'react-native';
import { GoogleSignin } from 'react-native-google-signin';

import MapView, { Marker, AnimatedRegion, Animated as AM } from 'react-native-maps';
import mapStyles from './mapStyles';
const { width, height } = Dimensions.get('window');

import firebase from 'react-native-firebase';


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: height,
    width: width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  tabs: {
    alignSelf: 'flex-end',
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  tab: {
    height: 70,
    width: 70,
    borderRadius: 70/2,
    margin: 10,
  },
  tabImg: {
    height: 70,
    width: 70,
    borderRadius: 70/2,
  },
  sv: {
    height: 130,
  },
  info: {
    padding: 20,
    backgroundColor: '#fff',
    width: width,
    marginBottom: -100,
    //transform: [{'translateY': 100}],
  }
});


class TabGrp extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: false
    }
  }

  componentWillMount() {
    this.animatedValue = new Animated.Value(1);
    console.log(firebase.auth().currentUser);
  }

  async componentDidMount() {
    if (this.state.selected) {
      Animated.spring(this.animatedValue, {
        toValue: 1.1
      }).start();
   }
   const uid = await AsyncStorage.getItem('@MySuperStore:uid');
   console.log(uid);
  }

  render() {
    const animatedStyle = {transform: [{"scale": this.animatedValue}]};
    return (
      <TouchableNativeFeedback
        onPress={() => {
          this.setState({selected: true});
          this.props.onTouch();
        }}
      >
        <Animated.View style={[styles.tab, animatedStyle]}>
          <Image source={{uri: this.props.img}} style={styles.tabImg}/>
          <Text>{this.state.selected}</Text>
        </Animated.View>

      </TouchableNativeFeedback>
    ) 
  }
}

type Props = {};
export default class Dashboard extends Component<Props> {

  // this.markers = []

  constructor(props) {
    super(props);
    this.state = {
      region: new AnimatedRegion ({
        latitude: 28.4737195,
        longitude: 77.0832894,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }),
      info: false,
      friends: [],
      markers: [],
      selected: {
        name: '',
        speed: ''
      }
    };
    this.marker = [];
  }


  componentDidMount() {
    let options = {
      enableHighAccuracy: true, timeout: 1000, distanceFilter:5
    }

    function accidentDetected() {
      Alert.alert(
      'Accident Detected',
      ' ',
      [
        {text: 'SOS', onPress: () => console.log('Ask me later pressed')},
        {text: 'Ignore', onPress: () => console.log('Cancel Pressed')},
      ],
      { cancelable: false }
    )

    }

    function pos() {
      let prevSpeed = 0;
      navigator.geolocation.getCurrentPosition((position) => {

      let { speed } = position.coords;


      if (this.state.speed != 0 || speed != 0) {
          let decelaration = ((speed*18/5 - prevSpeed)/5);
          console.log(decelaration);
          if (decelaration < -15)  {
            accidentDetected();
          }
      }
      prevSpeed = speed;
    }, function(error) {
        console.log(error);
      }, {enableHighAccuracy: true, timeout: 500, distanceFilter:1} );
    }

    setInterval(pos.bind(this), 500);
  }

  async componentWillMount() {
	  const uid = await AsyncStorage.getItem("@MySuperStore:uid");
    this.animatedValue = new Animated.Value(-100);
    this.pos = navigator.geolocation.watchPosition(function(pos) {
      pos.coords.speed *= 3.6;
    	firebase.firestore().collection("users").doc(uid).set({ coords: pos }, {merge: true});
    	console.log(pos.coords);
    }, function(err) {
    	console.log(err);
    }, {
    	enableHighAccuracy: true,
    	timeout: 1000,
    	maximumAge: 0
    });

    const ref = firebase.firestore().collection("users");

    ref.doc(uid).get().then(doc => {
      if (doc.exists) {
        // console.log("added");
        console.log(Object.keys(doc.data().friends));
        let fuid = Object.keys(doc.data().friends);

        var fdata = [];

        fuid.map((id) => {
          ref.doc(id).onSnapshot(async (doc) => {
            if (doc.exists) {
              // fdata.push({ coords: doc.data().coords, name: doc.data().name, img: doc.data().picture });
              // let fd = { coords: doc.data().coords, name: doc.data().name, img: doc.data().picture };
              // console.log('adding');
              // this.setState({ friends: [...this.state.friends, fd] });

              var markers = this.state.markers;
              // console.log(markers);
              markers = markers.map((marker, i) => {
                if (marker.email == doc.data().email) {

                  marker.latlng = {
                    'latitude': doc.data().coords.coords.latitude,
                    'longitude': doc.data().coords.coords.longitude
                  },
                  marker.title = doc.data().name;
                  marker.description = `Current Speed ${Math.ceil(doc.data().coords.coords.speed)}`,
                  marker.email = doc.data().email;
                  marker.speed = doc.data().coords.coords.speed;
                  console.log(marker);
                 this.marker[i]._component.animateMarkerToCoordinate(
                    {
                      latitude: marker.latlng.latitude,
                      longitude: marker.latlng.longitude
                    },
                    500

                  )
                }
                return marker;
              });

              console.log(markers);

              this.setState({markers});
            }

          });
        });


        fuid.map((id) => {
          ref.doc(id).get().then(doc => {
            if (doc.exists) {
              let fd = { coords: doc.data().coords, name: doc.data().name, img: doc.data().picture };
              this.setState({ friends: [...this.state.friends, fd] });

               this.setState({
                markers: [...this.state.markers, { 
                  latlng: {
                    'latitude': doc.data().coords.coords.latitude,
                    'longitude': doc.data().coords.coords.longitude
                  },
                  coordinate: new AnimatedRegion({
                    latitude: doc.data().coords.coords.latitude,
                    longitude: doc.data().coords.coords.longitude
                  }),
                  'title': doc.data().name,
                  'description': `currently at ${Math.ceil(doc.data().coords.coords.speed)}`,
                  email: doc.data().email,
                  speed: doc.data().coords.coords.speed
                }]
              });
          }
          })
        })
      }
    });

  }

  componentWillUnmount() {
    navigator.Geolocation.clearWatch(this.pos); 
  }

  onTouch(i) {
    this.setState({ info: !this.state.info });
    this.setState({ selected: { name: i.name, speed: Math.ceil(i.coords.coords.speed)} });
    if (this.state.info) {
      Animated.spring(this.animatedValue, {
        toValue: 0
      }).start();
    } else {
      Animated.spring(this.animatedValue, {
        toValue: -80
      }).start();
    }
  }

  onRegionChange(region) {
    this.state.region.setValue(region);
  }

  async _logout() {
  	GoogleSignin.signOut()
	.then(async () => {
		firebase.auth().signOut();
  		await AsyncStorage.setItem('@MySuperStore:uid', '');
  		this.props.navigation.navigate('Login');
	})
  
  }

  render() {
    const data = this.state.friends;
    const animateStyle = {marginBottom: this.animatedValue};
    var navigationView = (
      <View style={{flex: 1, backgroundColor: '#fff', }}>
        <View style={{ backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', padding: 40}}>
          <Image source={{ uri: 'https://source.unsplash.com/random'}} style={{ width: 100, height: 100, borderRadius: 50 }}/>
        </View>
        <View style={{ padding: 20 }}>
          <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('Profile')}>
	          <Text style={{fontSize: 20, paddingTop: 10}}>Profile</Text>
	       </TouchableNativeFeedback>
          <Text style={{fontSize: 20, paddingTop: 10}}>Alerts</Text>
          <TouchableNativeFeedback onPress={() => this._logout()}>
          	<Text style={{fontSize: 20, paddingTop: 10}}>Logout</Text>
          </TouchableNativeFeedback>
        </View>
      </View>
    );
    return (
      <DrawerLayoutAndroid
        drawerWidth={230}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
         ref='DRAWER'
        renderNavigationView={() => navigationView}
      >
      <View style ={styles.container}>

      

        <StatusBar
         barStyle="light-content"
         backgroundColor="rgba(0,0,0,0.0)"
         translucent={true}
        />



        <AM
          style={styles.map}
          initialRegion={this.state.region}
          onRegionChange={() => this.onRegionChange} 
          customMapStyle={mapStyles}
          liteMode={false}
        >

    	       {this.state.markers.map((marker, i) => (
      			    <Marker.Animated
      			      coordinate={marker.coordinate}
                  ref={mark => {this.marker.push(mark) }}
      			      title={marker.title}
      			      description={marker.description}
                  key={i}
                  identifier={`Marker${i}`}
      			    />
  			     ))}

        </AM>

      <View style={{ backgroundColor: '#fff', height:50, width: 50, borderRadius: 25, position: 'absolute', top: 50, alignSelf: 'flex-start', marginLeft: 10 , justifyContent: 'center', alignItems: 'center'  }}>
        <TouchableNativeFeedback 
          onPress={() => this.refs['DRAWER'].openDrawer()}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hamburger_icon.svg/1200px-Hamburger_icon.svg.png'}} style={{ width:30, height: 30 }}/>
        </TouchableNativeFeedback>
      </View>

        <View style={styles.sv}>
        
          <ScrollView 
            contentContainerStyle={styles.tabs} 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            { data.map((i, k) => 
              <TabGrp key={k} onTouch={() => this.onTouch(i)} img={i.img} />
            ) }
          </ScrollView>
        </View>
        <Animated.View style={[styles.info, animateStyle, { flexDirection: 'row'} ]}>
          <View style={{flex: 2}}>
            <Text style={{ fontWeight: '500'}}>{this.state.selected.name}</Text>
          </View>
          <View elevation={15} style={{ backgroundColor: '#333', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{ color: '#fff'}}>{this.state.selected.speed}</Text>
          </View>
        </Animated.View>
      </View>
      </DrawerLayoutAndroid>
    );
  }
}

