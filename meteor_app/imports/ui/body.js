import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Session } from 'meteor/session';

import { Examples } from '../api/options.js';
import { ActionLog } from '../api/actionlog.js';
import Pycollections from 'pycollections';

import './body.html';

var exampleTotal = function(){
  // console.log('exampleTotal',Examples.find({dataset: Session.get('dataset')}).count());
  return Examples.find({dataset: Session.get('dataset')}).count();
  // return fetchExamples(selector).count();
}

var fetchExamples = function(selector){
  if (_.isEmpty(selector)){
    selector = {'dataset': Session.get('dataset')};
  } else {
    selector['dataset'] = Session.get('dataset');
  }
  return Examples.find(selector).fetch();
}

var fetchAndCountExamples = function(selector){
  if (_.isEmpty(selector)){
    selector = {'dataset': Session.get('dataset')};
  } else {
    selector['dataset'] = Session.get('dataset');
  }
  return Examples.find(selector).count();
}

var fetchShortestExamples = function(selector){
  if (_.isEmpty(selector)){
    selector = {'dataset': Session.get('dataset')};
  } else {
    selector['dataset'] = Session.get('dataset');
  }
  console.log('selector',selector);
  return Examples.find(selector, { sort: { codeLength : 1 } });
}



var blocknames = [
  'initialization',
  'try',
  'configuration',
  'guardType',
  'guardCondition',
  'focalAPI',
  'checkType',
  'followUpCheck',
  'use',
  'exceptionType',
  'exceptionHandlingCall',
  // 'finally',
  'cleanUpCall'
];

var option_lists = [
  'initialization',
  'exceptionHandlingCall',
  'configuration',
  'use',
  'cleanUpCall'
];

console.log(blocknames)

var addSpan = function(exampleID,expressionStart,expressionEnd,blockname){
  if (expressionStart !== -1 && expressionEnd !== -1) {
    spanAdder.addRegionsD3('#exampleID'+exampleID,expressionStart,expressionEnd,blockname);
  } 
}

var addMultipleSpans = function(exampleID,expressionStart_array,expressionEnd_array,blockname){
  if (!_.isEmpty(expressionStart_array) && !_.isEmpty(expressionEnd_array)) {
    var expressionTuples = _.zip(expressionStart_array,expressionEnd_array);
    _.each(expressionTuples, function(tuple){
      addSpan(exampleID,tuple[0],tuple[1],blockname);
    });
  } 
}

Template.example.onRendered(function() {
    $('#'+this.data.exampleID + ' pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
    var exampleID = this['data']['exampleID'];
    for (let blockname of blocknames){
      if (blockname==='initialization' && !_.isEmpty(this['data']['initializationStart'])) {
        var expressionStart = this['data']['initializationStart'];
        var expressionEnd = this['data']['initializationEnd'];
        addMultipleSpans(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==='try' && this['data']['tryExpressionStart'] !== -1) {
        var expressionStart = this['data']['tryExpressionStart'];
        var expressionEnd = this['data']['tryExpressionEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==='configuration' && !_.isEmpty(this['data']['configurationStart'])) {
        var expressionStart = this['data']['configurationStart'];
        var expressionEnd = this['data']['configurationEnd'];
        addMultipleSpans(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="guardCondition" && this['data']['guardExpressionStart'] !== -1 ) {
        var expressionStart = this['data']['guardExpressionStart'];
        var expressionEnd = this['data']['guardExpressionEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==='focalAPI' && this['data']['focalAPIStart'] !== -1 ) {
        var expressionStart = this['data']['focalAPIStart'];
        var expressionEnd = this['data']['focalAPIEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="checkType" && this['data']['followUpCheckExpressionStart'] !== -1) {
        var expressionStart = this['data']['followUpCheckExpressionStart'];
        var expressionEnd = this['data']['followUpCheckExpressionEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="use" && !_.isEmpty(this['data']['useStart'])) {
        var expressionStart = this['data']['useStart'];
        var expressionEnd = this['data']['useEnd'];
        addMultipleSpans(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="exceptionType" && this['data']['catchExpressionStart'] !== -1 ) {
        var expressionStart = this['data']['catchExpressionStart'];
        var expressionEnd = this['data']['catchExpressionEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="exceptionHandlingCall" && !_.isEmpty(this['data']['exceptionHandlingCallStart'])) {
        var expressionStart = this['data']['exceptionHandlingCallStart'];
        var expressionEnd = this['data']['exceptionHandlingCallEnd'];
        addMultipleSpans(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="finally" && this['data']['finallyExpressionStart'] !== -1 ) {
        var expressionStart = this['data']['finallyExpressionStart'];
        var expressionEnd = this['data']['finallyExpressionEnd'];
        addSpan(exampleID,expressionStart,expressionEnd,blockname);
      } else if (blockname==="cleanUpCall" && !_.isEmpty(this['data']['cleanUpCallStart'])) {
        var expressionStart = this['data']['cleanUpCallStart'];
        var expressionEnd = this['data']['cleanUpCallEnd'];
        addMultipleSpans(exampleID,expressionStart,expressionEnd,blockname);
      } 
    }
});

/*
 * Register the helper functions for the body template
 */
Template.body.helpers({
  getDataset(){
    return Session.get('dataset');
  },
  changeData(a){
    console.log(a)
  },
  optionBlocks(){
    return blocknames; 
  },
  filteredExamples() {
    var selector = Session.get('selector');
    if (selector == null) {
      selector = {};
    }
    return fetchShortestExamples(selector); //Examples.find(selector, { sort: { codeLength: 1 } }); //, limit: 50 
  },
  countTooLowThreshold(){
    return Session.get('countTooLowThreshold');
  },
  selectorKeys(){
    var selector = Session.get('selector');
    // console.log('selectorKeys',selector);
    if (_.isEmpty(selector)){ 
      return [];
    } else{
      return Object.keys(selector);
    }
  },
  count() {
    var selector = Session.get('selector');
    return fetchAndCountExamples(selector);
  }
});

/*
 * Register the helper functions for the breadcrumb template
 */
Template.breadcrumb.helpers({
  shortName(filterType){
    var selector = Session.get('selector');
    var filterValue = selector[filterType];
    if (!_.isEmpty(filterValue)) {
      if (typeof filterValue === 'string' && filterValue !== 'dataset') {
        console.log('filterValue is string');
        return 'must have '+filterValue;
      } else if (Object.keys(filterValue)[0] === '$ne'){
        switch(filterType) {
          case "initialization":
            return "some declarations";
            break;
          case "try":
            return 'a try block';
            break;
          case "configuration":
            return "some config";
            break;
          case 'guardType':
            return "some guard type"
            break;
          case 'guardCondition':
            return 'some guard condition';
            break;
          // case 'focalAPI':
          //   return "the API call of interest";
          //   break;
          case 'checkType':
            return 'a control structure for results';
            break;
          case 'followUpCheck':
            return 'some result checking';
            break;
          case 'use':
            return 'some use calls';
            break;
          case 'exceptionType':
            return 'some exception caught';
            break;
          case 'exceptionHandlingCall':
            return 'some exception handling';
            break;
          // case 'finally':
          //   return 'finally block';
          //   break;
          case 'cleanUpCall':
            return 'some clean up';
            break;
          default:
            return '';
        }
      } else if (Object.keys(filterValue)[0] === '$all'){
        switch(filterType) {
          case "initialization":
            return "all these declaration(s): " + filterValue['$all'].join();
            break;
          // case "try":
          //   return 'API call in a try block';
          //   break;
          case "configuration":
            return "all this config: " + filterValue['$all'].join();
            break;
          // case 'guardType':
          //   return "control structure enclosing the API call" + filterValue['$all'].join();
          //   break;
          // case 'guardCondition':
          //   return 'at least one condition guarding execution of the API call' + filterValue['$all'].join();
          //   break;
          // case 'focalAPI':
          //   return "the API call of interest";
          //   break;
          // case 'checkType':
          //   return 'control structure interacting with the API call results';
          //   break;
          // case 'followUpCheck':
          //   return 'at least one condition checking the results';
          //   break;
          case 'use':
            return 'all these uses: ' + filterValue['$all'].join();
            break;
          case 'exceptionType':
            return 'all these exception(s) caught: ' + filterValue['$all'].join();
            break;
          case 'exceptionHandlingCall':
            return 'all these call(s) handling exceptions: '+ filterValue['$all'].join();
            break;
          // case 'finally':
          //   return 'finally block';
          //   break;
          case 'cleanUpCall':
            return 'all these clean-up calls: '+ filterValue['$all'].join();
            break;
          default:
            return '';
        }
      }
    }
  },
});


/*
 * Register the event listeners on the body template
 */
Template.body.events({
  'change #change-dataset'(event){
    var newDataSet = $(event.target).val()
    console.log('Dataset', newDataSet);
    Session.set('dataset', newDataSet);
  },
  'click .change-dataset'(event, instance){
    console.log('API Change')
    // Session.set('dataset', 'get');
  },
  'click .toggle-collapse'(event,instance){
    // console.log('.toggle-collapse clicked',event.target)
    var hideOptions = Session.get('hideOptions');
    if (hideOptions){
      $('.collapse').collapse('show');
      Session.set('hideOptions',false);
    } else {
      $('.collapse').collapse('hide');
      Session.set('hideOptions',true);
    }
  },
  'click .hide-labels'(event, instance){
    var hideLabels = Session.get('hideLabels');
    if (hideLabels) {
      Session.set('hideLabels',false);
    } else {
      Session.set('hideLabels',true);
    }
    // console.log(Session.get('hideLabels'));
    ActionLog.insert({date : new Date(), hideLabels: Session.get('hideLabels'), action: "click hide-labels", subjectNum: Session.get('subjectNum')});
  },
  'click .show-all'(event, instance) {
    // var tooLowThreshold = Session.get('countTooLowThreshold');
    var numOptions = Session.get('numOptions');
    //don't let threshold get below 1
    // Session.set('countTooLowThreshold',Math.max(tooLowThreshold - 1,0));
    Session.set('numOptions',100);
    console.log(Session.get('numOptions'));
    ActionLog.insert({date : new Date(), numOptions: Session.get('numOptions'), action: "click show-all", subjectNum: Session.get('subjectNum')});
  },
  'click .show-default'(event, instance) {
    // var tooLowThreshold = Session.get('countTooLowThreshold');
    var numOptions = Session.get('numOptions');
    //don't let threshold get below 1
    // Session.set('countTooLowThreshold',Math.max(tooLowThreshold - 1,0));
    Session.set('numOptions',3);
    console.log(Session.get('numOptions'));
    ActionLog.insert({date : new Date(), numOptions: Session.get('numOptions'), action: "click show-default", subjectNum: Session.get('subjectNum')});
  },
  'click .more-uncommon'(event, instance) {
    // var tooLowThreshold = Session.get('countTooLowThreshold');
    var numOptions = Session.get('numOptions');
    //don't let threshold get below 1
    // Session.set('countTooLowThreshold',Math.max(tooLowThreshold - 1,0));
    Session.set('numOptions',Math.max(numOptions + 1,0));
    console.log(Session.get('numOptions'));
    ActionLog.insert({date : new Date(), numOptions: Session.get('numOptions'), action: "click more-uncommon", subjectNum: Session.get('subjectNum')});
  },
  'click .less-uncommon'(event, instance) {
    var numOptions = Session.get('numOptions');
    //don't let threshold get below 1
    // Session.set('countTooLowThreshold',Math.max(tooLowThreshold + 1,0));
    Session.set('numOptions',Math.max(numOptions - 1,0));
    console.log(Session.get('numOptions'));
    ActionLog.insert({date : new Date(), numOptions: Session.get('numOptions'), action: "click less-uncommon", subjectNum: Session.get('subjectNum')});
  },
  'click .reset-all'(event, instance) {
    ActionLog.insert({date : new Date(), numOptions: Session.get('numOptions'), action: "click reset-all", subjectNum: Session.get('subjectNum')});
    Session.set('selector', {}); 
    // Session.set('toggleUncommon',false);
    Session.set('numOptions',3);
    // Session.set('toggleZeroCount',true);
    $("input:checkbox").prop('checked', false);  
    $("input:radio").prop('checked', false);      
  },
  'change .filterByBlock'(event, instance) {
    var selector = Session.get('selector');
    if (selector == null){
      selector = {};
    }

    // console.log(event,event.target)
    var blockname = event.target.id; 

    if (event.target.checked) {
      console.log(event);
      console.log('The following block must exist in filtered examples:');
      console.log(blockname);
      //todo check if it's checked or unchecked, then update global selector in Session;

      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        selector[blockname] = {$ne: []};
      } else {
        selector[blockname] = {$ne: 'empty'};
      }

      //todo: uncheck all radio buttons in this block
      $('input[name='+blockname+']').each(function(){$(this).attr('checked', false)});
    } else {
      selector[blockname] = undefined;
    }

    ActionLog.insert({date : new Date(), blockname: blockname, action: "change filterByBlock", subjectNum: Session.get('subjectNum')});
    // console.log('selector',selector);
    Session.set('selector',selector);
  },
  'change .filterByCheckOption'(event, instance){
    var selector = Session.get('selector');
    if (selector == null){
      selector = {};
    }

    // console.log(event,event.target);
    var blockname = event.target.name;
    var optionname = $(event.target).data('option');

    // console.log(blockname, optionname, selector);

    var block_selector_object = selector[blockname];

    if (event.target.checked) {
      console.log(event);
      console.log('The following option:');
      
      console.log(optionname);
      console.log('in block:');
      
      console.log(blockname);
      console.log('must be present in filtered examples.');
      
      if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
        var updated_list = [ optionname ];
      } else if (!_.isEmpty(block_selector_object['$all'])) {
        var list_of_options = block_selector_object['$all'];
        var updated_list = list_of_options.concat([ optionname ]);
      } else {
        console.log('unhandled case!');
      }
      console.log('updated_list for check option',updated_list, blockname, optionname);
    } else {
      //remove optionname from list
      var list_of_options = block_selector_object['$all'];
      var updated_list = list_of_options.filter(function(option){
        return option !== optionname
      });
    }

    if (_.isEmpty(updated_list)){
      selector[blockname] = undefined;
    } else {
      selector[blockname] = { '$all': updated_list };
    }

    //uncheck block-level 'or'
    $('#'+blockname).prop('checked',false);    

    ActionLog.insert({date : new Date(), blockname: blockname, optionname: optionname, action: "change filterByCheckOption", subjectNum: Session.get('subjectNum')});

    Session.set('selector',selector);
  },
  'click .filterByRadioOption'(event, instance) {
    // console.log('click event on .filterByRadioOption');
    var selector = Session.get('selector');
    if (selector == null){
      selector = {};
    }

    var blockname = event.target.name;
    var optionname = $(event.target).data('option');

    // console.log(blockname, optionname, selector);

    //if radio option already clicked
    if (selector[blockname] == optionname) {
      $(event.target).prop('checked', false); //uncheck radio button
      selector[blockname] = undefined; //remove filter
    } else {
      //radio button wasn't already clicked on
      $(event.target).prop('checked', true); //click it on, just to be sure
      console.log(event);
      console.log('The following option:');
      
      console.log(optionname);
      console.log('in block:');
      
      console.log(blockname);
      console.log('must be present in filtered examples.');
      selector[blockname] = optionname;
      //find the block-level checkbox and uncheck it
      $('#'+blockname).prop('checked',false);
    }

    ActionLog.insert({date : new Date(), blockname: blockname, optionname: optionname, action: "change filterByRadioOption", subjectNum: Session.get('subjectNum')});
    // console.log('selector',selector);
    Session.set('selector',selector);
  },
});

/*
 * Declare the dictionary of global helper functions, where key is the function name and value is the function body
 */
var helpers = {
  conditionalCountBlockRow: function(blockname) {
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return fetchAndCountExamples(selector); 
    } else {
      //if we're not already filtering for an element in this block
      //then filter for it
      if (!selector[blockname]) {
        //is it a checkbox-block or a radio-button block?
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return conditionalCount;
    }
  },
  hideLabels: function(){
    // console.log(Session.get('hideLabels'));
    return Session.get('hideLabels');
  },
  blockStyle: function(blockname) {
    return "inherit";
  },
  countBlock: function(blockname) {
    var selector = {};
    if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
      selector[blockname] = {$ne: []};
    } else {
      selector[blockname] = {$ne: 'empty'};
    }
    return fetchAndCountExamples(selector);
  },
  count: function(optionname) {
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = {};
    selector[blockname] = optionname;
    return fetchAndCountExamples(selector);
  },
  conditionalTooltip: function(blockname){ 
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return ""; 
    } else {
      if (!selector[blockname]){
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      var tooltip = ", " + conditionalCount + " of which have ";
      var count = 0;
      var length = Object.keys(selector).length;
      for (var key in selector) {
	 if (key !== 'dataset' && key !== blockname) {
	   tooltip += key;
	   if (count < length - 3) {
	     if (length === 4) tooltip += " and ";
	     else tooltip += ", ";
	   }
           count++;
	 }
      }

      return tooltip;
    }
  },
  conditionalTooltipOption: function(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];

    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return "";
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []}) ){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!!')
        }
        if (_.isEmpty(updated_list)){
          selector[blockname] = undefined;
        } else {
          selector[blockname] = { '$all': updated_list };
        }
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return ""; 
        } else {
          selector[blockname] = optionname;
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      var conditionalCount = fetchAndCountExamples(selector);
      var tooltip = ", " + conditionalCount + " of which have ";
      var count = 0;
      var length = Object.keys(selector).length;
      for (var key in selector) {
   	if (key !== 'dataset' && key !== blockname) {
     	  tooltip += key;
     	  if (count < length - 3) {
       	    if (length === 4) tooltip += " and ";
            else tooltip += ", ";
          }
          count++;
        }
      }

      return tooltip;
    }
  },
  conditionalWidth: function(blockname){ 
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return 0; 
    } else {
      if (!selector[blockname]){
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return (100*conditionalCount/exampleTotal()).toFixed(2);
    }
  },
  conditionalWidthOption: function(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];

    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return 0;
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []}) ){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!!')
        }
        if (_.isEmpty(updated_list)){
          selector[blockname] = undefined;
        } else {
          selector[blockname] = { '$all': updated_list };
        }
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return 0 
        } else {
          selector[blockname] = optionname;
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return (100*conditionalCount/exampleTotal()).toFixed(2);
    }
  },
  remainingTotalWidth: function(blockname){
    var selector = {};

    if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
      selector[blockname] = {$ne: []};
    } else {
      selector[blockname] = {$ne: 'empty'};
    }

    var count = fetchAndCountExamples(selector);
    // console.log('remainingTotalWidth selector, count',selector,count);

    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return (100*count/exampleTotal()).toFixed(2);
    } else {
      if (!selector[blockname]){
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      // console.log('remainingTotalWidth selector, count',selector,count);
      var conditionalCount = fetchAndCountExamples(selector);
      // console.log('remainingTotalWidth count, conditionalCount',count,conditionalCount);
      return (100*(count - conditionalCount)/exampleTotal()).toFixed(2);
    }
  },
  remainingTotalWidthOption: function(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];

    var selector = {};
    selector[blockname] = optionname;
    var count = fetchAndCountExamples(selector);

    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return (100*count/exampleTotal()).toFixed(2);
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!');
        }
        if (_.isEmpty(updated_list)){
          selector[blockname] = undefined;
        } else {
          selector[blockname] = { '$all': updated_list };
        }
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          var conditionalCount = 0;
          return (100*(count - conditionalCount)/exampleTotal()).toFixed(2);
        } else {
          selector[blockname] = optionname;
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return (100*(count - conditionalCount)/exampleTotal()).toFixed(2);
    }
  },
  conditionalCountZeroBlock: function(blockname){
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return ''; 
    } else {
      //if we're not already filtering for an element in this block
      //then filter for it
      if (!selector[blockname]) {
        //is it a checkbox-block or a radio-button block?
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return conditionalCount;
    }
  },
  blockHeader: function(blockname) {
    switch(blockname) {
      case "initialization":
        return "declarations";
        break;
      case "try":
        return 'try block';
        break;
      case "configuration":
        return "configuration";
        break;
      case 'guardType':
        return "check type"
        break;
      case 'guardCondition':
        return 'check condition';
        break;
      case 'focalAPI':
        return "focus";
        break;
      case 'checkType':
        return 'follow-up check';
        break;
      case 'followUpCheck':
        return 'follow-up condition';
        break;
      case 'use':
        return 'uses';
        break;
      case 'exceptionType':
        return 'exceptions types';
        break;
      case 'exceptionHandlingCall':
        return 'exception handling';
        break;
      // case 'finally':
      //   return 'finally block';
      //   break;
      case 'cleanUpCall':
        return 'clean up';
        break;
      default:
        return '';
    }
  },
  toggleZeroCount: function(){
    return Session.get('toggleZeroCount');
  },
  conditionalAndTotalCountOption: function(optionname){
    //like conditionalCountOption but returns total when selector is empty
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return exampleTotal();
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!')
        }
        selector[blockname] = { '$all': updated_list };
        return fetchAndCountExamples(selector);
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return 0 
        } else {
          selector[blockname] = optionname;
          return fetchAndCountExamples(selector);
        }
      }
    }
  },
  conditionalCountZero: function(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return '';
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        //console.log('block_selector_object',block_selector_object);
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!')
        }
        selector[blockname] = { '$all': updated_list };
        return fetchAndCountExamples(selector);
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return '' 
        } else {
          selector[blockname] = optionname;
          return fetchAndCountExamples(selector);
        }
      }
    }
  },
  getBlockName: function() {
    var parentData = Template.parentData();
    return parentData['blockname'];
  },
  checkboxType: function(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    return !_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}));
  },
  options: function(blockname) {
    // uncomment if you want to not replicate block and option level try
    // if (blockname === 'try'){
    //   return [];
    // }
    var selector = {};
    if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))) {
      selector[blockname] = {$ne: []};
      var examps = fetchExamples(selector);
      var calls = new Pycollections.Counter();
      _.each(examps, function(examp){
        calls.update(examp[blockname]);
      });
      var uniq_opts = calls.mostCommon().map(function(item){ return item[0]}); //unnecesary to call mostCommon here but fine
    } else {
      selector[blockname] = {$ne: 'empty'};
      // var opts = fetchExamples(selector);
      //consider rewritting this to use pycollections.js
      var uniq_opts = _.uniq(fetchExamples(selector).map(function (rec) {
            return rec[blockname];
        }), false);
    }
    var counts = {}
    _.each(uniq_opts, function(opt){ 
      var selector = {};
      selector[blockname] = opt;
      counts[opt] = fetchAndCountExamples(selector);
    });
    return _.sortBy(uniq_opts, function(opt){ return counts[opt]; }).reverse().slice(0, Session.get('numOptions'));
  },
};

/*
 * Register the global helper functions for all templates
 */
_.each(helpers, function(value, key){
  Template.registerHelper(key, value);
});


/*
 * Below is the helper functions for the general template of code blocks and options.
 */
/*
Template.optionBlock.helpers({
  conditionalCountBlock(blockname){
    var selector = Session.get('selector');
    console.log('selector in conditionalCountBlock',selector);
    if ( _.isEmpty(selector) ) {
      return 0; 
    } else {
      //if we're not already filtering for an element in this block
      //then filter for it
      if (!selector[blockname]) {
        //is it a checkbox-block or a radio-button block?
        if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
          selector[blockname] = {$ne: []};
        } else {
          selector[blockname] = {$ne: 'empty'};
        }
      }
      var conditionalCount = fetchAndCountExamples(selector);
      return conditionalCount;
    }
  },
  conditionalCountOption(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return 0;
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!')
        }
        selector[blockname] = { '$all': updated_list };
        return fetchAndCountExamples(selector);
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return 0 
        } else {
          selector[blockname] = optionname;
          return fetchAndCountExamples(selector);
        }
      }
    }
  },
  countBelowThreshold(optionname){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    console.log('countBelowThreshold',blockname,optionname);

    var selector = Session.get('selector');

    if ( _.isEmpty(selector) ) {
      return exampleTotal() <= Session.get('countTooLowThreshold');
    } else {
      //is it a radio or check button?
      if (!_.isEmpty(_.find(option_lists, function(list_type){ return list_type===blockname;}))){
        //it is a check box
        var block_selector_object = selector[blockname];
        if (_.isEmpty(block_selector_object) || _.isEqual(block_selector_object,{$ne: []})){
          var updated_list = [ optionname ];
        } else if (!_.isEmpty(block_selector_object['$all'])) {
          var list_of_options = block_selector_object['$all'];
          var updated_list = list_of_options.concat([ optionname ]);
        } else {
          console.log('unhandled case!')
        }
        selector[blockname] = { '$all': updated_list };
        return fetchAndCountExamples(selector) <= Session.get('countTooLowThreshold');
      } else {
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return 0 <= Session.get('countTooLowThreshold');
        } else {
          selector[blockname] = optionname;
          return fetchAndCountExamples(selector) <= Session.get('countTooLowThreshold');
        }
      }
    }
  },
  conditionalCountTooLow(optionname){
    if (Session.get('toggleZeroCount')) {
      var parentData = Template.parentData();
      var blockname = parentData['blockname'];
      var selector = Session.get('selector');
      if ( _.isEmpty(selector) ) {
        return false;
      } else {
        //TODO: CHECK FOR RADIO BUTTON OR CHECKBOX SEE conditionalCountOption
        if (!_.isEmpty(selector[blockname]) && !_.isEqual(selector[blockname],{$ne: 'empty'}) && selector[blockname] !== optionname ){
          //then another radio button is selected; dont override it
          return true;
        } else {
          selector[blockname] = optionname;
          var conditionalCount = fetchAndCountExamples(selector);
          return conditionalCount <= 0;
        }
      }
    } else { //TODO: TEST IF CONDITIONALCOUNT <= Session.get('countTooLowThreshold');
      return false;
    }
  },
  count(optionname) {
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = {};
    selector[blockname] = optionname;
    return fetchAndCountExamples(selector);
  },
  width(optionname) {
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    var selector = {};
    selector[blockname] = optionname;
    var count = fetchAndCountExamples(selector);
    return (100*count/exampleTotal()).toFixed(2);
  },
  opacity(optionname) {
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];

    var selector = {};
    selector[blockname] = optionname;
    var count = fetchAndCountExamples(selector);
    var selector = Session.get('selector');
    if ( _.isEmpty(selector) ) {
      return Math.log(1+count/exampleTotal()).toFixed(2);
    } else {
      selector[blockname] = optionname;
      var conditionalCount = fetchAndCountExamples(selector);
      return Math.log(1+conditionalCount/exampleTotal()).toFixed(2);
    }
  },
  codeSnippet(blockname) {
    switch(blockname) {
      // case 'try':
      //   return 'try {';
      //   break;
      case 'exceptionType':
        return '} catch ... {';
        break;
      case 'cleanUpCall':
        return '} finally {';
        break;
      default:
        return '';
    }
  },
  postCodeSnippet(blockname) {
    switch(blockname) {
      case 'cleanUpCall':
        return '}';
        break;
      case 'use':
        return '}';
        break;
      default:
        return '';
    }
  },
  postIndentationOuter(blockname) {
    switch(blockname) {
      case 'exceptionType':
        return '10';
        break;
      case 'use':
        return '30';
        break;
      default:
        return '';
    }
  },
  preCodeSnippet(blockname) {
    switch(blockname) {
      case 'exceptionType':
        return '}';
        break;
      default:
        return '';
    }
  },
  preIndentationOuter(blockname){
    switch(blockname) {
      case "exceptionType":
        return 30;
        break;
      default:
        return '';
    }
  },
  prepreIndentationOuter(blockname){
    switch(blockname) {
      case "exceptionType":
        return 50;
        break;
      default:
        return '';
    }
  },
  indentationInner() {
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    switch(blockname) {
      case "initialization":
        return 0;
        break;
      case "try":
        return 0;
        break;
      case "configuration":
        return 20;
        break;
      case 'guardType':
        return 20;
        break;
      case 'guardCondition':
        return 40;
        break;
      case 'focalAPI':
        return 60;
        break;
      case 'checkType':
        return 60;
        break;
      case 'followUpCheck':
        return 80;
        break;
      case 'use':
        return 100;
        break;
      case 'exceptionType':
        return 20;
        break;
      case 'exceptionHandlingCall':
        return 40;
        break;
      // case 'finally':
      //   return 0;
      //   break;
      case 'cleanUpCall':
        return 40;
        break;
      default:
        return 0;
    }
  },
  indentationOuter(blockname) {
    switch(blockname) {
      case "initialization":
        return 0;
        break;
      case "try":
        return 0;
        break;
      case "configuration":
        return 20;
        break;
      case 'guardType':
        return 20;
        break;
      case 'guardCondition':
        return 40;
        break;
      case 'focalAPI':
        return 60;
        break;
      case 'checkType':
        return 60;
        break;
      case 'followUpCheck':
        return 80;
        break;
      case 'use':
        return 100;
        break;
      case 'exceptionType':
        return 20;
        break;
      case 'exceptionHandlingCall':
        return 40;
        break;
      // case 'finally':
      //   return 0;
      //   break;
      case 'cleanUpCall':
        return 40;
        break;
      default:
        return 0;
    }
  },
  singleOptionClass(){
    var parentData = Template.parentData();
    var blockname = parentData['blockname'];
    if (blockname=="focalAPI" || blockname=="finally") {
      return "singleOption";
    }
  },
  visibility(blockname) {
    if (blockname=="focalAPI" || blockname=="finally") {
      return "hidden";
    }
    return "inherit";
  },
}); */
