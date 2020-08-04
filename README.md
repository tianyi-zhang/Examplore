# Examplore

This repository contains the source code of Examplore.  

# To run Examplore
1. Install [Meteor](https://www.meteor.com/install)
2. Go to the meteor_app folder and install pycollections and babel-runtime
```bash
$ meteor npm install --save pycollections
$ meteor npm install --save babel-runtime
```
3. Install MongoDB
If your OS is Ubuntu, run the following command in the terminal.
```bash
$ sudo apt-get install mongodb-clients
```
Note: If your OS is MacOS, install MongoDB using Homebrew ([Tutorial](https://github.com/mongodb/homebrew-brew)).

4. If this is the first time you run Examplore, open server/main.js and change the value of `reload` to `true`. Do not forget to change it back afterwards. Otherwise it will load the same dataset twice. In addition, if you want to load the dataset for another API, change the json file name at line 18.
5. In the terminal, `cd` into the `meteor_app` folder and then execute `meteor` command.
