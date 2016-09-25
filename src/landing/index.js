/**
 * Created by ggoma on 9/24/16.
 */
import React, {Component} from 'react';
import {
    Alert,
    AsyncStorage,
    View,
    Text,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native';

import colors from '../common/colors';
import NavigationBar from 'react-native-navbar';
import Icon from 'react-native-vector-icons/Ionicons';
import Swiper from 'react-native-swiper';
import ArrowButton from '../common/arrow-button';
import ActionButton from 'react-native-action-button';
import DateButton from '../common/date-button';
import moment from 'moment';
import imageMap from '../common/img-map';
import { Button, ButtonGroup, List, ListItem } from 'react-native-elements'
import SimplePicker from 'react-native-simple-picker';
import ModalBox from 'react-native-modalbox';
import TextField from 'react-native-md-textinput';

import '../../UserAgent';
import io from 'socket.io-client/socket.io';

import { LineChart } from 'react-native-ios-charts';

var {width, height} = Dimensions.get('window');

const options = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const feeling = ['happy', 'angry', 'love', 'question', 'sad', 'vomit'];
const feelingString = ['Happy', 'Angry', 'Love', 'Confused', 'Sad', 'Disgust'];


export default class Landing extends Component {
    constructor(props) {
        super(props);


        var curr = new Date;
        var first = curr.getDate() - curr.getDay();
        var last = first + 6;


        var firstday = new Date(curr.setDate(first));
        var lastday = new Date(curr.setDate(last));
        var today = moment().format('D');
        var month = moment().format('M');

        console.log(today);

        var temp = [];

        for(i = first; i <= last; i++) {
            temp.push(i%moment().daysInMonth() + '');
        }


        this.state = {
            loading: true,
            dates: [],
            index: month - 1,
            selected: today,


            signalModal: false,
            signalDescription: 'Today was amazing!',
            incomeData: null,
            incomingSignal: 0,
            thanksmessage: '',



            recordModal: false,
            recordButtonIndex: 0,
            recordDescription: "I don't know! I am just really happy today :)",
            recordEEG1: [],
            recordEEG2: [],
            recordEEG3: [],
            recordEEG4: [],
            recording: false,
            firstDay: moment(firstday).format('D'),
            lastDay: moment(lastday).format('D'),
            today: moment(curr).format('D'),
            month: moment(curr).format('M'),
            dates: temp,
            itemInfoModal: false,
        };

        this.socket = io('45.55.172.186:8081', {jsonp: false});
        this.socket.on('connection', (data) => {
            console.log(data);
        });

    }

    async loadData() {
        console.log('loading');
        try {
            AsyncStorage.getAllKeys((err, keys) => {
                AsyncStorage.multiGet(keys, (err, stores) => {
                    var list = {};
                    stores.map((result, i, store) => {
                        // get at each store's key/value so you can work with it
                        var key = store[i][0];
                        var value = store[i][1];

                        // console.log(key + JSON.stringify(JSON.parse(value)));
                        list[key] = JSON.parse(value);
                    });
                    console.log(list);
                    this.setState({list: list}, () => {
                        this.setState({loading: false})
                    })
                });
            });

        } catch (e) {
            // Error retrieving data
            console.log(e);
        }
    }

    async saveData(key, data) {

        try {
            await AsyncStorage.setItem(key, JSON.stringify(data),
                cb => console.log(cb)
            )
        } catch (error) {
            // Error saving data
        }
    }

    concatData(key, data) {
        try {
            AsyncStorage.getItem(key)
                .then((d) => {
                    var arr = JSON.parse(d);
                    if(!arr) {
                        arr = [];
                    }
                    arr.push(data);
                    AsyncStorage.setItem(key, JSON.stringify(arr))
                        .then((success) => {
                            console.log('yay!');
                            this.loadData();
                        }, (error) => {
                            console.log('error :(');
                        });
                });

        } catch (e) {

        }
    }



    componentDidMount() {

        this.socket.on('message', (data) => {
            console.log(data);
            if(!this.state.signalModal && !this.state.itemInfoModal && !this.state.recordModal) {
                this.setState({signalModal: true, incomeData: data, signalDescription: data.message});
            }
        });

        this.socket.on('signal', (data) => {
            console.log(data);
            this.setState({incomingSignal: data});
        });


        // AsyncStorage.clear();
        // this.saveData('25', JSON.stringify([{"name":"Happy","avatar_url":"happy","subtitle":"I was feeling very good!","time":"9:30 AM"},{"name":"Angry","avatar_url":"angry","subtitle":"I could not control my anger","time":"11:22 AM"},{"name":"Love","avatar_url":"love","subtitle":"I felt loved!","time":"12:22 PM"}]))
        this.saveData('key', '1');
        this.loadData();
        // Speech.speak({
        //     text: 'Alexa, play any music',
        //     voice: 'en-US',
        //     rate: .3
        // })
        //     .then(started => {
        //         console.log('Speech started');
        //     })
        //     .catch(error => {
        //         console.log('You\'ve already started a speech instance.');
        //     });
    }


    render() {

        if(this.state.loading) {
            return (
                <View style={{flex:1 ,justifyContent: 'center', alignItems: 'center'}}>
                    <Text>Loading...</Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                {this.navBar()}
                {this.renderHeader()}
                {this.monthCarousel()}
                {this.renderBody()}
                {this.actionButton()}
                {this.modalPicker()}
                {this.modalBox()}
                {this.recordModal()}
                {this.itemModal()}
            </View>
        )
    }

    modalBox() {

        if(!this.state.incomeData) {
            return
        }

        var temp = [];
        this.state.incomeData.signal.map((signal) => {
            temp.push(signal);
        });

        var config = {
            dataSets: [{
                values: temp,
                drawValues: false,
                colors: [colors.main],
                label: 'EEG 1',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }],
            labels: this.state.recordEEG1.map(v => v.toString()),
            minOffset: 20,
            scaleYEnabled: false,
            showLegend: false,
            legend: {
                textSize: 12
            },
            xAxis: {
                axisLineWidth: 0,
                drawLabels: false,
                position: 'bottom',
                drawGridLines: false
            },
            leftAxis: {
                customAxisMax: 1,
                customAxisMin: -1,
                labelCount: 11,
                startAtZero: false,
                spaceTop: 0.1,
                spaceBottom: 0.1
            },
            rightAxis: {
                enabled: false,
                drawGridLines: false
            },
            valueFormatter: {
                minimumSignificantDigits: 1,
                type: 'regular',
                maximumDecimalPlaces: 1
            }
        };


        return (
            <ModalBox
                isOpen={this.state.signalModal}
                backdrop={false}
                onClosed={() => {this.setState({recordEEG1: [], signalModal: false})}}
            >
                <View style={{flex: 1, paddingTop: 40}}>
                    <View style={{flex: 1}}>
                        <ScrollView>
                            <View style={{alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.gray1}}>
                                <Image style={{height: 50, width: 50}} source={imageMap[this.state.incomeData.emotion]} />
                                <View style={{padding: 16, alignItems: 'center'}}>
                                    <Text style={{fontSize: 24, alignSelf: 'center', color:colors.gray1}}>We think you were feeling <Text style={{color: colors.main}}>{this.state.incomeData.emotion.toUpperCase()}</Text> on</Text>
                                    <Text style={{fontSize: 16, alignSelf: 'center', marginBottom: 10, color:colors.gray1}}>{moment(this.state.incomeData.timestamp).format('MMMM Do h:mm A')}</Text>
                                    <View style={{alignItems: 'center'}}>
                                    <Icon.Button onPress={() => this.setState({thanksmessage: 'Thanks for letting us know!' })}
                                                 backgroundColor={colors.main} name='md-sad'>Were we wrong?</Icon.Button>
                                        <Text style={{color:colors.gray1}}>{this.state.thanksmessage}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{padding: 16, paddingTop: 40}}>
                                <TextField
                                    label={'What happened?'}
                                    highlightColor={colors.main}
                                    keyboardType={'default'}
                                    value={this.state.signalDescription}
                                    clearTextOnFocus={this.state.signalDescription == ''}
                                    onChangeText={(signalDescription) => {this.setState({signalDescription})}}
                                    multiline={true}
                                    autoGrow={true}
                                />
                            </View>


                        </ScrollView>

                        <LineChart config={config} style={{height: 240,
                            justifyContent: 'center',
                            alignItems: 'stretch',
                            backgroundColor: 'transparent'}}/>

                        <View style={{padding: 16}}>
                            <Button
                                small
                                iconRight
                                icon={{name: 'check'}}
                                onPress={() => this.signalDonePressed()}
                                backgroundColor={colors.main}
                                title='DONE' />
                            </View>

                    </View>
                </View>

            </ModalBox>
        )

    }

    signalDonePressed() {


        var dataObj = {
            timestamp: moment(this.state.incomeData.timestamp).format("dddd, MMMM Do YYYY"),
            avatar_url: this.state.incomeData.emotion,
            name: this.state.incomeData.emotion,
            subtitle: this.state.signalDescription,
            time: moment(this.state.incomeData.timestamp).format('h:mm A'),
            eeg1: this.state.incomeData.signal,
            eeg2: [],
            eeg3: [],
            eeg4: [],
        };

        this.concatData(this.state.selected, dataObj);


        this.setState({
            signalModal: false,
            eeg1: [],
            eeg2: [],
            eeg3: [],
            eeg4: [],
            signalDescription: 'Today was amazing!',
        });
    }


    actionButton() {
        return (
            <ActionButton buttonColor="rgba(231,76,60,1)">
                <ActionButton.Item buttonColor='#3498db' title="Record New Data" onPress={() => this.setState({recordModal: true})}>
                    <Icon name="md-create" style={styles.actionButtonIcon} />
                </ActionButton.Item>
                <ActionButton.Item buttonColor='#1abc9c' title="All Tasks" onPress={() => {}}>
                    <Icon name="md-done-all" style={styles.actionButtonIcon} />
                </ActionButton.Item>
                <ActionButton.Item buttonColor={colors.main} title="Delete All" onPress={() => {
                    Alert.alert(
                        'Are you sure?',
                        'Your data will be deleted',
                        [
                            {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                            {text: 'OK', onPress: () => AsyncStorage.clear().then(() => {this.loadData()})},
                        ]
                    )

                }}>
                    <Icon name="md-trash" style={styles.actionButtonIcon} />
                </ActionButton.Item>
            </ActionButton>

        )
    }



    recordModal() {


        const { recordButtonIndex } = this.state;
        const buttons = [
            <Image source={imageMap['happy']}/>,
            <Image source={imageMap['angry']}/>,
            <Image source={imageMap['love']}/>,
            <Image source={imageMap['question']}/>,
            <Image source={imageMap['sad']}/>,
            <Image source={imageMap['vomit']}/>
        ];
        return (
            <ModalBox
                isOpen={this.state.recordModal}
                backdrop={false}
                onClosed={() => {
                    if(this.interval) {
                        clearInterval(this.interval);
                    }
                    this.setState({recordModal: false, recording: false})
                }}
            >
                <View style={{flex: 1, paddingTop: 40}}>
                    <View style={{flex: 1}}>
                        <ScrollView>
                            <Text style={{alignSelf: 'center', color: colors.gray1, fontSize: 24}}>How are you feeling?</Text>
                            <ButtonGroup
                                onPress={(index) => this.updateRecordIndex(index)}
                                selectedIndex={recordButtonIndex}
                                buttons={buttons} />
                            <View style={{padding: 16}}>
                                <TextField
                                    label={'What happened?'}
                                    highlightColor={colors.main}
                                    keyboardType={'default'}
                                    value={this.state.recordDescription}
                                    clearTextOnFocus={this.state.recordDescription ==  "I don't know! I am just really happy today :)"}
                                    onChangeText={(recordDescription) => {this.setState({recordDescription})}}
                                    multiline={true}
                                    autoGrow={true}
                                />
                            </View>
                            <Button
                                small
                                iconRight
                                backgroundColor={this.state.recording? colors.pink: colors.blue}
                                icon={{name: 'touch-app'}}
                                onPress={() => {this.addRecordChartData()}}
                                title={this.state.recording ? 'STOP' : 'Record'} />


                        </ScrollView>

                        {this.recordGraph()}


                        <View style={{padding: 16}}>
                            <Button
                                small
                                iconRight
                                icon={{name: 'check'}}
                                onPress={() => this.donePressed()}
                                backgroundColor={colors.main}
                                title='DONE' />
                        </View>

                    </View>
                </View>

            </ModalBox>
        )
    }



    addRecordChartData() {
        if(this.state.recording) {
            this.setState({recording: false});
            clearInterval(this.interval);
            return
        }

        this.setState({recordEEG1: [], recordEEG2: [], recordEEG3: [], recordEEG4: [], recording: true});
        this.count = 0;
        this.interval = setInterval(() => {
            console.log(this.count);

            if(this.count >= 100) {
                this.count = 0;
                this.setState({recording: false});
                clearInterval(this.interval);
            }

            this.count = this.count + 1;

            if(this.state.incomingSignal) {
                this.setState({
                    recordEEG1: this.state.recordEEG1.concat(this.state.incomingSignal.signal)
                });
            }


        }, 100);


    }

    donePressed() {
        var dataObj = {
            timestamp: moment().format("dddd, MMMM Do YYYY"),
            avatar_url: feeling[this.state.recordButtonIndex],
            name: feelingString[this.state.recordButtonIndex],
            subtitle: this.state.recordDescription,
            time: moment().format('h:mm A'),
            eeg1: this.state.recordEEG1,
            eeg2: this.state.recordEEG2,
            eeg3: this.state.recordEEG3,
            eeg4: this.state.recordEEG4,
        };


        this.concatData(this.state.selected, dataObj);


        this.setState({
            recordModal: false,
            recordEEG1: [],
            recordEEG2: [],
            recordEEG3: [],
            recordEEG4: [],
            recordButtonIndex: 0,
            recordDescription: "I don't know! I am just really happy today :)",
        });


    }

    recordGraph() {

        // console.log('------------', this.state.recordEEG1);
        var config = {
            dataSets: [{
                values: this.state.recordEEG1,
                drawValues: false,
                colors: [colors.main],
                label: 'EEG 1',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: this.state.recordEEG2,
                drawValues: false,
                colors: ['rgb(255, 247, 141)'],
                label: 'EEG 2',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: this.state.recordEEG3,
                drawValues: false,
                colors: ['rgb(255, 200, 141)'],
                label: 'EEG 3',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: this.state.recordEEG4,
                drawValues: false,
                colors: ['rgb(153, 247, 141)'],
                label: 'EEG 4',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }],
            labels: this.state.recordEEG1 && this.state.recordEEG1.length != 0 ? this.state.recordEEG1.map(v => v.toString()) : [''],
            minOffset: 20,
            scaleYEnabled: false,
            showLegend: false,
            legend: {
                textSize: 12
            },
            xAxis: {
                axisLineWidth: 0,
                drawLabels: false,
                position: 'bottom',
                drawGridLines: false
            },
            leftAxis: {
                customAxisMax: 1,
                customAxisMin: -1,
                labelCount: 11,
                startAtZero: false,
                spaceTop: 0.1,
                spaceBottom: 0.1
            },
            rightAxis: {
                enabled: false,
                drawGridLines: false
            },
            valueFormatter: {
                minimumSignificantDigits: 1,
                type: 'regular',
                maximumDecimalPlaces: 1
            }
        };
        return (
            <LineChart config={config} style={{flex: 1,
                justifyContent: 'center',
                alignItems: 'stretch',
                backgroundColor: 'transparent'}}/>
        )
    }

    updateRecordIndex (index) {
        this.setState({recordButtonIndex: index});
    }


    modalPicker() {

        return (
            <SimplePicker
                ref={'picker'}
                options={options}
                labels={months}
                onSubmit={(month) => {
                    this.monthSelected(month - 1);
                }}
            />
        )

    }

    navBar() {
        return (
            <NavigationBar
                style={styles.navbar}
                leftButton={<Icon style={styles.actionButton} name='md-menu'/>}
                rightButton={<Icon style={styles.actionButton} name='md-search'/>}

            />
        )
    }


    renderHeader() {
        return (
            <View style={styles.header}>
                <Text style={styles.greeting}>Good Morning!</Text>
                <Image style={styles.avatar} source={require('../img/landing/avatar.png')}/>

            </View>
        )
    }

    renderBody() {
        return (
            <View style={styles.body}>

                <View style={{padding: 16, flexDirection: 'row', justifyContent: 'space-around'}}>
                    {this.renderDays()}
                </View>

                <View style={{paddingRight: 16, paddingLeft: 16, flexDirection: 'row', justifyContent: 'space-around'}}>
                    {this.renderDate()}
                </View>

                {this.renderList()}

            </View>
        )
    }

    renderDays() {
        return days.map((day, i) => {
            return (
                <View style={{flex: 1, alignItems: 'center'}} key={i}>
                    <Text style={{color: '#9e9e9e', fontWeight: '600'}}>{day.toUpperCase()}</Text>
                </View>
            )
        })
    }

    renderDate() {

        var selectedStyle = {};
        return this.state.dates.map((date, i) => {
            if(date == this.state.selected) {
                selectedStyle = {backgroundColor: '#eee'};
            } else {
                selectedStyle = {};
            }
            return <TouchableOpacity onPress={() => this.changeSelected(date)} style={[{flex: 1, padding: 16, borderRadius: 50, justifyContent: 'center', alignItems: 'center'}, selectedStyle]} key={i}>
                <View><DateButton fontSize={12}  selected={date == this.state.selected} empty={!this.state.list[date]} text={date}/></View>
            </TouchableOpacity>
        })
    }

    renderList() {

        if(!this.state.list[this.state.selected]) {
            return <ScrollView >
                <View style={{paddingTop: 50, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: '#bdbdbd'}}>No records yet!</Text>
                    <Text style={{color: '#bdbdbd'}}>Add your mood by clicking on the '+' button</Text>
                </View>
            </ScrollView>
        }

        return (
            <ScrollView>
                <List containerStyle={{marginBottom: 20}}>
                    {
                        this.state.list[this.state.selected].map((l, i) => (
                            <ListItem
                                roundAvatar
                                avatar={imageMap[l.avatar_url]}
                                key={i}
                                title={l.time}
                                subtitle={l.subtitle}
                                onPress={() => this.itemPressed(i)}
                            />
                        ))
                    }
                </List>
            </ScrollView>
        )
    }

    itemPressed(index) {
        console.log(index);
        this.setState({itemIndex: index}, () => {
            this.setState({itemInfoModal: true})
        });
    }

    itemModal() {

        // console.log(this.state.list[this.state.selected][this.state.itemIndex]);
        if(!this.state.list[this.state.selected]) {
            return
        } else if(!this.state.list[this.state.selected][this.state.itemIndex]) {
            return
        }

        var itemData = this.state.list[this.state.selected][this.state.itemIndex];

        var eeg1 = [];
        var eeg2 = [];
        var eeg3 = [];
        var eeg4 = [];

        itemData.eeg1.map((item) => {
            eeg1.push(item);
        });

        itemData.eeg2.map((item) => {
            eeg2.push(item);
        });

        itemData.eeg3.map((item) => {
            eeg3.push(item);
        });

        itemData.eeg4.map((item) => {
            eeg4.push(item);
        });


        var config = {
            dataSets: [{
                values: eeg1,
                drawValues: false,
                colors: [colors.main],
                label: 'EEG 1',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: eeg2,
                drawValues: false,
                colors: ['rgb(255, 247, 141)'],
                label: 'EEG 2',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: eeg3,
                drawValues: false,
                colors: ['rgb(255, 200, 141)'],
                label: 'EEG 3',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }, {
                values: eeg4,
                drawValues: false,
                colors: ['rgb(153, 247, 141)'],
                label: 'EEG 4',
                drawCubic: true,
                drawCircles: false,
                lineWidth: 2
            }],
            labels: eeg1.map(v => v.toString()),
            minOffset: 20,
            scaleYEnabled: false,
            showLegend: false,
            legend: {
                textSize: 12
            },
            xAxis: {
                axisLineWidth: 0,
                drawLabels: false,
                position: 'bottom',
                drawGridLines: false
            },
            leftAxis: {
                customAxisMax: 1,
                customAxisMin: -1,
                labelCount: 11,
                startAtZero: false,
                spaceTop: 0.1,
                spaceBottom: 0.1
            },
            rightAxis: {
                enabled: false,
                drawGridLines: false
            },
            valueFormatter: {
                minimumSignificantDigits: 1,
                type: 'regular',
                maximumDecimalPlaces: 1
            }
        };

        return (
            <ModalBox
                isOpen={this.state.itemInfoModal}
                backdrop={false}
                onClosed={(closed) => {this.setState({itemInfoModal: false})}}
            >
                <View style={{flex: 1, paddingTop: 40}}>
                    <View style={{flex: 1}}>
                        <ScrollView>
                            <View style={{alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.gray1}}>
                                <Image style={{height: 50, width: 50}} source={imageMap[itemData.avatar_url]} />
                                <View style={{padding: 16}}>
                                    <Text style={{fontSize: 30, color:colors.gray1}}>You were feeling <Text style={{color: colors.main}}>{itemData.name.toUpperCase()}</Text> on</Text>
                                    <Text style={{fontSize: 20, color:colors.gray1}}>{itemData.timestamp}</Text>
                                    <Text style={{fontSize: 20, color:colors.gray1}}>{itemData.time}</Text>
                                </View>
                            </View>
                            <View style={{padding: 16, paddingTop: 40}}>
                                <Text style={{fontSize: 16, color: colors.main}}>Description:</Text>
                                <Text style={{fontSize: 12, color: 'black'}}>{itemData.subtitle}</Text>
                            </View>
                        </ScrollView>

                        <LineChart config={config} style={{flex: 1,
                            justifyContent: 'center',
                            alignItems: 'stretch',
                            backgroundColor: 'transparent'}}/>

                    </View>
                </View>

            </ModalBox>
        )

    }


    changeSelected(date) {
        console.log(date, 'selected!');
        this.setState({selected: date});
    }

    leftArrowPressed() {
        this.setState({index: this.state.index - 1});
        this.refs.swiper.scrollBy.call(this, -1);
    }

    rightArrowPressed() {
        this.setState({index: this.state.index + 1});
        this.refs.swiper.scrollBy.call(this, 1);
    }

    monthCarousel() {
        return (
            <View style={[styles.carouselContainer, {backgroundColor: colors.main}]}>
                <ArrowButton underlayColor={colors.main} size={50} backgroundColor={colors.main} name='ios-arrow-back' onPress={() => this.leftArrowPressed()}/>
                <TouchableHighlight
                    onPress={() => this.refs.picker.show()}
                    underlayColor={colors.main}
                    style={{flex: 1}}>
                    <View>
                        <Swiper index={this.state.index} ref='swiper' style={styles.wrapper} showsButtons={false}>
                            {this.renderSwiperItems()}
                        </Swiper>
                    </View>
                </TouchableHighlight>
                <ArrowButton underlayColor={colors.main} size={50} backgroundColor={colors.main} name='ios-arrow-forward' onPress={() => this.rightArrowPressed()}/>
            </View>
        )
    }

    monthSelected(month) {
        console.log('month selected - ' + month);
        var difference = month - this.state.index;
        this.setState({index: month}, () => {
            this.refs.swiper.scrollBy.call(this, difference);
        });



    }

    renderSwiperItems() {
        return months.map((month, index) => {
            return (
                <View key={index} style={{height: 50, width: width - 100, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.main,}}>
                    <Text style={{fontSize: 16, marginBottom: 6, fontWeight: '100', color: 'white'}}>{month.toUpperCase()}</Text>
                </View>
            )
        })
    }

}

var styles = StyleSheet.create({
    actionButton: {
        fontSize: 24,
        height: 26,
        color: 'white',
        margin: 12,
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    container: {
        flex: 1
    },
    navbar: {
        backgroundColor: colors.main
    },

    //header
    header: {
        flex: 3,
        backgroundColor: colors.main,
        alignItems: 'center'
    },
    greeting: {
        fontSize: 40,
        fontWeight: '200',
        marginTop: 16,
        marginBottom: 10,
        color: 'white'
    },
    avatar: {
        width: 100,
        height: 100,
        marginTop: 16,
        borderRadius: 50
    },


    //body
    body: {
        flex: 5
    },

    //swiper
    carouselContainer: {
        height: 50,
        flexDirection: 'row',
    },
    buttonWrapper: {
        backgroundColor: 'black',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    wrapper: {

    },
    slide1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9DD6EB',
    },
    slide2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#97CAE5',
    },
    slide3: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#92BBD9',
    },
    text: {
        color: '#fff',
        fontSize: 30,
        fontWeight: 'bold',
    },

    chart: {
        height: 300
    },


});