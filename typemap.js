var types = {'String':{JS:'String',angular:'text'},'Number':{JS:'Number',angular:'number'},'Date':{JS:'Date',angular:'datetime'},'Email':{JS:'String',angular:'email'}};
TypeMap = function(){
    this.mapJS = function(type){
        if(!type)return('String');
        r = types[type];
        if(r)return r.JS;
        else return "String";
    };
    this.mapAngular = function(type){
        if(!type)return('text');
        r = types[type];
        if(r)return r.angular;
        else return "text";
    }

};
var typeMap = new TypeMap();

module.exports = typeMap;