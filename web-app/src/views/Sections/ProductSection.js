import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AlarmIcon from '@material-ui/icons/Alarm';
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import InfoArea from "components/InfoArea/InfoArea.js";
import styles from "assets/jss/material-kit-react/views/landingPageSections/productStyle.js";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function ProductSection() {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.section}>
      <GridContainer justify="center">
        <GridItem xs={12} sm={12} md={8}>
          <h2 className={classes.title}>{t('product_section_heading')}</h2>
          <h5 className={classes.description}>
            {t('product_section_para')}
          </h5>
        </GridItem>
      </GridContainer>
      <div>
        <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title={t('pruduct_section_heading_1')}
              description={t('product_section_1')}
              icon={EmojiTransportationIcon}
              iconColor="danger"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title={t('pruduct_section_heading_2')}
              description={t('product_section_2')}
              icon={AlarmIcon}
              iconColor="info"
              vertical
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={4}>
            <InfoArea
              title={t('pruduct_section_heading_3')}
              description={t('product_section_3')}
              icon={VerifiedUser}
              iconColor="success"
              vertical
            />
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}
