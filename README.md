#Introduction
    ngn means Angular for Node
    A simple generator to generate basic CRUD scaffold for a model(in json format)

#Prequisite
*node
*mongodb
*express-generator
*bower

For examples, you could prepare them On MacOSX:

##Install node,mongod
    brew install node
    brew install mongo
    npm install -g express-generator
    npm install -g bower

#Get started

##Prepare the project

    mkdir /path/to/your/project

##Init with express generator
    
    cd /path/to/your/project
    express -e
##Init the bower 
    bower init


##Write a model file
example:
<pre>
{
  "name":"hotel",
  "properties":[
    {"name":"name","type":"String"},
    {"name":"address","type":"String"},
    {"name":"latitude","type":"Number"},
    {"name":"created","type":"Date"},
    {"name":"email","type":"Email"}
  ],
  "pagination":true
}
</pre>

Save the file as model.json

##Generate 

    ngn-gen.js ahb model.json /path/to/your/project

    ahb is a prefix which will be the naming prefix for project files, as well as the name of MongoDb with 'DB' as suffix.

##Test run

cd /path/to/your/project
npm install
bower install
bin/www

Then open your browser and goto: http://localhost:3000/hotel


##TODO List
* Refactoring for more OO, especially about Persistence Layer choices.
* To support more config parameters
* Implementing pagination.
*




