import React from 'react';
import {
	Text,
	Image,
	View,
	AsyncStorage,
	StatusBar,
	StyleSheet,
	TextInput,
	TouchableNativeFeedback,
	ToolbarAndroid,
	ToastAndroid,
	KeyboardAvoidingView
} from 'react-native';
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

const styles = StyleSheet.create({
	text: {
		fontSize: 14,
	},
	main: {
		alignContent: 'center',
		flexDirection: 'column',
		height: '100%',
		padding: 20
	},
	card: {
		marginTop: 20,
		marginBottom: 30,
		width: '100%',
		padding: 40,
		borderRadius: 5,
		backgroundColor: '#fff'
	},
	btn: {
		padding: 10,
		backgroundColor: "rgba(0,100,210,0.9)"
	},
	btnText: {
		textAlign: 'center',
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold'
	}
})

class Profile extends React.Component{

	constructor(props) {
		super(props);
		this.state = {
			uid: '',
			lol: '',
			toAdd: ''
		};
	}
	
	async componentWillMount() {
		let uid;
		try {
			uid = await AsyncStorage.getItem('@MySuperStore:uid');
			console.log(uid);
		} catch (error) {
			console.log(error);
		}
		this.setState({
			uid: uid,
			lol: "lol"
		});		
	}

	_onChange(text) {
		this.setState({toAdd: text});
		console.log(text);
	}

	_onChangeVehicle(text) {
		this.setState({vehicle: text});
		console.log(text);
	}

	_addVehicle() {
		let {vehicle} = this.state;

		firebase
			.firestore()
			.collection("users")
			.doc(this.state.uid)
			.set({ vehicleNo: vehicle}, {merge: true});
		ToastAndroid.show("Vehicle no added successfully!", ToastAndroid.LONG);
	}

	_add() {
		console.log(this.state.toAdd);
		let {toAdd} = this.state;
		let addedUser = {};

		firebase
			.firestore()
			.collection("userinfo")
			.doc(toAdd)
			.get()
			.then(doc => {
				if (doc.exists) {
					console.log(doc.data());
					addedUser = doc.data().uid;
					firebase
					.firestore()
					.collection("users")
					.doc(this.state.uid)
					.set({friends: {[addedUser]: true}}, {merge: true});
					ToastAndroid.show("User added successfully!", ToastAndroid.LONG);
				} else {
					ToastAndroid.show("User doesn't exist", ToastAndroid.SHORT);
				}
			})
			.catch(err => console.log(err));

		console.log(addedUser);


		this.setState({ toAdd: ''});
	}

	render() {
		return (
			<KeyboardAvoidingView behaviour="padding">
				<View
					style={{ height: 70, 
								backgroundColor: "rgba(0,20,150, 0.7)",
								marginTop: StatusBar.currentHeight,
								alignContent: 'center',
								alignItems: 'center',
								flexDirection: 'row',
								padding: 10 }}
				>
					<TouchableNativeFeedback onPress={() => this.props.navigation.goBack()}>
						<Image style={{ width: 20, height: 20, marginRight: 10}} source={require('./back.png')} />
					</TouchableNativeFeedback>
					<Text style={{ color: '#fff', fontSize: 25}}>Add People</Text>
				</View>
				<StatusBar
		         barStyle="light-content"
		        	backgroundColor="rgba(0,20,150, 0.7)" 
		         translucent={true}
	        />	
	        	<View style={[{ paddingTop: StatusBar.currentHeight, margin: 10}, styles.main ]}>
					<AddCard onChange={this._onChange.bind(this)} add={this._add.bind(this)}/>
					<AddVehicle onChange={this._onChangeVehicle.bind(this)} add={this._addVehicle.bind(this)}/>
				</View>
			</KeyboardAvoidingView>	
		)
	}

};

const AddCard = ({onChange, add}) => (
	<View elevation={2} style={styles.card}>
		<Text style={[{ marginBottom: 10}]} >Enter email to add</Text>
		<TextInput onChangeText={onChange} />
		<TouchableNativeFeedback onPress={add}>
			<View style={styles.btn}>
				<Text style={styles.btnText}>
					Add
				</Text>
			</View>
		</TouchableNativeFeedback>
	</View>
);

const AddVehicle = ({onChange, add}) => (
	<View elevation={2} style={styles.card}>
		<Text style={[{ marginBottom: 10}]} >Enter your vehicle number</Text>
		<TextInput onChangeText={onChange} />
		<TouchableNativeFeedback onPress={add}>
			<View style={styles.btn}>
				<Text style={styles.btnText}>
					Add
				</Text>
			</View>
		</TouchableNativeFeedback>
	</View>
);

export default Profile;
