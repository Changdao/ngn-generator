#!/usr/bin/env node
var program = require('commander');
var fs = require('fs');
var  Q = require('q');
var path = require('path');
var typeMap = require('./typemap');


var modelFile;
var destPath;
var prefix;
var angularJSPath;

program.version('0.0.1').arguments('ngn-gen.js <prefix> <modelFile> <destPath>')
    .action(function(pf,model,path){
        prefix = pf;
        modelFile=model;
        destPath=path;

        parameterCheck()
            .then(nodeExpressInitialize)
            .then(ngnGenerate)
            .done();
    })
;

var nodeExpressInitialize = function(){
    return Q.fcall(function(){

        angularJSPath=path.join(destPath,'public','js');

        if(!fs.existsSync(angularJSPath))fs.mkdirSync(angularJSPath);


        return modelFile;

    });
    //todo
    //test destpath is an ahp path.   exists(destPath/.ngnrc) exists then return

    //test express installed
    //if not: install express

    //test package.json exists in destPath/.
    //test bower in destPath/.
    //test bower.json exists in destPath/.
};

var parameterCheck = function(){
    var deferred = Q.defer();
    fs.exists(modelFile,function(exists){
        if(!exists)
            deferred.reject(new Error('Not found :'+modelFile));
        else
            deferred.resolve(modelFile);
    });
    return deferred.promise;
};

function loadJSTemplate(name) {
    return fs.readFileSync(path.join(__dirname, 'templates', 'js', name), 'utf-8');
}
function loadTemplate(dir,name) {
    return fs.readFileSync(path.join(__dirname, 'templates', dir, name), 'utf-8');
}

function createPartialDir(modelName){
    partialDir = path.join(destPath,'views','partials');//,modelName);
    if(!fs.existsSync(partialDir))fs.mkdirSync(partialDir);

    partialModuleDir = path.join(partialDir,modelName);
    if(!fs.existsSync(partialModuleDir))fs.mkdirSync(partialModuleDir);
}

function createDir(dirs){
    dir=destPath;
    for(i=0;i<dirs.length;i++)
    {
        dir=path.join(dir,dirs[i]);
        if(!fs.existsSync(dir))fs.mkdirSync(dir);
    }
}


//cp .bowerrc
function updateBowerRC()
{
    content = '{
  "directory": "public/bower_components"
}
';
    bowerrcpath = path.join(destPath,'.bowerrc');
    fs.writeFileSync(bowerrcpath,content);    
}
        //update package.json
function updatePackageJSON()
{
    dependencies = {
        "ejs": "^2.3.1",
        "i18n-2": "^0.4.6",
        "mongodb": "^2.0.31",
        "mongoose": "^4.0.3"
    };
    pkpath = path.join(destPath,'package.json');
    pkjson = fs.readFileSync(pkpath,{encoding:"utf-8"});

    pk = JSON.parse(pkjson);

    for(property in depenencies)
    {
        if(dependencies.hasOwnProperty(property)){
            pk.dependencies[property]=dependencies[property];
        }
    }

    fs.writeFileSync(pkpath,JSON.stringify(pk));

}
        //update bower.json
function updateBowerJSON(){
    dependencies={
        "angular-bootstrap": "~0.13.0",
        "angular-resource": "~1.3.15",
        "angular-route": "~1.3.15",
        "angular": "~1.3.15",
        "bootstrap": "~3.3.4",
        "font-awesome": "~4.3.0"
    };
    brpath = path.join(destPath,'bower.json');
    brjson = fs.readFileSync(brpath,{encoding:"utf-8"});

    br = JSON.parse(brjson);

    for(property in depenencies)
    {
        if(dependencies.hasOwnProperty(property)){
            br.dependencies[property]=dependencies[property];
        }
    }

    fs.writeFileSync(brpath,JSON.stringify(br));
}


function getClassName(){
    if(this.name)return this.name[0].toUpperCase()+this.name.substring(1);
}

function getModelName(modelName){
    if(modelName)return modelName[0].toLowerCase()+model.name.substring(1);
}

function write(path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || 0666 });
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
}
function append(path, str) {
    fs.appendFileSync(path, str);
    console.log('   \x1b[90mmodify\x1b[0m : ' + path);
}

function appendOrReplace(path,str,beginMark,endMark)
{
   

    fileContent = fs.readFileSync(path,{encoding:"utf-8"});


    beginMarkPos=fileContent.indexOf(beginMark);

    thePrevPart = fileContent.substring(0,beginMarkPos);

    endMarkPos = fileContent.indexOf(endMark);
    theLastPart = fileContent.substring(endMarkPos+endMark.length);

    fs.truncateSync(path,0);
    fs.appendFileSync(path, thePrevPart);
    fs.appendFileSync(path,beginMark+'\n');
    fs.appendFileSync(path,str);
    fs.appendFileSync(path,endMark);

    fs.appendFileSync(path, theLastPart);


}


var ngnGenerate = function(){
    function initAPIIndex(){
        content="'use strict';\nvar express = require('express');\nvar app = express();\nmodule.exports = app;\n\n";
        createDir(['routes','api']);
        apiIndexPath=path.join(destPath,'routes','api','index.js');
        if(!fs.existsSync(apiIndexPath)){
            write(apiIndexPath,content);
        }
        return apiIndexPath;
    }
    function generateNGModule(angularModelListControllerName, angularModelDetailControllerName, angularModelNewControllerName, angularControllerModuleName, angularModelName) {
        var ngAppModule = prefix + model.getClassName() + 'App';
        var ngApp = loadJSTemplate('ngapp.jst');
        ngApp = ngApp.replace(/\{appModuleName\}/g, ngAppModule);
        ngApp = ngApp.replace(/\{modelListControllerName\}/g, angularModelListControllerName);
        ngApp = ngApp.replace(/\{modelDetailControllerName\}/g, angularModelDetailControllerName);
        ngApp = ngApp.replace(/\{modelNewControllerName\}/g, angularModelNewControllerName);
        ngApp = ngApp.replace(/\{controllerModuleName\}/g, angularControllerModuleName);
        ngApp = ngApp.replace(/\{modelName\}/g, angularModelName);
        angularAppRelativePath = path.join('js', prefix + angularModelName + '.js');
        angularAppPath = path.join(destPath, 'public', angularAppRelativePath);
        write(angularAppPath, ngApp);
        return ngAppModule;
    }

    function generateNGController(angularModelName, angularModelClassName, angularServiceName,angularModelCollectionName) {
        var angularControllerModuleName = prefix + model.getClassName() + 'Controllers';
        var controller = loadJSTemplate('controller.jst');
        controller = controller.replace(/\{ModelName\}/g, angularModelClassName);
        controller = controller.replace(/\{modelName\}/g, angularModelName);
        controller = controller.replace(/\{serviceName\}/g, angularServiceName);
        controller = controller.replace(/\{controllerModuleName\}/g, angularControllerModuleName);
        controller = controller.replace(/\{modelCollectionName\}/g, angularModelCollectionName);

        var angularModelListControllerName = prefix + model.getClassName() + 'ListCtrl';
        controller = controller.replace(/\{modelListControllerName\}/g, angularModelListControllerName);
        var angularModelDetailControllerName = prefix + model.getClassName() + 'DetailCtrl';
        controller = controller.replace(/\{modelDetailControllerName\}/g, angularModelDetailControllerName);
        var angularModelNewControllerName = prefix + model.getClassName() + 'NewCtrl';
        controller = controller.replace(/\{modelNewControllerName\}/g, angularModelNewControllerName);
        angularControllerRelativePath = path.join('js', prefix + angularModelName + 'controllers.js');
        angularControllerPath = path.join(destPath, 'public', angularControllerRelativePath);
        write(angularControllerPath, controller);
        return {
            angularControllerModuleName: angularControllerModuleName,
            angularModelListControllerName: angularModelListControllerName,
            angularModelDetailControllerName: angularModelDetailControllerName,
            angularModelNewControllerName: angularModelNewControllerName

        };
    }

    function generateNGService(angularServiceName, angularModelClassName, angularModelName) {
        var service = loadJSTemplate('service.jst');
        service = service.replace(/\{serviceName\}/g, angularServiceName);
        service = service.replace(/\{ModelName\}/g, angularModelClassName);
        service = service.replace(/\{modelName\}/g, angularModelName);
        angularServiceRelativePath = path.join('js', prefix + angularModelName + 'services.js');
        angularServicePath = path.join(destPath, 'public', angularServiceRelativePath);
        write(angularServicePath, service);
    }

    function generateMainView(ngAppModule, angularModelName) {
        var mainView = loadTemplate('view', 'view.ejs');

        mainView = mainView.replace(/\{appModuleName\}/g, ngAppModule);
        mainView = mainView.replace(/\{angularAppPath\}/g, angularAppRelativePath);
        mainView = mainView.replace(/\{angularControllerPath\}/g, angularControllerRelativePath);
        mainView = mainView.replace(/\{angularServicePath\}/g, angularServiceRelativePath);
        angularMainViewPath = path.join(destPath, 'views', angularModelName + '.ejs');
        write(angularMainViewPath, mainView);
    }

    function generateRoute(angularModelName) {
        var routeJS = loadTemplate('route', 'route.jst');
        routeJS = routeJS.replace(/\{modelName\}/g, angularModelName);
        routePath = path.join(destPath, 'routes', angularModelName + '.js');
        write(routePath, routeJS);
    }

    function generateNewPartialView(angularModelClassName, angularModelName) {
        var newView = loadTemplate('view', 'new.ejs');

        newView = newView.replace(/\{ModelName\}/g,angularModelClassName);
        newView = newView.replace(/\{modelName\}/g,angularModelName);

        var newFields = '';
        for (i = 0; i < model.properties.length; i++) {
            property = model.properties[i];
            field = '<div class="form-group">';
            field = field + '<label><%= __("' + angularModelClassName + '.' + property.name + '") %></label>\n';
            angularType = typeMap.mapAngular(property.type);
            field = field + '<input type="'+angularType+'" class="form-control" ng-model="' + angularModelName + '.' + property.name + '">\n';
            field = field + '</div>\n';
            newFields = newFields + field;
        }

        newView = newView.replace('{fields}', newFields);
        newPartialPath = path.join(destPath, 'views', 'partials', angularModelName, 'new.ejs');
        write(newPartialPath, newView);
    }

    function generateListPartialView(angularModelClassName, angularModelName,angularModelCollectionName) {
        var listView = loadTemplate('view', 'list.ejs');
        listView = listView.replace('{ModelName}',angularModelClassName);
        var listTableHeader = '<tr>';
        var listTableBody = '<tr  ng-repeat="'+angularModelName+' in '+angularModelCollectionName+'">';
        for (i = 0; i < model.properties.length; i++) {
            property = model.properties[i];

            if (!(property.inList === false)) {
                th = '<th><%= __("' + angularModelClassName + '.' + property.name + '")%></th>\n';
                listTableHeader = listTableHeader + th;

                td = '<td>{{' + angularModelName + '.' + property.name + '}}</td>\n';
                listTableBody = listTableBody + td;
            }

        }
        listTableHeader = listTableHeader + '</tr>';
        listTableBody = listTableBody + '</tr>';

        listView = listView.replace('{listTableHeader}', listTableHeader);
        listView = listView.replace('{listTableBody}', listTableBody);
        listPartialPath = path.join(destPath, 'views', 'partials', angularModelName, 'list.ejs');
        createPartialDir(model.name);
        write(listPartialPath, listView);
    }
    function generate(data){
        model = JSON.parse(data);


        model.getClassName = getClassName;


        if (!model.name)throw new Error('Model has no name');
        if (!model.properties || !model.properties.length)throw new Error('Model has no properties');

        //write services prefix+ModelName(firstUpperCase)+Services.js
        var angularServiceName = prefix + model.getClassName() + 'Service';
        var angularModelClassName = model.getClassName();
        var angularModelName = getModelName(model.name);
        var angularModelCollectionName = angularModelName + 's';

        generateNGService(angularServiceName, angularModelClassName, angularModelName);


        //write controller prefix+ModelName(firstUpperCase)+Controller.js
        var __ret = generateNGController(angularModelName, angularModelClassName, angularServiceName,angularModelCollectionName);
        var angularControllerModuleName = __ret.angularControllerModuleName;
        var angularModelListControllerName = __ret.angularModelListControllerName;
        var angularModelDetailControllerName = __ret.angularModelDetailControllerName;
        var angularModelNewControllerName = __ret.angularModelNewControllerName;


        //write module Prefix+ModelName.js
        var ngAppModule = generateNGModule(angularModelListControllerName, angularModelDetailControllerName, angularModelNewControllerName, angularControllerModuleName, angularModelName);


        //write api/modelName.js
        var restAPI = loadTemplate('api','model.jst');
        restAPI=restAPI.replace(/\{ModelName\}/g,angularModelClassName);
        restAPI=restAPI.replace(/\{mongoDBName\}/g,prefix+'DB');
        restAPIProperties ='{';
        for(i=0;i<model.properties.length;i++)
        {
            property = model.properties[i];
            restAPIProperties+=property.name+':'+typeMap.mapJS(property.type)
            if(i<model.properties.length-1)restAPIProperties+=',\n';
        }
        restAPIProperties+='}';
        restAPI = restAPI.replace('{properties}',restAPIProperties);
        restAPIPath= path.join(destPath,'routes','api',model.name+'.js');
        createDir(['routes','api']);
        write(restAPIPath,restAPI);

        //modify api/index.js
        modelIndexPart=loadTemplate('api','index.jst');
        indexAPIPath=initAPIIndex();
        modelIndexPart = modelIndexPart.replace(/\{modelName\}/g,angularModelName);
        //append(indexAPIPath,modelIndexPart);
        appendOrReplace(indexAPIPath,modelIndexPart,'//--NGN-BEGIN '+angularModelName,'//--NGN-END '+angularModelName);
        //write views/partials/model/list.ejs
        generateListPartialView(angularModelClassName, angularModelName,angularModelCollectionName);

        //write views/partials/model/new.ejs
        generateNewPartialView(angularModelClassName, angularModelName);

        //write views/partials/model/edit.ejs


        //write views/model.ejs
        generateMainView(ngAppModule, angularModelName);

        //write routes/model.js
        generateRoute(angularModelName);

        //write routes/partials.js
        partialsRoute = loadTemplate('route','partials.jst');
        partialsPath = path.join(destPath,'routes','partials.js');
        write(partialsPath,partialsRoute);


        //modify app.js
        appJSPath= path.join(destPath,'app.js');
        //todo
        insertOrReplace(appJSPath,i18nPart,'','//--NGN-BEGIN i18n-2','//--NGN-END i18n-2');
        insertOrReplace(appJSPath,useParth,'','//--NGN-BEGIN use','//--NGN-END use');
        insertOrReplace(appJSPath,requirePart,'','//--NGN-BEGIN require','//--NGN-END require');

        //todo
        //cp .bowerrc
        updateBowerRC();
        //update package.json
        updatePackageJSON();
        //update bower.json
        updateBowerJSON();

    }
    model = fs.readFile(modelFile,{encoding:"utf-8"},function(error,data) {
        if (error)throw new Error('Read model file :' + modelFile + ' error:' + error);

        generate(data);

    });
};

try
{
    program.parse(process.argv);
}
catch(error){
    console.log(error);
}


