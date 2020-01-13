/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  TouchableHighlight,
  BackHandler,
  Alert,
  Platform, KeyboardAvoidingView
} from 'react-native';
import { connect } from 'react-redux';
import UserActions from "../Redux/UserRedux";
import Slideshow from 'react-native-image-slider-show';
import moment from "moment";
import _ from 'lodash';
import ImagePicker from 'react-native-image-picker';
import Loader from "../common/Spinner";
import { NavigationEvents } from 'react-navigation';

const options = {
  title: 'Profile Picture',
  storageOptions: {
    skipBackup: true,
    path: 'download',
  },
};

const defaultProfileImage = require('../images/timelinePic2.png');
const editIconProfile = require('../images/editImage.png');
const mamaIconImage = require("../images/profile-tabIcon.png");
const pregnentIconImage = require("../images/pregnentIcon.png");
const boyIconImage = require('../images/sonIconSmall.png');
const girlIconImage = require('../images/girlIconSmall.png');

const today = new Date();
var todayDate = today.getFullYear() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getDate();

class MyProfile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      position: 1,
      interval: null,
      bio: ''
    }
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid))
    this.props.getUserData()
  }

  componentDidMount() {
    const { user } = this.props;
    const { data = {} } = user;
    const { images = [] } = data;
    this.setState({
      interval: setInterval(() => {
        this.setState({
          position: this.state.position === images.length ? 0 : this.state.position + 1
        });
      }, 3000)
    });
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid))
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
  }

  onBackButtonPressAndroid = () => {
    Alert.alert('MAMA',
      'Are you sure want to exit?',
      [{ text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }, {
        text: 'OK',
        onPress: () => BackHandler.exitApp()
      },], { cancelable: false }
    );
    return true
  };

  getDiff(dt) {
    try {
      var m1 = moment(dt, 'YYYY-M-D');
      var m2 = moment(todayDate, 'YYYY-M-D');
      var m3 = moment(dt, 'YYYY')
      var m4 = moment(todayDate, 'YYYY');
      var month1 = m1.format('M')
      var month2 = m2.format('M')

      var mDiff = moment.preciseDiff(month1, month2)
      var dDiff = m1.diff(m2, 'days');
      var yDiff = moment.preciseDiff(m3, m4)

      var diff = moment.preciseDiff(m1, m2)
      if (yDiff) {
        return yDiff.split('year')[0] + "Years";
      } else if (mDiff > '1 month') {
        return mDiff;
      } else if (dDiff <= 30) {
        return diff === "" ? "0 days" : diff;
      }
    } catch (error) {
      var m1 = moment(dt, 'YYYY-M-D');
      var m2 = moment(todayDate, 'YYYY-M-D');
      var m3 = moment(dt, 'YYYY')
      var m4 = moment(todayDate, 'YYYY');
      var month1 = m1.format('M')
      var month2 = m2.format('M')
      var mDiff = moment.preciseDiff(month1, month2)
      var dDiff = m1.diff(m2, 'days');
      var yDiff = moment.preciseDiff(m3, m4)
      var diff = moment.preciseDiff(m1, m2)
      if (yDiff) {
        return yDiff;
      } else if (mDiff > '1 month') {
        return mDiff;
      } else if (dDiff <= 30) {
        return diff === "" ? "0 days" : diff;
      }
    }
  }

  _onProfilePicClick = (id) => {
    // Open Image Library:
    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {

        var data = new FormData()
        data.append("image", {
          uri: Platform.OS === "android" ? "file://" + response.path : response.uri.replace("file://", ""),
          name: response.fileName,
          type: response.type
        });
        data.append("id", id);
        this.props.updateImage(data)
      }
    });
  };


  userExists(array, value) {
    return array.some(function (el) {
      return el.gender === value;
    });
  }
  parseValue(week) {
    if (week != "") {
      return parseInt(week).toFixed(2)
    } else {
      return null;
    }
  }

  _onCoverEditClick() {
    this.props.navigation.navigate('YouScreen', { myProfile: true, reDirect: false, route_Name: "TabBarScreen" })
  }

  _onProfileNameEditClick() {
    this.props.navigation.navigate('AllAboutYouScreen', { myProfile: true, reDirect: true, route_Name: "TabBarScreen" })
  }

  _onBioEditClick() {
    this.props.navigation.navigate('YouScreen', { myProfile: true, reDirect: false, route_Name: "TabBarScreen" })
  }

  _onInterestEditClick() {
    this.props.navigation.navigate('SelectInterestScreen', { myProfile: true, interest: filterInterest, reDirect: false, route_Name: "TabBarScreen" })
  }


  render() {
    const { user, fetching } = this.props;
    const { data = {}, image_path = "", is_pregnant = "", week = "" } = user;
    const { dp = { name: "" }, images = [], interests = [], children = [] } = data;
    let filterInterest = _.uniqBy(interests, 'id'); //remove duplicate array
    let showDp = dp == null ? false : true;
    let image_Array = [];
    if (images.length === 0) { //default profile pic
      let localObj = { url: defaultProfileImage }
      image_Array.push(localObj)
    } else {
      for (let i = 0; i < images.length; i++) {
        let obj = { url: image_path + images[i].name }
        image_Array.push(obj);
      }
    }
    return (
      <KeyboardAvoidingView style={style.container} behavior="padding" enabled>
        <NavigationEvents
          onWillFocus={payload => { this.props.getUserData() }}
        />
        <ScrollView>
          {fetching == false &&
            <View style={style.profile_container} >

              {/* cover Image */}
              <Slideshow
                dataSource={image_Array}
                arrowSize={0}
                scrollEnabled={false}
                position={this.state.position}
                onPositionChanged={position => this.setState({ position })} />
              <Text style={style.btn_edit} onPress={() => { this._onCoverEditClick() }}>Edit</Text>

              <View style={style.profileDetailContainer}>

                {/* profile and userName */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableHighlight underlayColor='#ffffff00' onPress={() => { this._onProfilePicClick(showDp ? dp.id : "") }}>
                    {showDp ?
                      <Image style={style.profile_image} source={{ uri: image_path + dp.name }} />
                      :
                      <Image style={style.profile_image} source={defaultProfileImage} />
                    }
                  </TouchableHighlight>
                  {showDp && <Image style={style.editImageIcon} source={editIconProfile} />}

                  <View style={{ marginLeft: 10 }}>
                    <Text style={style.mamaName}> {data.name} </Text>
                    <Text style={style.placeName}> {data.location} </Text>
                  </View>
                  <Text style={style.below_bt_edit} onPress={() => { this._onProfileNameEditClick() }}>Edit</Text>
                </View>

                <View style={style.line} />

                {/* children list */}
                <View style={style.sectionSpacing}>
                  <View style={style.verticalLine} />
                  <Text style={style.bio}>  Children </Text>
                  {/* <Text style={style.below_bt_edit}>Edit</Text> */}
                </View>

                <View style={style.childrenView}>

                  <View style={style.pregBG}>
                    <Image style={style.mamaOrPregnentImage} source={is_pregnant === "false" ? mamaIconImage : pregnentIconImage} />
                    <Text style={style.weekText}> {is_pregnant === "false" && week == "" ? 'Mama' : this.parseValue(week) + ' week'}</Text>
                  </View>

                  <View style={style.childrenList}>
                    <FlatList
                      columnWrapperStyle={{ justifyContent: 'space-between' }}
                      data={children}
                      keyExtractor={(item, index) => item.id}
                      horizontal={false}
                      numColumns={2}
                      renderItem={({ item, index }) =>
                        <View key={index} style={{ width: 80 }}>
                          {
                            item.gender === 'male' ?
                              <View style={style.boyBG}>
                                <Image style={style.mamaOrPregnentImage} source={boyIconImage} />
                                <Text style={[style.weekText]}>{this.getDiff(item.date_of_birth)}</Text>
                              </View>
                              :
                              <View style={style.girlBg}>
                                <Image style={style.mamaOrPregnentImage} source={girlIconImage} />
                                <Text style={[style.weekText]}>{this.getDiff(item.date_of_birth)}  </Text>
                              </View>
                          }
                        </View>
                      }
                    />
                  </View>

                </View>

                <View style={style.line} />

                {/* bio View */}
                <View style={style.sectionSpacing}>
                  <View style={style.verticalLine} />
                  <Text style={style.bio}>  Bio </Text>
                  <Text style={style.below_bt_edit} onPress={() => { this._onBioEditClick() }}>Edit</Text>
                </View>
                <Text style={style.bioText}>
                  {data.bio}
                </Text>

                <View style={style.line} />

                {/* Interest View */}
                <View style={style.sectionSpacing}>
                  <View style={style.verticalLine} />
                  <Text style={style.bio}>  My Interest </Text>
                  <Text style={style.below_bt_edit} onPress={() => { this._onInterestEditClick() }}>Edit</Text>
                </View>

                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  data={filterInterest}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  contentContainerStyle={style.ccsFlatlist}
                  renderItem={({ item }) =>
                    <View style={style.interestBg}>
                      <Text> {item.name}</Text>
                    </View>
                  }
                />
              </View>
            </View>}
          {fetching && <Loader />}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
};


const style = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f8f1ea',
  },
  sectionSpacing: {
    flexDirection: 'row',
    marginTop: 10
  },
  editImageIcon: {
    height: 20,
    width: 20,
    position: 'absolute',
    left: 41,
    bottom: 5
  },
  userName: {
    color: '#f8f1ea',
    fontFamily: 'Poppins',
    fontSize: 17,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  placeName: {
    color: '#3c3c5a',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '300',
  },
  btn_edit: {
    borderRadius: 3,
    backgroundColor: '#f0696e',
    position: 'absolute',
    bottom: 10,
    right: 12,
    color: 'white',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 7,
    paddingRight: 7,
  },
  profile_container: {
    shadowColor: 'rgba(203, 180, 157, 0.1)',
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 10,
    borderRadius: 10,
    backgroundColor: '#f8f1ea',
  },
  profileDetailContainer: {
    margin: 15,
    flexDirection: 'column'
  },
  profile_image: {
    width: 58,
    height: 58,
    borderColor: '#f0696e',
    borderWidth: 1,
    borderRadius: 58 / 2,
  },
  mamaName: {
    color: '#3c3c5a',
    fontFamily: 'Poppins',
    fontSize: 17,
    fontWeight: 'bold',
  },
  below_bt_edit: {
    borderRadius: 3,
    backgroundColor: '#f0696e',
    position: 'absolute',
    right: 0,
    color: 'white',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 7,
    paddingRight: 7,
  },
  line: {
    width: '80%',
    borderColor: '#3c3c5a',
    borderStyle: 'solid',
    borderWidth: 0.5,
    opacity: 0.2,
    marginTop: 10,
    marginLeft: '10%',
    marginRight: '10%',
  },
  mamaOrPregnentImage: {
    marginLeft: 2,
    marginRight: 5,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    resizeMode: 'contain'
  },
  pregBG: {
    borderRadius: 3,
    backgroundColor: '#f0696e',
    flexDirection: 'row',
    padding: 2,
    marginTop: 10,
    alignSelf: 'flex-start',
    width: 80,
    height: 25,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  girlBg: {
    borderRadius: 3,
    backgroundColor: '#f16f9b',
    flexDirection: 'row',
    padding: 2,
    marginTop: 10,
    width: 80,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  boyBG: {
    borderRadius: 3,
    backgroundColor: '#58a8dd',
    flexDirection: 'row',
    padding: 2,
    marginTop: 10,
    width: 80,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  weekText: {
    color: '#f5ebe1',
    fontFamily: 'Poppins',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  childrenList: {
    width: 180,
    alignSelf: 'flex-end'
  },
  verticalLine: {
    borderColor: '#f0696e',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 18,
  },
  bio: {
    color: '#3c3c5a',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: 'bold',
  },
  childrenView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  bioText: {
    color: '#3c3c5a',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 15
  },
  interestBg: {
    borderRadius: 3,
    borderColor: 'rgba(60, 60, 90, 0.32)',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#f5ebe1',
    paddingRight: 5,
    paddingLeft: 5,
    paddingTop: 3,
    paddingBottom: 3,
    margin: 5
  },
  ccsFlatlist: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap'
  }
})


const mapStateToProps = (state) => {
  return {
    state: state,
    error: state.user.error,
    fetching: state.user.fetching,
    exists: state.user.exists,
    user: state.user.user_Data,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateImage: (data) => dispatch(UserActions.updateImage(data)),
    addUserInfo: (data) => dispatch(UserActions.addUserBio(data)),
    getUserData: () => dispatch(UserActions.getUserData()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyProfile)
