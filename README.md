# Examplore: Visualizing API Usage at Scale

This repository contains the source code of Examplore. Please refer to our CHI 2018 paper *[Visualizing API Usage at Scale](http://web.cs.ucla.edu/~tianyi.zhang/examplore.pdf)* for details. 

## Run Examplore
1. Install [Meteor](https://www.meteor.com/install)
2. Go to the `meteor_app` folder and install pycollections and babel-runtime
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

4. If this is the first time you run Examplore, open `meteor_app/server/main.js` and change the value of `reload` to `true` (line 14). Do not forget to change it back afterwards. Otherwise it will load the same dataset twice. In addition, if you want to load the dataset for another API, change the json file name at line 18.
5. In the terminal, `cd` into the `meteor_app` folder and then execute `meteor` command.
6. Open the app at http://localhost:3000

## Load More API Data
By default, Examplore only loads the dataset of the Android API method, `Activity.findViewById`. We have prepared datasets for 100 popular API methods in Java and Android. You can find them in `meteor_app/private/`. To load the dataset of a different API method, you need to manually change the dataset name to the corresponding json file name in `meteor_app/private/` at line 18 in `meteor_app/server/main.js` (make sure the value of `reload` is set to `true` at line 14).