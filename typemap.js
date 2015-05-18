var types = {'String':{JS:'String',angular:'text',sequelize:'Sequelize.STRING'},
            'Number':{JS:'Number',angular:'number',sequelize:'Sequelize.FLOAT'},
            'Date':{JS:'Date',angular:'date',sequelize:'Sequelize.DATE'},
            'Email':{JS:'String',angular:'email',sequelize:'Sequelize.STRING'}};
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
    };
    this.mapSequelize = function(type){
        if(!type)return "Sequelize.STRING";
        r = types[type];
        if(r)return r.sequelize;
        else return 'Sequelize.STRING';
    }

};
var typeMap = new TypeMap();

module.exports = typeMap;