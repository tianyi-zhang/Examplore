import '../imports/ui/body.js';
// import '../imports/ui/option.js';

Meteor.startup(function(){
    $.getScript('js/tutorons-library.js', function(){
        console.log('script should be loaded and do something with it.');
        spanAdder = new tutorons.TutoronsConnection(window);
        spanAdder.scanDom();
    });
    Session.set('countTooLowThreshold',0);
    Session.set('numOptions',3);
    Session.set('toggleZeroCount', true);
    Session.set('hideLabels', false);
    Session.set('hideOptions', false);
    $('.collapse').collapse('show');
    
    // var subjectNum = Number(prompt("Please enter your participant ID", "0"));
    
    Session.set('subjectNum',-1); //update for each subject
    Session.set('dataset', 'findViewById'); //update for each subject

    //create object which maps user id to correct dataset?

    // var datasetID = Number(prompt("Please enter your participant ID", "0"));
    // var datasets = {1: 'fileInputStream', 2: 'findViewById', 3: 'get', 4: 'query'};

    // Session.set('dataset', datasets[datasetID]); //update for each subject
    Session.set('selector',{});
    console.log('session',Session.keys);
});
