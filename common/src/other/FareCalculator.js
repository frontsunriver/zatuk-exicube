export const FareCalculator = (distance,time,rateDetails,instructionData, decimal)=>{  

    let baseCalculated =  (parseFloat(rateDetails.rate_per_unit_distance) * parseFloat(distance)) + (parseFloat(rateDetails.rate_per_hour) * (parseFloat(time) / 3600));
    if(rateDetails.base_fare>0){
        baseCalculated = baseCalculated + rateDetails.base_fare;
    }
    if(instructionData && instructionData.parcelTypeSelected){
        baseCalculated = baseCalculated + instructionData.parcelTypeSelected.amount;
    }
    if(instructionData && instructionData.optionSelected){
        baseCalculated = baseCalculated + instructionData.optionSelected.amount;
    }
    let total = baseCalculated > parseFloat(rateDetails.min_fare) ? baseCalculated : parseFloat(rateDetails.min_fare);
    let convenienceFee = 0;
    if(rateDetails.convenience_fee_type && rateDetails.convenience_fee_type == 'flat'){
        convenienceFee = rateDetails.convenience_fees;
    }else{
        convenienceFee = (total*parseFloat(rateDetails.convenience_fees)/100);
    }
    let grand = total + convenienceFee;

    return {
        totalCost:parseFloat(total.toFixed(decimal)),
        grandTotal:parseFloat(grand.toFixed(decimal)),
        convenience_fees:parseFloat(convenienceFee.toFixed(decimal))
    }
     
}
