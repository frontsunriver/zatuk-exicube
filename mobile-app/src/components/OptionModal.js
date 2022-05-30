import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal
} from 'react-native';
import { TouchableOpacity as OldTouch } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';


export function OptionModal(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0; 
    const { settings, tripdata, optionModalStatus, onPressCancel, handleGetEstimate, handleOptionSelection, handleParcelTypeSelection,instructionData } = props;

    return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={optionModalStatus}
    >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                {tripdata.carType && tripdata.carType.parcelTypes ?
                    <View style={{width:'100%'}}>
                        <Text style={{ color: colors.BLACK, fontWeight: 'bold', fontSize: 16,textAlign:isRTL? 'right':'left'}}>{t('parcel_type')}</Text>
                        <RadioForm
                            initial={0}
                            formHorizontal={false}
                            labelHorizontal={true}
                            buttonColor={colors.Radio_BUTTON}
                            labelColor={colors.BLACK}
                            style={{ marginTop: 10 }}
                            labelStyle={{ marginLeft: 0 }}
                            selectedButtonColor={colors.BLACK}
                            selectedLabelColor={colors.BLACK}
                        >
                            {
                                tripdata.carType.parcelTypes.map((obj, i) => (
                                    <RadioButton labelHorizontal={true} key={i} style={{flexDirection:isRTL?'row-reverse':'row'}}>
                                        <RadioButtonInput
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + obj.amount + ' - ' + obj.description: obj.amount + ' ' + settings.symbol + ' - ' + obj.description, value: i  }}
                                            index={i}
                                            isSelected={instructionData.parcelTypeIndex === i}
                                            onPress={handleParcelTypeSelection}
                                            
                                        />
                                        <RadioButtonLabel
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + obj.amount + ' - ' + obj.description: obj.amount + ' ' + settings.symbol + ' - ' + obj.description, value: i }}
                                            index={i}
                                            labelHorizontal={true}
                                            onPress={handleParcelTypeSelection}
                                        />
                                    </RadioButton>
                                ))
                            }
                        </RadioForm>
                    </View>
                    : null}
                {tripdata.carType && tripdata.carType.options ?
                    <View style={{ marginTop: 20,width:'100%'}}>
                        <Text style={{ color: colors.BLACK, fontWeight: 'bold', fontSize: 16,textAlign:isRTL? 'right':'left' }}>{t('options')}</Text>
                        <RadioForm
                            initial={0}
                            formHorizontal={false}
                            labelHorizontal={true}
                            buttonColor={colors.Radio_BUTTON}
                            labelColor={colors.BLACK}
                            style={{ marginTop: 10 }}
                            labelStyle={{ marginLeft: 0 }}
                            selectedButtonColor={colors.BLACK}
                            selectedLabelColor={colors.BLACK}
                        >
                            {
                                tripdata.carType.options.map((obj, i) => (
                                    <RadioButton labelHorizontal={true} key={i} style={{flexDirection:isRTL?'row-reverse':'row'}}>
                                        <RadioButtonInput
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + obj.amount + ' - ' + obj.description: obj.amount + ' ' + settings.symbol + ' - ' + obj.description, value: i }}
                                            index={i}
                                            isSelected={instructionData.optionIndex === i}
                                            onPress={handleOptionSelection}
                                        />
                                        <RadioButtonLabel
                                            obj={{ label: settings.swipe_symbol===false? settings.symbol + ' ' + obj.amount + ' - ' + obj.description: obj.amount + ' ' + settings.symbol + ' - ' + obj.description, value: i }}
                                            index={i}
                                            labelHorizontal={true}
                                            onPress={handleOptionSelection}
                                        />
                                    </RadioButton>
                                ))
                            }
                        </RadioForm>
                    </View>
                    : null}
                <View style={{ flexDirection:isRTL?'row-reverse':'row', marginTop: 20, alignSelf: 'center', height: 40, }}>
                    <OldTouch
                        loading={false}
                        onPress={onPressCancel}
                        style={[styles.modalButtonStyle, [isRTL?{marginLeft:5}:{ marginRight: 5}]]}
                    >
                        <Text style={styles.modalButtonTextStyle}>{t('cancel')}</Text>
                    </OldTouch>
                    <OldTouch
                        loading={false}
                        onPress={handleGetEstimate}
                        style={[styles.modalButtonStyle, [isRTL?{marginRight:5,backgroundColor: colors.START_TRIP }:{ marginLeft: 5,backgroundColor: colors.START_TRIP}]]}
                    >
                        <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                    </OldTouch>
                </View>
            </View>
        </View>
    </Modal>
    );

}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.BACKGROUND
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.BUTTON_RIGHT,
        width: 100,
        height: 40,
        elevation: 0,
        borderRadius: 10
    },
    modalButtonTextStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 18
    }
});
