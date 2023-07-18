
exports.getDate = function(){
    const today = new Date();
        const options = {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    let date = today.toLocaleDateString("en-US",options);
    return date;
}

exports.getDay = ()=>{
    const today = new Date();
        let options = {
            weekday: "long",
        }
    const day = today.toLocaleDateString("en-US",options);
    return day;
}