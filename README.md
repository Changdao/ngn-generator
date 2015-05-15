#Introduction
ngn means Angular for Node
A simple generator to generate basic CRUD scaffold for a model(in json format)

#Steps
On MacOSX
##Install node,mongod
brew install node
brew install mongo
##Prepare the node project
mkdir /path/to/your/project
##Install express-generator
npm install -g express-generator
cd /path/to/your/project
express

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

Save the file to hotel.json

##Generate 

ngn-gen.js ahb sample.json /path/to/your/project

##Test run

cd /path/to/your/project
bin/www

Then open your browser and goto: http://localhost:3000/hotel




