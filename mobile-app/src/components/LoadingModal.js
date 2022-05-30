import React from 'react';
import { 
    Text,
    View,
    Modal,
    Image
  } from 'react-native';
import { colors } from '../common/theme';
import i18n from 'i18n-js';

export function LoadingModal(props){
    const { loadingModal } = props;
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={loadingModal}
    >
        <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '85%', backgroundColor: colors.BACKGROUND_PRIMARY, borderRadius: 10, flex: 1, maxHeight: 70 }}>
                <View style={{ alignItems: 'center', flexDirection:isRTL? 'row-reverse':'row', flex: 1, justifyContent: "center" }}>
                        <Image
                            style={{ width: 80, height: 80, backgroundColor: colors.TRANSPARENT }}
                            source={require('../../assets/images/loader.gif')}
                        />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.BLACK, fontSize: 16, textAlign:isRTL? 'right':'left' }}>{t('driver_finding_alert')}</Text>
                    </View>
                </View>
            </View>
        </View>
    </Modal>
    );
}
